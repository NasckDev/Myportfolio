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

/** Print real de uma tela do projeto, servido em public/assets/projetos/<id>/. */
export interface CaseShot {
  src: string;
  alt: string;
  caption: string;
  device: "desktop" | "mobile";
}

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
  /** Demo executável servida pelo próprio portfólio (build estático em public/projetos/<id>/). */
  demoUrl?: string;
  /** Prints reais, do mais representativo para o menos; o primeiro desktop vira a capa. */
  shots?: CaseShot[];
}

/** Monta a lista de prints de um projeto a partir dos arquivos em public/assets/projetos/<id>/. */
const shotsOf = (id: string, list: [file: string, device: CaseShot["device"], caption: string][]): CaseShot[] =>
  list.map(([file, device, caption]) => ({ src: `${base}assets/projetos/${id}/${file}`, alt: caption, caption, device }));

export const cases: CaseStudy[] = [
  {
    id: "insighthub", num: "01", kind: "React · dados", read: "6 min", name: "InsightHub", tagline: "Research & AI Insights Workspace", tags: ["React", "Dados", "Acessibilidade"],
    title: "Um workspace de insights para reduzir a distância entre dados e decisão.", eta: "Fev 2027", stage: "Workspace rodando no navegador e API com 16 testes; faltam E2E e OpenAPI", repoUrl: "https://github.com/NasckDev/insighthub", liveUrl: "https://nasckdev.github.io/insighthub/",
    demoUrl: `${base}projetos/insighthub/`,
    shots: shotsOf("insighthub", [
      ["insighthub-visao-geral-desktop.png", "desktop", "Visão geral: NPS, distribuição das notas e evolução semanal"],
      ["insighthub-comparar-amostra-pequena-desktop.png", "desktop", "Comparação de segmentos com aviso de amostra pequena"],
      ["insighthub-sintese-citacao-desktop.png", "desktop", "Síntese com citação aberta na resposta de origem"],
      ["insighthub-visao-geral-celular.png", "mobile", "Visão geral no celular"],
      ["insighthub-sintese-celular.png", "mobile", "Síntese com citações clicáveis no celular"],
    ]),
    summary: "Workspace para explorar pesquisas, comparar segmentos e gerar sínteses assistidas por IA com rastreabilidade.",
    role: "Concepção, arquitetura e frontend", skills: ["React", "TypeScript", "TanStack", "IA"],
    problem: "Times de pesquisa e produto precisam transformar respostas, segmentos e indicadores em insights acionáveis. A experiência costuma ser fragmentada entre filtros complexos, tabelas, gráficos, comentários e geração de sínteses.",
    decisions: ["Filtros persistidos na URL para visões compartilháveis", "TanStack Query para estado de servidor, cache e invalidação", "IA com cancelamento, retry e indicação da fonte usada"],
    a11y: "Gráficos com alternativa em tabela, contraste AA nos dois temas e navegação completa por teclado.", tests: "76 testes: regras de NPS e schemas no core, API com SQLite em memória e interface com filtros na URL, estados e citações. Playwright + axe é o próximo passo.",
  },
  {
    id: "opsflow", num: "02", kind: "Angular · corporativo", read: "7 min", name: "OpsFlow", tagline: "Enterprise Workflow & Approval Console", tags: ["Angular", "Acessibilidade"],
    title: "Um workflow corporativo com permissões, auditoria e evolução incremental.", eta: "Mar 2027", stage: "Máquina de estados, permissões e auditoria rodando, com 84 testes; faltam testes de ponta a ponta", repoUrl: "https://github.com/NasckDev/opsflow", liveUrl: "https://nasckdev.github.io/opsflow/",
    demoUrl: `${base}projetos/opsflow/`,
    shots: shotsOf("opsflow", [
      ["opsflow-lista-solicitacoes-desktop.webp", "desktop", "Lista de solicitações com status e prazo (SLA)"],
      ["opsflow-detalhe-auditoria-desktop.webp", "desktop", "Detalhe aprovado, com a linha do tempo de auditoria"],
      ["opsflow-wizard-detalhes-desktop.webp", "desktop", "Wizard de nova solicitação, etapa de detalhes"],
      ["opsflow-wizard-revisao-desktop.webp", "desktop", "Wizard, revisão antes de enviar"],
      ["opsflow-lista-solicitacoes-mobile.webp", "mobile", "Lista no celular"],
      ["opsflow-detalhe-auditoria-mobile.webp", "mobile", "Auditoria no celular"],
    ]),
    summary: "Console de workflow com etapas rastreáveis, permissões, histórico e suporte multilíngue.",
    role: "Estados, formulários e RBAC", skills: ["Angular", "RxJS", "RBAC", "i18n"],
    problem: "Operações corporativas precisam criar, revisar e aprovar solicitações com várias etapas, papéis, documentos, prazos e trilha de auditoria. Interfaces frágeis aumentam retrabalho, erros e tempo de decisão.",
    decisions: ["Workflow modelado como máquina de estados", "Matriz de permissões testada por papel", "Migração incremental de legado com adapter"],
    a11y: "Wizard navegável por teclado e leitor de tela; foco vai para o primeiro erro.", tests: "84 testes unitários da máquina de estados, das 35 combinações de papel e permissão, do SLA, da auditoria e do adapter do legado. E2E com Playwright é o próximo passo.",
  },
  {
    id: "fiscotrack", num: "03", kind: "Domínio · testes", read: "5 min", name: "FiscoTrack", tagline: "Investment Tax Calculator & Reporting", tags: ["React", "Dados"],
    title: "Regras financeiras em um motor de cálculo testável e explicável.", eta: "Jan 2027", stage: "Motor com 71 testes e app web rodando; faltam testes de ponta a ponta", repoUrl: "https://github.com/NasckDev/fiscotrack", liveUrl: "https://nasckdev.github.io/fiscotrack/",
    demoUrl: `${base}projetos/fiscotrack/`,
    shots: shotsOf("fiscotrack", [
      ["fiscotrack-painel-mensal-desktop.webp", "desktop", "Painel mensal: resultado e DARF estimado por mês"],
      ["fiscotrack-explicacao-calculo-desktop.webp", "desktop", "\"Por que deu esse valor?\": o cálculo passo a passo, com as fontes legais"],
      ["fiscotrack-importacao-csv-desktop.webp", "desktop", "Importação de CSV com erro apontado por linha"],
      ["fiscotrack-operacoes-desktop.webp", "desktop", "Lançamento manual e tabela de operações"],
      ["fiscotrack-regras-desktop.webp", "desktop", "Regras e premissas, com vigência e fonte"],
      ["fiscotrack-painel-mensal-mobile.webp", "mobile", "Painel no celular"],
    ]),
    summary: "Calculadora educacional de resultados de investimentos com regras versionadas e explicáveis.",
    role: "Modelagem de domínio e testes", skills: ["React", "Funções puras", "Vitest"],
    problem: "Investidores precisam organizar operações, calcular resultados por período e compreender regras aplicadas, sem depender de uma planilha opaca.",
    decisions: ["Motor de cálculo em funções puras, fora da UI", "Regras versionadas por data, com fonte", "Dados locais por padrão; nada enviado à telemetria"],
    a11y: "Gráficos com alternativa textual e erros de importação por linha.", tests: "71 testes do motor (99% de cobertura), table-driven: zero operações, custos, prejuízo acumulado, arredondamento. Mais 23 testes de interface.",
  },
  {
    id: "nasckui", num: "04", kind: "Design System", read: "5 min", name: "Nasck UI", tagline: "Accessible Product Interface System", tags: ["React", "Design System"],
    title: "Padrões recorrentes em um sistema de interface acessível e governável.", eta: "Jan 2027", stage: "14 componentes, tokens e playground rodando, com 100 testes e 99% de cobertura", repoUrl: "https://github.com/NasckDev/nasck-ui", liveUrl: "https://nasckdev.github.io/nasck-ui/",
    demoUrl: `${base}projetos/nasck-ui/`,
    shots: shotsOf("nasckui", [
      ["nasckui-desktop-visao-geral.png", "desktop", "Playground: visão geral, princípios e navegação por componente"],
      ["nasckui-desktop-componente-button.png", "desktop", "Página do Button: variantes, tamanhos e código copiável"],
      ["nasckui-desktop-tokens-escuro.png", "desktop", "Tokens no tema escuro, com a paleta e o contraste"],
      ["nasckui-mobile-visao-geral.png", "mobile", "Playground no celular"],
      ["nasckui-mobile-exemplo-composto.png", "mobile", "Tela de configurações montada só com a lib, com erro de validação"],
      ["nasckui-mobile-menu.png", "mobile", "Menu de componentes no celular"],
    ]),
    summary: "Biblioteca de componentes acessíveis usada pelos outros projetos, com tokens, playground e governança.",
    role: "Arquitetura de componentes e documentação", skills: ["Design System", "Tokens", "a11y", "Vitest"],
    problem: "Padrões recorrentes eram reimplementados em cada projeto, com estados, foco e acessibilidade inconsistentes.",
    decisions: ["Tokens de cor, tipografia, espaço e movimento exportáveis", "Teclado e acessibilidade documentados por componente", "Changelog com Changesets e CI que barra tokens desatualizados"],
    a11y: "Foco visível em fundo claro e escuro, suporte a forced-colors e axe em todos os componentes.", tests: "100 testes de teclado, axe e contraste WCAG dos tokens; 99% de cobertura e CI a cada push.",
  },
  {
    id: "juntos", num: "05", kind: "Produto · full stack", read: "6 min", name: "Juntos", tagline: "Household Finance for One or Two", tags: ["Dados", "Acessibilidade"],
    title: "A planilha de finanças de um casal virando um app mobile-first, com contas que se lançam sozinhas e divisão justa.", eta: "Jul 2027", stage: "Protótipo completo no ar com 12 testes de ponta a ponta; app full stack (Next.js, Postgres, Better Auth) em planejamento", repoUrl: "https://github.com/NasckDev/juntos",
    demoUrl: `${base}projetos/juntos/`,
    shots: shotsOf("juntos", [
      ["juntos-inicio-computador.webp", "desktop", "Início: quanto deve sobrar até o fim do mês, próximos vencimentos e para onde foi o dinheiro"],
      ["juntos-divisao-computador.webp", "desktop", "Divisão de contas: quem pagou o quê e quanto falta acertar"],
      ["juntos-orcamento-computador.webp", "desktop", "Orçamento por categoria, com sugestão pela média de três meses"],
      ["juntos-lancamentos-computador.webp", "desktop", "Lançamentos agrupados em atrasados, em aberto e concluídos"],
      ["juntos-exportar-computador.webp", "desktop", "Exportação para Excel no modelo da planilha, PDF e CSV, com filtros"],
      ["juntos-inicio-celular.webp", "mobile", "Início no celular"],
      ["juntos-lancamentos-celular.webp", "mobile", "Lançamentos no celular"],
      ["juntos-divisao-celular.webp", "mobile", "Divisão no celular"],
    ]),
    summary: "Finanças da casa, sozinho ou a dois: contas fixas e parcelas automáticas, divisão justa, orçamento, metas e a planilha do Excel de volta.",
    role: "Produto, UX e arquitetura", skills: ["Mobile-first", "Playwright", "Modelagem de dados", "Segurança"],
    problem: "Um casal controlava o ano numa planilha com uma aba por mês: redigitava toda conta fixa, não sabia quanto ia sobrar no meio do mês, dividia as contas de cabeça e quase não conseguia usar no celular.",
    decisions: [
      "Protótipo completo como fonte da verdade de UX e regras, e o app full stack reconstruído em camadas com o núcleo testado antes da interface",
      "Dinheiro em centavos inteiros e lançamento mensal idempotente das contas fixas",
      "Repositório público sem dados reais: varredura de privacidade no CI e no build, CSP restrita e segredos só em variáveis de ambiente",
    ],
    a11y: "Barra inferior e alvos de 44 px no celular, validação embaixo de cada campo, atalhos de teclado, 4 tamanhos de letra e gráficos com a frase completa para leitor de tela.",
    tests: "12 testes Playwright no celular (390 px) e no computador (1440 px), com a mesma CSP da produção: entrada, resumo, lançamento, validação, exportação para Excel e nenhuma tela rolando para o lado.",
  },
  {
    id: "myportfolio", num: "06", kind: "Produto · engenharia", read: "4 min", name: "Myportfolio", tagline: "Este portfólio como case de engenharia", tags: ["React", "Acessibilidade"],
    title: "Como reposicionei meu portfólio para transformar experiência em evidência.",
    summary: "React 19, TypeScript e Vite, legível por robôs e IAs, com 3D sob demanda e métricas sem dados pessoais.",
    role: "Produto, UX e engenharia", skills: ["React", "TypeScript", "three.js", "Vercel"],
    problem: "O portfólio anterior chamava atenção, mas apresentava primeiro os projetos que menos representavam a carreira, e robôs e IAs viam uma página vazia.",
    decisions: [
      "Conteúdo pré-renderizado no HTML, com robots.txt, sitemap e llms.txt, para IAs e prévias de link lerem o site",
      "three.js carregado só em telas largas e depois do primeiro conteúdo; no celular, o 3D é CSS puro",
      "Visitas e avaliações em Vercel Functions com Redis, visitante identificado por hash anônimo e limite de votos",
    ],
    a11y: "Skip link, foco visível, alvos de toque de 44 px e respeito a prefers-reduced-motion.", tests: "ESLint com jsx-a11y, testes de componente com Vitest e Testing Library, testes das Functions e build de produção a cada deploy.",
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
  ["Arquitetura e interface", [["Micro frontends", [], []], ["Webpack", [], []], ["WebSockets", [], []], ["Componentização", [3], [0, 1]], ["Design Systems", [3], [0]], ["Storybook", [], []], ["styled-components", [], []], ["Tailwind CSS", [4], []], ["Motion / GSAP", [4], []]]],
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
  { slug: "nasckdev/nasck-ui", name: "Nasck UI", problem: "Sistema de interface acessível usado pelos outros projetos.", quality: "100 testes · axe · Pages", status: "Demo no ar · v1 jan 2027", dot: "#FEBC2E", href: "https://github.com/NasckDev/nasck-ui" },
  { slug: "nasckdev/insighthub", name: "InsightHub", problem: "Workspace de pesquisa com filtros, gráficos e sínteses assistidas.", quality: "Hono · Drizzle · TanStack · CI", status: "Demo no ar · v1 fev 2027", dot: "#6CC0EE", href: "https://github.com/NasckDev/insighthub" },
  { slug: "nasckdev/fiscotrack", name: "FiscoTrack", problem: "Evolução do minersCalculator: cálculo explicável e testável.", quality: "71 testes do motor · CI · Pages", status: "Demo no ar · v1 jan 2027", dot: "#FEBC2E", href: "https://github.com/NasckDev/fiscotrack" },
  { slug: "nasckdev/opsflow", name: "OpsFlow", problem: "Workflow de aprovações em Angular com máquina de estados, RBAC e auditoria.", quality: "84 testes · CI · Pages", status: "Demo no ar · v1 mar 2027", dot: "#6CC0EE", href: "https://github.com/NasckDev/opsflow" },
  { slug: "nasckdev/web-design", name: "Web design", problem: "Estudos visuais com 3D e movimento, com código, prints e README.", quality: "Páginas ao vivo · prints · README", status: "Publicado", dot: "#28C840", href: WEB_DESIGN_REPO_URL },
  { slug: "nasckdev/vespera", name: "Véspera", problem: "Meu jogo: RPG de ação 2D em pixel art, com co-op local.", quality: "Godot 4 · C# · testes automatizados", status: "Beta", dot: "#FEBC2E", href: VESPERA_REPO_URL },
  { slug: "nasckdev/myportfolio", name: "Myportfolio", problem: "Este portfólio, documentado como case de engenharia.", quality: "ESLint · Vitest · CI · prerender", status: "Publicado", dot: "#28C840", href: "https://github.com/NasckDev/Myportfolio" },
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
