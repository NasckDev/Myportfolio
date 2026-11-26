import type { CollectionGroup, ThemeKey } from "./types.js";

/**
 * Coleções curadas. Configuração versionada: mudar uma fonte exige subir COLLECTIONS_VERSION,
 * o que também invalida o cache persistido no navegador.
 *
 * Os ids de playlist do Deezer foram conferidos na API pública em 25/11/2026 (`GET /playlist/{id}`
 * e `GET /user/{id}/playlists`): todos pertencem a contas editoriais do próprio Deezer
 * (campo `owner` abaixo). `npm run verify:collections` refaz a conferência ao vivo.
 */
export const COLLECTIONS_VERSION = "2026-11-25";

export type CollectionSource =
  | { kind: "apple-chart"; country: AppleCountry; limit: 50 | 100 }
  | { kind: "deezer-playlist"; playlistId: string; owner: string };

export interface CollectionDef {
  id: string;
  title: string;
  description: string;
  group: CollectionGroup;
  theme: ThemeKey;
  source: CollectionSource;
}

/** Países aceitos nas paradas da Apple (todos responderam 200 no feed most-played em 25/11/2026). */
export const APPLE_COUNTRIES = ["br", "us", "gb", "pt", "ar", "mx", "fr", "de", "jp", "ca", "au", "it"] as const;
export type AppleCountry = (typeof APPLE_COUNTRIES)[number];

export const COLLECTIONS: readonly CollectionDef[] = [
  {
    id: "paradas-brasil",
    title: "Paradas do Brasil",
    description: "As mais tocadas na Apple Music no Brasil, atualizadas todo dia.",
    group: "paradas",
    theme: "brasa",
    source: { kind: "apple-chart", country: "br", limit: 50 },
  },
  {
    id: "top-mundo",
    title: "Top Mundo",
    description: "As 100 faixas mais ouvidas no Deezer no mundo.",
    group: "paradas",
    theme: "cobalto",
    source: { kind: "deezer-playlist", playlistId: "3155776842", owner: "Deezer Charts" },
  },
  {
    id: "paradas-eua",
    title: "Paradas dos EUA",
    description: "As mais tocadas na Apple Music nos Estados Unidos.",
    group: "paradas",
    theme: "noite",
    source: { kind: "apple-chart", country: "us", limit: 50 },
  },
  {
    id: "top-brasil-deezer",
    title: "Top Brasil no Deezer",
    description: "O ranking brasileiro do Deezer, para comparar com o da Apple.",
    group: "paradas",
    theme: "menta",
    source: { kind: "deezer-playlist", playlistId: "1111141961", owner: "Deezer Charts" },
  },
  {
    id: "anos-80",
    title: "Anos 80",
    description: "Os hits internacionais que marcaram a década.",
    group: "decadas",
    theme: "lilas",
    source: { kind: "deezer-playlist", playlistId: "867825522", owner: "Laeti - Deezer Pop Editor" },
  },
  {
    id: "anos-90",
    title: "Anos 90",
    description: "Pop, eurodance e baladas que tocaram sem parar.",
    group: "decadas",
    theme: "menta",
    source: { kind: "deezer-playlist", playlistId: "878989033", owner: "Laeti - Deezer Pop Editor" },
  },
  {
    id: "anos-2000",
    title: "Anos 2000",
    description: "A trilha da virada do milênio.",
    group: "decadas",
    theme: "cobalto",
    source: { kind: "deezer-playlist", playlistId: "248297032", owner: "Laeti - Deezer Pop Editor" },
  },
  {
    id: "anos-80-brasil",
    title: "Anos 80 no Brasil",
    description: "Rock nacional, MPB e pop brasileiro da década.",
    group: "decadas",
    theme: "brasa",
    source: { kind: "deezer-playlist", playlistId: "309650853", owner: "Editores Deezer Brasil" },
  },
  {
    id: "sertanejo",
    title: "Sertanejo",
    description: "O top 50 do sertanejo, montado pela redação do Deezer Brasil.",
    group: "generos",
    theme: "noite",
    source: { kind: "deezer-playlist", playlistId: "5207214368", owner: "Daniel - Editor Sênior Deezer Brasil" },
  },
  {
    id: "pagode-samba",
    title: "Pagode e samba",
    description: "Os essenciais do pagode.",
    group: "generos",
    theme: "brasa",
    source: { kind: "deezer-playlist", playlistId: "1335664985", owner: "Editores Deezer Brasil" },
  },
  {
    id: "rock",
    title: "Rock",
    description: "Clássicos e hinos do rock.",
    group: "generos",
    theme: "noite",
    source: { kind: "deezer-playlist", playlistId: "1306931615", owner: "Rod - Deezer Rock Editor" },
  },
  {
    id: "pop",
    title: "Pop",
    description: "Os essenciais do pop.",
    group: "generos",
    theme: "lilas",
    source: { kind: "deezer-playlist", playlistId: "1036183001", owner: "Laeti - Deezer Pop Editor" },
  },
  {
    id: "hip-hop",
    title: "Hip-hop",
    description: "Rap com peso, da redação de rap do Deezer.",
    group: "generos",
    theme: "cobalto",
    source: { kind: "deezer-playlist", playlistId: "1996494362", owner: "Ayoub - Deezer Rap Editor" },
  },
  {
    id: "mpb",
    title: "MPB",
    description: "Clássicos da música popular brasileira.",
    group: "generos",
    theme: "menta",
    source: { kind: "deezer-playlist", playlistId: "556502217", owner: "Editores Deezer Brasil" },
  },
  {
    id: "rap-nacional",
    title: "Rap nacional",
    description: "Os essenciais do rap brasileiro.",
    group: "generos",
    theme: "brasa",
    source: { kind: "deezer-playlist", playlistId: "11881565941", owner: "Editores Deezer Brasil" },
  },
];

export function findCollection(id: string): CollectionDef | undefined {
  return COLLECTIONS.find((collection) => collection.id === id);
}
