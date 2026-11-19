import { createHmac } from "node:crypto";

export interface RequestLike {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
  body?: unknown;
}

export interface ResponseLike<T> {
  setHeader(name: string, value: string): void;
  status(code: number): ResponseLike<T>;
  json(body: T): void;
}

const REQUEST_TIMEOUT_MS = 4_000;
/** Corpo maior que isto é recusado sem ser lido; o maior payload válido é {"vote":"down"}. */
export const MAX_BODY_BYTES = 1024;
export const KEY_PREFIX = "adn:";

/**
 * Aceita as variáveis criadas pela integração Upstash da Vercel (KV_REST_API_*)
 * ou as da Upstash direto (UPSTASH_REDIS_REST_*).
 */
export function redisConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ""), token };
}

/** Executa um comando Redis pela API REST da Upstash. */
export async function redis(command: (string | number)[]): Promise<unknown> {
  const config = redisConfig();
  if (!config) throw new Error("redis not configured");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(config.url, {
      method: "POST",
      headers: { Authorization: `Bearer ${config.token}`, "Content-Type": "application/json" },
      body: JSON.stringify(command),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`redis http ${response.status}`);
    const payload = (await response.json()) as { result?: unknown; error?: string };
    if (payload.error) throw new Error(payload.error);
    return payload.result;
  } finally {
    clearTimeout(timeout);
  }
}

function header(request: RequestLike, name: string) {
  const value = request.headers?.[name];
  return Array.isArray(value) ? value[0] : value;
}

/**
 * IP do visitante. Na Vercel, x-vercel-forwarded-for e x-real-ip são escritos pela plataforma e o cliente
 * não consegue forjá-los; x-forwarded-for só é usado fora dela (dev local), como último recurso.
 */
export function clientIp(request: RequestLike) {
  const raw = header(request, "x-vercel-forwarded-for") || header(request, "x-real-ip") || header(request, "x-forwarded-for") || "";
  return raw.split(",")[0].trim() || "unknown";
}

/**
 * Segredo do hash: COUNTER_SALT (recomendado) ou, na falta dele, o token do Redis, que também só existe no servidor.
 * O hash nunca depende de um valor público do repositório, então ninguém reconstrói o IP a partir dele.
 */
function hashSecret(): string {
  const secret = process.env.COUNTER_SALT || redisConfig()?.token;
  if (!secret) throw new Error("counter secret not configured");
  return secret;
}

/**
 * Identificador anônimo do visitante: HMAC-SHA256 do IP com um segredo do servidor (nada é guardado em texto puro).
 * O user-agent fica de fora de propósito: trocar de navegador não pode virar "outra pessoa" para votos e visitas.
 */
export function visitorId(request: RequestLike) {
  return createHmac("sha256", hashSecret()).update(clientIp(request)).digest("hex").slice(0, 32);
}

/** Corpo declarado acima do limite: recusado antes de qualquer trabalho. */
export function bodyTooLarge(request: RequestLike) {
  const length = Number(header(request, "content-length") || 0);
  return Number.isFinite(length) && length > MAX_BODY_BYTES;
}

/** Registra a falha no log da função, sem dados do visitante, para não virar erro silencioso. */
export function logFailure(route: string, error: unknown) {
  console.error(`[api/${route}] redis failure: ${error instanceof Error ? error.message : String(error)}`);
}

export function toCount(value: unknown) {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

export function noStore<T>(response: ResponseLike<T>) {
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("X-Content-Type-Options", "nosniff");
}
