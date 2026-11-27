import { APPLE_COUNTRIES, COLLECTIONS, COLLECTIONS_VERSION, findCollection, type AppleCountry, type CollectionDef } from "./collections.js";
import { UpstreamError, type FetchLike, type UpstreamOptions } from "./http.js";
import { appleChart, deezerPlaylist, deezerPlaylistSearch, deezerPreview, deezerShortLink, itunesPreview, spotifyName, unifiedSearch } from "./sources.js";
import type { ApiError, CollectionDetail, CollectionSummary } from "./types.js";

/** Formato mínimo de request/response da Vercel (Node) e do middleware do Vite. */
export interface CoverlistRequest {
  method?: string;
  url?: string;
  query?: Record<string, string | string[] | undefined>;
}

export interface CoverlistResponse {
  setHeader(name: string, value: string): void;
  status(code: number): CoverlistResponse;
  json(body: unknown): void;
}

/** Faixas por coleção/playlist devolvidas ao app. */
export const MAX_COLLECTION_TRACKS = 100;
export const SEARCH_DEFAULT_LIMIT = 20;
export const SEARCH_MAX_LIMIT = 25;
export const PLAYLIST_SEARCH_DEFAULT_LIMIT = 12;
export const QUERY_MIN = 2;
export const QUERY_MAX = 80;
const CHART_LIMITS = [10, 25, 50, 100] as const;

/**
 * Cache na borda por tipo de dado (segundos). Paradas mudam uma vez por dia; playlists editoriais, menos;
 * a busca pode envelhecer um pouco; a prévia do Deezer é assinada e expira em ~15 min, então fica pouco.
 */
export const CACHE_POLICY = {
  collections: { sMaxAge: 86_400, swr: 604_800 },
  collectionChart: { sMaxAge: 3_600, swr: 21_600 },
  collectionPlaylist: { sMaxAge: 21_600, swr: 86_400 },
  charts: { sMaxAge: 3_600, swr: 21_600 },
  playlist: { sMaxAge: 900, swr: 3_600 },
  search: { sMaxAge: 1_800, swr: 3_600 },
  track: { sMaxAge: 300, swr: 60 },
  lookup: { sMaxAge: 86_400, swr: 604_800 },
  spotify: { sMaxAge: 86_400, swr: 604_800 },
  playlists: { sMaxAge: 1_800, swr: 3_600 },
  shortlink: { sMaxAge: 86_400, swr: 604_800 },
  notFound: { sMaxAge: 300, swr: 0 },
} as const;

type Policy = (typeof CACHE_POLICY)[keyof typeof CACHE_POLICY];

const OPS = {
  collections: [],
  collection: ["id"],
  charts: ["country", "limit"],
  playlist: ["id"],
  search: ["q", "limit", "country"],
  track: ["id"],
  lookup: ["id", "country"],
  spotify: ["id"],
  playlists: ["q", "limit"],
  shortlink: ["code"],
} as const satisfies Record<string, readonly string[]>;

export type Op = keyof typeof OPS;
export const OP_NAMES = Object.keys(OPS) as Op[];

class BadRequest extends Error {
  constructor(readonly code: string) {
    super(code);
  }
}

class NotFound extends Error {
  constructor(readonly code: string) {
    super(code);
  }
}

function readParams(request: CoverlistRequest): Map<string, string> {
  const params = new Map<string, string>();
  if (request.url) {
    const url = new URL(request.url, "http://localhost");
    for (const key of new Set(url.searchParams.keys())) {
      const values = url.searchParams.getAll(key);
      if (values.length !== 1) throw new BadRequest("duplicate_param");
      params.set(key, values[0]);
    }
    return params;
  }
  for (const [key, value] of Object.entries(request.query ?? {})) {
    if (value === undefined) continue;
    if (Array.isArray(value)) throw new BadRequest("duplicate_param");
    params.set(key, value);
  }
  return params;
}

function parseOp(params: Map<string, string>): Op {
  const op = params.get("op");
  if (!op || !(op in OPS)) throw new BadRequest("unknown_op");
  const allowed = new Set<string>(["op", ...OPS[op as Op]]);
  for (const key of params.keys()) if (!allowed.has(key)) throw new BadRequest("unknown_param");
  return op as Op;
}

function numericId(value: string | undefined): string {
  if (!value || !/^[1-9]\d{0,14}$/.test(value)) throw new BadRequest("invalid_id");
  return value;
}

function country(value: string | undefined, fallback: AppleCountry): AppleCountry {
  if (value === undefined) return fallback;
  if (!(APPLE_COUNTRIES as readonly string[]).includes(value)) throw new BadRequest("invalid_country");
  return value as AppleCountry;
}

function intIn(value: string | undefined, fallback: number, min: number, max: number): number {
  if (value === undefined) return fallback;
  if (!/^\d{1,3}$/.test(value)) throw new BadRequest("invalid_limit");
  const n = Number(value);
  if (n < min || n > max) throw new BadRequest("invalid_limit");
  return n;
}

function setCache(response: CoverlistResponse, policy: Policy | null) {
  response.setHeader(
    "Cache-Control",
    policy ? `public, s-maxage=${policy.sMaxAge}, stale-while-revalidate=${policy.swr}` : "no-store",
  );
}

function summary(def: CollectionDef): CollectionSummary {
  const source =
    def.source.kind === "apple-chart"
      ? { kind: "apple-chart" as const, country: def.source.country, label: `Apple Music · ${def.source.country.toUpperCase()}` }
      : { kind: "deezer-playlist" as const, playlistId: def.source.playlistId, label: `Deezer · ${def.source.owner}` };
  return {
    id: def.id,
    title: def.title,
    description: def.description,
    group: def.group,
    theme: def.theme,
    source,
    ...(def.era ? { era: def.era } : {}),
    ...(def.scope ? { scope: def.scope } : {}),
  };
}

async function collectionDetail(def: CollectionDef, options: UpstreamOptions): Promise<CollectionDetail> {
  if (def.source.kind === "apple-chart") {
    const chart = await appleChart(def.source.country, def.source.limit, options);
    return { ...summary(def), updatedAt: chart.updatedAt, total: chart.tracks.length, tracks: chart.tracks };
  }
  const playlist = await deezerPlaylist(def.source.playlistId, MAX_COLLECTION_TRACKS, options);
  return { ...summary(def), updatedAt: playlist.updatedAt, total: playlist.total, tracks: playlist.tracks };
}

async function run(op: Op, params: Map<string, string>, options: UpstreamOptions): Promise<{ body: unknown; policy: Policy }> {
  switch (op) {
    case "collections":
      return { body: { version: COLLECTIONS_VERSION, collections: COLLECTIONS.map(summary) }, policy: CACHE_POLICY.collections };
    case "collection": {
      const id = params.get("id") ?? "";
      const def = /^[a-z0-9-]{1,40}$/.test(id) ? findCollection(id) : undefined;
      if (!def) throw new NotFound("unknown_collection");
      const body = await collectionDetail(def, options);
      return { body, policy: def.source.kind === "apple-chart" ? CACHE_POLICY.collectionChart : CACHE_POLICY.collectionPlaylist };
    }
    case "charts": {
      const limit = intIn(params.get("limit"), 50, 10, 100);
      if (!(CHART_LIMITS as readonly number[]).includes(limit)) throw new BadRequest("invalid_limit");
      return { body: await appleChart(country(params.get("country"), "br"), limit, options), policy: CACHE_POLICY.charts };
    }
    case "playlist":
      return { body: await deezerPlaylist(numericId(params.get("id")), MAX_COLLECTION_TRACKS, options), policy: CACHE_POLICY.playlist };
    case "search": {
      const q = (params.get("q") ?? "").replace(/\s+/g, " ").trim();
      if (q.length < QUERY_MIN || q.length > QUERY_MAX) throw new BadRequest("invalid_query");
      const limit = intIn(params.get("limit"), SEARCH_DEFAULT_LIMIT, 1, SEARCH_MAX_LIMIT);
      return { body: await unifiedSearch(q, limit, country(params.get("country"), "br"), options), policy: CACHE_POLICY.search };
    }
    case "track":
      return { body: await deezerPreview(numericId(params.get("id")), options), policy: CACHE_POLICY.track };
    case "lookup":
      return { body: await itunesPreview(numericId(params.get("id")), country(params.get("country"), "br"), options), policy: CACHE_POLICY.lookup };
    case "playlists": {
      const q = (params.get("q") ?? "").replace(/\s+/g, " ").trim();
      if (q.length < QUERY_MIN || q.length > QUERY_MAX) throw new BadRequest("invalid_query");
      const limit = intIn(params.get("limit"), PLAYLIST_SEARCH_DEFAULT_LIMIT, 1, SEARCH_MAX_LIMIT);
      return { body: await deezerPlaylistSearch(q, limit, options), policy: CACHE_POLICY.playlists };
    }
    case "shortlink": {
      const code = params.get("code") ?? "";
      if (!/^[A-Za-z0-9]{4,40}$/.test(code)) throw new BadRequest("invalid_code");
      return { body: await deezerShortLink(code, options), policy: CACHE_POLICY.shortlink };
    }
    case "spotify": {
      const id = params.get("id") ?? "";
      if (!/^[A-Za-z0-9]{22}$/.test(id)) throw new BadRequest("invalid_id");
      return { body: await spotifyName(id, options), policy: CACHE_POLICY.spotify };
    }
  }
}

export interface HandlerDeps {
  fetch?: FetchLike;
  timeoutMs?: number;
  retryDelayMs?: number;
}

/**
 * Proxy de música: lista fechada de operações, cada uma com seus parâmetros validados.
 * Nenhuma URL vem do cliente (sem SSRF): o servidor monta todas a partir de ids validados.
 */
export function createHandler(deps: HandlerDeps = {}) {
  const options: UpstreamOptions = { fetch: deps.fetch, timeoutMs: deps.timeoutMs, retryDelayMs: deps.retryDelayMs };
  return async function handleCoverlist(request: CoverlistRequest, response: CoverlistResponse): Promise<void> {
    response.setHeader("X-Content-Type-Options", "nosniff");
    if (request.method !== "GET" && request.method !== "HEAD") {
      response.setHeader("Allow", "GET, HEAD");
      setCache(response, null);
      return response.status(405).json({ error: "method_not_allowed" } satisfies ApiError);
    }
    let op: Op | "?" = "?";
    try {
      const params = readParams(request);
      op = parseOp(params);
      const { body, policy } = await run(op, params, options);
      setCache(response, policy);
      return response.status(200).json(body);
    } catch (error) {
      if (error instanceof BadRequest) {
        setCache(response, null);
        return response.status(400).json({ error: error.code } satisfies ApiError);
      }
      if (error instanceof NotFound || (error instanceof UpstreamError && error.failure === "not_found")) {
        setCache(response, CACHE_POLICY.notFound);
        return response.status(404).json({ error: "not_found" } satisfies ApiError);
      }
      console.error(`[api/coverlist] op=${op} upstream failure: ${error instanceof Error ? error.message : "unknown"}`);
      setCache(response, null);
      return response.status(502).json({ error: "upstream_unavailable" } satisfies ApiError);
    }
  };
}

export const handleCoverlist = createHandler();
