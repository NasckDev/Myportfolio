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
  title: string;
  why: string;
  url: string;
  code: string;
}

export interface Job {
  when: string;
  company: string;
  role: string;
  items: readonly string[];
  tech: readonly string[];
}
