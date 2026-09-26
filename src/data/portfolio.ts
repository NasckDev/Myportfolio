export const EMAIL = "aleh.dnascimento@gmail.com";
export const LINKEDIN_URL = "https://www.linkedin.com/in/alexandre-diogo-nascimento";
export const GITHUB_URL = "https://github.com/NasckDev";
export const GITHUB_REPOS_URL = "https://github.com/NasckDev?tab=repositories";

const base = import.meta.env.BASE_URL;
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
}

export const cases: CaseStudy[] = [
  {
    id: "insighthub", num: "01", kind: "React · dados", read: "6 min", name: "InsightHub", tagline: "Research & AI Insights Workspace", tags: ["React", "Dados", "Acessibilidade"],
    title: "Como desenhei um workspace de insights para reduzir a distância entre dados e decisão.",
    summary: "Workspace para explorar pesquisas, comparar segmentos e gerar sínteses assistidas por IA com rastreabilidade.",
    role: "Concepção, arquitetura e frontend", skills: ["React", "TypeScript", "TanStack", "IA"],
    problem: "Times de pesquisa e produto precisam transformar respostas, segmentos e indicadores em insights acionáveis. A experiência costuma ser fragmentada entre filtros complexos, tabelas, gráficos, comentários e geração de sínteses.",
    decisions: ["Filtros persistidos na URL para visões compartilháveis", "TanStack Query para estado de servidor, cache e invalidação", "IA com cancelamento, retry e indicação da fonte usada"],
    a11y: "Gráficos com alternativa tabular e painel redimensionável por teclado.", tests: "Vitest e Testing Library nas regras; Playwright + axe nos fluxos principais.",
  },
  {
    id: "opsflow", num: "02", kind: "Angular · corporativo", read: "7 min", name: "OpsFlow", tagline: "Enterprise Workflow & Approval Console", tags: ["Angular", "Acessibilidade"],
    title: "Como modelei um workflow corporativo com permissões, auditoria e evolução incremental.",
    summary: "Console de workflow com etapas rastreáveis, permissões, histórico e suporte multilíngue.",
    role: "Estados, formulários e RBAC", skills: ["Angular", "RxJS", "RBAC", "i18n"],
    problem: "Operações corporativas precisam criar, revisar e aprovar solicitações com várias etapas, papéis, documentos, prazos e trilha de auditoria. Interfaces frágeis aumentam retrabalho, erros e tempo de decisão.",
    decisions: ["Workflow modelado como máquina de estados", "Matriz de permissões testada por papel", "Migração incremental de legado com adapter"],
    a11y: "Wizard navegável por teclado e leitor de tela; foco vai para o primeiro erro.", tests: "Testes unitários de regras e permissões; E2E com Playwright.",
  },
  {
    id: "fiscotrack", num: "03", kind: "Domínio · testes", read: "5 min", name: "FiscoTrack", tagline: "Investment Tax Calculator & Reporting", tags: ["React", "Dados"],
    title: "Como transformei regras financeiras em um motor de cálculo testável e explicável.",
    summary: "Calculadora educacional de resultados de investimentos com regras versionadas e explicáveis.",
    role: "Modelagem de domínio e testes", skills: ["React", "Funções puras", "Vitest"],
    problem: "Investidores precisam organizar operações, calcular resultados por período e compreender regras aplicadas, sem depender de uma planilha opaca.",
    decisions: ["Motor de cálculo em funções puras, fora da UI", "Regras versionadas por data, com fonte", "Dados locais por padrão; nada enviado à telemetria"],
    a11y: "Gráficos com alternativa textual e erros de importação por linha.", tests: "Casos table-driven: zero operações, custos, prejuízo acumulado, arredondamento.",
  },
  {
    id: "nasckui", num: "04", kind: "Design System", read: "5 min", name: "Nasck UI", tagline: "Accessible Product Interface System", tags: ["React", "Design System"],
    title: "Como transformei padrões recorrentes em um sistema de interface acessível e governável.",
    summary: "Biblioteca de componentes acessíveis usada pelos outros projetos, com tokens, Storybook e governança.",
    role: "Arquitetura de componentes e documentação", skills: ["Design System", "Storybook", "Tokens", "a11y"],
    problem: "Padrões recorrentes eram reimplementados em cada projeto, com estados, foco e acessibilidade inconsistentes.",
    decisions: ["Tokens de cor, tipografia, espaço e movimento exportáveis", "Teclado e acessibilidade documentados por componente", "Visual regression e changelog a cada release"],
    a11y: "Foco visível em fundo claro e escuro; axe em todas as stories.", tests: "Testes de interação, visual regression e CI.",
  },
  {
    id: "myportfolio", num: "05", kind: "Produto · engenharia", read: "4 min", name: "Myportfolio", tagline: "Este portfólio como case de engenharia", tags: ["React", "Acessibilidade"],
    title: "Como reposicionei meu portfólio para transformar experiência em evidência.",
    summary: "React, TypeScript e Vite com rotas por case, métricas de funil e quality gates.",
    role: "Produto, UX e engenharia", skills: ["React", "Vite", "Analytics", "CI"],
    problem: "O portfólio anterior chamava atenção, mas apresentava primeiro os projetos que menos representavam a carreira.",
    decisions: ["Remoção do preloader e orçamento de movimento", "Cases em rotas próprias com metadados", "Eventos de funil sem dados pessoais"],
    a11y: "Skip link, foco visível e respeito a prefers-reduced-motion.", tests: "Lint, typecheck, E2E, axe e Lighthouse CI.",
  },
];

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

const groupColors = ["#1783C1", "#3B6FD4", "#0E8C9E", "#2A74C9", "#12689A", "#0B8575"];

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
  { slug: "nasckdev/nasck-ui", name: "Nasck UI", problem: "Sistema de interface acessível usado pelos outros projetos.", quality: "Storybook · axe · testes de interação", status: "Em construção", dot: "#FEBC2E" },
  { slug: "nasckdev/insighthub", name: "InsightHub", problem: "Workspace de pesquisa com filtros, gráficos e sínteses assistidas.", quality: "Vitest · Playwright + axe · CI", status: "Planejado", dot: "#6CC0EE" },
  { slug: "nasckdev/fiscotrack", name: "FiscoTrack", problem: "Evolução do minersCalculator: cálculo explicável e testável.", quality: "Casos table-driven · CI", status: "Em evolução", dot: "#FEBC2E" },
  { slug: "nasckdev/myportfolio", name: "Myportfolio", problem: "Este portfólio, documentado como case de engenharia.", quality: "Lint · typecheck · E2E · Lighthouse CI", status: "Publicado", dot: "#28C840", href: "https://github.com/NasckDev/Myportfolio" },
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

export const navItems: [id: string, label: string][] = [["habilidades", "Habilidades"], ["cases", "Projetos"], ["experiencia", "Experiência"], ["sobre", "Sobre"], ["contato", "Contato"]];

export const footerLinks: [id: string, label: string][] = [["habilidades", "Habilidades"], ["cases", "Projetos"], ["experiencia", "Experiência"], ["engenharia", "Código aberto"], ["sobre", "Sobre mim"], ["contato", "Contato"]];

export const paletteNav: [id: string, label: string][] = [["habilidades", "Habilidades"], ["cases", "Projetos"], ["experiencia", "Experiência"], ["engenharia", "Código aberto"], ["sobre", "Sobre mim"], ["contato", "Contato"]];

export const sectionIds = ["topo", "habilidades", "cases", "experiencia", "engenharia", "sobre", "contato"];

export const MAIL_SUBJECT = "Oportunidade frontend";
export const MAIL_HREF = `mailto:${EMAIL}?subject=${encodeURIComponent(MAIL_SUBJECT)}`;
