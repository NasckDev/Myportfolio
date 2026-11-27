/**
 * Contrato único entre o proxy e o app. Toda resposta de origem (Deezer, iTunes, Apple RSS)
 * é normalizada para estes tipos antes de sair do servidor.
 */

export type TrackSource = "deezer" | "itunes";

/** Capa em três tamanhos: lista (~100 px), cartão (~250–300 px) e vinil/imagem de compartilhar (~500–600 px). */
export interface Artwork {
  small: string;
  medium: string;
  large: string;
}

/**
 * Prévia de 30 s.
 * - `url`: endereço estável (iTunes), pode ser guardado.
 * - `deezer`: a URL do Deezer é assinada e expira; só o id é guardado e a URL é resolvida na hora de tocar (op=track).
 * - `itunes`: o lookup em lote da parada falhou para esta faixa; a prévia é buscada na hora de tocar (op=lookup).
 */
export type Preview = { kind: "url"; url: string } | { kind: "deezer"; trackId: string } | { kind: "itunes"; trackId: string; country: string } | null;

export interface Track {
  /** Id com prefixo da fonte: `dz:123` (Deezer) ou `it:456` (iTunes/Apple). */
  id: string;
  title: string;
  artist: string;
  album: string | null;
  durationSec: number | null;
  artwork: Artwork | null;
  preview: Preview;
  source: TrackSource;
  explicit: boolean;
  /** Link público da faixa no serviço de origem. */
  link: string | null;
}

export type CollectionGroup = "paradas" | "decadas" | "generos";

/** Década de uma coleção do grupo "decadas" (ano de início). */
export const ERAS = [1960, 1970, 1980, 1990, 2000, 2010, 2020] as const;
export type Era = (typeof ERAS)[number];

/** Recorte de origem: música brasileira ou internacional. */
export type CollectionScope = "brasil" | "mundo";

export type CollectionSourceInfo =
  | { kind: "apple-chart"; country: string; label: string }
  | { kind: "deezer-playlist"; playlistId: string; label: string };

export interface CollectionSummary {
  id: string;
  title: string;
  description: string;
  group: CollectionGroup;
  theme: ThemeKey;
  source: CollectionSourceInfo;
  /** Só em décadas. */
  era?: Era;
  /** Em décadas e gêneros. */
  scope?: CollectionScope;
}

export interface CollectionDetail extends CollectionSummary {
  /** Data da última atualização informada pela origem (ISO 8601), quando existe. */
  updatedAt: string | null;
  tracks: Track[];
  /** Total de faixas na origem (pode ser maior que `tracks.length`, que é limitado). */
  total: number;
}

export interface ImportedPlaylist {
  id: string;
  title: string;
  description: string;
  creator: string | null;
  updatedAt: string | null;
  total: number;
  tracks: Track[];
}

export interface SearchResult {
  tracks: Track[];
  /** Situação de cada fonte: a busca devolve resultado parcial quando só uma responde. */
  sources: Record<TrackSource, "ok" | "error">;
}

export interface ChartResult {
  country: string;
  title: string;
  updatedAt: string | null;
  tracks: Track[];
}

export interface ResolvedPreview {
  id: string;
  url: string | null;
  /** Momento em que a URL assinada expira (ms desde epoch), quando a origem informa. */
  expiresAt: number | null;
}

export interface SpotifyName {
  title: string;
}

/** Playlist pública do Deezer encontrada pelo nome (op=playlists). */
export interface PlaylistHit {
  id: string;
  title: string;
  creator: string | null;
  total: number;
  artwork: Artwork | null;
}

export interface PlaylistSearchResult {
  playlists: PlaylistHit[];
}

/**
 * Para onde aponta um link de compartilhar do app do Deezer (`link.deezer.com/s/…`).
 * `kind` "other" cobre podcast, episódio e qualquer destino que não seja playlist, álbum, faixa ou artista.
 */
export interface ShortLinkTarget {
  kind: "playlist" | "album" | "track" | "artist" | "other";
  id: string | null;
}

export interface ApiError {
  error: string;
}

export const THEME_KEYS = ["cobalto", "brasa", "noite", "menta", "lilas"] as const;
export type ThemeKey = (typeof THEME_KEYS)[number];
