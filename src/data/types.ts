export type Tag = "React" | "Angular" | "Dados" | "Design System" | "APIs públicas" | "Full stack";

/** Par [rótulo, endereço]. */
export type LinkPair = readonly [label: string, href: string];
/** Par [título, descrição]. */
export type Feature = readonly [title: string, text: string];
/** Par [número em destaque, legenda]. */
export type Proof = readonly [value: string, label: string];

export interface Project {
  id: string;
  name: string;
  kind: string;
  tags: readonly Tag[];
  /** Cor da capa e do estudo de caso. */
  color: string;
  /** Cor do texto sobre `color` (contraste AA). */
  on: string;
  live: boolean;
  status: string;
  title: string;
  summary: string;
  role: string;
  stack: readonly string[];
  problem: string;
  decisions: readonly string[];
  a11y: string;
  tests: string;
  counts: readonly Proof[] | null;
  /** O primeiro é a ação principal (demo ou app). */
  links: readonly LinkPair[];
  pitch: string;
  feats: readonly Feature[];
  /** Texto curto usado no cartão (chip de prova). */
  proofLine: string;
  /** Textos e números ainda provisórios (projeto em construção). */
  provisional?: boolean;
}

export interface DesignStudy {
  id: string;
  name: string;
  kind: string;
  image: string;
  alt: string;
  text: string;
  tools: readonly string[];
  live: string;
  code?: string;
  /** Estudo de caso do mesmo produto, quando existir. */
  caseId?: string;
}

export interface Snippet {
  id: string;
  file: string;
  repoName: string;
  /** Linhas do arquivo na branch principal, no formato [início, fim]. */
  lines: readonly [start: number, end: number];
  title: string;
  why: string;
  url: string;
  code: string;
}

/** Logo oficial salva em public/assets/empresas ou, sem fonte confiável, um monograma. */
export type CompanyMark =
  | { readonly src: string; readonly alt: string; readonly width: number; readonly height: number }
  | { readonly mono: string; readonly alt: string };

export interface JobDetail {
  /** Empresa, produto ou cliente e o tipo de trabalho. */
  context: string;
  /** O que eu fazia no dia a dia. */
  did: readonly string[];
  /** IA no trabalho, quando houver. */
  ai?: readonly string[];
  /** Entregas específicas que não cabem na lista do dia a dia. */
  highlights?: readonly string[];
  stack: readonly string[];
}

export interface Job {
  id: string;
  when: string;
  company: string;
  role: string;
  marks: readonly CompanyMark[];
  items: readonly string[];
  tech: readonly string[];
  detail: JobDetail;
}
