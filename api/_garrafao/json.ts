/** Leitura defensiva do JSON da fonte: nada é confiável, tudo pode faltar ou mudar de tipo. */

export type JsonObject = Record<string, unknown>;

export function isObj(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function obj(value: unknown): JsonObject {
  return isObj(value) ? value : {};
}

export function arr(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function str(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
  }
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

export function num(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number.parseFloat(value.replace(",", "."));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

/** Caminho seguro: `at(raw, "a", 0, "b")` equivale a `raw?.a?.[0]?.b` sem confiar nos tipos. */
export function at(value: unknown, ...keys: (string | number)[]): unknown {
  let current: unknown = value;
  for (const key of keys) {
    current = typeof key === "number" ? arr(current)[key] : obj(current)[key];
    if (current === undefined) return undefined;
  }
  return current;
}

/** Só aceita links http(s): evita `javascript:` e afins vindos da fonte. */
export function httpUrl(value: unknown): string | null {
  const raw = str(value);
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol === "https:") return url.toString();
    if (url.protocol === "http:") return url.toString().replace(/^http:/, "https:");
    return null;
  } catch {
    return null;
  }
}

/** Cor em hex de 6 dígitos, sem `#`, em minúsculas. */
export function hexColor(value: unknown): string | null {
  const raw = str(value);
  if (!raw) return null;
  const clean = raw.replace(/^#/, "").toLowerCase();
  return /^[0-9a-f]{6}$/.test(clean) ? clean : null;
}
