import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { contrastRatio } from "@/lib/contrast";
import { AXE_E2E_PRODUCTS, CODE_METRICS, DESIGNS, EVIDENCE, getJob, JOBS, PRODUCT_COUNT, REPOS, SKILLS, SPECIALTIES, STORIES_TOTAL } from "./content";
import { mediaOf } from "./media";
import { FILTERS, filterProjects, PROJECTS, SPOT_IDS } from "./projects";
import { allRoutes, metaFor, NAV } from "./routes";
import { LINKS, SITE_URL } from "./site";
import { SNIPPETS } from "./snippets";
import { TEST_COUNTS, TOTAL_E2E, TOTAL_UNIT } from "./testCounts";

const isHttps = (u: string) => {
  try {
    return new URL(u).protocol === "https:";
  } catch {
    return false;
  }
};

describe("integridade dos dados", () => {
  it("ids de projeto, rotas, páginas e trechos são únicos", () => {
    const ids = PROJECTS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    const paths = allRoutes().map((r) => metaFor(r).path);
    expect(new Set(paths).size).toBe(paths.length);
    expect(new Set(SNIPPETS.map((s) => s.id)).size).toBe(SNIPPETS.length);
    expect(new Set(NAV.map((n) => n.path)).size).toBe(NAV.length);
  });

  it("ordem dos produtos: Juntos, apps, Coverlist, Garrafão e o portfólio por último", () => {
    expect(PROJECTS.map((p) => p.id)).toEqual(["juntos", "insighthub", "opsflow", "fiscotrack", "nasckui", "coverlist", "garrafao", "portfolio"]);
    expect(SPOT_IDS).toEqual(["insighthub", "opsflow", "fiscotrack", "nasckui", "coverlist", "garrafao"]);
  });

  it("todo projeto tem mídia segundo a convenção ou cai na capa de fallback", () => {
    for (const p of PROJECTS) {
      const m = mediaOf(p.id);
      if (p.id === "portfolio") expect(m.shots).toEqual([]);
      else expect(m.shots.length, p.id).toBeGreaterThan(0);
      for (const s of m.shots) {
        expect(s.src).toMatch(new RegExp(`^/assets/projetos/${p.id}/desktop-\\d\\.webp$`));
        expect(s.caption.length, s.src).toBeGreaterThan(10);
      }
    }
  });

  it("links externos são https; currículo e demos usam o domínio do site", () => {
    const all = [
      ...PROJECTS.flatMap((p) => p.links.map(([, u]) => u)),
      ...DESIGNS.flatMap((d) => [d.live, d.code ?? d.live]),
      ...REPOS.map((r) => r[3]),
      ...SNIPPETS.map((s) => s.url),
      ...Object.values(LINKS),
    ];
    for (const u of all) expect(isHttps(u), u).toBe(true);
    expect(LINKS.cv.startsWith(SITE_URL)).toBe(true);
    for (const id of ["coverlist", "garrafao"]) {
      expect(PROJECTS.find((p) => p.id === id)!.links[0]![1]).toBe(`${SITE_URL}/projetos/${id}/`);
      expect(DESIGNS.find((d) => d.id === id)!.live).toBe(`${SITE_URL}/projetos/${id}/`);
    }
  });

  it("toda evidência de habilidade existe", () => {
    const all = SKILLS.flatMap(([, items]) => items.map(([s]) => s));
    for (const [, items] of SKILLS) for (const [skill, ev] of items) for (const id of ev) expect(EVIDENCE[id], `${skill} → ${id}`).toBeDefined();
    for (const [, , , skill] of SPECIALTIES) expect(all).toContain(skill);
    expect(new Set(all).size).toBe(all.length);
  });

  it("contagens coerentes: totais vêm da fonte única e aparecem nos textos", () => {
    const counts = Object.values(TEST_COUNTS);
    expect(TOTAL_UNIT).toBe(counts.reduce((a, c) => a + (c.unit ?? 0), 0));
    expect(TOTAL_E2E).toBe(counts.reduce((a, c) => a + (c.e2e ?? 0), 0));
    const ih = PROJECTS.find((p) => p.id === "insighthub")!;
    expect(ih.tests).toContain(String(TEST_COUNTS.insighthub.unit));
    expect(ih.counts![0]![0]).toBe(String(TEST_COUNTS.insighthub.unit));
    expect(SPECIALTIES[3]![2]).toContain(TOTAL_UNIT.toLocaleString("pt-BR"));
    // Contagem ainda não medida (null) não vira número inventado nas provas.
    for (const id of ["coverlist", "garrafao"] as const) {
      if (TEST_COUNTS[id].unit === null) expect(PROJECTS.find((p) => p.id === id)!.counts!.some(([, l]) => l.includes("testes"))).toBe(false);
    }
  });

  it("filtros contam corretamente e todo projeto aparece em algum filtro", () => {
    expect(filterProjects("Todos")).toHaveLength(PROJECTS.length);
    const covered = new Set(FILTERS.filter((f) => f !== "Todos").flatMap((f) => filterProjects(f).map((p) => p.id)));
    for (const p of PROJECTS) expect(covered.has(p.id), p.id).toBe(true);
  });

  it("cores dos projetos têm contraste AA com o texto sobre elas", () => {
    for (const p of PROJECTS.filter((x) => x.color.startsWith("#"))) expect(contrastRatio(p.color, p.on), p.id).toBeGreaterThanOrEqual(4.5);
  });

  it("experiências e trechos estão completos", () => {
    for (const j of JOBS) expect(j.items.length).toBeGreaterThan(0);
    for (const s of SNIPPETS) expect(s.code.split("\n").length).toBeGreaterThan(5);
  });

  it("cada experiência tem id único, logo existente ou monograma e detalhe completo", () => {
    expect(new Set(JOBS.map((j) => j.id)).size).toBe(JOBS.length);
    for (const j of JOBS) {
      expect(j.marks.length, j.id).toBeGreaterThan(0);
      for (const m of j.marks) {
        expect(m.alt.length, j.id).toBeGreaterThan(2);
        if ("src" in m) expect(existsSync(`public${m.src}`), m.src).toBe(true);
      }
      expect(j.detail.context.length, j.id).toBeGreaterThan(20);
      expect(j.detail.did.length, j.id).toBeGreaterThan(0);
      expect(j.detail.stack.length, j.id).toBeGreaterThan(0);
    }
  });

  it("evidência profissional aponta para uma experiência existente", () => {
    for (const [id, e] of Object.entries(EVIDENCE)) if (e.job) expect(getJob(e.job), id).toBeDefined();
  });

  it("habilidades têm IA e Ferramentas; toda habilidade tem evidência e as de IA explicam onde foram aplicadas", () => {
    expect(SKILLS.map(([g]) => g)).toEqual(expect.arrayContaining(["IA", "Ferramentas"]));
    for (const [, items] of SKILLS) for (const [skill, ev] of items) expect(ev.length, skill).toBeGreaterThan(0);
    const ia = SKILLS.find(([g]) => g === "IA")![1];
    for (const [skill, , note] of ia) expect(note, skill).toBeTruthy();
    const withJob = ia.filter(([, ev]) => ev.some((id) => EVIDENCE[id]?.job)).map(([s]) => s);
    expect(withJob).toEqual(["LLMs em produto", "MCP (Model Context Protocol)", "Agentes de IA no desenvolvimento"]);
  });

  it("métricas do Início vêm das contagens medidas", () => {
    const stories = Object.values(TEST_COUNTS).reduce((a, c) => a + ((c as { stories: number | null }).stories ?? 0), 0);
    expect(STORIES_TOTAL).toBe(stories);
    expect(CODE_METRICS.map(([v]) => v)).toEqual([Number.parseInt(TEST_COUNTS.juntos.coreCoverage, 10), stories, TEST_COUNTS.nasckui.components, AXE_E2E_PRODUCTS.length]);
    const products = PROJECTS.filter((p) => p.id !== "portfolio").map((p) => p.id);
    for (const id of AXE_E2E_PRODUCTS) expect(products).toContain(id);
    expect(AXE_E2E_PRODUCTS.length).toBeLessThanOrEqual(PRODUCT_COUNT);
  });

  it("trechos indicam as linhas de origem e o link aponta para elas", () => {
    for (const s of SNIPPETS) {
      const [start, end] = s.lines;
      expect(end - start + 1, s.id).toBe(s.code.split("\n").length);
      expect(s.url, s.id).toContain(`/blob/HEAD/${s.file}`);
      if (start > 1) expect(s.url, s.id).toMatch(new RegExp(`#L${start}-L${end}$`));
    }
  });
});
