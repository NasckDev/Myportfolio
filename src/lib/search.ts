/** Busca da paleta (Ctrl K): pura, sem React, para testar ranking, acentos e sinônimos. */
export interface SearchEntry {
  group: string;
  label: string;
  hint?: string;
  /** Tecnologias, tags e palavras-chave: aparecem como motivo do resultado. */
  terms?: readonly string[];
  /** Descrição longa: casa com peso menor e mostra um trecho como motivo. */
  text?: string;
}

export type Range = readonly [start: number, end: number];

export interface Marked {
  text: string;
  ranges: readonly Range[];
}

export interface SearchHit<E extends SearchEntry = SearchEntry> {
  entry: E;
  score: number;
  label: readonly Range[];
  hint: readonly Range[];
  why?: Marked;
}

export interface HitGroup<E extends SearchEntry = SearchEntry> {
  group: string;
  hits: SearchHit<E>[];
}

const SYNONYMS: Readonly<Record<string, readonly string[]>> = {
  ts: ["typescript"],
  js: ["javascript"],
  ia: ["ai", "inteligencia artificial"],
  ai: ["ia", "inteligencia artificial"],
  node: ["node.js"],
  nodejs: ["node.js"],
  next: ["next.js"],
  nextjs: ["next.js"],
  vue: ["vue.js"],
  vuejs: ["vue.js"],
  nest: ["nestjs"],
  postgres: ["postgresql"],
  pg: ["postgresql"],
  a11y: ["acessibilidade", "wcag"],
  wcag: ["acessibilidade"],
  e2e: ["ponta a ponta", "playwright"],
  cv: ["curriculo"],
  resume: ["curriculo"],
  email: ["e-mail"],
  dark: ["escuro", "tema"],
  light: ["claro", "tema"],
  game: ["jogo"],
  ds: ["design system"],
  fullstack: ["full stack"],
  front: ["front-end"],
  frontend: ["front-end"],
  back: ["back-end"],
  backend: ["back-end"],
  test: ["teste"],
  tests: ["teste"],
};

/** Termos até este tamanho só casam no começo de uma palavra ("ia" não casa com "mídia"). */
const SHORT = 3;
const SYNONYM_FACTOR = 0.9;
const GROUP_LIMIT = 10;

export const normalize = (s: string): string =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

/** Texto normalizado com o índice de cada caractere no original, para destacar o trecho certo. */
function fold(s: string): { text: string; map: number[] } {
  let text = "";
  const map: number[] = [];
  for (let i = 0; i < s.length; i++) {
    const n = normalize(s[i]!);
    text += n;
    for (let k = 0; k < n.length; k++) map.push(i);
  }
  return { text, map };
}

const isWordChar = (c: string | undefined) => !!c && /[a-z0-9]/.test(c);

/** Primeira ocorrência de `needle`; termos curtos só valem no início de palavra. */
function findAt(hay: string, needle: string, from = 0): number {
  const boundary = needle.length <= SHORT;
  let i = hay.indexOf(needle, from);
  while (i !== -1) {
    if (!boundary || !isWordChar(hay[i - 1])) return i;
    i = hay.indexOf(needle, i + 1);
  }
  return -1;
}

const atWordStart = (hay: string, needle: string): boolean => {
  let i = hay.indexOf(needle);
  while (i !== -1) {
    if (!isWordChar(hay[i - 1])) return true;
    i = hay.indexOf(needle, i + 1);
  }
  return false;
};

function rangesOf(original: string, needles: readonly string[]): Range[] {
  const { text, map } = fold(original);
  const out: [number, number][] = [];
  for (const n of needles) {
    if (!n) continue;
    let i = findAt(text, n);
    while (i !== -1) {
      out.push([map[i]!, map[i + n.length - 1]! + 1]);
      i = findAt(text, n, i + n.length);
    }
  }
  out.sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const r of out) {
    const last = merged.at(-1);
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
    else merged.push([r[0], r[1]]);
  }
  return merged;
}

type Source = "label" | "term" | "hint" | "text" | "group";

interface Prepared<E extends SearchEntry> {
  entry: E;
  label: string;
  terms: string[];
  hint: string;
  text: string;
  group: string;
}

function prepare<E extends SearchEntry>(entry: E): Prepared<E> {
  return {
    entry,
    label: normalize(entry.label),
    terms: (entry.terms ?? []).map(normalize),
    hint: normalize(entry.hint ?? ""),
    text: normalize(entry.text ?? ""),
    group: normalize(entry.group),
  };
}

/** Pontua uma alternativa: nome exato > começa com > palavra do nome > contém no nome > tags > dica > descrição. */
function scoreOne(p: Prepared<SearchEntry>, alt: string): { score: number; source: Source; term?: number } {
  if (p.label === alt) return { score: 100, source: "label" };
  if (p.label.startsWith(alt)) return { score: 85, source: "label" };
  if (atWordStart(p.label, alt)) return { score: 75, source: "label" };
  if (alt.length > SHORT && p.label.includes(alt)) return { score: 60, source: "label" };
  let best: { score: number; source: Source; term?: number } = { score: 0, source: "term" };
  p.terms.forEach((t, i) => {
    const s = t === alt ? 50 : t.startsWith(alt) || atWordStart(t, alt) ? 45 : alt.length > SHORT && t.includes(alt) ? 40 : 0;
    if (s > best.score) best = { score: s, source: "term", term: i };
  });
  if (best.score) return best;
  if (findAt(p.hint, alt) !== -1) return { score: atWordStart(p.hint, alt) ? 35 : 30, source: "hint" };
  if (findAt(p.text, alt) !== -1) return { score: atWordStart(p.text, alt) ? 25 : 20, source: "text" };
  if (p.group.startsWith(alt)) return { score: 10, source: "group" };
  return { score: 0, source: "group" };
}

export function expand(token: string): string[] {
  return [token, ...(SYNONYMS[token] ?? []).map(normalize)];
}

function snippet(original: string, needles: readonly string[]): Marked {
  const { text, map } = fold(original);
  const hit = needles.map((n) => ({ n, i: findAt(text, n) })).find((x) => x.i !== -1);
  const at = hit ? map[hit.i]! : 0;
  const start = Math.max(0, original.lastIndexOf(" ", Math.max(0, at - 28)) + 1);
  const end = Math.min(original.length, at + 52);
  const cut = original.slice(start, end).trim();
  const piece = `${start > 0 ? "…" : ""}${cut}${end < original.length ? "…" : ""}`;
  return { text: piece, ranges: rangesOf(piece, needles) };
}

function rank<E extends SearchEntry>(p: Prepared<E>, query: string): SearchHit<E> | null {
  const tokens = query.split(/\s+/).filter(Boolean);
  const used: string[] = [];
  const hidden: string[] = [];
  const terms = new Set<number>();
  let textNeedles: string[] = [];
  let total = 0;
  for (const token of tokens) {
    let best = { score: 0, source: "group" as Source, term: undefined as number | undefined, alt: token };
    expand(token).forEach((alt, k) => {
      const r = scoreOne(p, alt);
      const score = k === 0 ? r.score : r.score * SYNONYM_FACTOR;
      if (score > best.score) best = { score, source: r.source, term: r.term, alt };
    });
    if (!best.score) return null;
    total += best.score;
    used.push(best.alt);
    if (best.source === "term" || best.source === "text") hidden.push(best.alt);
    if (best.source === "term" && best.term !== undefined) terms.add(best.term);
    if (best.source === "text") textNeedles = [...textNeedles, best.alt];
  }
  let score = total / tokens.length;
  if (tokens.length > 1) {
    const phrase = scoreOne(p, query);
    if (phrase.source === "label") score = Math.max(score, phrase.score);
  }
  for (const alt of hidden) p.terms.forEach((t, i) => findAt(t, alt) !== -1 && terms.add(i));

  const termList = [...new Map([...terms].sort((a, b) => a - b).map((i) => [p.terms[i]!, p.entry.terms![i]!])).values()].slice(0, 3);
  const why = termList.length
    ? (() => {
        const text = termList.join(" · ");
        return { text, ranges: rangesOf(text, used) };
      })()
    : textNeedles.length && p.entry.text
      ? snippet(p.entry.text, textNeedles)
      : undefined;
  return { entry: p.entry, score, label: rangesOf(p.entry.label, used), hint: rangesOf(p.entry.hint ?? "", used), why };
}

/**
 * Sem busca, mostra só os grupos de `defaults` na ordem original. Com busca, devolve os resultados
 * agrupados por tipo: o grupo com o melhor resultado vem primeiro e, dentro dele, o mais relevante.
 */
export function search<E extends SearchEntry>(entries: readonly E[], query: string, defaults: readonly string[] = []): HitGroup<E>[] {
  const q = normalize(query.trim()).replace(/\s+/g, " ");
  const hits: SearchHit<E>[] = q
    ? entries
        .map((e, i) => ({ hit: rank(prepare(e), q), i }))
        .filter((x): x is { hit: SearchHit<E>; i: number } => x.hit !== null)
        .sort((a, b) => b.hit.score - a.hit.score || a.i - b.i)
        .map((x) => x.hit)
    : entries.filter((e) => defaults.includes(e.group)).map((entry) => ({ entry, score: 0, label: [], hint: [] }));

  const groups: HitGroup<E>[] = [];
  for (const hit of hits) {
    const g = groups.find((x) => x.group === hit.entry.group);
    if (!g) groups.push({ group: hit.entry.group, hits: [hit] });
    else if (!q || g.hits.length < GROUP_LIMIT) g.hits.push(hit);
  }
  return q ? groups : [...groups].sort((a, b) => defaults.indexOf(a.group) - defaults.indexOf(b.group));
}

/** Divide o texto em pedaços marcados e não marcados, para renderizar o destaque. */
export function splitMarks(text: string, ranges: readonly Range[]): { text: string; mark: boolean }[] {
  const out: { text: string; mark: boolean }[] = [];
  let at = 0;
  for (const [s, e] of ranges) {
    if (s > at) out.push({ text: text.slice(at, s), mark: false });
    out.push({ text: text.slice(s, e), mark: true });
    at = e;
  }
  if (at < text.length) out.push({ text: text.slice(at), mark: false });
  return out;
}
