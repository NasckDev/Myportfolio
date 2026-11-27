/**
 * Geração do HTML pré-renderizado (uma página por rota), sitemap, robots.txt e llms.txt.
 * Funções puras, testadas em scripts/seo.test.ts; o prerender.ts só lê e grava arquivos.
 * Todo texto vem de src/data (a mesma fonte do site).
 */
import { DESIGNS, EDU, GAME, JOBS, PRODUCT_WORD, REPOS, SKILLS } from "../src/data/content.ts";
import { PROJECTS, getProject } from "../src/data/projects.ts";
import { allRoutes, metaFor, NAV, type Route } from "../src/data/routes.ts";
import { EMAIL, FACTS, LINKS, MODES, PERSON, SITE_URL } from "../src/data/site.ts";
import { SNIPPETS } from "../src/data/snippets.ts";

export const DEFAULT_OG = "/og-image.jpg";

const esc = (s: string): string => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const list = (items: readonly string[]): string => `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;
const a = (href: string, text: string) => `<a href="${esc(href)}">${esc(text)}</a>`;
const abs = (path: string) => (/^https?:/.test(path) ? path : SITE_URL + (path === "/" ? "/" : path));

/** Navegação em texto, igual em todas as páginas. */
function navHtml(): string {
  return `<nav aria-label="Páginas"><ul>${NAV.map((n) => `<li>${a(n.path, n.label)}</li>`).join("")}</ul></nav>`;
}

function projectSummaryHtml(): string {
  return PROJECTS.map(
    (p) => `<li>${a(`/projeto/${p.id}`, p.name)} (${esc(p.kind)}): ${esc(p.pitch)} ${esc(p.summary)}</li>`,
  ).join("");
}

function caseHtml(id: string): string {
  const p = getProject(id)!;
  return [
    `<h1>${esc(p.name)}</h1><p><strong>${esc(p.title)}</strong></p><p>${esc(p.summary)}</p>`,
    `<p>Status: ${esc(p.status)}. Atuação: ${esc(p.role)}.</p>`,
    `<p>${p.links.map(([l, u]) => a(u, l)).join(" · ")}</p>`,
    `<h2>${esc(p.pitch)}</h2>${list(p.feats.map(([t, d]) => `${t}: ${d}`))}`,
    `<h2>O problema</h2><p>${esc(p.problem)}</p><p>Tecnologias: ${esc(p.stack.join(", "))}.</p>`,
    `<h2>Decisões de engenharia</h2>${list(p.decisions)}`,
    p.counts ? `<h2>Provas</h2>${list(p.counts.map(([n, l]) => `${n} ${l}`))}` : "",
    `<h2>Acessibilidade</h2><p>${esc(p.a11y)}</p><h2>Testes</h2><p>${esc(p.tests)}</p>`,
  ].join("");
}

function pageHtml(route: Route): string {
  switch (route.name) {
    case "inicio":
      return [
        `<h1>${esc(PERSON.name)}</h1><p><strong>Engenheiro de software. Produtos web completos, da interface ao banco de dados.</strong></p>`,
        `<p>Seis anos entregando software em produção: front-end com React e TypeScript, back-end com Node.js e NestJS e experiência com C#. ${PRODUCT_WORD} produtos autorais publicados, com código aberto e demonstração ao vivo.</p>`,
        `<p>${a(`mailto:${EMAIL}`, EMAIL)} · ${a(LINKS.linkedin, "LinkedIn")} · ${a(LINKS.github, "GitHub")} · ${a(LINKS.cv, "Currículo (PDF)")}</p>`,
        `<h2>Experiência</h2>${list(JOBS.slice(0, 3).map((j) => `${j.when} · ${j.company} · ${j.role}`))}`,
        `<h2>Produtos</h2><ul>${projectSummaryHtml()}</ul>`,
        `<h2>Design</h2>${list(DESIGNS.map((d) => `${d.name}: ${d.kind}`))}`,
        `<h2>Jogo</h2><p>${esc(GAME.lead)}</p>`,
      ].join("");
    case "projetos":
      return `<h1>Projetos</h1><p>${PRODUCT_WORD} produtos publicados e este portfólio. Cada um tem demonstração, estudo de caso e código-fonte.</p><ul>${projectSummaryHtml()}</ul>`;
    case "projeto":
      return caseHtml(route.projectId);
    case "design":
      return `<h1>Design</h1>${DESIGNS.map((d) => `<h2>${esc(d.name)}</h2><p>${esc(d.kind)}. ${esc(d.text)}</p><p>${a(d.live, "Ver ao vivo")}${d.code ? ` · ${a(d.code, "Código-fonte")}` : ""}</p>`).join("")}`;
    case "codigo":
      return `<h1>Código</h1>${SNIPPETS.map((s) => `<h2>${esc(s.title)}</h2><p>${esc(s.why)}</p><p>${a(s.url, `${s.repoName}/${s.file}`)}</p>`).join("")}<h2>Repositórios</h2>${list(REPOS.map(([n, d, q, u]) => `${n}: ${d} (${q}) ${u}`))}`;
    case "jogo":
      return `<h1>${esc(GAME.name)}</h1><p>${esc(GAME.lead)}</p>${list(GAME.feats.map(([t, d]) => `${t}: ${d}`))}<p>${a(LINKS.vespera, "Site do jogo")} · ${a(LINKS.vesperaReleases, "Baixar o jogo")} · ${a(LINKS.vesperaRepo, "Código")}</p>`;
    case "habilidades":
      return `<h1>Habilidades</h1>${SKILLS.map(([g, items]) => `<h2>${esc(g)}</h2><p>${esc(items.map(([s]) => s).join(", "))}</p>`).join("")}`;
    case "experiencia":
      return `<h1>Experiência</h1>${JOBS.map((j) => `<h2>${esc(j.company)}</h2><p>${esc(j.when)} · ${esc(j.role)}</p><p>${esc(j.detail.context)}</p>${list(j.detail.did)}${j.detail.ai ? list(j.detail.ai) : ""}<p>${esc(j.detail.stack.join(", "))}</p>`).join("")}<h2>Formação e certificações</h2>${list(EDU.map(([x, y]) => `${x}: ${y}`))}`;
    case "contato":
      return `<h1>Contato</h1>${list(FACTS.map(([x, y]) => `${x}: ${y}`))}<p>${a(`mailto:${EMAIL}`, EMAIL)} · ${a(LINKS.linkedin, "LinkedIn")} · ${a(LINKS.github, "GitHub")}</p><h2>Modelos de trabalho</h2>${list(MODES)}`;
    default:
      return `<h1>Página não encontrada</h1><p>${a("/", "Ir para o início")} · ${a("/projetos", "Ver projetos")}</p>`;
  }
}

/** HTML em texto que fica no #root até o React montar (e aparece para quem está sem JavaScript). */
export function snapshotHtml(route: Route): string {
  return `<div class="static-snapshot">${navHtml()}<main>${pageHtml(route)}</main><footer><p>${esc(PERSON.fullName)}, ${esc(PERSON.city)}</p></footer></div>`;
}

export interface PageOptions {
  /** Prefixo do deploy (ex.: "/Myportfolio"); vazio na Vercel. */
  base: string;
  /** Caminho público da imagem de prévia de cada estudo de caso, quando existir og.jpg. */
  caseOg: Record<string, string | null>;
  /** Fonte principal para pré-carregar (caminho já com o hash do build). */
  fontPreload?: string;
}

export function ogImageFor(route: Route, caseOg: PageOptions["caseOg"]): string {
  if (route.name === "projeto") return caseOg[route.projectId] ?? DEFAULT_OG;
  return DEFAULT_OG;
}

export function personJsonLd(): string {
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: PERSON.name,
    alternateName: PERSON.fullName,
    jobTitle: PERSON.role,
    url: `${SITE_URL}/`,
    email: `mailto:${EMAIL}`,
    image: `${SITE_URL}/assets/retrato.webp`,
    address: { "@type": "PostalAddress", addressLocality: PERSON.city, addressRegion: PERSON.region, addressCountry: "BR" },
    sameAs: [LINKS.linkedin, LINKS.github],
  };
  return JSON.stringify(person).replace(/</g, "\\u003c");
}

const SNAPSHOT_CSS =
  ".static-snapshot{max-width:760px;margin:0 auto;padding:48px 16px;font:16px/1.6 system-ui,sans-serif;color:#0F1114;background:#F6F6F2;animation:ss-show 0s 2.5s both}.static-snapshot h1{font-size:34px;line-height:1.2}.static-snapshot h2{font-size:22px;margin-top:28px}.static-snapshot ul{padding-left:20px;list-style:disc}.static-snapshot nav ul{list-style:none;padding:0;display:flex;flex-wrap:wrap;gap:12px}.static-snapshot a{color:inherit}@keyframes ss-show{from{visibility:hidden}to{visibility:visible}}";

/** Monta o HTML de uma rota a partir do index.html gerado pelo Vite. */
export function buildPage(template: string, route: Route, opts: PageOptions): string {
  if (!template.includes('<div id="root"></div>')) throw new Error('prerender: <div id="root"></div> não encontrado no template');
  const m = metaFor(route);
  const url = route.name === "nao-encontrada" ? `${SITE_URL}/404` : abs(m.path);
  const image = SITE_URL + ogImageFor(route, opts.caseOg);
  const isCase = route.name === "projeto";
  const head = [
    `<meta property="og:type" content="${isCase ? "article" : "website"}" />`,
    `<meta property="og:site_name" content="${esc(PERSON.shortName)}" />`,
    `<meta property="og:locale" content="pt_BR" />`,
    `<meta property="og:title" content="${esc(m.title)}" />`,
    `<meta property="og:description" content="${esc(m.description)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:image" content="${esc(image)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(m.title)}" />`,
    `<meta name="twitter:description" content="${esc(m.description)}" />`,
    `<meta name="twitter:image" content="${esc(image)}" />`,
    route.name === "nao-encontrada" ? `<meta name="robots" content="noindex" />` : "",
    `<link rel="alternate" type="text/plain" href="${SITE_URL}/llms.txt" title="Resumo para IAs" />`,
    opts.fontPreload ? `<link rel="preload" href="${esc(opts.fontPreload)}" as="font" type="font/woff2" crossorigin />` : "",
    route.name === "inicio" ? `<link rel="preload" href="${opts.base}/assets/retrato-recorte.webp" as="image" type="image/webp" fetchpriority="high" />` : "",
    `<script type="application/ld+json">${personJsonLd()}</script>`,
    `<style>${SNAPSHOT_CSS}</style>`,
  ]
    .filter(Boolean)
    .join("\n    ");
  return template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(m.title)}</title>`)
    .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${esc(m.description)}" />`)
    .replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${esc(url)}" />`)
    .replace("</head>", `    ${head}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${snapshotHtml(route)}</div>`);
}

/** Arquivo de saída de uma rota, relativo a dist/. */
export function outputFile(route: Route): string {
  if (route.name === "nao-encontrada") return "404.html";
  const p = metaFor(route).path;
  return p === "/" ? "index.html" : `${p.slice(1)}/index.html`;
}

export function sitemapXml(today: string): string {
  const urls = allRoutes().map((r) => abs(metaFor(r).path));
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join("\n") +
    `\n</urlset>\n`
  );
}

export const robotsTxt = (): string => `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;

export function llmsTxt(): string {
  return [
    `# ${PERSON.name}`,
    "",
    `> ${PERSON.role} em ${PERSON.city}. Front-end com React e TypeScript, back-end com Node.js e NestJS. ${PRODUCT_WORD} produtos publicados, com código aberto e demonstração ao vivo.`,
    "",
    `- Site: ${SITE_URL}/`,
    `- E-mail: ${EMAIL}`,
    `- LinkedIn: ${LINKS.linkedin}`,
    `- GitHub: ${LINKS.github}`,
    `- Currículo (PDF): ${LINKS.cv}`,
    `- Currículo ATS (PDF): ${LINKS.cvAts}`,
    "",
    "## Experiência",
    ...JOBS.map((j) => `- ${j.when} · ${j.company} · ${j.role}`),
    "",
    "## Projetos",
    ...PROJECTS.map((p) => `- [${p.name}](${SITE_URL}/projeto/${p.id}): ${p.pitch} ${p.summary} Tecnologias: ${p.stack.join(", ")}.${p.links[0] ? ` ${p.links[0][0]}: ${p.links[0][1]}` : ""}`),
    "",
    "## Design",
    ...DESIGNS.map((d) => `- ${d.name} (${d.kind}): ${d.text} Ao vivo: ${d.live}`),
    "",
    `## Jogo: ${GAME.name}`,
    GAME.lead,
    `- Site do jogo: ${LINKS.vespera}`,
    `- Código: ${LINKS.vesperaRepo}`,
    "",
    "## Habilidades",
    ...SKILLS.map(([g, items]) => `- ${g}: ${items.map(([s]) => s).join(", ")}`),
    "",
    "## Formação",
    ...EDU.map(([x, y]) => `- ${x}: ${y}`),
    "",
  ].join("\n");
}

export { allRoutes };
