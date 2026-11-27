import { dedupeTracks, interleave } from "./dedupe.js";
import { isObject, str } from "./guards.js";
import { fetchJson, fetchRedirect, TtlCache, UpstreamError, withRetry, type UpstreamOptions } from "./http.js";
import {
  deezerError,
  deezerLinkTarget,
  deezerPreviewUrl,
  normalizeDeezerPlaylistHits,
  enrichWithLookup,
  normalizeAppleRss,
  normalizeDeezerPlaylist,
  normalizeDeezerTracks,
  normalizeItunesResults,
  normalizeItunesTrack,
} from "./normalize.js";
import type { AppleCountry } from "./collections.js";
import type { ChartResult, ImportedPlaylist, PlaylistSearchResult, ResolvedPreview, SearchResult, ShortLinkTarget, SpotifyName, Track } from "./types.js";

const DEEZER_API = "https://api.deezer.com";
const DEEZER_SHARE = "https://link.deezer.com/s";
const ITUNES_API = "https://itunes.apple.com";
const APPLE_RSS = "https://rss.marketingtools.apple.com/api/v2";
/** O lookup do iTunes aceita vários ids separados por vírgula; lotes de 25 diminuem a chance de limite por IP. */
export const LOOKUP_BATCH = 25;
const MINUTE = 60_000;
/** Paradas e lookups ficam 15 min em memória e servem até 24 h se a origem cair. */
export const chartCache = new TtlCache<ChartResult>(15 * MINUTE, 24 * 60 * MINUTE);
const lookupCache = new TtlCache<unknown[]>(60 * MINUTE, 24 * 60 * MINUTE, 256);

/** Limpa os caches em memória (testes). */
export function resetCaches() {
  chartCache.clear();
  lookupCache.clear();
}

/** Erro "no data" do Deezer (código 800) é recurso inexistente; os demais são falha da origem. */
async function deezer(path: string, options: UpstreamOptions): Promise<unknown> {
  const raw = await fetchJson("deezer", `${DEEZER_API}${path}`, options);
  const error = deezerError(raw);
  if (error) {
    if (error.code === 800) throw new UpstreamError("deezer", "not_found", "code 800");
    if (error.code === 4) throw new UpstreamError("deezer", "quota", "code 4");
    throw new UpstreamError("deezer", "invalid", `code ${error.code ?? "?"}`);
  }
  return raw;
}

export async function deezerPlaylist(playlistId: string, limit: number, options: UpstreamOptions): Promise<ImportedPlaylist> {
  const raw = await deezer(`/playlist/${playlistId}`, options);
  const parsed = normalizeDeezerPlaylist(raw, limit);
  if (!parsed) throw new UpstreamError("deezer", "invalid", "playlist shape");
  return { ...parsed.meta, tracks: parsed.tracks };
}

export async function deezerPreview(trackId: string, options: UpstreamOptions): Promise<ResolvedPreview> {
  const raw = await deezer(`/track/${trackId}`, options);
  if (!isObject(raw) || raw.type !== "track") throw new UpstreamError("deezer", "invalid", "track shape");
  return { id: `dz:${trackId}`, ...deezerPreviewUrl(raw) };
}

/** Um lote do lookup, com repetição em falha temporária e cache; lote que falha não derruba os outros. */
async function lookupBatch(batch: string[], country: string, options: UpstreamOptions): Promise<unknown[] | null> {
  const key = `${country}:${batch.join(",")}`;
  const cached = lookupCache.fresh(key);
  if (cached) return cached;
  try {
    const raw = await withRetry(
      () => fetchJson("itunes", `${ITUNES_API}/lookup?id=${batch.join(",")}&country=${country}&entity=song`, options),
      options,
    );
    const results = isObject(raw) && Array.isArray(raw.results) ? raw.results : [];
    lookupCache.set(key, results);
    return results;
  } catch (error) {
    console.error(`[api/coverlist] itunes lookup failed: ${error instanceof Error ? error.message : "unknown"}`);
    return lookupCache.stale(key) ?? null;
  }
}

async function itunesLookup(ids: string[], country: string, options: UpstreamOptions): Promise<{ results: unknown[]; failedIds: Set<string> }> {
  const batches: string[][] = [];
  for (let i = 0; i < ids.length; i += LOOKUP_BATCH) batches.push(ids.slice(i, i + LOOKUP_BATCH));
  const answers = await Promise.all(batches.map((batch) => lookupBatch(batch, country, options)));
  const failedIds = new Set(batches.filter((_, i) => answers[i] === null).flat());
  return { results: answers.flatMap((a) => a ?? []), failedIds };
}

/** Prévia de uma faixa do iTunes resolvida na hora de tocar (quando o lookup em lote da parada falhou). */
export async function itunesPreview(trackId: string, country: AppleCountry, options: UpstreamOptions): Promise<ResolvedPreview> {
  const results = await lookupBatch([trackId], country, options);
  if (results === null) throw new UpstreamError("itunes", "http", "lookup unavailable");
  const track = normalizeItunesTrack(results[0]);
  return { id: `it:${trackId}`, url: track?.preview?.kind === "url" ? track.preview.url : null, expiresAt: null };
}

/**
 * Parada da Apple (RSS) enriquecida pelo lookup em lote do iTunes, que traz prévia, duração e álbum.
 * Degradação: lote do lookup que falha deixa as faixas com prévia "a resolver" (op=lookup na hora de tocar);
 * se o RSS falha, serve a última parada boa da memória. Só dá erro sem nada para mostrar.
 */
export async function appleChart(country: AppleCountry, limit: number, options: UpstreamOptions): Promise<ChartResult> {
  const key = `${country}:${limit}`;
  const cached = chartCache.fresh(key);
  if (cached) return cached;
  let raw: unknown;
  try {
    raw = await withRetry(() => fetchJson("apple-rss", `${APPLE_RSS}/${country}/music/most-played/${limit}/songs.json`, options), options);
  } catch (error) {
    const stale = chartCache.stale(key);
    if (stale) return stale;
    throw error;
  }
  const chart = normalizeAppleRss(raw, limit);
  if (!chart) throw new UpstreamError("apple-rss", "invalid", "feed shape");
  const { results, failedIds } = await itunesLookup(
    chart.tracks.map((track) => track.id.slice(3)),
    country,
    options,
  );
  const tracks = enrichWithLookup(chart.tracks, { results }).map((track) =>
    track.preview === null && failedIds.has(track.id.slice(3)) ? { ...track, preview: { kind: "itunes" as const, trackId: track.id.slice(3), country } } : track,
  );
  const result = { country, title: chart.title, updatedAt: chart.updatedAt, tracks };
  // Parada com lote faltando não vai para o cache: na próxima chamada o lookup é tentado de novo.
  if (!failedIds.size) chartCache.set(key, result);
  return result;
}

/**
 * Busca unificada: Deezer e iTunes em paralelo, normalizados, intercalados e sem duplicatas.
 * Uma fonte fora do ar não derruba a busca; só falha (502) quando as duas falham.
 */
export async function unifiedSearch(term: string, limit: number, country: AppleCountry, options: UpstreamOptions): Promise<SearchResult> {
  const query = encodeURIComponent(term);
  const [deezerResult, itunesResult] = await Promise.allSettled([
    deezer(`/search?q=${query}&limit=${limit}`, options).then((raw) => normalizeDeezerTracks(isObject(raw) ? raw.data : null, limit)),
    fetchJson("itunes", `${ITUNES_API}/search?term=${query}&media=music&entity=song&limit=${limit}&country=${country}`, options).then(
      (raw) => normalizeItunesResults(raw, limit),
    ),
  ]);
  if (deezerResult.status === "rejected" && itunesResult.status === "rejected") throw deezerResult.reason;
  const fromDeezer: Track[] = deezerResult.status === "fulfilled" ? deezerResult.value : [];
  const fromItunes: Track[] = itunesResult.status === "fulfilled" ? itunesResult.value : [];
  return {
    tracks: dedupeTracks(interleave(fromDeezer, fromItunes)).slice(0, limit),
    sources: {
      deezer: deezerResult.status === "fulfilled" ? "ok" : "error",
      itunes: itunesResult.status === "fulfilled" ? "ok" : "error",
    },
  };
}

/** Playlists públicas do Deezer pelo nome (`search/playlist`): a alternativa quando a pessoa não tem o link. */
export async function deezerPlaylistSearch(term: string, limit: number, options: UpstreamOptions): Promise<PlaylistSearchResult> {
  const raw = await deezer(`/search/playlist?q=${encodeURIComponent(term)}&limit=${limit}`, options);
  return { playlists: normalizeDeezerPlaylistHits(raw, limit) };
}

/**
 * Link de compartilhar do app do Deezer (`link.deezer.com/s/{código}`): o servidor monta a URL a partir do
 * código validado, lê só o cabeçalho Location (sem seguir o redirecionamento) e devolve o tipo e o id.
 */
export async function deezerShortLink(code: string, options: UpstreamOptions): Promise<ShortLinkTarget> {
  const location = await fetchRedirect("deezer-link", `${DEEZER_SHARE}/${code}`, options);
  const target = location ? deezerLinkTarget(location) : null;
  if (!target) throw new UpstreamError("deezer-link", "not_found", "no target");
  return target;
}

/** O Spotify só oferece oEmbed sem chave: dá o nome da playlist, nunca as faixas. */
export async function spotifyName(playlistId: string, options: UpstreamOptions): Promise<SpotifyName> {
  const target = encodeURIComponent(`https://open.spotify.com/playlist/${playlistId}`);
  const raw = await fetchJson("spotify", `https://open.spotify.com/oembed?url=${target}`, options);
  const title = isObject(raw) ? str(raw.title, 100) : null;
  if (!title) throw new UpstreamError("spotify", "invalid", "oembed shape");
  return { title };
}
