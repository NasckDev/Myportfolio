/**
 * Coverlist e Garrafão: textos conferidos com os relatórios finais dos apps (25/11/2026).
 */
import { demoUrl, nf } from "./site";
import { TEST_COUNTS } from "./testCounts";
import type { DesignStudy, Project, Proof } from "./types";

function testsText(id: "coverlist" | "garrafao", fallback: string): string {
  const c = TEST_COUNTS[id];
  const parts = [c.unit !== null ? `${nf(c.unit)} testes` : null, c.e2e !== null ? `${c.e2e} cenários E2E com Playwright e axe` : null].filter(Boolean);
  return parts.length ? `${parts.join(" e ")}. ${fallback}` : fallback;
}

function proofs(id: "coverlist" | "garrafao", base: readonly Proof[]): Proof[] {
  const c = TEST_COUNTS[id];
  const extra: Proof[] = [];
  if (c.unit !== null) extra.push([nf(c.unit), "testes automatizados"]);
  if (c.e2e !== null) extra.push([String(c.e2e), "testes de ponta a ponta"]);
  return [...base, ...extra].slice(0, 3);
}

function proofLine(id: "coverlist" | "garrafao"): string {
  const c = TEST_COUNTS[id];
  if (c.unit === null) return "Proxy com testes de contrato";
  return `${nf(c.unit)} testes${c.e2e ? ` e ${c.e2e} E2E` : ""}`;
}

export const COVERLIST: Project = {
  id: "coverlist",
  name: "Coverlist",
  kind: "APIs públicas de música",
  tags: ["APIs públicas", "Full stack"],
  color: "#8A1FA8",
  on: "#FFFFFF",
  live: true,
  status: "No ar",
  title: "Uma capa de playlist viva, montada com dados reais de três APIs públicas de música que não conversam entre si.",
  summary:
    "Paradas do Brasil e do mundo, décadas e gêneros com prévias reais de 30 s, playlists próprias salvas no navegador e capa animada pronta para compartilhar.",
  role: "Produto, integração de APIs e front-end",
  stack: ["React 19", "TypeScript", "TanStack Query", "IndexedDB", "Vercel Functions", "Deezer, iTunes e Apple RSS", "Vitest", "Playwright + axe"],
  problem:
    "Montar uma playlist com músicas de verdade exige combinar APIs com formatos, limites e regras diferentes: o RSS da Apple traz as paradas sem áudio, o Deezer não libera CORS e assina as prévias com validade curta, e Spotify e YouTube não liberam faixas sem chave.",
  decisions: [
    "Proxy próprio em uma Vercel Function com lista fechada de operações: o cliente escolhe a operação e o servidor monta a URL, sem SSRF",
    "Deezer, iTunes e Apple RSS normalizados para um único tipo de faixa, com deduplicação entre fontes",
    "Prévia do Deezer resolvida na hora de tocar, porque a URL assinada expira; só o id é guardado",
    "Paradas da Apple completadas por lookup em lote, com nova tentativa em falha temporária, cache em memória e degradação faixa a faixa",
    "Cache na CDN por tipo de dado e, no navegador, TanStack Query com retry e modo offline; playlists no IndexedDB com versão de esquema",
  ],
  a11y: "Reordenar faixas por arrastar ou pelo teclado, atalhos do player, Media Session na tela de bloqueio, contraste AA nos dois temas e animações que respeitam prefers-reduced-motion.",
  tests: testsText("coverlist", "Respostas reais das APIs gravadas para rodar sem rede, e verificação de layout em 8 larguras nos dois temas."),
  counts: proofs("coverlist", [["3", "APIs públicas atrás de um proxy próprio"]]),
  links: [
    ["Acessar a demonstração", demoUrl("coverlist")],
    ["Código-fonte", "https://github.com/NasckDev/coverlist"],
  ],
  pitch: "A capa viva da sua playlist, com músicas de verdade.",
  feats: [
    ["Paradas e coleções reais", "Paradas do Brasil e do mundo, décadas e gêneros, com prévias de 30 s do Deezer e da Apple."],
    ["Minhas playlists", "Crie a partir de uma coleção ou do zero, busque faixas nas duas fontes, reordene e importe playlists do Deezer por link."],
    ["Capa viva", "Vinil animado na cor do selo, três modelos de capa e player com fila e atalhos de teclado."],
    ["Compartilhar", "Imagem em story ou quadrado e um link que reabre a playlist em outro navegador."],
  ],
  proofLine: proofLine("coverlist"),
};

export const GARRAFAO: Project = {
  id: "garrafao",
  name: "Garrafão",
  kind: "APIs públicas de basquete",
  tags: ["APIs públicas", "Dados", "Full stack"],
  color: "#C8102E",
  on: "#FFFFFF",
  live: true,
  status: "No ar",
  title: "Um painel de NBA que organiza dados públicos da ESPN, sem contrato, em um app que se atualiza sozinho.",
  summary:
    "Jogadores com o tema do time, favoritos, placares ao vivo, classificação, Draft, All-Star e Copa NBA e notícias, a partir dos dados públicos da ESPN.",
  role: "Produto, integração de APIs e front-end",
  stack: ["React 19", "TypeScript", "TanStack Query", "Vercel Functions", "Dados públicos da ESPN", "Vitest", "MSW", "Playwright + axe"],
  problem:
    "Os dados da ESPN são públicos, mas não têm contrato: três hosts diferentes, nomes de campo que mudam, datas em UTC num dia de rodada de Nova York e textos em inglês. Para virar um painel útil, precisam ser buscados com segurança, normalizados e organizados por objetivo.",
  decisions: [
    "Proxy próprio em uma Vercel Function com lista fechada de 13 operações, cada parâmetro validado e a URL de origem montada no servidor, sem SSRF",
    "Cache na CDN por tipo de dado: 15 s para jogo ao vivo, minutos para classificação, horas para perfil e calendário",
    "Respostas normalizadas para tipos próprios (jogo, time, atleta, evento), com rótulos traduzidos e horários em Brasília",
    "Placar atualizado sozinho só com jogo ao vivo e a aba visível; datas de eventos só quando a fonte publica, nunca estimadas",
    "Instantâneo offline real e datado para quando a fonte cai, e normalizadores testados com 80 respostas gravadas, incluindo um jogo ao vivo",
  ],
  a11y: "Placar e status nunca só por cor, painel do jogo com foco preso e Esc, tabela que rola na própria caixa no celular e contraste AA sobre as cores dos 30 times.",
  tests: testsText("garrafao", "O handler roda no MSW nos testes de componente, e uma varredura confere o layout de 320 a 1920 px."),
  counts: proofs("garrafao", [["13", "operações no proxy, todas com cache próprio"]]),
  links: [
    ["Acessar a demonstração", demoUrl("garrafao")],
    ["Código-fonte", "https://github.com/NasckDev/garrafao"],
  ],
  pitch: "A NBA ao vivo, com as cores do seu time.",
  feats: [
    ["Jogadores com o tema do time", "Cada atleta recolore a página com as cores do seu time, com raio-x, comparação e ranking."],
    ["Favoritos", "Jogadores favoritos e times seguidos, que aparecem primeiro nas listas e nos placares."],
    ["Placares ao vivo", "Jogos do dia com parciais por quarto, horários em Brasília e a classificação das conferências."],
    ["Eventos e notícias", "Draft, All-Star e Copa NBA a partir das fontes oficiais, e as manchetes da ESPN."],
  ],
  proofLine: proofLine("garrafao"),
};

/** Entradas da página Design para os dois produtos novos. */
export const NEW_DESIGNS: readonly DesignStudy[] = [
  {
    id: "coverlist",
    name: "Coverlist",
    kind: "Editor de capa de playlist",
    image: "/assets/design/coverlist.webp",
    alt: "Tela do Coverlist: lista de faixas, um disco de vinil e o título da playlist em letras grandes",
    text: "Transforma uma playlist em capa: a lista de faixas ganha um vinil animado na cor do selo, um player e uma imagem pronta para compartilhar em formato de story ou quadrado.",
    tools: ["Editor ao vivo", "Animação", "Exportação de imagem", "APIs públicas"],
    live: demoUrl("coverlist"),
    caseId: "coverlist",
  },
  {
    id: "garrafao",
    name: "Garrafão",
    kind: "Painel de jogadores de basquete",
    image: "/assets/design/garrafao.webp",
    alt: "Tela do Garrafão: cartão de um jogador com o número da camisa em destaque e suas médias por jogo",
    text: "Painel de jogadores em que cada atleta recolore a página com as cores do seu time. Inclui busca, filtro por posição, placares, classificação e atalhos de teclado.",
    tools: ["Tema dinâmico", "Visualização de dados", "Atalhos de teclado", "APIs públicas"],
    live: demoUrl("garrafao"),
    caseId: "garrafao",
  },
];
