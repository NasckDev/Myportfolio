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
