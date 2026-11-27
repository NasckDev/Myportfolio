import { NEW_DESIGNS } from "./newProjects";
import { PRODUCTS, PROJECTS } from "./projects";
import { LINKS, SITE_URL, nf, numberWord } from "./site";
import { TEST_COUNTS, TOTAL_E2E, TOTAL_UNIT, type TestCount } from "./testCounts";
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
    alt: "Hero do Bluebird com um pássaro azul pousado sobre o nome do app e, ao lado, o guia de campo aberto no celular com fotos reais de aves",
    text: "App que identifica pássaros pelo canto. O pássaro pousa em vídeo 3D e o guia de campo traz aves, sapos, insetos e mamíferos reais da API do iNaturalist, com fotos, gravações e créditos de licença.",
    tools: ["Vídeo 3D", "API iNaturalist", "Áudio", "Responsivo"],
    live: `${SITE_URL}/web-design/bluebird/index.html`,
    code: "https://github.com/NasckDev/web-design/tree/main/projetos/bluebird",
  },
  {
    id: "traco",
    name: "Traço Construtora",
    kind: "Redesign com 3D",
    image: "/assets/design/traco.webp",
    alt: "Redesign da Traço Construtora no desktop e no celular, com o prédio 3D já construído ao lado do título",
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

const LOGO = {
  mindminers: { src: "/assets/empresas/mindminers.svg", alt: "Logo da MindMiners", width: 96, height: 24 },
  ey: { src: "/assets/empresas/ey.svg", alt: "Logo da EY", width: 24, height: 24 },
  vivo: { src: "/assets/empresas/vivo.svg", alt: "Logo da Vivo", width: 65, height: 24 },
  sap: { src: "/assets/empresas/sap.svg", alt: "Logo da SAP", width: 48, height: 24 },
} as const;

export const JOBS: readonly Job[] = [
  {
    id: "mindminers",
    when: "ago/2025 até hoje",
    company: "MindMiners",
    role: "Software Engineer Front-End, remoto",
    marks: [LOGO.mindminers],
    items: [
      "Condução do front-end da squad de Dados em React e TypeScript, do refinamento técnico à publicação, com Produto, Design e backends em C# e Python",
      "Jornada de Descobertas por IA nos Clusters: seleção de dados, prompts, consumo de APIs e estados de carregamento, validação e erro",
      "Painéis de insights redimensionáveis e arrastáveis, com filtros, favoritos, avaliações e persistência de estado",
      "Componentes do Design System para formulários dinâmicos, filtros, modais e painéis, com semântica, navegação por teclado, foco e responsividade",
      "Feature flags por plano e eventos de produto para lançamentos segmentados",
    ],
    tech: ["React", "TypeScript", "Design System", "IA", "Feature flags"],
    detail: {
      context: "Plataforma SaaS de pesquisa e inteligência de mercado. Desenvolvo funcionalidades com foco em experiência do usuário, interfaces orientadas a dados e evolução contínua do produto.",
      did: [
        "Transformo layouts do Figma em componentes React e TypeScript responsivos, acessíveis e consistentes com o Design System da empresa",
        "Desenvolvo componentes reutilizáveis para jornadas complexas: filtros, seleções, formulários dinâmicos, modais, painéis redimensionáveis, listas de insights e tooltips",
        "Integro APIs REST e serviços de IA, com estados de carregamento, erro, validação e feedback que deixam os fluxos assíncronos previsíveis",
        "Aplico feature flags e rollout gradual por plano da plataforma, para lançamentos mais seguros e validação progressiva",
        "Instrumento eventos e métricas de uso para acompanhar engajamento, adoção e avaliação das features",
        "Melhoro acessibilidade e usabilidade: navegação por teclado, foco visível, mensagens de erro claras e elementos semânticos",
        "Trabalho com Product Owners, Design, Dados e Backend em refinamentos, decisões de solução, code reviews e entregas incrementais, com GitLab e Scrum",
        "Atuo junto a serviços em C# e Python e proponho soluções para casos específicos, como comunicação com iframes e modais picture-in-picture",
      ],
      ai: [
        "Fluxos de processamento por LLM no back-end em C#",
        "Servidor MCP para consultar logs no Grafana e no Loki, com alertas no Slack",
        "Agentes de IA no fluxo de desenvolvimento, integrados por MCP ao Figma, ao Storybook e ao Playwright",
      ],
      highlights: [
        "Condução do front-end da squad de Dados, do refinamento técnico à publicação",
        "Jornada de Descobertas por IA nos Clusters: seleção de dados, prompts, consumo de APIs e estados de carregamento, validação e erro",
        "Painéis de insights redimensionáveis e arrastáveis, com filtros, favoritos, avaliações e persistência de estado",
      ],
      stack: ["React", "TypeScript", "JavaScript", "HTML5", "CSS3 e SCSS", "Figma", "Design System", "APIs REST", "LLMs", "MCP", "GitLab", "C#", "Python", "Scrum"],
    },
  },
  {
    id: "ey-vivo",
    when: "jul/2023 a ago/2025",
    company: "EY, projeto Vivo (Telefônica)",
    role: "Software Engineer Front-End e Microsserviços, híbrido",
    marks: [LOGO.ey, LOGO.vivo],
    items: [
      "Interfaces corporativas em React, TypeScript, Angular, Vue.js e Nuxt.js, traduzindo regras de negócio em fluxos reutilizáveis e responsivos",
      "Microsserviços em Node.js e NestJS e integrações REST, com tratamento de dados e erros entre interface e serviços",
      "Testes unitários com Jest, code review e investigação de incidentes em produção",
      "Pipelines de build e deploy com Jenkins e ArgoCD",
    ],
    tech: ["React", "Angular", "Vue.js", "NestJS", "Jest", "ArgoCD"],
    detail: {
      context: "Analista e Desenvolvedor Pleno na EY, em aplicações corporativas e integrações do projeto para a Vivo: evolução de aplicações web, microsserviços, testes e automação de entrega.",
      did: [
        "Desenvolvi aplicações com React, Angular e AngularJS, Vue.js, Nuxt.js e TypeScript, traduzindo requisitos funcionais e técnicos em interfaces reutilizáveis e responsivas",
        "Criei microsserviços com Node.js e NestJS para integrações e fluxos de negócio consumidos pelas aplicações web",
        "Trabalhei com APIs REST e contratos entre front-end e back-end, tratando dados, erros e comportamentos esperados nas integrações",
        "Implementei testes unitários com Jest e participei de code reviews, para reduzir regressões",
        "Investiguei e resolvi incidentes em produção",
        "Apoiei pipelines de build e deploy com Jenkins e ArgoCD, com versionamento em GitHub, GitLab e Azure DevOps",
        "Participei de refinamentos e decisões técnicas com times multidisciplinares, equilibrando viabilidade, experiência do usuário e negócio",
      ],
      stack: ["React", "Angular e AngularJS", "Vue.js", "Nuxt.js", "TypeScript", "JavaScript", "Node.js", "NestJS", "Jest", "APIs REST", "Jenkins", "ArgoCD", "GitHub", "GitLab", "Azure DevOps"],
    },
  },
  {
    id: "ey-sap-commerce",
    when: "ago/2022 a ago/2023",
    company: "EY",
    role: "Analista e Desenvolvedor Front-End e SAP Commerce",
    marks: [LOGO.ey, LOGO.sap],
    items: ["E-commerce em SAP Commerce com internacionalização, integrações via API, feature flags e deploys em produção"],
    tech: ["SAP Commerce", "i18n", "APIs REST"],
    detail: {
      context: "Analista e Desenvolvedor Júnior na EY, em e-commerce e operação de jornadas corporativas sobre SAP Commerce.",
      did: [
        "Evoluí interfaces SAP Commerce com foco em usabilidade, internacionalização e manutenção de jornadas corporativas",
        "Integrei APIs e configurações por feature flags e variáveis de ambiente",
        "Apoiei deploys e correções em produção",
      ],
      stack: ["SAP Commerce", "JavaScript", "APIs REST", "Feature flags", "Internacionalização", "Deploy"],
    },
  },
  {
    id: "ey-trainee",
    when: "fev/2021 a ago/2022",
    company: "EY",
    role: "Trainee SAP Sales e SAP Commerce",
    marks: [LOGO.ey, LOGO.sap],
    items: ["Customização de objetos, telas e fluxos com C# e ABSL no SAP Application Studio"],
    tech: ["C#", "ABSL", "SAP Sales"],
    detail: {
      context: "Desenvolvedor Trainee na EY, em soluções empresariais sobre SAP Sales C4C e SAP Commerce.",
      did: [
        "Personalizei objetos, telas e fluxos no SAP Application Studio com C# e ABSL",
        "Implementei melhorias em SAP Sales C4C e SAP Commerce orientadas a regras de negócio, com base em integração de sistemas",
      ],
      stack: ["SAP Sales C4C", "SAP Commerce", "SAP Application Studio", "C#", "ABSL"],
    },
  },
  {
    id: "partners",
    when: "ago/2020 a fev/2021",
    company: "Partners Digital",
    role: "Estagiário em Desenvolvimento SAP",
    marks: [{ mono: "PD", alt: "Partners Digital" }],
    items: ["Objetos no SAP Sales C4C, front-end, testes e melhorias de usabilidade"],
    tech: ["SAP C4C", "Front-end", "Testes"],
    detail: {
      context: "Primeiro estágio, em desenvolvimento SAP para projetos comerciais.",
      did: [
        "Criei e estendi objetos personalizados no SAP Sales C4C e apoiei customizações de telas e funcionalidades comerciais",
        "Contribuí com desenvolvimento front-end, testes, correções e melhorias de usabilidade",
      ],
      stack: ["SAP Sales C4C", "SAP Application Studio", "C#", "ABSL", "Front-end"],
    },
  },
];

export const getJob = (id: string): Job | undefined => JOBS.find((j) => j.id === id);

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
  /** Experiência profissional: id do emprego aberto em detalhe na página Experiência. */
  job?: string;
}

export const EVIDENCE: Readonly<Record<string, Evidence>> = {
  vespera: { name: "Véspera", kind: "Jogo em Godot 4 e C#", href: "/jogo" },
  bluebird: { name: "Bluebird", kind: "Design de interface", href: "/design" },
  traco: { name: "Traço Construtora", kind: "Design com three.js", href: "/design" },
  mm: { name: "MindMiners", kind: "Trabalho atual, desde 2025", href: "/experiencia", job: "mindminers" },
  ey: { name: "EY, projeto Vivo", kind: "Trabalho, 2023 a 2025", href: "/experiencia", job: "ey-vivo" },
  sap: { name: "EY, SAP Commerce", kind: "Trabalho, 2021 a 2023", href: "/experiencia", job: "ey-sap-commerce" },
  pd: { name: "Partners Digital", kind: "Estágio, 2020 a 2021", href: "/experiencia", job: "partners" },
  ...Object.fromEntries(PROJECTS.map((p) => [p.id, { name: p.name, kind: p.kind, href: `/projeto/${p.id}` }])),
};

const APPS = ["juntos", "insighthub", "opsflow", "fiscotrack", "nasckui"];
const API_APPS = ["coverlist", "garrafao"];
const VITE_APPS = ["insighthub", "fiscotrack", "nasckui", ...API_APPS, "portfolio"];

/** Habilidade, ids de evidência e, quando ajuda, uma frase de onde e como foi aplicada. */
export type SkillItem = readonly [skill: string, evidence: readonly string[], note?: string];

export const SKILLS: readonly (readonly [group: string, items: readonly SkillItem[]])[] = [
  ["Linguagens", [
    ["TypeScript", [...APPS, ...API_APPS, "portfolio", "mm", "ey"]],
    ["JavaScript", ["portfolio", "bluebird", "mm", "ey", "sap"]],
    ["HTML e CSS", ["bluebird", "traco", "portfolio", "mm", "ey"]],
    ["C#", ["vespera", "mm", "sap", "pd"], "Na MindMiners, junto aos serviços e fluxos de LLM do back-end; na EY e na Partners Digital, no SAP Application Studio; no Véspera, toda a lógica do jogo."],
  ]],
  ["Front-end", [
    ["React", ["juntos", "insighthub", "fiscotrack", "nasckui", "portfolio", "mm", "ey"]],
    ["Next.js", ["juntos"]],
    ["Angular", ["opsflow", "nasckui", "ey"]],
    ["Vue.js e Nuxt.js", ["ey"]],
    ["Design Systems", ["nasckui", "mm"], "Na MindMiners, componentes do Design System da empresa a partir do Figma; no Nasck UI, a mesma API em React e Angular."],
    ["Componentização", ["nasckui", "insighthub", "opsflow", "fiscotrack", "mm", "ey"]],
    ["Visualização de dados", ["insighthub", "opsflow", "fiscotrack", "garrafao", "mm"]],
    ["TanStack Query", ["insighthub"]],
    ["Tailwind CSS", ["juntos"]],
    ["Internacionalização", ["sap"]],
    ["Animação e 3D na web", ["portfolio", "traco", "bluebird", "coverlist"]],
  ]],
  ["Back-end", [
    ["Node.js", ["juntos", "portfolio", "ey", ...API_APPS]],
    ["NestJS", ["ey"]],
    ["APIs REST", ["insighthub", "mm", "ey", "sap"]],
    ["Integração com APIs públicas", API_APPS],
    ["Proxy e cache na CDN", API_APPS],
    ["Microsserviços", ["ey"], "No projeto da Vivo, serviços em Node.js e NestJS consumidos pelas aplicações web."],
    ["PostgreSQL e Drizzle", ["juntos"]],
    ["Autenticação", ["juntos"]],
    ["Serverless na Vercel", ["juntos", "portfolio", ...API_APPS]],
    ["SAP Commerce e SAP C4C", ["sap", "pd"]],
  ]],
  ["IA", [
    ["LLMs em produto", ["insighthub", "mm"], "Na MindMiners, jornadas com serviços de IA e fluxos de processamento por LLM no back-end em C#; no InsightHub, síntese em streaming com cancelar e tentar de novo."],
    ["RAG com citações", ["insighthub"], "No InsightHub, o modelo recebe só as respostas que passam pelos filtros e cita cada fonte como [#id]; id fora do conjunto enviado é descartado."],
    ["MCP (Model Context Protocol)", ["mm"], "Na MindMiners, criei um servidor MCP para consultar logs no Grafana e no Loki, com alertas no Slack."],
    ["Agentes de IA no desenvolvimento", ["mm", "juntos"], "Na MindMiners, agentes integrados por MCP ao Figma, ao Storybook e ao Playwright; no Juntos, as regras para agentes ficam versionadas no CLAUDE.md."],
    ["Prompts e defesa contra injeção", ["insighthub"], "No InsightHub, o texto dos clientes vai entre delimitadores sorteados a cada pedido e nunca é seguido como instrução."],
  ]],
  ["Ferramentas", [
    ["Git, GitHub e GitLab", [...APPS, ...API_APPS, "portfolio", "mm", "ey"], "GitLab na MindMiners; GitHub, GitLab e Azure DevOps na EY; GitHub em todos os projetos públicos."],
    ["Figma", ["mm"], "Na MindMiners, layouts do Figma viram componentes React do Design System."],
    ["Storybook", ["insighthub", "opsflow", "fiscotrack", "nasckui", "mm"]],
    ["Playwright", [...APPS, ...API_APPS, "portfolio", "mm"], "Testes de ponta a ponta em todos os produtos; na MindMiners, também acionado por agentes via MCP."],
    ["axe-core", [...APPS, ...API_APPS, "portfolio"], "Os sete produtos e este portfólio rodam o axe nos testes de ponta a ponta."],
    ["Vitest e Jest", [...APPS, ...API_APPS, "portfolio", "ey"], "Jest no projeto da Vivo; Vitest nos produtos publicados."],
    ["Vite", VITE_APPS],
    ["Jenkins e ArgoCD", ["ey"]],
    ["Grafana e Loki", ["mm"]],
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
    ["Feature flags", ["mm", "sap"], "Na MindMiners, rollout gradual por plano da plataforma; na EY, configurações por flag no SAP Commerce."],
    ["Métricas de produto", ["mm"], "Na MindMiners, eventos de uso para acompanhar adoção, engajamento e avaliação das features."],
    ["Documentação técnica", ["juntos", "opsflow", "mm"]],
    ["Scrum e Kanban", ["mm"]],
  ]],
];

export const ALL_SKILLS = SKILLS.flatMap(([, items]) => items.map(([s]) => s));

export function skillEvidence(skill: string): { projects: Evidence[]; jobs: Evidence[]; note?: string } {
  const item = SKILLS.flatMap(([, items]) => items).find(([s]) => s === skill);
  const all = (item?.[1] ?? []).map((id) => EVIDENCE[id]).filter((e): e is Evidence => !!e);
  return { projects: all.filter((e) => !e.job), jobs: all.filter((e) => e.job), note: item?.[2] };
}

/** Cartões de especialidade (Início e Habilidades). O último campo é a habilidade aberta ao clicar. */
export const SPECIALTIES: readonly (readonly [icon: string, title: string, text: string, skill: string])[] = [
  ["code", "Front-end", `React, Next.js, Angular e Vue com TypeScript. Seis anos em produção e ${numberWord(PRODUCT_COUNT)} produtos publicados.`, "React"],
  ["layers", "Back-end e APIs", "Microsserviços em Node.js e NestJS no projeto da Vivo, o back-end do Juntos e proxies próprios para APIs públicas.", "Node.js"],
  ["grid", "Design Systems e acessibilidade", `${TEST_COUNTS.nasckui.components} componentes com a mesma API em React e Angular, com WCAG AA verificada com axe.`, "Design Systems"],
  ["check", "Testes e entrega", `${nf(TOTAL_UNIT)} testes automatizados, ${TOTAL_E2E} cenários de ponta a ponta e CI/CD.`, "Testes automatizados"],
  ["spark", "IA aplicada", "LLMs em produto na MindMiners, RAG com citações verificáveis no InsightHub e um servidor MCP para logs, com alertas no Slack.", "LLMs em produto"],
];

/** Produtos cujo repositório roda o axe nos testes de ponta a ponta (conferido em cada repositório). */
export const AXE_E2E_PRODUCTS: readonly string[] = ["juntos", "insighthub", "opsflow", "fiscotrack", "nasckui", "coverlist", "garrafao"];

const storyCounts = (Object.values(TEST_COUNTS) as TestCount[]).map((c) => c.stories).filter((n): n is number => n !== null);
/** Stories no Storybook somadas e quantas bibliotecas têm Storybook. */
export const STORIES_TOTAL = storyCounts.reduce((sum, n) => sum + n, 0);
export const STORYBOOK_LIBS = storyCounts.length;

/** Métricas do bloco de código no Início: valor animado, complemento e legenda. */
export const CODE_METRICS: readonly (readonly [value: number, suffix: string, label: string])[] = [
  [Number.parseInt(TEST_COUNTS.juntos.coreCoverage, 10), "%", "das linhas do núcleo de regras do Juntos cobertas por testes"],
  [STORIES_TOTAL, "", `stories no Storybook, em ${numberWord(STORYBOOK_LIBS)} bibliotecas`],
  [TEST_COUNTS.nasckui.components, "", "componentes com a mesma API em React e Angular"],
  [AXE_E2E_PRODUCTS.length, ` de ${PRODUCT_COUNT}`, "produtos com auditoria axe nos testes de ponta a ponta"],
];

/** Stack principal no topo do Início: rótulo e habilidade aberta. */
export const MAIN_STACK: readonly (readonly [string, string])[] = [
  ["React", "React"], ["Next.js", "Next.js"], ["Angular", "Angular"], ["TypeScript", "TypeScript"],
  ["Node.js", "Node.js"], ["NestJS", "NestJS"], ["PostgreSQL", "PostgreSQL e Drizzle"], ["C#", "C#"],
];
