import { screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CommandPalette } from "@/components/overlays/CommandPalette";
import { paletteNav } from "@/data/portfolio";
import { renderWithPortfolio } from "@/test/render";

const PALETTE = { name: "Busca e comandos" } as const;

async function openPalette() {
  const view = renderWithPortfolio(<CommandPalette />);
  await view.user.keyboard("{Control>}k{/Control}");
  return { ...view, dialog: screen.getByRole("dialog", PALETTE) };
}

describe("CommandPalette", () => {
  it("começa fechada e abre com Ctrl+K", async () => {
    // Arrange
    const { user } = renderWithPortfolio(<CommandPalette />);
    expect(screen.queryByRole("dialog", PALETTE)).not.toBeInTheDocument();

    // Act
    await user.keyboard("{Control>}k{/Control}");

    // Assert
    expect(screen.getByRole("dialog", PALETTE)).toBeInTheDocument();
  });

  it("no desktop leva o foco para o campo de busca ao abrir", async () => {
    await openPalette();

    await waitFor(() => expect(screen.getByRole("combobox", { name: "Buscar" })).toHaveFocus());
  });

  it("tem um botão Fechar com nome acessível que fecha a paleta", async () => {
    // Arrange
    const { user, dialog } = await openPalette();
    const fechar = within(dialog).getByRole("button", { name: "Fechar" });

    // Act
    await user.click(fechar);

    // Assert
    expect(screen.queryByRole("dialog", PALETTE)).not.toBeInTheDocument();
  });

  it("filtra pela tag do case, sem diferenciar acento e caixa", async () => {
    const { user, dialog } = await openPalette();

    await user.type(within(dialog).getByRole("combobox", { name: "Buscar" }), "ANGULAR");

    const opcoes = within(dialog).getAllByRole("option").map((o) => o.textContent);
    expect(opcoes).toHaveLength(1);
    expect(opcoes[0]).toContain("Abrir OpsFlow");
  });

  it("setas movem a opção ativa e o combobox aponta para ela via aria-activedescendant", async () => {
    const { user, dialog } = await openPalette();
    const busca = within(dialog).getByRole("combobox", { name: "Buscar" });
    await waitFor(() => expect(busca).toHaveFocus());

    await user.keyboard("{ArrowDown}");

    const ativa = within(dialog).getByRole("option", { selected: true });
    expect(busca).toHaveAttribute("aria-activedescendant", ativa.id);
    // A segunda entrada da navegação (a primeira já começa ativa).
    expect(ativa).toHaveTextContent(paletteNav[1][1]);
  });

  it("avisa quando a busca não encontra nada", async () => {
    const { user, dialog } = await openPalette();

    await user.type(within(dialog).getByRole("combobox", { name: "Buscar" }), "xyzzy");

    expect(within(dialog).queryAllByRole("option")).toHaveLength(0);
    expect(within(dialog).getByRole("status")).toHaveTextContent("Nada encontrado para “xyzzy”.");
  });

  it("Escape fecha a paleta", async () => {
    const { user } = await openPalette();

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog", PALETTE)).not.toBeInTheDocument();
  });
});
