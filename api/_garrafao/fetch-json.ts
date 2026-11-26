import { ORIGIN_HOSTS } from "./origin.js";

export type FetchLike = (input: string, init?: { signal?: AbortSignal; headers?: Record<string, string> }) => Promise<{
  ok: boolean;
  status: number;
  headers: { get(name: string): string | null };
  json(): Promise<unknown>;
}>;

/** Falha de origem: vira 502 no handler, sem repassar detalhe ao cliente. */
export class OriginError extends Error {
  readonly reason: "timeout" | "status" | "network" | "payload" | "host";
  readonly status: number | null;

  constructor(reason: OriginError["reason"], status: number | null = null) {
    super(`origin ${reason}${status ? ` ${status}` : ""}`);
    this.name = "OriginError";
    this.reason = reason;
    this.status = status;
  }
}

export const ORIGIN_TIMEOUT_MS = 6_000;
/** Resposta declarada acima disso é recusada (o maior JSON usado, o placar do mês, fica perto de 1,4 MB). */
const MAX_DECLARED_BYTES = 4 * 1024 * 1024;

export async function fetchJson(fetcher: FetchLike, url: string, timeoutMs = ORIGIN_TIMEOUT_MS): Promise<unknown> {
  const host = new URL(url).hostname;
  if (!ORIGIN_HOSTS.has(host)) throw new OriginError("host");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    let response: Awaited<ReturnType<FetchLike>>;
    try {
      response = await fetcher(url, { signal: controller.signal, headers: { Accept: "application/json" } });
    } catch {
      throw new OriginError(controller.signal.aborted ? "timeout" : "network");
    }
    if (!response.ok) throw new OriginError("status", response.status);
    const declared = Number(response.headers.get("content-length") ?? 0);
    if (Number.isFinite(declared) && declared > MAX_DECLARED_BYTES) throw new OriginError("payload");
    try {
      return await response.json();
    } catch {
      throw new OriginError(controller.signal.aborted ? "timeout" : "payload");
    }
  } finally {
    clearTimeout(timer);
  }
}
