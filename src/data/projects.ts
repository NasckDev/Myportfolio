import { COVERLIST, GARRAFAO } from "./newProjects";
import { demoUrl, nf, SITE_URL } from "./site";
import { TEST_COUNTS } from "./testCounts";
import type { Project, Tag } from "./types";

const J = TEST_COUNTS.juntos;
const IH = TEST_COUNTS.insighthub;
const OF = TEST_COUNTS.opsflow;
const FT = TEST_COUNTS.fiscotrack;
const NU = TEST_COUNTS.nasckui;

const JUNTOS: Project = {
  id: "juntos",
  name: "Juntos",
  kind: "Produto full stack",
  tags: ["React", "Dados", "Full stack"],
  color: "#4B3FE4",
  on: "#FFFFFF",
  live: true,
  status: "No ar",
  title: "A planilha financeira de um casal transformada em produto mobile-first, com lançamentos automáticos e divisão de despesas.",
  summary: "Finanças domésticas para uma ou duas pessoas: lançamentos recorrentes, divisão de despesas, orçamento, metas e integração com Excel.",
  role: "Produto, UX e arquitetura",
  stack: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS v4", "Drizzle ORM", "PostgreSQL (Neon)", "Better Auth", "ExcelJS", "Web Push", "Vitest", "Playwright + axe"],
  problem:
    "Um casal controlava o ano numa planilha com uma aba por mês: redigitava toda conta fixa, não sabia quanto ia sobrar no meio do mês, dividia as contas de cabeça e quase não conseguia usar no celular.",
  decisions: [
    "Protótipo completo como fonte da verdade de UX e regras, e o app full stack reconstruído em camadas, com o núcleo testado antes da interface",
    "Dinheiro em centavos inteiros e lançamento mensal idempotente das contas fixas",
    "Repositório público sem dados reais: varredura de privacidade no CI e no build, CSP restrita e segredos só em variáveis de ambiente",
  ],
  a11y: "Barra inferior e alvos de 44 px no celular, validação embaixo de cada campo, atalhos de teclado, 4 tamanhos de letra e gráficos com a frase completa para leitor de tela.",
  tests: `${J.coreUnit} testes do núcleo de regras (${J.coreCoverage} das linhas) e ${J.appUnit} do app, com o servidor em PGlite na memória, mais ${J.e2e} cenários de ponta a ponta com Playwright e axe no celular (390 px) e no computador (1440 px).`,
  counts: [
    [nf(J.unit), "testes no núcleo e no app"],
    [String(J.e2e), "cenários de ponta a ponta"],
    [J.coreCoverage, "das linhas do núcleo cobertas"],
  ],
  links: [
    ["Acessar o app", "https://juntos-phi.vercel.app"],
    ["Código-fonte", "https://github.com/NasckDev/juntos"],
  ],
  pitch: "Gestão financeira da casa em um só lugar.",
  feats: [
    ["Lançamentos recorrentes automáticos", "Contas fixas, anuais e parcelas são lançadas todo mês, sem redigitação."],
    ["Divisão de despesas", "Em partes iguais, proporcional à renda ou personalizada, com o acerto calculado entre as pessoas."],
    ["Previsão de saldo", "Saldo previsto do mês, orçamento por categoria, metas e projeção de seis meses."],
    ["Integração com Excel", "Importa planilhas do Excel e exporta no mesmo modelo, em PDF e CSV."],
  ],
  proofLine: `${nf(J.unit)} testes e ${J.e2e} E2E`,
};

const INSIGHTHUB: Project = {
  id: "insighthub",
  name: "InsightHub",
  kind: "React e dados",
  tags: ["React", "Dados"],
  color: "#0E6B5C",
  on: "#FFFFFF",
  live: true,
  status: "No ar",
  title: "Um workspace de insights para reduzir a distância entre dados e decisão.",
  summary: "Workspace para explorar pesquisas, comparar segmentos e gerar sínteses assistidas por IA com rastreabilidade.",
  role: "Concepção, arquitetura e front-end",
  stack: ["React", "TypeScript", "Ant Design", "ECharts", "TanStack Query", "Storybook", "Playwright + axe"],
  problem:
    "Times de pesquisa e produto precisam transformar respostas, segmentos e indicadores em insights acionáveis. A experiência costuma ser fragmentada entre filtros complexos, tabelas, gráficos, comentários e geração de sínteses.",
  decisions: [
    "Filtros persistidos na URL para visões compartilháveis",
    "TanStack Query para estado de servidor, cache e invalidação",
    "IA com cancelamento, nova tentativa e indicação da fonte usada",
  ],
  a11y: "Diálogos em portal com foco preso e Esc por camada, gráficos com tabela equivalente, alvos de 44 px no toque e axe sem violações nos dois temas.",
  tests: `${IH.unit} testes no core, na API e na interface, ${IH.e2e} E2E com Playwright e axe e ${IH.stories} stories no Storybook.`,
  counts: [
    [nf(IH.unit), "testes no core, na API e na interface"],
    [String(IH.e2e), "testes de ponta a ponta"],
    [String(IH.stories), "stories no Storybook"],
  ],
  links: [
    ["Acessar a demonstração", demoUrl("insighthub")],
    ["Código-fonte", "https://github.com/NasckDev/insighthub"],
  ],
  pitch: "Da pesquisa à decisão.",
  feats: [
    ["Síntese com IA e fontes clicáveis", "Toda afirmação aponta para a resposta de onde saiu."],
    ["Comparação de segmentos", "Barras divergentes contra o NPS geral e aviso de amostra pequena."],
    ["Mapa de temas com sentimento", "Cada tema dá acesso às respostas que o citaram."],
    ["Quadro de insights", "Decisões registradas, exportáveis e compartilháveis por link."],
  ],
  proofLine: `${nf(IH.unit)} testes e ${IH.e2e} E2E`,
};

const OPSFLOW: Project = {
  id: "opsflow",
  name: "OpsFlow",
  kind: "Angular corporativo",
  tags: ["Angular", "Dados"],
  color: "#1D54DB",
  on: "#FFFFFF",
  live: true,
  status: "No ar",
  title: "Um workflow corporativo com permissões, auditoria e evolução incremental.",
  summary: "Console de aprovações com caixa de entrada por papel, quadro kanban, aprovação em lote, análises e auditoria.",
  role: "Estados, formulários e RBAC",
  stack: ["Angular 22", "Signals", "TypeScript", "NG-ZORRO", "ECharts", "Storybook", "Playwright + axe"],
  problem:
    "Operações corporativas precisam criar, revisar e aprovar solicitações com várias etapas, papéis, documentos, prazos e trilha de auditoria. Interfaces frágeis aumentam retrabalho, erros e tempo de decisão.",
  decisions: [
    "Workflow modelado como máquina de estados, validada também na API simulada (403, 409, 422)",
    "Concorrência otimista e janela de desfazer de 6 s nas decisões",
    "Matriz de permissões testada por papel, com segregação de funções",
  ],
  a11y: "Atalhos j/k/a/r com foco real, quadro com alternativa ao arrastar e axe sem violações em 7 telas nos dois temas.",
  tests: `${OF.unit} testes unitários, ${OF.e2e} E2E com Playwright e axe (360 e 1440 px, dois temas) e ${OF.stories} stories no Storybook Angular.`,
  counts: [
    [nf(OF.unit), "testes unitários"],
    [String(OF.e2e), "testes de ponta a ponta"],
    [String(OF.stories), "stories no Storybook"],
  ],
  links: [
    ["Acessar a demonstração", demoUrl("opsflow")],
    ["Código-fonte", "https://github.com/NasckDev/opsflow"],
  ],
  pitch: "Aprovações corporativas com controle e rastreabilidade.",
  feats: [
    ["Caixa de entrada por perfil", "Cada perfil acessa as próprias pendências, com o prazo (SLA) em contagem regressiva."],
    ["Aprovação em lote", "Decisões em lote com acompanhamento de progresso, justificativa dos itens ignorados e opção de desfazer."],
    ["Kanban com regras de fluxo", "Movimentações não permitidas pelo fluxo ou pelo perfil são bloqueadas, com o motivo indicado."],
    ["Auditoria completa", "Cadeia de aprovação, comentários e linha do tempo em cada solicitação."],
  ],
  proofLine: `${nf(OF.unit)} testes e ${OF.e2e} E2E`,
};

const FISCOTRACK: Project = {
  id: "fiscotrack",
  name: "FiscoTrack",
  kind: "Domínio e testes",
  tags: ["React", "Dados"],
  color: "#0D3A2A",
  on: "#FFFFFF",
  live: true,
  status: "No ar",
  title: "Regras financeiras em um motor de cálculo testável e explicável.",
  summary: "IR de renda variável com transparência: carteira, apuração mensal, DARFs com vencimento e cada valor explicado com a fonte legal.",
  role: "Modelagem de domínio e testes",
  stack: ["React", "TypeScript", "Ant Design", "ECharts", "IndexedDB", "Vitest", "Playwright + axe"],
  problem:
    "Investidores precisam organizar operações, calcular resultados por período e compreender as regras aplicadas, sem depender de uma planilha opaca.",
  decisions: [
    "Motor de cálculo em funções puras, fora da UI, com ordem determinística das operações do mesmo dia",
    "Regras versionadas por data, com fonte legal em cada passo do cálculo",
    "Dados só no navegador (IndexedDB), com backup, desfazer e sincronização entre abas",
  ],
  a11y: "Tema do Ant Design com contraste AA calculado nos dois temas, gráficos com tabela equivalente e axe sem violações em 360 e 1440 px.",
  tests: `${FT.engineUnit} testes do motor e ${FT.uiUnit} de interface, E2E com Playwright e axe, e cerca de ${FT.wrappers} wrappers com stories no Storybook.`,
  counts: [
    [nf(FT.unit), "testes automatizados"],
    [String(FT.engineUnit), "só no motor de cálculo"],
    [String(FT.wrappers), "wrappers com stories"],
  ],
  links: [
    ["Acessar a demonstração", demoUrl("fiscotrack")],
    ["Código-fonte", "https://github.com/NasckDev/fiscotrack"],
  ],
  pitch: "Imposto de renda variável com cálculo transparente.",
  feats: [
    ["DARF mensal com prazo", "Valor a pagar e dias restantes até o vencimento."],
    ["Cálculo explicado", "Cada valor detalhado passo a passo, com a fonte legal correspondente."],
    ["Importação de CSV", "Mapeamento de colunas, pré-visualização e erros indicados por linha."],
    ["Privacidade por padrão", "Os dados ficam no navegador do usuário, com backup e desfazer."],
  ],
  proofLine: `${nf(FT.unit)} testes`,
};

const NASCKUI: Project = {
  id: "nasckui",
  name: "Nasck UI",
  kind: "Design System",
  tags: ["React", "Angular", "Design System"],
  color: "#F0501C",
  on: "#160700",
  live: true,
  status: "No ar",
  title: "Padrões recorrentes em um sistema de interface acessível e governável.",
  summary: "Camada de componentes sobre Ant Design e NG-ZORRO, com a mesma API em React e Angular, tema central e Storybook.",
  role: "Arquitetura de componentes e documentação",
  stack: ["React 19", "Angular 22", "TypeScript", "Ant Design", "NG-ZORRO", "Storybook", "Tokens"],
  problem: "Padrões recorrentes eram reimplementados em cada projeto, com estados, foco e acessibilidade inconsistentes.",
  decisions: [
    "Tokens de cor, tipografia, espaço e movimento exportáveis",
    "Teclado e acessibilidade documentados por componente",
    "Contrato único de props: um teste lê os dois pacotes e falha se React e Angular divergirem",
  ],
  a11y: "Contraste AA verificado por preset de tema e axe sem violações em todas as stories dos dois Storybooks, nos temas claro e escuro.",
  tests: `Testes de tokens, dos wrappers React e Angular e ${NU.contract} de contrato, mais E2E com Playwright e axe nas ${NU.stories} stories.`,
  counts: [
    [String(NU.components), "componentes com a mesma API nos dois frameworks"],
    [String(NU.stories), "stories verificadas com axe"],
    [String(NU.contract), "testes de contrato"],
  ],
  links: [
    ["Acessar a demonstração", demoUrl("nasck-ui")],
    ["Código-fonte", "https://github.com/NasckDev/nasck-ui"],
  ],
  pitch: "Uma única API de componentes para React e Angular.",
  feats: [
    [`${NU.components} componentes nos dois frameworks`, "Mesmos nomes e mesmas props em React e em Angular."],
    ["Tema central", "Cores, raios e fontes saem de tokens, com contraste AA verificado."],
    ["Storybook com todos os estados", `${NU.stories} stories, todas sem violações no axe.`],
    ["Biblioteca de base substituível", "As telas não dependem diretamente do Ant Design."],
  ],
  proofLine: `${NU.contract} testes de contrato`,
};

/** "Este portfólio": textos reescritos conforme o que esta versão realmente implementa. */
const PORTFOLIO: Project = {
  id: "portfolio",
  name: "Este portfólio",
  kind: "Produto e engenharia",
  tags: ["React", "Full stack"],
  color: "var(--accent)",
  on: "var(--on-accent)",
  live: true,
  status: "No ar",
  title: "O portfólio tratado como produto: legível por pessoas, robôs e IAs.",
  summary:
    "React 19, TypeScript e Vite, com uma página pré-renderizada por rota, transições entre páginas e aparência ajustável por design tokens.",
  role: "Produto, UX e engenharia",
  stack: ["React 19", "TypeScript", "Vite", "CSS com design tokens", "View Transitions API", "Vercel Functions", "Redis", "Vitest", "Playwright + axe"],
  problem:
    "O portfólio anterior chamava atenção, mas apresentava primeiro os projetos que menos representavam a carreira, e robôs, IAs e prévias de link viam uma página quase vazia.",
  decisions: [
    "Uma página HTML pré-renderizada por rota, com título, descrição, canonical e prévia de link próprios, mais robots.txt, sitemap e llms.txt",
    "Roteador próprio sobre a History API, com View Transitions, rolagem restaurada, foco no conteúdo e código dividido por rota",
    "Aparência construída sobre design tokens: tema, cor de destaque, cantos e movimento mudam em um só lugar e ficam salvos no navegador",
    "Mídia dos projetos lida de uma convenção de pastas, com prévia em vídeo só para quem usa mouse e não pediu menos movimento",
    "Visitas contadas em Vercel Functions com Redis, com o visitante identificado por hash anônimo",
  ],
  a11y: "Skip link, foco visível, alvos de 44 px, diálogos com foco preso e Esc, contraste AA em todas as cores de destaque e respeito a prefers-reduced-motion.",
  tests:
    "ESLint com jsx-a11y, testes de componente com Vitest e Testing Library, teste do pré-render, testes das Functions e E2E com Playwright e axe em 390 e 1440 px, nos temas claro e escuro.",
  counts: null,
  links: [["Código-fonte", "https://github.com/NasckDev/Myportfolio"]],
  pitch: "Um portfólio construído como produto.",
  feats: [
    ["Legível para pessoas, buscadores e IAs", "Uma página pré-renderizada por rota, sitemap e llms.txt."],
    ["Navegação de app", "Rotas reais, transições entre páginas, busca com Ctrl K e prévia em vídeo dos projetos."],
    ["Aparência por design tokens", "Tema, cor de destaque, cantos e movimento ajustáveis e salvos no navegador."],
  ],
  proofLine: "Pré-renderizado, com testes e CI",
};

/** Ordem de exibição: Juntos em destaque, os apps, os dois produtos de APIs públicas e o portfólio por último. */
export const PROJECTS: readonly Project[] = [JUNTOS, INSIGHTHUB, OPSFLOW, FISCOTRACK, NASCKUI, COVERLIST, GARRAFAO, PORTFOLIO];

/** Produtos publicados (todos menos o próprio portfólio). */
export const PRODUCTS = PROJECTS.filter((p) => p.id !== "portfolio");
/** Carrossel "Outros produtos" do Início: todos os produtos menos o Juntos, que tem destaque próprio. */
export const SPOT_IDS = PRODUCTS.filter((p) => p.id !== "juntos").map((p) => p.id);

export const FILTERS: readonly ("Todos" | Tag)[] = ["Todos", "React", "Angular", "Dados", "Design System", "APIs públicas", "Full stack"];

export function getProject(id: string): Project | undefined {
  return PROJECTS.find((p) => p.id === id);
}

export function projectPath(id: string): string {
  return `/projeto/${id}`;
}

export function filterProjects(filter: string): readonly Project[] {
  return filter === "Todos" ? PROJECTS : PROJECTS.filter((p) => (p.tags as readonly string[]).includes(filter));
}

export const PRODUCTS_URL = `${SITE_URL}/projetos`;
