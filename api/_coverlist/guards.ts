/** Leitura defensiva de JSON de origem: nada é confiado, tudo é checado campo a campo. */

export type Json = Record<string, unknown>;

export function isObject(value: unknown): value is Json {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function str(value: unknown, max = 200): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.replace(/\s+/g, " ").trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

export function num(value: unknown): number | null {
  const n = typeof value === "number" ? value : typeof value === "string" && value.trim() ? Number(value) : NaN;
  return Number.isFinite(n) ? n : null;
}

export function idString(value: unknown): string | null {
  if (typeof value === "number" && Number.isSafeInteger(value) && value > 0) return String(value);
  if (typeof value === "string" && /^\d{1,20}$/.test(value)) return value;
  return null;
}

export function arr(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

/** Só aceita https em hosts conhecidos: evita repassar ao app qualquer URL arbitrária vinda da origem. */
export function httpsUrl(value: unknown, hosts: readonly string[]): string | null {
  if (typeof value !== "string" || value.length > 2048) return null;
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:") return null;
  const host = parsed.hostname.toLowerCase();
  return hosts.some((allowed) => host === allowed || host.endsWith(`.${allowed}`)) ? parsed.toString() : null;
}

/** Data da origem para ISO 8601. Aceita "2026-11-25 13:26:09" (Deezer, UTC) e RFC 1123 (Apple RSS). */
export function isoDate(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const deezer = /^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2})$/.exec(value.trim());
  const date = new Date(deezer ? `${deezer[1]}T${deezer[2]}Z` : value);
  return Number.isNaN(date.getTime()) || date.getUTCFullYear() < 2000 ? null : date.toISOString();
}
