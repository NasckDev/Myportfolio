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

  it("abre ao clicar em 'Ver a demo' e mostra o case em construção com previsão e código", async () => {
    // Arrange
    const { user } = renderCasesWithDrawer();
    const verDemo = screen.getByRole("button", { name: "Ver a demo do InsightHub" });
    expect(verDemo).toHaveTextContent("Ver a demo");

    // Act
    await user.click(verDemo);

    // Assert
    const dialog = screen.getByRole("dialog", { name: "InsightHub" });
    expect(within(dialog).getByRole("heading", { name: "Decisões" })).toBeInTheDocument();
    expect(within(dialog).getByText("Demo no ar.")).toBeInTheDocument();
    expect(within(dialog).getByText("Fev 2027")).toBeInTheDocument();
    const repo = within(dialog).getByRole("link", { name: /Código no GitHub/ });
    expect(repo).toHaveAttribute("href", "https://github.com/NasckDev/insighthub");
    expect(repo).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("leva o foco para o botão de fechar ao abrir", async () => {
    const { user } = renderCasesWithDrawer();

    await user.click(screen.getByRole("button", { name: "Ver a demo do OpsFlow" }));

    await waitFor(() => expect(screen.getByRole("button", { name: "Fechar case" })).toHaveFocus());
  });

  it("case publicado não mostra o aviso de construção e linka o código", async () => {
    const { user } = renderCasesWithDrawer();
    await user.click(screen.getByRole("button", { name: /Ver mais projetos/ }));

    await user.click(screen.getByRole("button", { name: "Ver detalhes do Myportfolio" }));

    const dialog = screen.getByRole("dialog", { name: "Myportfolio" });
    expect(within(dialog).getByRole("heading", { name: "Decisões" })).toBeInTheDocument();
    expect(within(dialog).queryByText("Demo no ar.")).not.toBeInTheDocument();
    expect(within(dialog).queryByText("Em construção.")).not.toBeInTheDocument();
    expect(within(dialog).getByRole("link", { name: /Código no GitHub/ })).toHaveAttribute("href", "https://github.com/NasckDev/Myportfolio");
  });

  it("'Próximo' navega para o case seguinte sem fechar a gaveta", async () => {
    const { user } = renderCasesWithDrawer();
    await user.click(screen.getByRole("button", { name: "Ver a demo do InsightHub" }));

    await user.click(screen.getByRole("button", { name: "Próximo: OpsFlow →" }));

    expect(screen.getByRole("dialog", { name: "OpsFlow" })).toBeInTheDocument();
  });

  it("fecha pelo botão 'Fechar case' e pela tecla Escape", async () => {
    const { user } = renderCasesWithDrawer();
    await user.click(screen.getByRole("button", { name: "Ver a demo do InsightHub" }));

    await user.click(screen.getByRole("button", { name: "Fechar case" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Ver a demo do OpsFlow" }));
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("roda a demo do projeto dentro da gaveta só depois do clique", async () => {
    // Arrange
    const { user } = renderCasesWithDrawer();
    await user.click(screen.getByRole("button", { name: "Ver a demo do OpsFlow" }));
    const dialog = screen.getByRole("dialog", { name: "OpsFlow" });
    // A gaveta leva o foco para "Fechar case" logo ao abrir; espera isso antes de agir, como uma pessoa faria.
    await waitFor(() => expect(within(dialog).getByRole("button", { name: "Fechar case" })).toHaveFocus());
    expect(within(dialog).queryByTitle("Demo do OpsFlow")).not.toBeInTheDocument();
    expect(within(dialog).getByRole("list", { name: "Prints do OpsFlow" })).toBeInTheDocument();

    // Act
    await user.click(within(dialog).getByRole("button", { name: "Rodar a demo" }));

    // Assert
    // A demo abre em tela cheia, num diálogo próprio por cima da gaveta.
    const demo = screen.getByRole("dialog", { name: "Demo do OpsFlow" });
    expect(within(demo).getByTitle("Demo do OpsFlow")).toHaveAttribute("src", "/projetos/opsflow/");
    expect(within(demo).getByRole("link", { name: /Abrir em nova aba/ })).toHaveAttribute("href", "/projetos/opsflow/");
    await waitFor(() => expect(within(demo).getByRole("button", { name: "Fechar demo" })).toHaveFocus());
  });

  it("Esc fecha só a demo, mantém a gaveta aberta e devolve o foco ao botão que abriu", async () => {
    // Arrange
    const { user } = renderCasesWithDrawer();
    await user.click(screen.getByRole("button", { name: "Ver a demo do OpsFlow" }));
    const drawer = screen.getByRole("dialog", { name: "OpsFlow" });
    await waitFor(() => expect(within(drawer).getByRole("button", { name: "Fechar case" })).toHaveFocus());
    const rodar = within(drawer).getByRole("button", { name: "Rodar a demo" });
    await user.click(rodar);
    expect(screen.getByRole("dialog", { name: "Demo do OpsFlow" })).toBeInTheDocument();

    // Act
    await user.keyboard("{Escape}");

    // Assert
    expect(screen.queryByRole("dialog", { name: "Demo do OpsFlow" })).not.toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "OpsFlow" })).toBeInTheDocument();
    await waitFor(() => expect(rodar).toHaveFocus());
  });
});
