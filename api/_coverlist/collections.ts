import type { CollectionGroup, CollectionScope, Era, ThemeKey } from "./types.js";

/**
 * Coleções curadas. Configuração versionada: mudar uma fonte exige subir COLLECTIONS_VERSION,
 * o que também invalida o cache persistido no navegador.
 *
 * Os ids de playlist do Deezer foram conferidos na API pública (`GET /playlist/{id}` e
 * `GET /user/{id}/playlists`): todos são públicos e pertencem a contas editoriais do próprio Deezer
 * (campo `owner` abaixo). As 15 primeiras em 25/11/2026; as demais em 27/11/2026.
 * `npm run verify:collections` refaz a conferência ao vivo.
 */
export const COLLECTIONS_VERSION = "2026-11-27";

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
  era?: Era;
  scope?: CollectionScope;
}

/** Países aceitos nas paradas da Apple (todos responderam 200 no feed most-played em 25/11/2026). */
export const APPLE_COUNTRIES = ["br", "us", "gb", "pt", "ar", "mx", "fr", "de", "jp", "ca", "au", "it"] as const;
export type AppleCountry = (typeof APPLE_COUNTRIES)[number];

const CHARTS = "Deezer Charts";
const POP = "Laeti - Deezer Pop Editor";
const BR = "Editores Deezer Brasil";
const DANIEL = "Daniel - Editor Sênior Deezer Brasil";

const deezer = (playlistId: string, owner: string): CollectionSource => ({ kind: "deezer-playlist", playlistId, owner });

const PARADAS: CollectionDef[] = [
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
    source: deezer("3155776842", CHARTS),
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
    source: deezer("1111141961", CHARTS),
  },
  {
    id: "top-mulheres-brasil",
    title: "Top Mulheres Brasil",
    description: "O ranking das artistas mais ouvidas no Brasil, do Deezer Charts.",
    group: "paradas",
    theme: "lilas",
    source: deezer("13578432881", CHARTS),
  },
  {
    id: "top-portugal",
    title: "Top Portugal",
    description: "As 100 mais ouvidas no Deezer em Portugal.",
    group: "paradas",
    theme: "menta",
    source: deezer("1362519755", CHARTS),
  },
  {
    id: "top-reino-unido",
    title: "Top Reino Unido",
    description: "As 100 mais ouvidas no Deezer no Reino Unido.",
    group: "paradas",
    theme: "cobalto",
    source: deezer("1111142221", CHARTS),
  },
  {
    id: "top-argentina",
    title: "Top Argentina",
    description: "As 100 mais ouvidas no Deezer na Argentina.",
    group: "paradas",
    theme: "noite",
    source: deezer("1279119721", CHARTS),
  },
  {
    id: "top-mexico",
    title: "Top México",
    description: "As 100 mais ouvidas no Deezer no México.",
    group: "paradas",
    theme: "brasa",
    source: deezer("1111142361", CHARTS),
  },
];

const DECADAS: CollectionDef[] = [
  { id: "anos-60", title: "Anos 60", description: "Os hits internacionais dos anos 60.", group: "decadas", era: 1960, scope: "mundo", theme: "menta", source: deezer("620264073", POP) },
  {
    id: "jovem-guarda",
    title: "Jovem Guarda",
    description: "O iê-iê-iê brasileiro dos anos 60.",
    group: "decadas",
    era: 1960,
    scope: "brasil",
    theme: "lilas",
    source: deezer("5524629202", BR),
  },
  {
    id: "anos-60-brasil",
    title: "Anos 60 no Brasil",
    description: "Os principais sucessos da música brasileira nos anos 60.",
    group: "decadas",
    era: 1960,
    scope: "brasil",
    theme: "noite",
    source: deezer("867430043", BR),
  },
  { id: "anos-70", title: "Anos 70", description: "Os hits internacionais dos anos 70.", group: "decadas", era: 1970, scope: "mundo", theme: "brasa", source: deezer("1470022445", POP) },
  {
    id: "anos-70-brasil",
    title: "Anos 70 no Brasil",
    description: "A música brasileira dos anos 70.",
    group: "decadas",
    era: 1970,
    scope: "brasil",
    theme: "cobalto",
    source: deezer("867287593", BR),
  },
  { id: "anos-80", title: "Anos 80", description: "Os hits internacionais que marcaram a década.", group: "decadas", era: 1980, scope: "mundo", theme: "lilas", source: deezer("867825522", POP) },
  {
    id: "anos-80-brasil",
    title: "Anos 80 no Brasil",
    description: "Rock nacional, MPB e pop brasileiro da década.",
    group: "decadas",
    era: 1980,
    scope: "brasil",
    theme: "brasa",
    source: deezer("309650853", BR),
  },
  { id: "anos-90", title: "Anos 90", description: "Pop, eurodance e baladas que tocaram sem parar.", group: "decadas", era: 1990, scope: "mundo", theme: "menta", source: deezer("878989033", POP) },
  {
    id: "anos-90-brasil",
    title: "Anos 90 no Brasil",
    description: "O que tocou no Brasil nos anos 90.",
    group: "decadas",
    era: 1990,
    scope: "brasil",
    theme: "noite",
    source: deezer("989343587", BR),
  },
  { id: "anos-2000", title: "Anos 2000", description: "A trilha da virada do milênio.", group: "decadas", era: 2000, scope: "mundo", theme: "cobalto", source: deezer("248297032", POP) },
  {
    id: "anos-2000-brasil",
    title: "Anos 2000 no Brasil",
    description: "O que tocou no Brasil nos anos 2000.",
    group: "decadas",
    era: 2000,
    scope: "brasil",
    theme: "lilas",
    source: deezer("3859951986", BR),
  },
  { id: "anos-2010", title: "Anos 2010", description: "Os hits internacionais dos anos 2010.", group: "decadas", era: 2010, scope: "mundo", theme: "brasa", source: deezer("14917741483", POP) },
  {
    id: "pop-brasil-anos-2010",
    title: "Pop Brasil anos 2010",
    description: "O pop nacional da década de 2010.",
    group: "decadas",
    era: 2010,
    scope: "brasil",
    theme: "menta",
    source: deezer("10631083602", BR),
  },
  { id: "anos-2020", title: "Anos 2020", description: "Os hits internacionais desta década.", group: "decadas", era: 2020, scope: "mundo", theme: "noite", source: deezer("13650084141", POP) },
];

const GENEROS: CollectionDef[] = [
  {
    id: "sertanejo",
    title: "Sertanejo",
    description: "O top 50 do sertanejo, montado pela redação do Deezer Brasil.",
    group: "generos",
    scope: "brasil",
    theme: "noite",
    source: deezer("5207214368", DANIEL),
  },
  { id: "funk", title: "Funk", description: "As novidades do funk, atualizadas pela redação do Deezer Brasil.", group: "generos", scope: "brasil", theme: "lilas", source: deezer("6874153324", BR) },
  { id: "pagode-samba", title: "Pagode e samba", description: "Os essenciais do pagode.", group: "generos", scope: "brasil", theme: "brasa", source: deezer("1335664985", BR) },
  { id: "forro", title: "Forró", description: "O top 50 do forró na redação do Deezer Brasil.", group: "generos", scope: "brasil", theme: "menta", source: deezer("6880421184", "Eduardo - Editor Deezer Brasil") },
  { id: "mpb", title: "MPB", description: "Clássicos da música popular brasileira.", group: "generos", scope: "brasil", theme: "menta", source: deezer("556502217", BR) },
  { id: "rap-nacional", title: "Rap nacional", description: "Os essenciais do rap brasileiro.", group: "generos", scope: "brasil", theme: "brasa", source: deezer("11881565941", BR) },
  { id: "trap", title: "Trap", description: "As novidades do trap brasileiro.", group: "generos", scope: "brasil", theme: "noite", source: deezer("10191249702", BR) },
  { id: "axe", title: "Axé", description: "Os clássicos do axé.", group: "generos", scope: "brasil", theme: "brasa", source: deezer("1450851327", BR) },
  { id: "samba-de-raiz", title: "Samba de raiz", description: "O samba de raiz, da redação do Deezer Brasil.", group: "generos", scope: "brasil", theme: "cobalto", source: deezer("5449764382", BR) },
  { id: "bossa-nova", title: "Bossa nova", description: "A bossa nova que ganhou o mundo.", group: "generos", scope: "brasil", theme: "lilas", source: deezer("5696878102", DANIEL) },
  { id: "rock-nacional", title: "Rock nacional", description: "Os clássicos do rock brasileiro.", group: "generos", scope: "brasil", theme: "noite", source: deezer("9268293682", DANIEL) },
  { id: "indie-brasil", title: "Indie Brasil", description: "A cena independente brasileira.", group: "generos", scope: "brasil", theme: "menta", source: deezer("3878391886", BR) },
  { id: "gospel", title: "Gospel", description: "O top 50 gospel do Deezer.", group: "generos", scope: "brasil", theme: "cobalto", source: deezer("2532050928", "Daniel - Deezer Gospel Editor") },
  { id: "eletronica", title: "Eletrônica", description: "Lançamentos da eletrônica feita no Brasil.", group: "generos", scope: "brasil", theme: "lilas", source: deezer("11943608401", BR) },
  { id: "rock", title: "Rock", description: "Clássicos e hinos do rock.", group: "generos", scope: "mundo", theme: "noite", source: deezer("1306931615", "Rod - Deezer Rock Editor") },
  { id: "pop", title: "Pop", description: "Os essenciais do pop.", group: "generos", scope: "mundo", theme: "lilas", source: deezer("1036183001", POP) },
  { id: "hip-hop", title: "Hip-hop", description: "Rap com peso, da redação de rap do Deezer.", group: "generos", scope: "mundo", theme: "cobalto", source: deezer("1996494362", "Ayoub - Deezer Rap Editor") },
  { id: "rnb", title: "R&B", description: "Os essenciais do R&B.", group: "generos", scope: "mundo", theme: "brasa", source: deezer("1314725125", "Ayoub - Deezer R&B Editor") },
  { id: "reggaeton", title: "Reggaeton", description: "Os hits do reggaeton.", group: "generos", scope: "mundo", theme: "menta", source: deezer("1273315391", "Camojada - Deezer Latin Editor") },
  { id: "dance", title: "Dance", description: "Os hits da pista no mundo.", group: "generos", scope: "mundo", theme: "cobalto", source: deezer("706093725", "Laeti - Deezer Dance & EDM Editor") },
  { id: "k-pop", title: "K-pop", description: "Os essenciais do pop coreano.", group: "generos", scope: "mundo", theme: "lilas", source: deezer("873660353", "Rudy - Deezer K-Pop Editor") },
  { id: "reggae", title: "Reggae", description: "Os essenciais do reggae.", group: "generos", scope: "mundo", theme: "menta", source: deezer("2448918882", "Camojada Deezer Reggae Editor") },
  { id: "afro", title: "Afro", description: "Os hits da música afro, da redação do Deezer.", group: "generos", scope: "mundo", theme: "brasa", source: deezer("1440614715", "Ayoub - Deezer Afro Editor") },
  { id: "country", title: "Country", description: "O country novo, da redação de country do Deezer.", group: "generos", scope: "mundo", theme: "noite", source: deezer("1132251583", "Rod - Deezer Country Editor") },
  { id: "jazz", title: "Jazz", description: "Os essenciais do jazz.", group: "generos", scope: "mundo", theme: "cobalto", source: deezer("1615514485", "Yannick - Deezer Jazz & Blues Editor") },
  { id: "soul", title: "Soul", description: "Os essenciais do soul.", group: "generos", scope: "mundo", theme: "brasa", source: deezer("1257789321", "Yannick - Soul & Funk Deezer Editor") },
  { id: "classica", title: "Clássica", description: "Os essenciais da música clássica.", group: "generos", scope: "mundo", theme: "noite", source: deezer("747148961", "Yannick - Deezer Classical Editor") },
];

export const COLLECTIONS: readonly CollectionDef[] = [...PARADAS, ...DECADAS, ...GENEROS];

export function findCollection(id: string): CollectionDef | undefined {
  return COLLECTIONS.find((collection) => collection.id === id);
}
