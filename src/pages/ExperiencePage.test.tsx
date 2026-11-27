import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { JOBS } from "@/data/content";
import { renderAppAt, renderWithApp } from "@/test/render";
import ExperiencePage from "./ExperiencePage";

describe("Experiência", () => {
  it("mostra a logo de cada empresa e um monograma onde não há logo oficial", () => {
    renderWithApp(<ExperiencePage />);
    expect(screen.getByRole("img", { name: "Logo da MindMiners" })).toHaveAttribute("src", "/assets/empresas/mindminers.svg");
    expect(screen.getByRole("img", { name: "Logo da Vivo" })).toBeInTheDocument();
    expect(screen.getAllByRole("img", { name: "Logo da EY" })).toHaveLength(3);
    expect(screen.getByRole("img", { name: "Partners Digital" })).toHaveTextContent("PD");
  });

  it("abre o detalhe de cada empresa em diálogo rotulado e fecha com Esc", async () => {
    const { user } = renderWithApp(<ExperiencePage />);
    const buttons = screen.getAllByRole("button", { name: /^Ver o que eu fazia/ });
    expect(buttons).toHaveLength(JOBS.length);

    const opener = screen.getByRole("button", { name: "Ver o que eu fazia: MindMiners, ago/2025 até hoje" });
    await user.click(opener);
    const dialog = screen.getByRole("dialog", { name: "MindMiners" });
    expect(within(dialog).getByRole("heading", { name: "O que eu fazia" })).toBeInTheDocument();
    expect(within(dialog).getByRole("heading", { name: "IA no dia a dia" })).toBeInTheDocument();
    expect(within(dialog).getByText(/Servidor MCP para consultar logs/)).toBeInTheDocument();
    expect(within(dialog).getAllByRole("button", { name: "Fechar" })[0]).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it("cada empresa mostra o próprio conteúdo, sem seção de IA onde ela não existiu", async () => {
    const { user } = renderWithApp(<ExperiencePage />);
    await user.click(screen.getByRole("button", { name: /^Ver o que eu fazia: EY, projeto Vivo/ }));
    const dialog = screen.getByRole("dialog", { name: "EY, projeto Vivo (Telefônica)" });
    expect(within(dialog).getByText(/microsserviços com Node.js e NestJS/)).toBeInTheDocument();
    expect(within(dialog).queryByRole("heading", { name: "IA no dia a dia" })).not.toBeInTheDocument();
    await user.click(within(dialog).getAllByRole("button", { name: "Fechar" })[1]!);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("vindo de uma habilidade, abre direto a experiência indicada", async () => {
    const { user } = renderAppAt("/habilidades");
    await screen.findByRole("heading", { level: 1, name: "Habilidades" });
    await user.click(screen.getByRole("button", { name: /^MCP \(Model Context Protocol\)/ }));
    await user.click(within(screen.getByTestId("xpanel")).getByRole("link", { name: /MindMiners/ }));
    expect(await screen.findByRole("dialog", { name: "MindMiners" })).toBeInTheDocument();
  });
});
