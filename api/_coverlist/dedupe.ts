import type { Track } from "./types.js";

/** Tolerância de duração para considerar duas gravações iguais entre fontes. */
const DURATION_TOLERANCE_SEC = 6;

function fold(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[’'`´]/g, "")
    .replace(/&/g, " e ");
}

/** Título sem participações e marcas de remasterização, que variam entre Deezer e iTunes. */
export function titleKey(title: string): string {
  return fold(title)
    .replace(/[([](feat|ft|with|com|part)\.?\s[^)\]]*[)\]]/g, " ")
    .replace(/\s-\s.*remaster.*$/g, " ")
    .replace(/[([][^)\]]*remaster[^)\]]*[)\]]/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Primeiro artista creditado: "Anitta & Los Brasileros" e "Anitta" viram a mesma chave. */
export function artistKey(artist: string): string {
  const first = fold(artist).split(/\s(?:e|x|feat\.?|ft\.?|com|with)\s|,|;|\//)[0] ?? "";
  return first.replace(/[^a-z0-9]+/g, " ").trim();
}

export function dedupeKey(track: Pick<Track, "title" | "artist">): string {
  return `${titleKey(track.title)}|${artistKey(track.artist)}`;
}

function sameRecording(a: Track, b: Track): boolean {
  if (a.durationSec == null || b.durationSec == null) return true;
  return Math.abs(a.durationSec - b.durationSec) <= DURATION_TOLERANCE_SEC;
}

/** Junta os dados de duas versões da mesma faixa, mantendo a primeira como base. */
function merge(base: Track, other: Track): Track {
  return {
    ...base,
    album: base.album ?? other.album,
    durationSec: base.durationSec ?? other.durationSec,
    artwork: base.artwork ?? other.artwork,
    preview: base.preview ?? other.preview,
    explicit: base.explicit || other.explicit,
  };
}

/**
 * Remove duplicatas entre fontes preservando a ordem de chegada.
 * A primeira ocorrência fica e herda o que faltava (capa, prévia, duração) da duplicata.
 */
export function dedupeTracks(tracks: readonly Track[]): Track[] {
  const out: Track[] = [];
  const byKey = new Map<string, number[]>();
  const seenIds = new Set<string>();
  for (const track of tracks) {
    if (seenIds.has(track.id)) continue;
    seenIds.add(track.id);
    const key = dedupeKey(track);
    const candidates = byKey.get(key) ?? [];
    const match = candidates.find((index) => sameRecording(out[index], track));
    if (match !== undefined) {
      out[match] = merge(out[match], track);
      continue;
    }
    byKey.set(key, [...candidates, out.length]);
    out.push(track);
  }
  return out;
}

/** Intercala duas listas (a1, b1, a2, b2…) para a busca unificada não favorecer uma fonte. */
export function interleave<T>(a: readonly T[], b: readonly T[]): T[] {
  const out: T[] = [];
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (i < a.length) out.push(a[i]);
    if (i < b.length) out.push(b[i]);
  }
  return out;
}
