import { NEW_DESIGNS } from "./newProjects";
import { PRODUCTS, PROJECTS } from "./projects";
import { LINKS, SITE_URL, nf, numberWord } from "./site";
import { TEST_COUNTS, TOTAL_E2E, TOTAL_UNIT } from "./testCounts";
import type { DesignStudy, Job } from "./types";

export const PRODUCT_COUNT = PRODUCTS.length;
export const PRODUCT_WORD = numberWord(PRODUCT_COUNT, true);

export const DESIGNS: readonly DesignStudy[] = [
  ...NEW_DESIGNS,
  {
    id: "bluebird",
    name: "Bluebird",
    kind: "Hero 3D de um app",
    image: "/assets/design/bluebird.webp",
    alt: "Hero do Bluebird com um pássaro azul pousado sobre o nome do app",
    text: "Hero de um app que identifica pássaros pelo canto. O pássaro pousa em vídeo 3D, o nome surge atrás dele e a interface em vidro entra em seguida, com som opcional.",
    tools: ["Vídeo 3D", "Glassmorphism", "Áudio", "Responsivo"],
    live: `${SITE_URL}/web-design/bluebird/index.html`,
    code: "https://github.com/NasckDev/web-design/tree/main/projetos/bluebird",
  },
  {
    id: "traco",
    name: "Traço Construtora",
    kind: "Redesign com 3D",
    image: "/assets/design/traco.webp",
    alt: "Redesign da Traço Construtora, com um prédio em wireframe 3D ao lado do título",
    text: "Redesign para uma construtora: o prédio é montado em wireframe ao vivo com three.js e o visitante navega pela planta antes de o apartamento existir.",
    tools: ["three.js", "WebGL", "Redesign", "Responsivo"],
    live: `${SITE_URL}/web-design/traco-construtora/index.html`,
    code: "https://github.com/NasckDev/web-design/tree/main/projetos/traco-construtora",
  },
];

export const GAME = {
  name: "Véspera",
  image: "/assets/design/vespera.webp",
  alt: "Cena do jogo Véspera: um caçador de capa diante de uma Brecha roxa e brilhante, em uma rua de pedra de Lumeira, à noite",
  bandAlt: "Cena do jogo Véspera: um caçador diante de uma Brecha roxa em uma rua de Lumeira",
  lead: "Toda véspera, uma Brecha se abre em Lumeira. RPG de ação 2D em pixel art, desenvolvido em equipe de três pessoas: cace monstros, junte Fragmentos, forje armas e suba de rank, sozinho ou em co‑op local.",
  chips: ["Godot 4", "C#", "Pixel art", "Co-op local", "Código aberto"],
  feats: [
    ["Brechas em Lumeira", "Toda véspera uma Brecha se abre na cidade. Entre, cace os monstros e feche."],
    ["Forja e ranks", "Junte Fragmentos, forje armas e suba de rank até o Alvor."],
    ["Um ou dois jogadores", "Modo cooperativo local para duas pessoas, no Windows."],
  ] as const,
  color: "#E64A8E",
};

const n = (v: number | null) => (v === null ? "" : nf(v));

export const REPOS: readonly (readonly [name: string, desc: string, proof: string, url: string])[] = [
  ["Nasck UI", "Sistema de interface acessível usado pelos outros projetos.", `React + Angular, ${n(TEST_COUNTS.nasckui.stories)} stories, teste de contrato`, "https://github.com/NasckDev/nasck-ui"],
  ["InsightHub", "Workspace de pesquisa com filtros, gráficos e sínteses assistidas.", `Ant Design, Storybook, ${n(TEST_COUNTS.insighthub.unit)} testes`, "https://github.com/NasckDev/insighthub"],
  ["OpsFlow", "Workflow de aprovações em Angular com máquina de estados, RBAC e auditoria.", `NG-ZORRO, Storybook, ${n(TEST_COUNTS.opsflow.e2e)} E2E`, "https://github.com/NasckDev/opsflow"],
  ["FiscoTrack", "Evolução do minersCalculator: cálculo explicável e testável.", `Ant Design, Storybook, ${n(TEST_COUNTS.fiscotrack.unit)} testes`, "https://github.com/NasckDev/fiscotrack"],
  ["Juntos", "Finanças da casa, sozinho ou a dois. App full stack no ar.", `Next.js 16, Drizzle, ${n(TEST_COUNTS.juntos.unit)} testes`, "https://github.com/NasckDev/juntos"],
  ["Coverlist", "Capa de playlist viva, com dados reais de três APIs públicas de música.", `Proxy próprio, TanStack Query, ${n(TEST_COUNTS.coverlist.unit)} testes`, "https://github.com/NasckDev/coverlist"],
  ["Garrafão", "Painel de NBA com dados públicos da ESPN, placares ao vivo e favoritos.", `Proxy próprio, MSW, ${n(TEST_COUNTS.garrafao.unit)} testes`, "https://github.com/NasckDev/garrafao"],
  ["Véspera", "RPG de ação 2D em pixel art, com modo cooperativo local.", "Godot 4, C#, testes automatizados", LINKS.vesperaRepo],
  ["Web design", "Estudos visuais com 3D e movimento, com código, prints e README.", "Páginas ao vivo, three.js", "https://github.com/NasckDev/web-design"],
  ["claude-usage-hud", "Widget flutuante para Windows que mostra o uso do Claude Code.", "PowerShell, Node.js", "https://github.com/NasckDev/claude-usage-hud"],
];

export const JOBS: readonly Job[] = [
  {
    when: "ago/2025 até hoje",
    company: "MindMiners",
    role: "Software Engineer Front-End, remoto",
    items: [
      "Condução do front-end da squad de Dados em React e TypeScript, do refinamento técnico à publicação, com Produto, Design e backends em C# e Python",
      "Jornada de Descobertas por IA nos Clusters: seleção de dados, prompts, consumo de APIs e estados de carregamento, validação e erro",
      "Painéis de insights redimensionáveis e arrastáveis, com filtros, favoritos, avaliações e persistência de estado",
      "Componentes do Design System para formulários dinâmicos, filtros, modais e painéis, com semântica, navegação por teclado, foco e responsividade",
      "Feature flags por plano e eventos de produto para lançamentos segmentados",
    ],
    tech: ["React", "TypeScript", "Design System", "IA", "Feature flags"],
  },
  {
    when: "jul/2023 a ago/2025",
    company: "EY, projeto Vivo (Telefônica)",
    role: "Software Engineer Front-End e Microsserviços, híbrido",
    items: [
      "Interfaces corporativas em React, TypeScript, Angular, Vue.js e Nuxt.js, traduzindo regras de negócio em fluxos reutilizáveis e responsivos",
      "Microsserviços em Node.js e NestJS e integrações REST, com tratamento de dados e erros entre interface e serviços",
      "Testes unitários com Jest, code review e investigação de incidentes em produção",
      "Pipelines de build e deploy com Jenkins e ArgoCD",
    ],
    tech: ["React", "Angular", "Vue.js", "NestJS", "Jest", "ArgoCD"],
  },
  {
    when: "ago/2022 a ago/2023",
    company: "EY",
    role: "Analista e Desenvolvedor Front-End e SAP Commerce",
    items: ["E-commerce em SAP Commerce com internacionalização, integrações via API, feature flags e deploys em produção"],
    tech: ["SAP Commerce", "i18n", "APIs REST"],
  },
  {
    when: "fev/2021 a ago/2022",
    company: "EY",
    role: "Trainee SAP Sales e SAP Commerce",
    items: ["Customização de objetos, telas e fluxos com C# e ABSL no SAP Application Studio"],
    tech: ["C#", "ABSL", "SAP Sales"],
  },
  {
    when: "ago/2020 a fev/2021",
    company: "Partners Digital",
    role: "Estagiário em Desenvolvimento SAP",
    items: ["Objetos no SAP Sales C4C, front-end, testes e melhorias de usabilidade"],
    tech: ["SAP C4C", "Front-end", "Testes"],
  },
];

export const EDU: readonly (readonly [string, string])[] = [
  ["Análise e Desenvolvimento de Sistemas", "São Paulo Tech School (SPTech), 2020 a 2022"],
  ["Técnico em Informática", "Etec Jaraguá, 2018 a 2019"],
  ["Artificial Intelligence, AI Engineering (Bronze)", "EY, 2025"],
  ["IA, negócios e o futuro do trabalho", "Lund University, 2025"],
  ["SAP Foundation", "EY, 2021"],
  ["Idiomas", "Português nativo, inglês e espanhol intermediários"],
];

export const INTERESTS = ["Design Systems", "Acessibilidade", "Visualização de dados", "Arquitetura de estado", "IA aplicada a produto", "APIs públicas", "Performance web"] as const;

/** Evidência de uma habilidade: um projeto, um estudo ou uma experiência profissional. */
export interface Evidence {
  name: string;
  kind: string;
  href: string;
  job?: boolean;
}

export const EVIDENCE: Readonly<Record<string, Evidence>> = {
  vespera: { name: "Véspera", kind: "Jogo em Godot 4 e C#", href: "/jogo" },
  bluebird: { name: "Bluebird", kind: "Design de interface", href: "/design" },
  traco: { name: "Traço Construtora", kind: "Design com three.js", href: "/design" },
  mm: { name: "MindMiners", kind: "Trabalho atual, desde 2025", href: "/experiencia", job: true },
  ey: { name: "EY, projeto Vivo", kind: "Trabalho, 2023 a 2025", href: "/experiencia", job: true },
  sap: { name: "EY, SAP Commerce", kind: "Trabalho, 2021 a 2023", href: "/experiencia", job: true },
  ...Object.fromEntries(PROJECTS.map((p) => [p.id, { name: p.name, kind: p.kind, href: `/projeto/${p.id}` }])),
};

const APPS = ["juntos", "insighthub", "opsflow", "fiscotrack", "nasckui"];
const API_APPS = ["coverlist", "garrafao"];

export const SKILLS: readonly (readonly [group: string, items: readonly (readonly [skill: string, evidence: readonly string[]])[]])[] = [
  ["Linguagens", [
    ["TypeScript", [...APPS, ...API_APPS, "portfolio", "mm", "ey"]],
    ["JavaScript", ["portfolio", "bluebird", "mm", "ey", "sap"]],
    ["HTML e CSS", ["bluebird", "traco", "portfolio", "mm", "ey"]],
    ["C#", ["vespera", "sap"]],
  ]],
  ["Front-end", [
    ["React", ["juntos", "insighthub", "fiscotrack", "nasckui", "portfolio", "mm", "ey"]],
    ["Next.js", ["juntos"]],
    ["Angular", ["opsflow", "nasckui", "ey"]],
    ["Vue.js e Nuxt.js", ["ey"]],
    ["Design Systems", ["nasckui", "mm"]],
    ["Componentização", ["nasckui", "insighthub", "opsflow", "fiscotrack", "mm", "ey"]],
    ["Storybook", ["insighthub", "opsflow", "fiscotrack", "nasckui"]],
    ["Visualização de dados", ["insighthub", "opsflow", "fiscotrack", "garrafao"]],
    ["TanStack Query", ["insighthub"]],
    ["Tailwind CSS", ["juntos"]],
    ["Animação e 3D na web", ["portfolio", "traco", "bluebird", "coverlist"]],
  ]],
  ["Back-end", [
    ["Node.js", ["juntos", "portfolio", "ey", ...API_APPS]],
    ["NestJS", ["ey"]],
    ["APIs REST", ["insighthub", "mm", "ey", "sap"]],
    ["Integração com APIs públicas", API_APPS],
    ["Proxy e cache na CDN", API_APPS],
    ["Microsserviços", ["ey"]],
    ["PostgreSQL e Drizzle", ["juntos"]],
    ["Autenticação", ["juntos"]],
    ["Serverless na Vercel", ["juntos", "portfolio", ...API_APPS]],
    ["Integração com IA", ["insighthub", "mm"]],
  ]],
  ["Qualidade", [
    ["Acessibilidade (WCAG AA)", [...APPS, ...API_APPS, "portfolio", "mm"]],
    ["Testes automatizados", [...APPS, ...API_APPS, "portfolio", "ey"]],
    ["Testes de ponta a ponta", [...APPS, ...API_APPS, "portfolio"]],
    ["Máquina de estados e RBAC", ["opsflow"]],
    ["Performance web", ["portfolio"]],
    ["Code review e incidentes", ["mm", "ey"]],
  ]],
  ["Entrega", [
    ["CI/CD", ["juntos", "insighthub", "fiscotrack", "nasckui", "ey"]],
    ["Feature flags", ["mm", "ey", "sap"]],
    ["Documentação técnica", ["juntos", "opsflow", "mm"]],
    ["Scrum e Kanban", ["mm"]],
  ]],
];

export const ALL_SKILLS = SKILLS.flatMap(([, items]) => items.map(([s]) => s));

export function skillEvidence(skill: string): { projects: Evidence[]; jobs: Evidence[] } {
  const ids = SKILLS.flatMap(([, items]) => items).find(([s]) => s === skill)?.[1] ?? [];
  const all = ids.map((id) => EVIDENCE[id]).filter((e): e is Evidence => !!e);
  return { projects: all.filter((e) => !e.job), jobs: all.filter((e) => e.job) };
}

/** Cartões de especialidade (Início e Habilidades). O último campo é a habilidade aberta ao clicar. */
export const SPECIALTIES: readonly (readonly [icon: string, title: string, text: string, skill: string])[] = [
  ["code", "Front-end", `React, Next.js, Angular e Vue com TypeScript. Seis anos em produção e ${numberWord(PRODUCT_COUNT)} produtos publicados.`, "React"],
  ["layers", "Back-end e APIs", "Microsserviços em Node.js e NestJS no projeto da Vivo, o back-end do Juntos e proxies próprios para APIs públicas.", "Node.js"],
  ["grid", "Design Systems e acessibilidade", `${TEST_COUNTS.nasckui.components} componentes com a mesma API em React e Angular, com WCAG AA verificada com axe.`, "Design Systems"],
  ["check", "Testes e entrega", `${nf(TOTAL_UNIT)} testes automatizados, ${TOTAL_E2E} cenários de ponta a ponta e CI/CD.`, "Testes automatizados"],
];

/** Stack principal no topo do Início: rótulo e habilidade aberta. */
export const MAIN_STACK: readonly (readonly [string, string])[] = [
  ["React", "React"], ["Next.js", "Next.js"], ["Angular", "Angular"], ["TypeScript", "TypeScript"],
  ["Node.js", "Node.js"], ["NestJS", "NestJS"], ["PostgreSQL", "PostgreSQL e Drizzle"], ["C#", "C#"],
];
