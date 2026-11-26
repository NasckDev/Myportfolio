import { describe, expect, it } from "vitest";
import { contrastRatio } from "@/lib/contrast";
import { DESIGNS, EVIDENCE, JOBS, REPOS, SKILLS, SPECIALTIES } from "./content";
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
});
