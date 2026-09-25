import { KEY_PREFIX, noStore, redis, redisConfig, toCount, visitorId, type RequestLike, type ResponseLike } from "./_redis.js";

export type Vote = "up" | "down" | null;

export type VotesApiResponse =
  | { available: true; likes: number; dislikes: number; vote: Vote }
  | { available: false; reason?: "invalid" | "rate_limited" };

const LIKES_KEY = `${KEY_PREFIX}likes`;
const DISLIKES_KEY = `${KEY_PREFIX}dislikes`;
const VOTE_TTL_SECONDS = 60 * 60 * 24 * 365;
const RATE_LIMIT = 20;
const RATE_WINDOW_SECONDS = 600;

/**
 * Troca o voto do visitante de forma atômica: desfaz o voto anterior e aplica o novo.
 * KEYS: voto do visitante, likes, dislikes, contador de rate limit.
 * ARGV: novo voto ('up' | 'down' | ''), TTL do voto, limite, janela do limite.
 */
const SET_VOTE = `
local hits = redis.call('INCR', KEYS[4])
if hits == 1 then redis.call('EXPIRE', KEYS[4], ARGV[4]) end
if hits > tonumber(ARGV[3]) then return {-1, -1, ''} end
local cur = redis.call('GET', KEYS[1]) or ''
local nxt = ARGV[1]
if cur ~= nxt then
  if cur == 'up' then redis.call('DECR', KEYS[2]) elseif cur == 'down' then redis.call('DECR', KEYS[3]) end
  if nxt == 'up' then redis.call('INCR', KEYS[2]) elseif nxt == 'down' then redis.call('INCR', KEYS[3]) end
  if nxt == '' then redis.call('DEL', KEYS[1]) else redis.call('SET', KEYS[1], nxt, 'EX', ARGV[2]) end
end
local likes = tonumber(redis.call('GET', KEYS[2]) or '0')
local dislikes = tonumber(redis.call('GET', KEYS[3]) or '0')
if likes < 0 then redis.call('SET', KEYS[2], 0) likes = 0 end
if dislikes < 0 then redis.call('SET', KEYS[3], 0) dislikes = 0 end
return {likes, dislikes, nxt}
`;

const READ_VOTES = `
return {tonumber(redis.call('GET', KEYS[1]) or '0'), tonumber(redis.call('GET', KEYS[2]) or '0'), redis.call('GET', KEYS[3]) or ''}
`;

function parseVote(body: unknown): Vote | undefined {
  let data = body;
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      return undefined;
    }
  }
  if (!data || typeof data !== "object" || !("vote" in data)) return undefined;
  const vote = (data as { vote: unknown }).vote;
  if (vote === "up" || vote === "down" || vote === null) return vote;
  return undefined;
}

const asVote = (value: unknown): Vote => (value === "up" || value === "down" ? value : null);

/**
 * GET  → { likes, dislikes, vote } (vote = voto atual deste visitante).
 * POST → body { vote: "up" | "down" | null } define o voto do visitante.
 */
export default async function handler(request: RequestLike, response: ResponseLike<VotesApiResponse>) {
  noStore(response);
  if (request.method !== "GET" && request.method !== "POST") {
    response.setHeader("Allow", "GET, POST");
    return response.status(405).json({ available: false });
  }
  if (!redisConfig()) return response.status(200).json({ available: false });

  const id = visitorId(request);
  const voteKey = `${KEY_PREFIX}vote:${id}`;

  try {
    if (request.method === "GET") {
      const [likes, dislikes, vote] = (await redis(["EVAL", READ_VOTES, 3, LIKES_KEY, DISLIKES_KEY, voteKey])) as unknown[];
      return response.status(200).json({ available: true, likes: toCount(likes), dislikes: toCount(dislikes), vote: asVote(vote) });
    }

    const vote = parseVote(request.body);
    if (vote === undefined) return response.status(400).json({ available: false, reason: "invalid" });

    const rateKey = `${KEY_PREFIX}rl:${id}`;
    const [likes, dislikes, current] = (await redis(["EVAL", SET_VOTE, 4, voteKey, LIKES_KEY, DISLIKES_KEY, rateKey, vote ?? "", VOTE_TTL_SECONDS, RATE_LIMIT, RATE_WINDOW_SECONDS])) as unknown[];
    if (likes === -1) return response.status(429).json({ available: false, reason: "rate_limited" });
    return response.status(200).json({ available: true, likes: toCount(likes), dislikes: toCount(dislikes), vote: asVote(current) });
  } catch {
    return response.status(200).json({ available: false });
  }
}
