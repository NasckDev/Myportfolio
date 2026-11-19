export const EMAIL = "aleh.dnascimento@gmail.com";
export const LINKEDIN_URL = "https://www.linkedin.com/in/alexandre-diogo-nascimento";
export const GITHUB_URL = "https://github.com/NasckDev";
export const GITHUB_REPOS_URL = "https://github.com/NasckDev?tab=repositories";
export const WEB_DESIGN_REPO_URL = "https://github.com/NasckDev/web-design";

/** Endereço oficial do portfólio (Vercel), usado em canonical, sitemap e na versão em texto para robôs. */
export const SITE_URL = "https://nasck-myportifolio.vercel.app";

// `?.` permite importar este arquivo fora do Vite (script de prerender em Node), onde import.meta.env não existe.
const base = import.meta.env?.BASE_URL ?? "/";

export const profile = {
  name: "Alexandre Diogo Nascimento",
  role: "Software Engineer · Frontend & Fullstack",
  intro:
    "Construo interfaces web rápidas, acessíveis e fáceis de manter. São 6 anos transformando regras de negócio complexas em produtos claros, na MindMiners, na EY e em projeto para a Vivo.",
  aboutTitle: "Trabalho entre engenharia, produto e design.",
  about: [
    "Entendo a regra de negócio, modelo os estados da interface e entrego componentes que o time consegue manter. Gosto de trabalhar perto de Produto e Design, questionando requisitos e propondo caminhos mais simples.",
    "Meu foco hoje são interfaces complexas: Design Systems, produtos orientados a dados, acessibilidade e integrações com estados assíncronos. Prefiro provar com código e decisões documentadas do que com níveis autodeclarados.",
  ],
};
export const CV_FULL_URL = `${base}curriculo-alexandre-diogo-nascimento.pdf`;
export const CV_ATS_URL = `${base}curriculo-alexandre-diogo-nascimento-ats.pdf`;
export const PORTRAIT_URL = `${base}assets/retrato-alexandre.webp`;

export type CaseTag = "React" | "Angular" | "Dados" | "Design System" | "Acessibilidade";

export interface CaseStudy {
  id: string;
  num: string;
  kind: string;
  read: string;
  name: string;
  tagline: string;
  tags: CaseTag[];
  title: string;
  summary: string;
  role: string;
  skills: string[];
  problem: string;
  decisions: string[];
  a11y: string;
  tests: string;
  image?: string;
  /** Previsão de publicação (estudo + código + demo). Ausente = já publicado. */
  eta?: string;
  /** Em que pé o projeto está hoje. */
  stage?: string;
  /** Código e página ao vivo, quando existirem. */
  repoUrl?: string;
  liveUrl?: string;
}

/** Linha do tempo pública dos projetos em construção (mostrada na seção Projetos). */
export const roadmap: { when: string; what: string; done?: boolean }[] = [
  { when: "Já no ar", what: "Este portfólio, o site do Véspera e as primeiras versões abertas de FiscoTrack, OpsFlow, InsightHub e Nasck UI", done: true },
  { when: "Jan 2027", what: "Nasck UI (design system) e FiscoTrack" },
  { when: "Fev 2027", what: "InsightHub" },
  { when: "Mar 2027", what: "OpsFlow" },
];

export const cases: CaseStudy[] = [
  {
    id: "insighthub", num: "01", kind: "React · dados", read: "6 min", name: "InsightHub", tagline: "Research & AI Insights Workspace", tags: ["React", "Dados", "Acessibilidade"],
    title: "Um workspace de insights para reduzir a distância entre dados e decisão.", eta: "Fev 2027", stage: "API e motor de síntese no ar, front-end em andamento", repoUrl: "https://github.com/NasckDev/insighthub",
    summary: "Workspace para explorar pesquisas, comparar segmentos e gerar sínteses assistidas por IA com rastreabilidade.",
    role: "Concepção, arquitetura e frontend", skills: ["React", "TypeScript", "TanStack", "IA"],
    problem: "Times de pesquisa e produto precisam transformar respostas, segmentos e indicadores em insights acionáveis. A experiência costuma ser fragmentada entre filtros complexos, tabelas, gráficos, comentários e geração de sínteses.",
    decisions: ["Filtros persistidos na URL para visões compartilháveis", "TanStack Query para estado de servidor, cache e invalidação", "IA com cancelamento, retry e indicação da fonte usada"],
    a11y: "Gráficos com alternativa tabular e painel redimensionável por teclado.", tests: "Vitest e Testing Library nas regras; Playwright + axe nos fluxos principais.",
  },
  {
    id: "opsflow", num: "02", kind: "Angular · corporativo", read: "7 min", name: "OpsFlow", tagline: "Enterprise Workflow & Approval Console", tags: ["Angular", "Acessibilidade"],
    title: "Um workflow corporativo com permissões, auditoria e evolução incremental.", eta: "Mar 2027", stage: "Máquina de estados, permissões e demo no ar", repoUrl: "https://github.com/NasckDev/opsflow", liveUrl: "https://nasckdev.github.io/opsflow/",
    summary: "Console de workflow com etapas rastreáveis, permissões, histórico e suporte multilíngue.",
    role: "Estados, formulários e RBAC", skills: ["Angular", "RxJS", "RBAC", "i18n"],
    problem: "Operações corporativas precisam criar, revisar e aprovar solicitações com várias etapas, papéis, documentos, prazos e trilha de auditoria. Interfaces frágeis aumentam retrabalho, erros e tempo de decisão.",
    decisions: ["Workflow modelado como máquina de estados", "Matriz de permissões testada por papel", "Migração incremental de legado com adapter"],
    a11y: "Wizard navegável por teclado e leitor de tela; foco vai para o primeiro erro.", tests: "Testes unitários de regras e permissões; E2E com Playwright.",
  },
  {
    id: "fiscotrack", num: "03", kind: "Domínio · testes", read: "5 min", name: "FiscoTrack", tagline: "Investment Tax Calculator & Reporting", tags: ["React", "Dados"],
    title: "Regras financeiras em um motor de cálculo testável e explicável.", eta: "Jan 2027", stage: "Motor e app web publicados, refinando testes de ponta a ponta", repoUrl: "https://github.com/NasckDev/fiscotrack", liveUrl: "https://nasckdev.github.io/fiscotrack/",
    summary: "Calculadora educacional de resultados de investimentos com regras versionadas e explicáveis.",
    role: "Modelagem de domínio e testes", skills: ["React", "Funções puras", "Vitest"],
    problem: "Investidores precisam organizar operações, calcular resultados por período e compreender regras aplicadas, sem depender de uma planilha opaca.",
    decisions: ["Motor de cálculo em funções puras, fora da UI", "Regras versionadas por data, com fonte", "Dados locais por padrão; nada enviado à telemetria"],
    a11y: "Gráficos com alternativa textual e erros de importação por linha.", tests: "Casos table-driven: zero operações, custos, prejuízo acumulado, arredondamento.",
  },
  {
    id: "nasckui", num: "04", kind: "Design System", read: "5 min", name: "Nasck UI", tagline: "Accessible Product Interface System", tags: ["React", "Design System"],
    title: "Padrões recorrentes em um sistema de interface acessível e governável.", eta: "Jan 2027", stage: "Tokens e 14 componentes no ar, Storybook em andamento", repoUrl: "https://github.com/NasckDev/nasck-ui",
    summary: "Biblioteca de componentes acessíveis usada pelos outros projetos, com tokens, Storybook e governança.",
    role: "Arquitetura de componentes e documentação", skills: ["Design System", "Storybook", "Tokens", "a11y"],
    problem: "Padrões recorrentes eram reimplementados em cada projeto, com estados, foco e acessibilidade inconsistentes.",
    decisions: ["Tokens de cor, tipografia, espaço e movimento exportáveis", "Teclado e acessibilidade documentados por componente", "Visual regression e changelog a cada release"],
    a11y: "Foco visível em fundo claro e escuro; axe em todas as stories.", tests: "Testes de interação, visual regression e CI.",
  },
  {
    id: "myportfolio", num: "05", kind: "Produto · engenharia", read: "4 min", name: "Myportfolio", tagline: "Este portfólio como case de engenharia", tags: ["React", "Acessibilidade"],
    title: "Como reposicionei meu portfólio para transformar experiência em evidência.",
    summary: "React 19, TypeScript e Vite, legível por robôs e IAs, com 3D sob demanda e métricas sem dados pessoais.",
    role: "Produto, UX e engenharia", skills: ["React", "TypeScript", "three.js", "Vercel"],
    problem: "O portfólio anterior chamava atenção, mas apresentava primeiro os projetos que menos representavam a carreira, e robôs e IAs viam uma página vazia.",
    decisions: [
      "Conteúdo pré-renderizado no HTML, com robots.txt, sitemap e llms.txt, para IAs e prévias de link lerem o site",
      "three.js carregado só em telas largas e depois do primeiro conteúdo; no celular, o 3D é CSS puro",
      "Visitas e avaliações em Vercel Functions com Redis, visitante identificado por hash anônimo e limite de votos",
    ],
    a11y: "Skip link, foco visível, alvos de toque de 44 px e respeito a prefers-reduced-motion.", tests: "Testes automatizados das Functions, typecheck e build de produção a cada deploy.",
    image: `${base}og-image.jpg`, repoUrl: "https://github.com/NasckDev/Myportfolio", liveUrl: SITE_URL,
  },
];

export interface WebDesignPiece {
  id: string;
  name: string;
  kind: string;
  summary: string;
  tools: string[];
  /** Página publicada dentro de public/web-design/<id>/. */
  url: string;
  image: string;
  /** Link para o código-fonte, quando estiver publicado. */
  repo?: string;
}

export const webDesigns: WebDesignPiece[] = [
  {
    id: "bluebird",
    name: "Bluebird",
    kind: "Hero 3D · conceito",
    summary: "Hero de um app que identifica pássaros pelo canto. O pássaro pousa em vídeo 3D, o nome surge atrás dele e a interface em vidro entra em seguida, com som opcional.",
    tools: ["Vídeo 3D", "Glassmorphism", "Áudio", "Responsivo"],
    url: `${base}web-design/bluebird/index.html`,
    image: `${base}assets/web-design/bluebird.jpg`,
    repo: `${WEB_DESIGN_REPO_URL}/tree/main/projetos/bluebird`,
  },
  {
    id: "traco-construtora",
    name: "Traço Construtora",
    kind: "Redesign · estudo 3D",
    summary: "Estudo de redesign para uma construtora, feito para explorar elementos 3D na web: o prédio é montado em wireframe ao vivo com three.js e o visitante navega pela planta.",
    tools: ["three.js", "WebGL", "Redesign", "Estudo"],
    url: `${base}web-design/traco-construtora/index.html`,
    image: `${base}assets/web-design/traco-construtora.jpg`,
    repo: `${WEB_DESIGN_REPO_URL}/tree/main/projetos/traco-construtora`,
  },
];

/** Véspera: jogo autoral. O site do jogo é publicado dentro do portfólio, em public/vespera/. */
export const VESPERA_REPO_URL = "https://github.com/NasckDev/vespera";
export const game = {
  name: "Véspera",
  tagline: "Toda véspera, uma Brecha se abre em Lumeira.",
  summary:
    "RPG de ação 2D em pixel art que estou criando. Cace monstros, junte Fragmentos, forje armas e suba de rank até o Alvor, sozinho ou em co-op local para 2. Beta grátis para Windows.",
  tools: ["Godot 4", "C#", "Pixel art", "Co-op local", "Código aberto"],
  siteUrl: `${base}vespera/`,
  downloadUrl: `${VESPERA_REPO_URL}/releases`,
  repoUrl: VESPERA_REPO_URL,
  video: { webm: `${base}vespera/video/hero-540.webm`, mp4: `${base}vespera/video/hero-540.mp4`, poster: `${base}vespera/video/hero-poster.webp` },
};

export const caseFilters = ["Todos", "React", "Angular", "Dados", "Design System"] as const;
export type CaseFilter = (typeof caseFilters)[number];

export const interfaceStates = ["loading", "empty", "error", "partial", "success"];

export interface Job {
  period: string;
  company: string;
  role: string;
  context: string;
  items: string[];
  tech: string[];
  case?: string;
  caseIndex?: number;
}

export const jobs: Job[] = [
  { period: "08/2025 — atual", company: "MindMiners", role: "Software Engineer Frontend Pleno", context: "Plataforma SaaS de pesquisa e inteligência de mercado.", items: ["Entrega de produto em React e TypeScript, do refinamento à produção", "Componentização e Design System: filtros, formulários dinâmicos, modais e painéis", "Integrações REST e IA, feature flags por plano e métricas de adoção"], tech: ["React", "TypeScript", "Design System", "IA"], case: "InsightHub", caseIndex: 0 },
  { period: "02/2021 — 08/2025", company: "EY", role: "Trainee → Júnior → Pleno · Frontend e Microsserviços", context: "Aplicações corporativas, e-commerce em SAP Commerce e projeto para a Vivo.", items: ["Frontend com React, Angular, Vue.js, Nuxt.js e TypeScript", "Microsserviços Node.js/NestJS e integrações REST", "Testes com Jest, code review, incidentes e deploy com Jenkins e ArgoCD"], tech: ["React", "Angular", "NestJS", "SAP Commerce"], case: "OpsFlow", caseIndex: 1 },
  { period: "2020 — 2022", company: "Graduação e estágio", role: "Análise e Desenvolvimento de Sistemas · SPTech", context: "Em paralelo, primeiro estágio na Partners Digital (08/2020 a 02/2021).", items: ["Estágio em Desenvolvimento SAP na Partners Digital", "Criação e extensão de objetos no SAP Sales C4C", "Frontend, testes, correções e melhorias de usabilidade"], tech: ["SAP C4C", "Frontend", "Testes"] },
  { period: "2018 — 2019", company: "Curso técnico", role: "Técnico em Informática · Etec Jaraguá", context: "Onde tudo começou: o primeiro contato com programação e desenvolvimento web.", items: ["Lógica de programação e fundamentos de software", "Primeiras páginas com HTML, CSS e JavaScript"], tech: ["HTML", "CSS", "JavaScript"] },
];

export interface Skill {
  id: number;
  name: string;
  cat: string;
  cases: number[];
  jobs: number[];
}

export interface SkillGroup {
  title: string;
  color: string;
  items: Skill[];
}

type RawSkill = [name: string, cases: number[], jobs: number[]];

const rawSkillGroups: [string, RawSkill[]][] = [
  ["Linguagens e base", [["JavaScript", [4], [0, 1, 2, 3]], ["TypeScript", [0, 2, 3, 4], [0, 1]], ["HTML5", [], [0, 1, 2, 3]], ["CSS3 / SCSS", [3, 4], [0, 1]], ["Responsividade", [4], [0, 1]], ["C# e ABSL (SAP)", [], [1, 2]]]],
  ["Frameworks", [["React.js", [0, 2, 3, 4], [0, 1]], ["React Hooks", [0, 4], [0]], ["Next.js", [], []], ["Angular / AngularJS", [1], [1]], ["Vue.js", [], [1]], ["Nuxt.js", [], [1]], ["Node.js / NestJS", [], [1]]]],
  ["Arquitetura e interface", [["Micro frontends", [], []], ["Webpack", [], []], ["WebSockets", [], []], ["Componentização", [3], [0, 1]], ["Design Systems", [3], [0]], ["Storybook", [3], []], ["styled-components", [], []], ["Tailwind CSS", [4], []], ["Motion / GSAP", [4], []]]],
  ["Dados e integrações", [["APIs REST", [0], [0, 1]], ["Integração com IA", [0], [0]], ["React Query / TanStack Query", [0], []], ["Redux Toolkit", [], []], ["Microsserviços", [], [1]], ["Backends em C# e Python", [], [0]], ["Serverless (Vercel)", [4], []]]],
  ["Qualidade e performance", [["Acessibilidade (WCAG)", [0, 1, 3], [0]], ["Performance web", [4], []], ["Jest", [], [1]], ["Testes unitários e de integração", [0, 2, 4], [1]], ["Cypress", [], []], ["Playwright", [0, 1, 4], []], ["Code review", [], [0, 1]], ["Troubleshooting e incidentes", [], [1]]]],
  ["Entrega e colaboração", [["CI/CD", [4], [1]], ["Jenkins", [], [1]], ["ArgoCD", [], [1]], ["GitHub Actions", [4], []], ["Feature flags", [], [0, 1]], ["Git · GitHub · GitLab · Azure DevOps", [4], [0, 1]], ["Scrum / Kanban", [], [0]], ["Documentação técnica", [], [0]], ["SAP Commerce", [], [1]]]],
];

// Fundos de chip com texto branco: todos com contraste ≥ 4,5:1 (WCAG AA).
const groupColors = ["#1677B0", "#3B6FD4", "#0B7D8D", "#2A74C9", "#12689A", "#0B7A6B"];

export const allSkills: Skill[] = [];
export const skillGroups: SkillGroup[] = rawSkillGroups.map(([title, items], gi) => ({
  title,
  color: groupColors[gi % groupColors.length],
  items: items.map(([name, caseIdx, jobIdx]) => {
    const skill: Skill = { id: allSkills.length, name, cat: title, cases: caseIdx, jobs: jobIdx };
    allSkills.push(skill);
    return skill;
  }),
}));

export const repos = [
  { slug: "nasckdev/nasck-ui", name: "Nasck UI", problem: "Sistema de interface acessível usado pelos outros projetos.", quality: "Tokens · axe · Vitest", status: "Em construção · v1 jan 2027", dot: "#FEBC2E", href: "https://github.com/NasckDev/nasck-ui" },
  { slug: "nasckdev/insighthub", name: "InsightHub", problem: "Workspace de pesquisa com filtros, gráficos e sínteses assistidas.", quality: "Hono · Drizzle · Vitest · CI", status: "Em construção · v1 fev 2027", dot: "#6CC0EE", href: "https://github.com/NasckDev/insighthub" },
  { slug: "nasckdev/fiscotrack", name: "FiscoTrack", problem: "Evolução do minersCalculator: cálculo explicável e testável.", quality: "71 testes do motor · CI · Pages", status: "Demo no ar · v1 jan 2027", dot: "#FEBC2E", href: "https://github.com/NasckDev/fiscotrack" },
  { slug: "nasckdev/opsflow", name: "OpsFlow", problem: "Workflow de aprovações em Angular com máquina de estados, RBAC e auditoria.", quality: "84 testes · CI · Pages", status: "Demo no ar · v1 mar 2027", dot: "#6CC0EE", href: "https://github.com/NasckDev/opsflow" },
  { slug: "nasckdev/web-design", name: "Web design", problem: "Estudos visuais com 3D e movimento, com código, prints e README.", quality: "Páginas ao vivo · prints · README", status: "Publicado", dot: "#28C840", href: WEB_DESIGN_REPO_URL },
  { slug: "nasckdev/vespera", name: "Véspera", problem: "Meu jogo: RPG de ação 2D em pixel art, com co-op local.", quality: "Godot 4 · C# · testes automatizados", status: "Beta", dot: "#FEBC2E", href: VESPERA_REPO_URL },
  { slug: "nasckdev/myportfolio", name: "Myportfolio", problem: "Este portfólio, documentado como case de engenharia.", quality: "Typecheck · testes das Functions · prerender", status: "Publicado", dot: "#28C840", href: "https://github.com/NasckDev/Myportfolio" },
] as { slug: string; name: string; problem: string; quality: string; status: string; dot: string; href?: string }[];

export const principles = [
  { n: "01", tag: "dados", t: "Produto e dados", d: "Filtros, painéis, insights, estados assíncronos e eventos de produto." },
  { n: "02", tag: "código", t: "Engenharia frontend", d: "React, Angular, TypeScript, APIs, testes e arquitetura de componentes." },
  { n: "03", tag: "a11y", t: "Qualidade", d: "Acessibilidade, consistência, Design Systems, observabilidade e CI." },
  { n: "04", tag: "time", t: "Colaboração", d: "Produto, Design, Dados e Backend, em startup e ambiente corporativo." },
];

export const interests = ["Design Systems", "Acessibilidade", "Visualização de dados", "Arquitetura de estado", "IA aplicada a produto", "Performance web"];

export const workModes = [
  { t: "Híbrido em São Paulo", d: "Capital e região", tag: "híbrido", remote: false },
  { t: "Híbrido em Campinas ou Jundiaí", d: "Interior de São Paulo", tag: "híbrido", remote: false },
  { t: "100% remoto", d: "Para empresas de qualquer lugar do Brasil", tag: "remoto", remote: true },
];

export const navItems: [id: string, label: string][] = [["habilidades", "Habilidades"], ["cases", "Projetos"], ["jogo", "Jogo"], ["experiencia", "Experiência"], ["sobre", "Sobre"], ["contato", "Contato"]];

export const footerLinks: [id: string, label: string][] = [["habilidades", "Habilidades"], ["cases", "Projetos"], ["jogo", "Jogue Véspera"], ["experiencia", "Experiência"], ["engenharia", "Código aberto"], ["sobre", "Sobre mim"], ["contato", "Contato"]];

export const paletteNav: [id: string, label: string][] = [["habilidades", "Habilidades"], ["cases", "Projetos"], ["jogo", "Jogue Véspera"], ["experiencia", "Experiência"], ["engenharia", "Código aberto"], ["sobre", "Sobre mim"], ["contato", "Contato"]];

export const sectionIds = ["topo", "habilidades", "cases", "jogo", "experiencia", "engenharia", "sobre", "contato"];

export const MAIL_SUBJECT = "Oportunidade frontend";
export const MAIL_HREF = `mailto:${EMAIL}?subject=${encodeURIComponent(MAIL_SUBJECT)}`;
