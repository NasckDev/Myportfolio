import { PRODUCT_WORD } from "./content";
import { PROJECTS, getProject } from "./projects";
import { PERSON } from "./site";

export type PageId = "inicio" | "projetos" | "design" | "codigo" | "jogo" | "habilidades" | "experiencia" | "contato";

export interface NavItem {
  id: PageId;
  label: string;
  icon: string;
  path: string;
}

export const NAV: readonly NavItem[] = [
  { id: "inicio", label: "Início", icon: "home", path: "/" },
  { id: "projetos", label: "Projetos", icon: "grid", path: "/projetos" },
  { id: "design", label: "Design", icon: "pen", path: "/design" },
  { id: "codigo", label: "Código", icon: "code", path: "/codigo" },
  { id: "jogo", label: "Jogo", icon: "game", path: "/jogo" },
  { id: "habilidades", label: "Habilidades", icon: "layers", path: "/habilidades" },
  { id: "experiencia", label: "Experiência", icon: "briefcase", path: "/experiencia" },
  { id: "contato", label: "Contato", icon: "mail", path: "/contato" },
];

/** Páginas que no celular ficam na folha "Mais" em vez do dock. */
export const MORE_PAGES: readonly PageId[] = ["design", "codigo", "jogo", "experiencia"];

export type Route =
  | { name: PageId; tab: PageId }
  | { name: "projeto"; tab: "projetos"; projectId: string }
  | { name: "nao-encontrada"; tab: null };

/** Normaliza o caminho: sem barra final (exceto a raiz) e em minúsculas. */
export function normalizePath(path: string): string {
  const clean = path.split(/[?#]/)[0] ?? "/";
  const trimmed = clean.length > 1 ? clean.replace(/\/+$/, "") : clean;
  return (trimmed || "/").toLowerCase();
}

export function parseRoute(pathname: string): Route {
  const path = normalizePath(pathname);
  const nav = NAV.find((n) => n.path === path);
  if (nav) return { name: nav.id, tab: nav.id };
  const m = /^\/projeto\/([a-z0-9-]+)$/.exec(path);
  if (m && m[1] && getProject(m[1])) return { name: "projeto", tab: "projetos", projectId: m[1] };
  return { name: "nao-encontrada", tab: null };
}

export function pathOf(route: Route): string {
  if (route.name === "projeto") return `/projeto/${route.projectId}`;
  if (route.name === "nao-encontrada") return "/404";
  return NAV.find((n) => n.id === route.name)?.path ?? "/";
}

export interface PageMeta {
  path: string;
  title: string;
  description: string;
  /** Imagem de prévia de link (caminho absoluto no site). */
  image?: string;
}

const SUFFIX = ` | ${PERSON.shortName}`;
const HOME_TITLE = `${PERSON.shortName}, engenheiro de software`;

const PAGE_META: Record<PageId, Omit<PageMeta, "path">> = {
  inicio: {
    title: HOME_TITLE,
    description: `Portfólio de ${PERSON.name}, engenheiro de software. Front-end com React e TypeScript, back-end com Node.js e NestJS, com ${PRODUCT_WORD.toLowerCase()} produtos completos, código aberto e demonstração ao vivo.`,
  },
  projetos: {
    title: `Projetos${SUFFIX}`,
    description: `${PRODUCT_WORD} produtos publicados e este portfólio: Juntos, InsightHub, OpsFlow, FiscoTrack, Nasck UI, Coverlist e Garrafão, cada um com demonstração, estudo de caso e código-fonte.`,
  },
  design: {
    title: `Design${SUFFIX}`,
    description: "Estudos de interface publicados como páginas funcionais, com animação, 3D e áudio: Coverlist, Garrafão, Bluebird e Traço Construtora.",
  },
  codigo: {
    title: `Código${SUFFIX}`,
    description: "Trechos de código extraídos dos repositórios: regras de negócio isoladas da interface, em funções puras e testadas. Todos os repositórios são públicos.",
  },
  jogo: {
    title: `Jogo${SUFFIX}`,
    description: "Véspera, RPG de ação 2D em pixel art desenvolvido em equipe de três pessoas com Godot 4 e C#, com modo cooperativo local.",
  },
  habilidades: {
    title: `Habilidades${SUFFIX}`,
    description: "Habilidades de front-end, back-end, qualidade e entrega, cada uma vinculada ao projeto ou à experiência profissional em que foi aplicada.",
  },
  experiencia: {
    title: `Experiência${SUFFIX}`,
    description: "Seis anos como engenheiro de software: MindMiners, EY no projeto da Vivo (Telefônica), SAP Commerce e formação em Análise e Desenvolvimento de Sistemas.",
  },
  contato: {
    title: `Contato${SUFFIX}`,
    description: "Aberto a avaliar novas oportunidades sênior de engenharia de software, front-end ou full stack, remoto ou híbrido em São Paulo, Campinas e Jundiaí.",
  },
};

export function metaFor(route: Route): PageMeta {
  if (route.name === "projeto") {
    const p = getProject(route.projectId)!;
    return {
      path: pathOf(route),
      title: `${p.name}, estudo de caso${SUFFIX}`,
      description: `${p.title} ${p.summary}`,
    };
  }
  if (route.name === "nao-encontrada") {
    return { path: "/404", title: `Página não encontrada${SUFFIX}`, description: "Esta página não existe. Veja os projetos, a experiência ou entre em contato." };
  }
  return { path: pathOf(route), ...PAGE_META[route.name] };
}

/** Todas as rotas públicas, na ordem do sitemap. */
export function allRoutes(): Route[] {
  return [
    ...NAV.map((n) => ({ name: n.id, tab: n.id }) as Route),
    ...PROJECTS.map((p) => ({ name: "projeto", tab: "projetos", projectId: p.id }) as Route),
  ];
}

export const labelOf = (id: PageId): string => NAV.find((n) => n.id === id)?.label ?? id;
