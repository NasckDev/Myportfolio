/** Validação de cada parâmetro aceito pelo proxy. Tudo que não passa vira 400 antes de qualquer chamada à origem. */

export class ParamError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ParamError";
  }
}

export type Query = Record<string, string | string[] | undefined>;

/** Primeira ocorrência do parâmetro; repetições são ignoradas. */
export function param(query: Query, name: string): string | undefined {
  const value = query[name];
  return Array.isArray(value) ? value[0] : value;
}

function required(query: Query, name: string): string {
  const value = param(query, name);
  if (value === undefined || value === "") throw new ParamError(`Parâmetro obrigatório ausente: ${name}`);
  return value;
}

/** Primeiro dia com placar disponível na fonte para a NBA moderna; antes disso não há o que mostrar. */
const MIN_DATE = "20020101";
/** Margem para frente: o calendário da temporada seguinte sai com alguns meses de antecedência. */
const MAX_DAYS_AHEAD = 400;

export function dateParam(query: Query, now: Date, name = "date"): string {
  const value = required(query, name);
  if (!/^\d{8}$/.test(value)) throw new ParamError("Data inválida: use o formato AAAAMMDD");
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(4, 6));
  const day = Number(value.slice(6, 8));
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    throw new ParamError("Data inválida: dia inexistente");
  }
  const max = new Date(now.getTime() + MAX_DAYS_AHEAD * 86_400_000);
  const maxStamp = `${max.getUTCFullYear()}${String(max.getUTCMonth() + 1).padStart(2, "0")}${String(max.getUTCDate()).padStart(2, "0")}`;
  if (value < MIN_DATE || value > maxStamp) throw new ParamError("Data fora do intervalo disponível");
  return value;
}

export function idParam(query: Query, name = "id", maxDigits = 12): string {
  const value = required(query, name);
  if (!new RegExp(`^[1-9]\\d{0,${maxDigits - 1}}$`).test(value)) throw new ParamError(`Identificador inválido: ${name}`);
  return value;
}

export const MAX_IDS = 30;

export function idListParam(query: Query, name = "ids"): string[] {
  const value = required(query, name);
  const ids = value.split(",");
  if (ids.length > MAX_IDS) throw new ParamError(`No máximo ${MAX_IDS} identificadores por chamada`);
  const unique = [...new Set(ids)];
  for (const id of unique) {
    if (!/^[1-9]\d{0,11}$/.test(id)) throw new ParamError(`Identificador inválido: ${name}`);
  }
  return unique;
}

/** A NBA tem 30 times; a ESPN usa ids de 1 a 30 (com lacunas), então dois dígitos bastam. */
export function teamIdParam(query: Query, name = "team"): string {
  const value = required(query, name);
  if (!/^[1-9]\d?$/.test(value)) throw new ParamError("Time inválido");
  return value;
}

/** Temporadas pelo ano em que terminam (2027 = 2026-27), como a ESPN numera. */
export function yearParam(query: Query, now: Date, name = "year"): number {
  const value = required(query, name);
  if (!/^\d{4}$/.test(value)) throw new ParamError("Ano inválido");
  const year = Number(value);
  if (year < 2002 || year > now.getUTCFullYear() + 1) throw new ParamError("Ano fora do intervalo disponível");
  return year;
}

export const SEARCH_MIN = 2;
export const SEARCH_MAX = 40;

export function searchParam(query: Query, name = "q"): string {
  const value = (param(query, name) ?? "").normalize("NFC").replace(/\s+/g, " ").trim();
  if (value.length < SEARCH_MIN) throw new ParamError(`A busca precisa de pelo menos ${SEARCH_MIN} letras`);
  if (value.length > SEARCH_MAX) throw new ParamError(`A busca aceita no máximo ${SEARCH_MAX} caracteres`);
  if (!/^[\p{L}\p{M}0-9 .'’-]+$/u.test(value)) throw new ParamError("A busca aceita só letras, números, espaço, ponto, hífen e apóstrofo");
  return value;
}
