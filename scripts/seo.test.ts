// @vitest-environment node
import { describe, expect, it } from "vitest";
import type { Route } from "../src/data/routes.ts";
import { SITE_URL } from "../src/data/site.ts";
import { allRoutes, buildPage, DEFAULT_OG, llmsTxt, ogImageFor, outputFile, robotsTxt, sitemapXml } from "./seo.ts";

const TEMPLATE = `<!doctype html><html lang="pt-BR"><head><title>x</title>
    <meta name="description" content="x" />
    <link rel="canonical" href="/" />
</head><body><div id="root"></div></body></html>`;

const opts = { base: "", caseOg: { juntos: "/assets/projetos/juntos/og.jpg", insighthub: null }, fontPreload: "/assets/archivo.woff2" };
const pick = (html: string, re: RegExp) => re.exec(html)?.[1];

describe("pré-render", () => {
  const routes = allRoutes();
  const pages = routes.map((r) => ({ r, html: buildPage(TEMPLATE, r, opts) }));

  it("gera uma página por rota com title, description e og próprios e únicos", () => {
    expect(routes).toHaveLength(16);
    const titles = pages.map((p) => pick(p.html, /<title>([^<]+)<\/title>/));
    const descs = pages.map((p) => pick(p.html, /<meta name="description" content="([^"]+)"/));
    const ogTitles = pages.map((p) => pick(p.html, /<meta property="og:title" content="([^"]+)"/));
    const ogUrls = pages.map((p) => pick(p.html, /<meta property="og:url" content="([^"]+)"/));
    for (const list of [titles, descs, ogTitles, ogUrls]) {
      expect(list.every(Boolean)).toBe(true);
      expect(new Set(list).size).toBe(routes.length);
    }
    for (const { html } of pages) {
      expect(html).toContain('<meta name="twitter:card" content="summary_large_image" />');
      expect(html).toContain('"@type":"Person"');
      expect(html).toContain('<link rel="preload" href="/assets/archivo.woff2" as="font"');
      expect(html).not.toContain('<div id="root"></div>');
    }
  });

  it("canonical absoluto no domínio do site e conteúdo em texto da rota", () => {
    const caseHtml = pages.find((p) => p.r.name === "projeto" && p.r.projectId === "garrafao")!.html;
    expect(caseHtml).toContain(`<link rel="canonical" href="${SITE_URL}/projeto/garrafao" />`);
    expect(caseHtml).toContain("<h1>Garrafão</h1>");
    expect(caseHtml).toContain("Decisões de engenharia");
    const home = pages.find((p) => p.r.name === "inicio")!.html;
    expect(home).toContain(`<link rel="canonical" href="${SITE_URL}/" />`);
  });

  it("og:image do estudo de caso usa og.jpg quando existe", () => {
    const juntos: Route = { name: "projeto", tab: "projetos", projectId: "juntos" };
    const ih: Route = { name: "projeto", tab: "projetos", projectId: "insighthub" };
    expect(ogImageFor(juntos, opts.caseOg)).toBe("/assets/projetos/juntos/og.jpg");
    expect(ogImageFor(ih, opts.caseOg)).toBe(DEFAULT_OG);
    expect(buildPage(TEMPLATE, juntos, opts)).toContain(`<meta property="og:image" content="${SITE_URL}/assets/projetos/juntos/og.jpg" />`);
  });

  it("404 sem indexação e arquivos de saída sem conflito com as demos", () => {
    const nf: Route = { name: "nao-encontrada", tab: null };
    expect(buildPage(TEMPLATE, nf, opts)).toContain('<meta name="robots" content="noindex" />');
    expect(outputFile(nf)).toBe("404.html");
    expect(outputFile({ name: "projetos", tab: "projetos" })).toBe("projetos/index.html");
    expect(outputFile({ name: "inicio", tab: "inicio" })).toBe("index.html");
    expect(outputFile({ name: "projeto", tab: "projetos", projectId: "nasckui" })).toBe("projeto/nasckui/index.html");
  });

  it("sitemap com todas as rotas, robots e llms.txt", () => {
    const xml = sitemapXml("2026-11-25");
    for (const r of routes) {
      const f = outputFile(r);
      const loc = f === "index.html" ? `${SITE_URL}/` : `${SITE_URL}/${f.replace(/\/index\.html$/, "")}`;
      expect(xml).toContain(`<loc>${loc}</loc>`);
    }
    expect(xml.match(/<url>/g)).toHaveLength(routes.length);
    expect(robotsTxt()).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
    const llms = llmsTxt();
    expect(llms).toContain("Coverlist");
    expect(llms).toContain(`${SITE_URL}/projeto/garrafao`);
  });
});
