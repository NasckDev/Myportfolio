import { arr, httpsUrl, idString, isObject, isoDate, num, str, type Json } from "./guards.js";
import type { Artwork, PlaylistHit, ShortLinkTarget, Track } from "./types.js";

/** Hosts aceitos em URLs que saem do proxy. Qualquer outro é descartado. */
export const DEEZER_HOSTS = ["dzcdn.net", "deezer.com"] as const;
export const APPLE_HOSTS = ["mzstatic.com", "apple.com"] as const;

const TITLE_MAX = 120;
const ARTIST_MAX = 120;

/* ------------------------------------------------------------------ Deezer */

function deezerArtwork(album: unknown): Artwork | null {
  if (!isObject(album)) return null;
  const small = httpsUrl(album.cover_small, DEEZER_HOSTS);
  const medium = httpsUrl(album.cover_medium, DEEZER_HOSTS);
  const large = httpsUrl(album.cover_big, DEEZER_HOSTS) ?? httpsUrl(album.cover_xl, DEEZER_HOSTS);
  if (!medium && !large && !small) return null;
  const any = (medium ?? large ?? small) as string;
  return { small: small ?? any, medium: medium ?? any, large: large ?? any };
}

/** Faixa do Deezer (search, chart, playlist ou track) para o tipo único. */
export function normalizeDeezerTrack(raw: unknown): Track | null {
  if (!isObject(raw)) return null;
  const id = idString(raw.id);
  const title = str(raw.title, TITLE_MAX);
  const artist = isObject(raw.artist) ? str(raw.artist.name, ARTIST_MAX) : null;
  if (!id || !title || !artist || raw.type !== "track") return null;
  const readable = raw.readable !== false;
  const hasPreview = readable && typeof raw.preview === "string" && raw.preview.length > 0;
  const duration = num(raw.duration);
  return {
    id: `dz:${id}`,
    title,
    artist,
    album: isObject(raw.album) ? str(raw.album.title, TITLE_MAX) : null,
    durationSec: duration && duration > 0 ? Math.round(duration) : null,
    artwork: deezerArtwork(raw.album),
    // A URL do Deezer é assinada e expira em minutos: só o id viaja, a URL é resolvida ao tocar.
    preview: hasPreview ? { kind: "deezer", trackId: id } : null,
    source: "deezer",
    explicit: raw.explicit_lyrics === true,
    link: `https://www.deezer.com/track/${id}`,
  };
}

export function normalizeDeezerTracks(list: unknown, limit: number): Track[] {
  const out: Track[] = [];
  for (const item of arr(list)) {
    const track = normalizeDeezerTrack(item);
    if (track) out.push(track);
    if (out.length >= limit) break;
  }
  return out;
}

/** Lê o objeto `error` que o Deezer devolve com HTTP 200. */
export function deezerError(raw: unknown): { code: number | null; type: string | null } | null {
  if (!isObject(raw) || !isObject(raw.error)) return null;
  return { code: num(raw.error.code), type: str(raw.error.type, 60) };
}

export function deezerPreviewUrl(raw: unknown): { url: string | null; expiresAt: number | null } {
  if (!isObject(raw)) return { url: null, expiresAt: null };
  const url = raw.readable === false ? null : httpsUrl(raw.preview, DEEZER_HOSTS);
  const exp = url ? /[?&~]hdnea=exp=(\d{9,11})/.exec(url) : null;
  return { url, expiresAt: exp ? Number(exp[1]) * 1000 : null };
}

export interface DeezerPlaylistMeta {
  id: string;
  title: string;
  description: string;
  creator: string | null;
  updatedAt: string | null;
  total: number;
}

export function normalizeDeezerPlaylist(raw: unknown, limit: number): { meta: DeezerPlaylistMeta; tracks: Track[] } | null {
  if (!isObject(raw)) return null;
  const id = idString(raw.id);
  const title = str(raw.title, 120);
  if (!id || !title) return null;
  const tracksBlock: Json = isObject(raw.tracks) ? raw.tracks : {};
  const tracks = normalizeDeezerTracks(tracksBlock.data, limit);
  const creator = isObject(raw.creator) ? str(raw.creator.name, 80) : isObject(raw.user) ? str(raw.user.name, 80) : null;
  return {
    meta: {
      id,
      title,
      description: str(raw.description, 300) ?? "",
      creator,
      updatedAt: isoDate(raw.mod_date) ?? isoDate(raw.creation_date),
      total: Math.max(tracks.length, num(raw.nb_tracks) ?? 0),
    },
    tracks,
  };
}

/** Resultado de `search/playlist` do Deezer: só playlists públicas, com capa em hosts conhecidos. */
export function normalizeDeezerPlaylistHits(raw: unknown, limit: number): PlaylistHit[] {
  const out: PlaylistHit[] = [];
  for (const item of arr(isObject(raw) ? raw.data : null)) {
    if (!isObject(item) || item.type !== "playlist" || item.public === false) continue;
    const id = idString(item.id);
    const title = str(item.title, 120);
    if (!id || !title) continue;
    const small = httpsUrl(item.picture_small, DEEZER_HOSTS);
    const medium = httpsUrl(item.picture_medium, DEEZER_HOSTS);
    const large = httpsUrl(item.picture_big, DEEZER_HOSTS);
    const any = medium ?? large ?? small;
    out.push({
      id,
      title,
      creator: isObject(item.user) ? str(item.user.name, 80) : null,
      total: Math.max(0, num(item.nb_tracks) ?? 0),
      artwork: any ? { small: small ?? any, medium: medium ?? any, large: large ?? any } : null,
    });
    if (out.length >= limit) break;
  }
  return out;
}

const DEEZER_ITEM_PATH = /^\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?(playlist|album|track|artist)\/(\d{1,15})\/?$/i;

/**
 * Destino de um link de compartilhar do Deezer a partir do Location do redirect.
 * Conferido em 27/11/2026: um código válido responde 301 para `link.deezer.com/?…&dest=<endereço deezer.com>`;
 * um código vencido ou inexistente responde 302 para `www.deezer.com/deezer-links-404` (devolve null).
 */
export function deezerLinkTarget(location: string): ShortLinkTarget | null {
  let first: URL;
  try {
    first = new URL(location, "https://link.deezer.com/");
  } catch {
    return null;
  }
  const dest = first.hostname === "link.deezer.com" ? first.searchParams.get("dest") : null;
  const target = httpsUrl(dest ?? first.toString(), ["deezer.com"]);
  if (!target) return null;
  const url = new URL(target);
  if (url.hostname === "link.deezer.com" || /links-404/.test(url.pathname)) return null;
  const match = DEEZER_ITEM_PATH.exec(url.pathname);
  if (!match) return { kind: "other", id: null };
  return { kind: match[1].toLowerCase() as ShortLinkTarget["kind"], id: match[2] };
}

/* ------------------------------------------------------------- Apple/iTunes */

const ART_SIZE = /\/\d{2,4}x\d{2,4}(bb|cc|-\d+)?\.(jpg|png|webp)$/;

/** As capas do iTunes aceitam o tamanho no fim do caminho (…/100x100bb.jpg). */
export function appleArtwork(url100: unknown): Artwork | null {
  const base = httpsUrl(url100, APPLE_HOSTS);
  if (!base) return null;
  if (!ART_SIZE.test(base)) return { small: base, medium: base, large: base };
  const at = (size: number) => base.replace(ART_SIZE, `/${size}x${size}bb.jpg`);
  return { small: at(100), medium: at(300), large: at(600) };
}

export function normalizeItunesTrack(raw: unknown): Track | null {
  if (!isObject(raw) || raw.wrapperType !== "track" || raw.kind !== "song") return null;
  const id = idString(raw.trackId);
  const title = str(raw.trackName, TITLE_MAX);
  const artist = str(raw.artistName, ARTIST_MAX);
  if (!id || !title || !artist) return null;
  const preview = httpsUrl(raw.previewUrl, APPLE_HOSTS);
  const millis = num(raw.trackTimeMillis);
  return {
    id: `it:${id}`,
    title,
    artist,
    album: str(raw.collectionName, TITLE_MAX),
    durationSec: millis && millis > 0 ? Math.round(millis / 1000) : null,
    artwork: appleArtwork(raw.artworkUrl100),
    preview: preview ? { kind: "url", url: preview } : null,
    source: "itunes",
    explicit: raw.trackExplicitness === "explicit",
    link: httpsUrl(raw.trackViewUrl, APPLE_HOSTS),
  };
}

export function normalizeItunesResults(raw: unknown, limit: number): Track[] {
  const out: Track[] = [];
  for (const item of arr(isObject(raw) ? raw.results : null)) {
    const track = normalizeItunesTrack(item);
    if (track) out.push(track);
    if (out.length >= limit) break;
  }
  return out;
}

export interface AppleChart {
  title: string;
  updatedAt: string | null;
  tracks: Track[];
}

/** Feed do Apple Marketing Tools RSS. Não traz prévia nem duração: isso vem do lookup em lote. */
export function normalizeAppleRss(raw: unknown, limit: number): AppleChart | null {
  if (!isObject(raw) || !isObject(raw.feed)) return null;
  const feed = raw.feed;
  const tracks: Track[] = [];
  for (const item of arr(feed.results)) {
    if (!isObject(item) || item.kind !== "songs") continue;
    const id = idString(item.id);
    const title = str(item.name, TITLE_MAX);
    const artist = str(item.artistName, ARTIST_MAX);
    if (!id || !title || !artist) continue;
    tracks.push({
      id: `it:${id}`,
      title,
      artist,
      album: null,
      durationSec: null,
      artwork: appleArtwork(item.artworkUrl100),
      preview: null,
      source: "itunes",
      explicit: item.contentAdvisoryRating === "Explict" || item.contentAdvisoryRating === "Explicit",
      link: httpsUrl(item.url, APPLE_HOSTS),
    });
    if (tracks.length >= limit) break;
  }
  return { title: str(feed.title, 120) ?? "Paradas", updatedAt: isoDate(feed.updated), tracks };
}

/** Completa as faixas da parada com prévia, duração, álbum e capa do lookup do iTunes (mesmo id). */
export function enrichWithLookup(tracks: Track[], lookup: unknown): Track[] {
  const byId = new Map<string, Track>();
  for (const found of normalizeItunesResults(lookup, 200)) byId.set(found.id, found);
  return tracks.map((track) => {
    const found = byId.get(track.id);
    if (!found) return track;
    return {
      ...track,
      album: found.album ?? track.album,
      durationSec: found.durationSec ?? track.durationSec,
      artwork: track.artwork ?? found.artwork,
      preview: found.preview ?? track.preview,
      explicit: track.explicit || found.explicit,
      link: track.link ?? found.link,
    };
  });
}
