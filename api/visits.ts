import { KEY_PREFIX, noStore, redis, redisConfig, toCount, visitorId, type RequestLike, type ResponseLike } from "./_redis.js";

export type VisitsApiResponse = { available: true; visits: number } | { available: false };

const VISITS_KEY = `${KEY_PREFIX}visits`;
/** Mesma pessoa só conta de novo depois de 12 horas. */
const DEDUPE_SECONDS = 60 * 60 * 12;

const COUNT_VISIT = `
local fresh = redis.call('SET', KEYS[1], '1', 'NX', 'EX', ARGV[1])
if fresh then return redis.call('INCR', KEYS[2]) end
return tonumber(redis.call('GET', KEYS[2]) or '0')
`;

/**
 * GET  → total de visitas.
 * POST → registra a visita (com dedupe por visitante) e devolve o total.
 */
export default async function handler(request: RequestLike, response: ResponseLike<VisitsApiResponse>) {
  noStore(response);
  if (request.method !== "GET" && request.method !== "POST") {
    response.setHeader("Allow", "GET, POST");
    return response.status(405).json({ available: false });
  }
  if (!redisConfig()) return response.status(200).json({ available: false });

  try {
    const result =
      request.method === "POST"
        ? await redis(["EVAL", COUNT_VISIT, 2, `${KEY_PREFIX}seen:${visitorId(request)}`, VISITS_KEY, DEDUPE_SECONDS])
        : await redis(["GET", VISITS_KEY]);
    return response.status(200).json({ available: true, visits: toCount(result) });
  } catch {
    return response.status(200).json({ available: false });
  }
}
