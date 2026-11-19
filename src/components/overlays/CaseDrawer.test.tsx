import { screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CaseDrawer } from "@/components/overlays/CaseDrawer";
import { Cases } from "@/components/sections/Cases";
import { renderWithPortfolio } from "@/test/render";

function renderCasesWithDrawer() {
  return renderWithPortfolio(
    <>
      <Cases />
      <CaseDrawer />
    </>,
  );
}

describe("CaseDrawer", () => {
  it("fica fechado e fora da árvore acessível até um case ser aberto", () => {
    renderCasesWithDrawer();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("abre ao clicar em 'Ver o plano' e mostra o plano do case em construção", async () => {
    // Arrange
    const { user } = renderCasesWithDrawer();
    const verPlano = screen.getByRole("button", { name: "Ver o plano do InsightHub" });
    expect(verPlano).toHaveTextContent("Ver o plano");

    // Act
    await user.click(verPlano);

    // Assert
    const dialog = screen.getByRole("dialog", { name: "InsightHub" });
    expect(within(dialog).getByRole("heading", { name: "Decisões planejadas" })).toBeInTheDocument();
    expect(within(dialog).getByText("Em construção.")).toBeInTheDocument();
    expect(within(dialog).getByText("Fev 2027")).toBeInTheDocument();
    const repo = within(dialog).getByRole("link", { name: /Código no GitHub/ });
    expect(repo).toHaveAttribute("href", "https://github.com/NasckDev/insighthub");
    expect(repo).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("leva o foco para o botão de fechar ao abrir", async () => {
    const { user } = renderCasesWithDrawer();

    await user.click(screen.getByRole("button", { name: "Ver o plano do OpsFlow" }));

    await waitFor(() => expect(screen.getByRole("button", { name: "Fechar case" })).toHaveFocus());
  });

  it("case publicado mostra 'Decisões' (sem 'planejadas') e o link do código", async () => {
    const { user } = renderCasesWithDrawer();
    await user.click(screen.getByRole("button", { name: /Ver mais projetos/ }));

    await user.click(screen.getByRole("button", { name: "Ver detalhes do Myportfolio" }));

    const dialog = screen.getByRole("dialog", { name: "Myportfolio" });
    expect(within(dialog).getByRole("heading", { name: "Decisões" })).toBeInTheDocument();
    expect(within(dialog).queryByText("Em construção.")).not.toBeInTheDocument();
    expect(within(dialog).getByRole("link", { name: /Código no GitHub/ })).toHaveAttribute("href", "https://github.com/NasckDev/Myportfolio");
  });

  it("'Próximo' navega para o case seguinte sem fechar a gaveta", async () => {
    const { user } = renderCasesWithDrawer();
    await user.click(screen.getByRole("button", { name: "Ver o plano do InsightHub" }));

    await user.click(screen.getByRole("button", { name: "Próximo: OpsFlow →" }));

    expect(screen.getByRole("dialog", { name: "OpsFlow" })).toBeInTheDocument();
  });

  it("fecha pelo botão 'Fechar case' e pela tecla Escape", async () => {
    const { user } = renderCasesWithDrawer();
    await user.click(screen.getByRole("button", { name: "Ver o plano do InsightHub" }));

    await user.click(screen.getByRole("button", { name: "Fechar case" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Ver o plano do OpsFlow" }));
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
