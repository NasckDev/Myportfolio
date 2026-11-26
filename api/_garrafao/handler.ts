import { OriginError, type FetchLike } from "./fetch-json.js";
import { OPERATIONS, type CachePolicy } from "./ops.js";
import { ParamError, param, type Query } from "./validate.js";

/** Mesma forma das Functions Node da Vercel (e do middleware do Vite no desenvolvimento). */
export interface NbaRequest {
  method?: string;
  url?: string;
  query?: Query;
}

export interface NbaResponse {
  setHeader(name: string, value: string): void;
  status(code: number): NbaResponse;
  json(body: unknown): void;
}

export interface HandlerDeps {
  fetch?: FetchLike;
  now?: () => Date;
  log?: (message: string) => void;
}

function readQuery(request: NbaRequest): Query {
  if (request.query && typeof request.query === "object") return request.query;
  const url = new URL(request.url ?? "/", "http://localhost");
  const query: Query = {};
  for (const [key, value] of url.searchParams) {
    const current = query[key];
    query[key] = current === undefined ? value : ([] as string[]).concat(current, value);
  }
  return query;
}

function cacheHeader(policy: CachePolicy) {
  return `public, max-age=0, s-maxage=${policy.sMaxAge}, stale-while-revalidate=${policy.swr}`;
}

function fail(response: NbaResponse, status: number, error: string, cache = "no-store") {
  response.setHeader("Cache-Control", cache);
  return response.status(status).json({ error });
}

export const MESSAGES = {
  method: "Método não permitido",
  unknownOp: "Operação desconhecida",
  unknownParam: "Parâmetro não aceito nesta operação",
  notFound: "Não encontrado",
  origin: "A fonte de dados não respondeu. Tente de novo em instantes.",
} as const;

/**
 * Proxy da NBA: lista fechada de operações (`op`), cada uma com parâmetros validados,
 * URL de origem montada no servidor, timeout, normalização e cache por tipo de dado.
 */
export function createNbaHandler(deps: HandlerDeps = {}) {
  const fetcher: FetchLike = deps.fetch ?? ((input, init) => fetch(input, init));
  const now = deps.now ?? (() => new Date());
  const log = deps.log ?? ((message: string) => console.error(message));

  return async function handleNba(request: NbaRequest, response: NbaResponse) {
    response.setHeader("X-Content-Type-Options", "nosniff");
    const method = (request.method ?? "GET").toUpperCase();
    if (method !== "GET" && method !== "HEAD") {
      response.setHeader("Allow", "GET, HEAD");
      return fail(response, 405, MESSAGES.method);
    }

    const query = readQuery(request);
    const opName = param(query, "op") ?? "";
    const operation = Object.prototype.hasOwnProperty.call(OPERATIONS, opName) ? OPERATIONS[opName] : undefined;
    if (!operation) return fail(response, 400, MESSAGES.unknownOp);
    // Parâmetro extra é recusado: além de não ter uso, ele criaria variações inúteis da chave de cache na CDN.
    const extra = Object.keys(query).filter((key) => key !== "op" && !operation.params.includes(key));
    if (extra.length > 0) return fail(response, 400, MESSAGES.unknownParam);

    try {
      const result = await operation.run(query, { fetch: fetcher, now: now() });
      response.setHeader("Cache-Control", cacheHeader(result.cache));
      return response.status(200).json(result.body);
    } catch (error) {
      if (error instanceof ParamError) return fail(response, 400, error.message);
      if (error instanceof OriginError && error.status === 404) {
        return fail(response, 404, MESSAGES.notFound, "public, max-age=0, s-maxage=60");
      }
      const detail = error instanceof OriginError ? `${error.reason}${error.status ? ` ${error.status}` : ""}` : "unexpected";
      log(`[api/nba] op=${opName} origin failure: ${detail}`);
      return fail(response, 502, MESSAGES.origin);
    }
  };
}

export const handleNba = createNbaHandler();
