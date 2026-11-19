import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import * as data from "@/data/portfolio";
import { caseFilters, cases, footerLinks, jobs, navItems, paletteNav, repos, sectionIds, skillGroups, webDesigns } from "@/data/portfolio";

/** Coleta recursivamente toda string de um valor (objetos, arrays) com o caminho, para varrer links. */
function collectStrings(value: unknown, path: string, out: { path: string; value: string }[] = []) {
  if (typeof value === "string") out.push({ path, value });
  else if (Array.isArray(value)) value.forEach((v, i) => collectStrings(v, `${path}[${i}]`, out));
  else if (value && typeof value === "object") Object.entries(value).forEach(([k, v]) => collectStrings(v, `${path}.${k}`, out));
  return out;
}

const MONTH_YEAR = /^(Jan|Fev|Mar|Abr|Mai|Jun|Jul|Ago|Set|Out|Nov|Dez) \d{4}$/;

describe("cases", () => {
  it("todo case tem previsão de entrega (eta) ou código publicado (repoUrl)", () => {
    // Arrange / Act
    const semEvidencia = cases.filter((c) => !c.eta && !c.repoUrl).map((c) => c.id);

    // Assert
    expect(semEvidencia).toEqual([]);
  });

  it("case em construção informa em que etapa está e usa data no formato 'Mmm AAAA'", () => {
    const emConstrucao = cases.filter((c) => c.eta);

    expect(emConstrucao.length).toBeGreaterThan(0);
    for (const c of emConstrucao) {
      expect(c.stage, c.id).toBeTruthy();
      expect(c.eta, c.id).toMatch(MONTH_YEAR);
    }
  });

  it("ids e números dos cases são únicos", () => {
    const ids = cases.map((c) => c.id);
    const nums = cases.map((c) => c.num);

    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(nums).size).toBe(nums.length);
  });

  it("toda tag usada por um case existe como filtro, exceto Acessibilidade (atributo transversal)", () => {
    const filtros = new Set<string>(caseFilters);

    const tagsSemFiltro = [...new Set(cases.flatMap((c) => c.tags))].filter((t) => !filtros.has(t) && t !== "Acessibilidade");

    expect(tagsSemFiltro).toEqual([]);
  });

  it("todo case tem pelo menos uma decisão e nenhuma decisão repetida (são usadas como key)", () => {
    for (const c of cases) {
      expect(c.decisions.length, c.id).toBeGreaterThan(0);
      expect(new Set(c.decisions).size, c.id).toBe(c.decisions.length);
    }
  });
});

/** Caminho público ("/assets/...") para o arquivo dentro de public/. */
const inPublic = (url: string) => resolve(import.meta.dirname, "../../public", url.replace(/^\/+/, ""));

describe("demos e prints dos projetos", () => {
  it("toda demo executável tem um index.html publicado em public/", () => {
    for (const c of cases.filter((k) => k.demoUrl)) {
      expect(existsSync(inPublic(`${c.demoUrl}index.html`)), c.id).toBe(true);
    }
  });

  it("todo print existe em public/ e tem texto alternativo e legenda", () => {
    for (const shot of cases.flatMap((c) => c.shots ?? [])) {
      expect(existsSync(inPublic(shot.src)), shot.src).toBe(true);
      expect(shot.alt.length).toBeGreaterThan(5);
      expect(shot.caption.length).toBeGreaterThan(5);
    }
  });

  it("projeto com prints tem pelo menos um print de desktop para a capa do card", () => {
    for (const c of cases.filter((k) => k.shots?.length)) {
      expect(c.shots?.some((s) => s.device === "desktop"), c.id).toBe(true);
    }
  });
});

describe("links", () => {
  const todasAsStrings = collectStrings(data, "portfolio");

  it("nenhum link aponta para '#' vazio", () => {
    const hrefs = [...repos.map((r) => r.href), ...cases.flatMap((c) => [c.repoUrl, c.liveUrl]), ...webDesigns.flatMap((w) => [w.url, w.repo])];

    expect(hrefs.filter((h) => h === "#" || h === "")).toEqual([]);
    expect(todasAsStrings.filter((s) => s.value === "#")).toEqual([]);
  });

  it("todo link externo usa https", () => {
    const inseguros = todasAsStrings.filter((s) => /^http:\/\//i.test(s.value));

    expect(inseguros).toEqual([]);
  });

  it("links de navegação apontam para seções que existem na página", () => {
    const secoes = new Set(sectionIds);
    const alvos = [...navItems, ...footerLinks, ...paletteNav].map(([id]) => id);

    expect(alvos.filter((id) => !secoes.has(id))).toEqual([]);
  });
});

describe("habilidades e experiências", () => {
  it("toda referência de habilidade a case ou emprego aponta para um índice válido", () => {
    const skills = skillGroups.flatMap((g) => g.items);

    const invalidas = skills.filter((s) => s.cases.some((i) => !cases[i]) || s.jobs.some((i) => !jobs[i])).map((s) => s.name);

    expect(invalidas).toEqual([]);
  });

  it("o case citado em cada emprego corresponde ao nome do case no índice informado", () => {
    for (const job of jobs.filter((j) => j.caseIndex !== undefined)) {
      expect(cases[job.caseIndex as number]?.name, job.company).toBe(job.case);
    }
  });
});
