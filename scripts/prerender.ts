/// <reference types="vite/client" />
/**
 * Roda depois do `vite build`. O site é montado por JavaScript, então robôs e IAs que não executam JS
 * (ChatGPT, Claude, prévias de LinkedIn/WhatsApp, curl) veriam a página vazia. Este script:
 *  - coloca uma versão em texto do conteúdo dentro de <div id="root"> (o React a substitui ao carregar);
 *  - adiciona canonical, Open Graph com imagem e JSON-LD de pessoa;
 *  - gera robots.txt, sitemap.xml e llms.txt.
 * Todo o texto vem de src/data/portfolio.ts, a mesma fonte do site.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  cases,
  CV_ATS_URL,
  CV_FULL_URL,
  EMAIL,
  GITHUB_URL,
  jobs,
  LINKEDIN_URL,
  profile,
  repos,
  SITE_URL,
  skillGroups,
  WEB_DESIGN_REPO_URL,
  webDesigns,
} from "../src/data/portfolio.ts";

const DIST = resolve(import.meta.dirname, "../dist");
const OG_IMAGE = `${SITE_URL}/og-image.jpg`;

/** Caminhos do portfólio ("/web-design/...") viram endereços absolutos no domínio oficial. */
const abs = (path: string): string => (/^https?:/.test(path) ? path : SITE_URL + "/" + path.replace(/^\/+/, ""));

const esc = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const list = (items: string[]): string => `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;

function snapshotHtml(): string {
  const parts = [
    `<header><h1>${esc(profile.name)}</h1><p><strong>${esc(profile.role)}</strong></p><p>${esc(profile.intro)}</p>`,
    `<p><a href="mailto:${EMAIL}">${EMAIL}</a> · <a href="${LINKEDIN_URL}">LinkedIn</a> · <a href="${GITHUB_URL}">GitHub</a> · <a href="${abs(CV_FULL_URL)}">Currículo (PDF)</a></p></header>`,
    `<section><h2>Projetos</h2><p>Estudos de caso com dados fictícios, para não expor informações de empregadores.</p>`,
    ...cases.map(
      (c) =>
        `<article><h3>${esc(c.name)} · ${esc(c.tagline)}</h3><p>${esc(c.summary)}</p><p>${esc(c.problem)}</p>` +
        `<p>Papel: ${esc(c.role)}. Tecnologias: ${esc(c.skills.join(", "))}.</p>${list(c.decisions)}` +
        `<p>Acessibilidade: ${esc(c.a11y)} Testes: ${esc(c.tests)}</p></article>`,
    ),
    `</section><section id="web-design"><h2>Web design</h2><p>Estudos visuais publicados como páginas reais. Código aberto em <a href="${WEB_DESIGN_REPO_URL}">${WEB_DESIGN_REPO_URL}</a>.</p>`,
    ...webDesigns.map(
      (w) =>
        `<article><h3>${esc(w.name)} · ${esc(w.kind)}</h3><p>${esc(w.summary)}</p>` +
        `<p><a href="${abs(w.url)}">Ver ao vivo</a>${w.repo ? ` · <a href="${w.repo}">Código</a>` : ""}</p></article>`,
    ),
    `</section><section><h2>Experiência</h2>`,
    ...jobs.map(
      (j) => `<article><h3>${esc(j.company)} · ${esc(j.role)}</h3><p>${esc(j.period)}. ${esc(j.context)}</p>${list(j.items)}</article>`,
    ),
    `</section><section><h2>Habilidades</h2>`,
    ...skillGroups.map((g) => `<h3>${esc(g.title)}</h3><p>${esc(g.items.map((i) => i.name).join(", "))}</p>`),
    `</section><section><h2>Código aberto</h2>`,
    list(repos.map((r) => `${r.name} (${r.status}): ${r.problem}${r.href ? ` ${r.href}` : ""}`)),
    `</section><section><h2>Sobre mim</h2><p><strong>${esc(profile.aboutTitle)}</strong></p>`,
    ...profile.about.map((p) => `<p>${esc(p)}</p>`),
    `</section>`,
  ];
  return `<div class="static-snapshot">${parts.join("")}</div>`;
}

function llmsTxt(): string {
  const lines = [
    `# ${profile.name}`,
    "",
    `> ${profile.role}. ${profile.intro}`,
    "",
    `- Site: ${SITE_URL}/`,
    `- E-mail: ${EMAIL}`,
    `- LinkedIn: ${LINKEDIN_URL}`,
    `- GitHub: ${GITHUB_URL}`,
    `- Currículo completo (PDF): ${abs(CV_FULL_URL)}`,
    `- Currículo ATS (PDF): ${abs(CV_ATS_URL)}`,
    "",
    "## Experiência",
    ...jobs.map((j) => `- ${j.period} · ${j.company} · ${j.role}: ${j.context}`),
    "",
    "## Projetos (estudos de caso com dados fictícios)",
    ...cases.map((c) => `- ${c.name} (${c.tagline}): ${c.summary} Tecnologias: ${c.skills.join(", ")}.`),
    "",
    "## Web design",
    `Código aberto: ${WEB_DESIGN_REPO_URL}`,
    ...webDesigns.map((w) => `- [${w.name}](${abs(w.url)}): ${w.summary}${w.repo ? ` Código: ${w.repo}` : ""}`),
    "",
    "## Habilidades",
    ...skillGroups.map((g) => `- ${g.title}: ${g.items.map((i) => i.name).join(", ")}`),
    "",
    "## Sobre",
    ...profile.about,
    "",
  ];
  return lines.join("\n");
}

function headTags(): string {
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.role,
    description: profile.intro,
    url: `${SITE_URL}/`,
    email: `mailto:${EMAIL}`,
    sameAs: [LINKEDIN_URL, GITHUB_URL],
  };
  return [
    `<link rel="canonical" href="${SITE_URL}/" />`,
    `<meta property="og:url" content="${SITE_URL}/" />`,
    `<meta property="og:image" content="${OG_IMAGE}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<link rel="alternate" type="text/plain" href="${SITE_URL}/llms.txt" title="Resumo para IAs" />`,
    `<script type="application/ld+json">${JSON.stringify(person).replace(/</g, "\\u003c")}</script>`,
    // A versão em texto só aparece para quem está sem JavaScript; com JS, o React a substitui antes disso.
    `<style>.static-snapshot{max-width:760px;margin:0 auto;padding:48px 16px;font:16px/1.6 system-ui,sans-serif;color:#0b2a4a;animation:ss-show 0s 2.5s both}.static-snapshot h1{font-size:34px;font-weight:700;line-height:1.2}.static-snapshot h2{font-size:24px;font-weight:700;margin-top:36px}.static-snapshot h3{font-size:18px;font-weight:600;margin-top:18px}.static-snapshot ul{padding-left:20px;list-style:disc}.static-snapshot p{margin:6px 0}@keyframes ss-show{from{visibility:hidden}to{visibility:visible}}</style>`,
  ].join("\n    ");
}

function main(): void {
  const indexPath = resolve(DIST, "index.html");
  const html = readFileSync(indexPath, "utf8");
  if (!html.includes('<div id="root"></div>')) throw new Error("prerender: <div id=\"root\"></div> não encontrado em dist/index.html");
  const out = html
    .replace("</head>", `    ${headTags()}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${snapshotHtml()}</div>`);
  writeFileSync(indexPath, out);

  const today = new Date().toISOString().slice(0, 10);
  const pages = ["/", ...webDesigns.map((w) => abs(w.url).slice(SITE_URL.length))];
  writeFileSync(
    resolve(DIST, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      pages.map((p) => `  <url><loc>${SITE_URL}${p}</loc><lastmod>${today}</lastmod></url>`).join("\n") +
      `\n</urlset>\n`,
  );
  writeFileSync(resolve(DIST, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
  writeFileSync(resolve(DIST, "llms.txt"), llmsTxt());
  console.log(`prerender: index.html, sitemap.xml (${pages.length} páginas), robots.txt e llms.txt gerados`);
}

main();
