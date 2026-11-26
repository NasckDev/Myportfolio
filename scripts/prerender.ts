/**
 * Roda depois do `vite build`. Gera um index.html por rota (título, descrição, canonical,
 * Open Graph/Twitter, JSON-LD e o conteúdo em texto), 404.html, robots.txt, sitemap.xml e llms.txt.
 * Confere no fim que a página /projetos e as demos em /projetos/<slug>/ convivem em dist/.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import type { Route } from "../src/data/routes.ts";
import { readProjectMedia } from "./projectMedia.ts";
import { allRoutes, buildPage, llmsTxt, outputFile, robotsTxt, sitemapXml } from "./seo.ts";

const ROOT = resolve(import.meta.dirname, "..");
const DIST = join(ROOT, "dist");
const BASE = (process.env.VITE_BASE_PATH || "/").replace(/\/$/, "");

function findFont(): string | undefined {
  const dir = join(DIST, "assets");
  const f = existsSync(dir) ? readdirSync(dir).find((n) => /^archivo-latin-wdth-normal-.*\.woff2$/.test(n)) : undefined;
  return f ? `${BASE}/assets/${f}` : undefined;
}

function main(): void {
  const template = readFileSync(join(DIST, "index.html"), "utf8");
  const media = readProjectMedia(join(ROOT, "public"));
  const caseOg = Object.fromEntries(Object.entries(media).map(([id, m]) => [id, m.og]));
  const opts = { base: BASE, caseOg, fontPreload: findFont() };
  if (!opts.fontPreload) console.warn("prerender: fonte Archivo (latin, wdth) não encontrada em dist/assets; sem preload");

  const routes: Route[] = [...allRoutes(), { name: "nao-encontrada", tab: null }];
  for (const route of routes) {
    const file = join(DIST, outputFile(route));
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, buildPage(template, route, opts));
  }

  writeFileSync(join(DIST, "sitemap.xml"), sitemapXml(new Date().toISOString().slice(0, 10)));
  writeFileSync(join(DIST, "robots.txt"), robotsTxt());
  writeFileSync(join(DIST, "llms.txt"), llmsTxt());

  // A página /projetos (dist/projetos/index.html) e as demos (dist/projetos/<slug>/) precisam conviver.
  const demos = join(DIST, "projetos");
  const slugs = readdirSync(demos).filter((n) => statSync(join(demos, n)).isDirectory());
  if (!existsSync(join(demos, "index.html"))) throw new Error("prerender: dist/projetos/index.html não foi gerado");
  for (const slug of slugs) {
    if (!existsSync(join(demos, slug, "index.html"))) console.warn(`prerender: a demo dist/projetos/${slug}/ não tem index.html`);
  }
  console.log(`prerender: ${routes.length} páginas (${routes.length - 1} rotas + 404), sitemap, robots e llms.txt. Demos em /projetos/: ${slugs.join(", ") || "nenhuma"}`);
}

main();
