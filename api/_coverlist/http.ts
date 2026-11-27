/** Chamada HTTP às origens: timeout, limite de tamanho e erro tipado, sem vazar detalhe para o cliente. */

/** O feed da Apple às vezes leva 3–5 s a frio; 8 s cobre isso e ainda cabe no limite da Function. */
export const UPSTREAM_TIMEOUT_MS = 8_000;
/** Maior resposta aceita de uma origem (playlist de 100 faixas do Deezer tem ~160 KB). */
export const MAX_UPSTREAM_BYTES = 2_000_000;

export type UpstreamFailure = "timeout" | "http" | "invalid" | "not_found" | "quota";

export class UpstreamError extends Error {
  readonly failure: UpstreamFailure;
  readonly upstream: string;
  readonly status: number | null;

  constructor(upstream: string, failure: UpstreamFailure, detail: string, status: number | null = null) {
    super(`${upstream}: ${failure} (${detail})`);
    this.name = "UpstreamError";
    this.failure = failure;
    this.upstream = upstream;
    this.status = status;
  }

  /** Falha que pode passar sozinha: timeout, rede, 429 ou 5xx. 4xx e resposta malformada não melhoram repetindo. */
  get temporary(): boolean {
    if (this.failure === "timeout" || this.failure === "quota") return true;
    return this.failure === "http" && (this.status === null || this.status === 429 || this.status >= 500);
  }
}

export type FetchLike = (input: string, init?: { signal?: AbortSignal; headers?: Record<string, string>; redirect?: "manual" }) => Promise<{
  ok: boolean;
  status: number;
  headers: { get(name: string): string | null };
  text(): Promise<string>;
}>;

export interface UpstreamOptions {
  fetch?: FetchLike;
  timeoutMs?: number;
  /** Espera antes de repetir uma chamada que falhou por motivo temporário (0 nos testes). */
  retryDelayMs?: number;
}

/** Repete uma vez, com espera crescente, só quando a falha é temporária. */
export async function withRetry<T>(run: () => Promise<T>, options: UpstreamOptions, attempts = 2): Promise<T> {
  let last: unknown;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await run();
    } catch (error) {
      last = error;
      if (!(error instanceof UpstreamError) || !error.temporary || attempt === attempts - 1) break;
      const delay = (options.retryDelayMs ?? 400) * (attempt + 1);
      if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw last;
}

/**
 * Cache em memória por instância da Function (some quando ela esfria). Guarda o último valor bom
 * para servir enquanto a origem estiver fora (stale-if-error), até staleMs.
 */
export class TtlCache<T> {
  private readonly entries = new Map<string, { value: T; at: number }>();
  constructor(
    private readonly ttlMs: number,
    private readonly staleMs: number,
    private readonly max = 64,
  ) {}

  fresh(key: string, now = Date.now()): T | undefined {
    const hit = this.entries.get(key);
    return hit && now - hit.at < this.ttlMs ? hit.value : undefined;
  }

  stale(key: string, now = Date.now()): T | undefined {
    const hit = this.entries.get(key);
    return hit && now - hit.at < this.staleMs ? hit.value : undefined;
  }

  set(key: string, value: T, now = Date.now()) {
    this.entries.delete(key);
    this.entries.set(key, { value, at: now });
    while (this.entries.size > this.max) this.entries.delete(this.entries.keys().next().value as string);
  }

  clear() {
    this.entries.clear();
  }
}

/**
 * Lê para onde uma URL montada pelo servidor redireciona, sem seguir o redirecionamento nem ler o corpo.
 * Devolve o cabeçalho Location de uma resposta 3xx, ou null quando a origem não redireciona.
 */
export async function fetchRedirect(upstream: string, url: string, options: UpstreamOptions = {}): Promise<string | null> {
  const doFetch = options.fetch ?? (globalThis.fetch as unknown as FetchLike);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? UPSTREAM_TIMEOUT_MS);
  try {
    const response = await doFetch(url, { signal: controller.signal, redirect: "manual", headers: { Accept: "text/html" } });
    if (response.status === 404) throw new UpstreamError(upstream, "not_found", "http 404");
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      return location && location.length <= 4096 ? location : null;
    }
    if (!response.ok) throw new UpstreamError(upstream, "http", `http ${response.status}`, response.status);
    return null;
  } catch (error) {
    if (error instanceof UpstreamError) throw error;
    if (controller.signal.aborted) throw new UpstreamError(upstream, "timeout", "aborted");
    throw new UpstreamError(upstream, "http", error instanceof Error ? error.message : "network");
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Busca JSON numa URL montada pelo próprio servidor (nunca vinda do cliente).
 * O nome da origem entra só no log; a resposta ao cliente é sempre genérica.
 */
export async function fetchJson(upstream: string, url: string, options: UpstreamOptions = {}): Promise<unknown> {
  const doFetch = options.fetch ?? (globalThis.fetch as unknown as FetchLike);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? UPSTREAM_TIMEOUT_MS);
  try {
    const response = await doFetch(url, { signal: controller.signal, headers: { Accept: "application/json" } });
    if (response.status === 404) throw new UpstreamError(upstream, "not_found", "http 404");
    if (!response.ok) throw new UpstreamError(upstream, "http", `http ${response.status}`, response.status);
    const length = Number(response.headers.get("content-length") || 0);
    if (length > MAX_UPSTREAM_BYTES) throw new UpstreamError(upstream, "invalid", "too large");
    const body = await response.text();
    if (body.length > MAX_UPSTREAM_BYTES) throw new UpstreamError(upstream, "invalid", "too large");
    try {
      return JSON.parse(body) as unknown;
    } catch {
      throw new UpstreamError(upstream, "invalid", "not json");
    }
  } catch (error) {
    if (error instanceof UpstreamError) throw error;
    if (controller.signal.aborted) throw new UpstreamError(upstream, "timeout", "aborted");
    throw new UpstreamError(upstream, "http", error instanceof Error ? error.message : "network");
  } finally {
    clearTimeout(timer);
  }
}
