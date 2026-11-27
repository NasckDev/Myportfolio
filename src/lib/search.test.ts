import { describe, expect, it } from "vitest";
import { normalize, search, splitMarks, type SearchEntry } from "./search";

const e = (group: string, label: string, extra: Partial<SearchEntry> = {}): SearchEntry => ({ group, label, ...extra });

const entries: SearchEntry[] = [
  e("Páginas", "Início", { text: "Front-end com React e TypeScript." }),
  e("Páginas", "Experiência", { text: "MindMiners e EY no projeto da Vivo." }),
  e("Projetos", "Juntos", { hint: "Produto full stack", terms: ["Next.js 16", "React 19", "TypeScript", "React"] }),
  e("Projetos", "InsightHub", { hint: "React e dados", terms: ["React", "ECharts", "React"], text: "Sínteses assistidas por IA com rastreabilidade." }),
  e("Projetos", "Reactor", { hint: "Teste de prefixo" }),
  e("Habilidades", "React", { terms: ["Front-end", "React"] }),
  e("Habilidades", "Integração com IA", { terms: ["Back-end"] }),
  e("Habilidades", "Mídia e vídeo"),
  e("Experiência", "EY, projeto Vivo (Telefônica)", { terms: ["React", "Angular"] }),
  e("Experiência", "EY", { hint: "Trainee SAP" }),
  e("Formação", "Análise e Desenvolvimento de Sistemas", { hint: "SPTech" }),
  e("Ações", "Copiar e-mail", { terms: ["contato"] }),
];

const labels = (q: string) => search(entries, q, ["Páginas", "Ações"]).flatMap((g) => g.hits.map((h) => h.entry.label));
const groupsOf = (q: string) => search(entries, q).map((g) => g.group);

describe("search", () => {
  it("sem busca, mostra só os grupos padrão na ordem pedida", () => {
    expect(search(entries, "  ", ["Ações", "Páginas"]).map((g) => g.group)).toEqual(["Ações", "Páginas"]);
  });

  it("ranqueia nome exato > começa com > tags > descrição e agrupa pelo melhor resultado", () => {
    expect(labels("react")).toEqual(["React", "Reactor", "Juntos", "InsightHub", "EY, projeto Vivo (Telefônica)", "Início"]);
    expect(groupsOf("react")).toEqual(["Habilidades", "Projetos", "Experiência", "Páginas"]);
  });

  it("explica por que casou e destaca o termo", () => {
    const juntos = search(entries, "react").flatMap((g) => g.hits).find((h) => h.entry.label === "Juntos")!;
    expect(juntos.why?.text).toBe("React 19 · React");
    const hub = search(entries, "react").flatMap((g) => g.hits).find((h) => h.entry.label === "InsightHub")!;
    expect(hub.why?.text).toBe("React");
    expect(splitMarks(juntos.why!.text, juntos.why!.ranges).filter((p) => p.mark).map((p) => p.text)).toEqual(["React", "React"]);
    const skill = search(entries, "react")[0]!.hits[0]!;
    expect(skill.label).toEqual([[0, 5]]);
    expect(skill.why).toBeUndefined();
  });

  it("ignora acentos e maiúsculas, destacando o texto original", () => {
    expect(labels("INICIO")).toEqual(["Início"]);
    const hit = search(entries, "analise")[0]!.hits[0]!;
    expect(splitMarks(hit.entry.label, hit.label)[0]).toEqual({ text: "Análise", mark: true });
    expect(normalize("Experiência Ação")).toBe("experiencia acao");
  });

  it("usa sinônimos e só casa termos curtos no começo de palavra", () => {
    expect(labels("ts")).toEqual(expect.arrayContaining(["Juntos", "Início"]));
    expect(labels("ia")).toEqual(["Integração com IA", "InsightHub"]);
    expect(labels("ai")).toEqual(["Integração com IA", "InsightHub"]);
    expect(labels("ey")).toEqual(["EY", "EY, projeto Vivo (Telefônica)", "Experiência"]);
    expect(labels("vivo")).toEqual(["EY, projeto Vivo (Telefônica)", "Experiência"]);
    expect(labels("email")).toEqual(["Copiar e-mail"]);
  });

  it("mostra um trecho da descrição quando o termo só aparece nela", () => {
    const hub = search(entries, "ia").flatMap((g) => g.hits).find((h) => h.entry.label === "InsightHub")!;
    expect(hub.why?.text).toContain("assistidas por IA");
    expect(splitMarks(hub.why!.text, hub.why!.ranges).find((p) => p.mark)?.text).toBe("IA");
  });

  it("com várias palavras, exige todas", () => {
    expect(labels("ey vivo")).toEqual(["EY, projeto Vivo (Telefônica)", "Experiência"]);
    expect(labels("react xyz")).toEqual([]);
  });
});
