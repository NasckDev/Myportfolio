import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { skillEvidence } from "@/data/content";
import { renderWithApp } from "@/test/render";
import SkillsPage from "./SkillsPage";

describe("Habilidades", () => {
  it("mostra as evidências da habilidade escolhida", async () => {
    const { user } = renderWithApp(<SkillsPage />);
    const panel = () => screen.getByTestId("xpanel");
    expect(within(panel()).getByRole("heading", { name: "React" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^Integração com APIs públicas/ }));
    expect(within(panel()).getByRole("heading", { name: "Integração com APIs públicas" })).toBeInTheDocument();
    const links = within(panel()).getAllByRole("link");
    expect(links.map((l) => l.getAttribute("href"))).toEqual(["/projeto/coverlist", "/projeto/garrafao"]);
    expect(screen.getByRole("button", { name: /^Integração com APIs públicas/ })).toHaveAttribute("aria-pressed", "true");
  });

  it("separa projetos de experiência profissional", () => {
    const ev = skillEvidence("React");
    expect(ev.projects.length).toBeGreaterThan(0);
    expect(ev.jobs.map((j) => j.name)).toEqual(["MindMiners", "EY, projeto Vivo"]);
  });

  it("grupos de IA e Ferramentas ligam cada habilidade ao trabalho e explicam onde foi aplicada", async () => {
    const { user } = renderWithApp(<SkillsPage />);
    for (const group of ["IA", "Ferramentas"]) expect(screen.getByRole("group", { name: group })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^RAG com citações/ }));
    const panel = screen.getByTestId("xpanel");
    expect(within(panel).getByText(/cita cada fonte como \[#id\]/)).toBeInTheDocument();
    expect(within(panel).getByRole("link", { name: /InsightHub/ })).toHaveAttribute("href", "/projeto/insighthub");

    await user.click(screen.getByRole("button", { name: /^MCP \(Model Context Protocol\)/ }));
    expect(within(screen.getByTestId("xpanel")).getByText(/Grafana e no Loki/)).toBeInTheDocument();
    expect(skillEvidence("MCP (Model Context Protocol)").jobs.map((j) => j.job)).toEqual(["mindminers"]);
  });

  it("a prova ao vivo diz onde o padrão foi aplicado", () => {
    renderWithApp(<SkillsPage />);
    const ctx = screen.getByTestId("prova-contexto");
    expect(within(ctx).getByRole("link", { name: "MindMiners" })).toHaveAttribute("href", "/experiencia");
    expect(within(ctx).getByRole("link", { name: "InsightHub" })).toHaveAttribute("href", "/projeto/insighthub");
  });

  it("cinco estados: alterna e o mesmo componente responde", async () => {
    const { user } = renderWithApp(<SkillsPage />);
    const mock = () => screen.getByTestId("mock");
    expect(within(mock()).getByText("state: success")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Erro" }));
    expect(within(mock()).getByRole("alert")).toHaveTextContent("Os vencimentos não carregaram");
    await user.click(screen.getByRole("button", { name: "Vazio" }));
    expect(within(mock()).getByText(/Nenhuma conta vence/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Adicionar conta fixa" }));
    expect(within(mock()).getByText("state: success")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Parcial" }));
    expect(within(mock()).getByText(/Mostrando 2 de 4/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Carregando" }));
    expect(within(mock()).getByRole("list", { name: "Carregando vencimentos" })).toHaveAttribute("aria-busy", "true");
  });
});
