import { createHash } from "node:crypto";

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

/** Identificador anônimo do visitante: hash de IP + user-agent (nada é guardado em texto puro). */
export function visitorId(request: RequestLike) {
  const ip = (header(request, "x-forwarded-for") || header(request, "x-real-ip") || "unknown").split(",")[0].trim();
  const ua = header(request, "user-agent") || "";
  const salt = process.env.COUNTER_SALT || "adn-portfolio";
  return createHash("sha256").update(`${salt}|${ip}|${ua}`).digest("hex").slice(0, 32);
}

export function toCount(value: unknown) {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

export function noStore<T>(response: ResponseLike<T>) {
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("X-Content-Type-Options", "nosniff");
}
