import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderAppAt } from "@/test/render";
import { searchActions, type PaletteAction } from "./Palette";

const act = (group: string, label: string, extra: Partial<PaletteAction> = {}): PaletteAction => ({ group, label, run: vi.fn(), ...extra });

describe("searchActions", () => {
  const actions = [act("Ir para", "Início"), act("Projetos", "OpsFlow", { keywords: "Angular Signals" }), act("Habilidades", "Angular")];

  it("sem busca, esconde as habilidades", () => {
    expect(searchActions(actions, "").map((a) => a.label)).toEqual(["Início", "OpsFlow"]);
  });

  it("busca sem acento e em palavras-chave", () => {
    expect(searchActions(actions, "inicio").map((a) => a.label)).toEqual(["Início"]);
    expect(searchActions(actions, "angular").map((a) => a.label)).toEqual(["OpsFlow", "Angular"]);
    expect(searchActions(actions, "xyz")).toEqual([]);
  });
});

describe("busca (Ctrl K)", () => {
  it("abre com Ctrl K, filtra, navega com as setas e abre com Enter", async () => {
    const { user } = renderAppAt("/");
    await screen.findByRole("heading", { level: 1, name: "Alexandre Diogo" });
    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    const dialog = await screen.findByRole("dialog", { name: "Buscar e navegar" });
    const input = within(dialog).getByRole("combobox");
    expect(input).toHaveFocus();

    await user.type(input, "react");
    const options = within(dialog).getAllByRole("option");
    expect(options.length).toBeGreaterThan(2);
    expect(options[0]).toHaveTextContent("Juntos");
    expect(options[0]).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{ArrowDown}");
    expect(within(dialog).getAllByRole("option")[1]).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{ArrowUp}{Enter}");

    expect(await screen.findByRole("heading", { level: 1, name: "Juntos" })).toBeInTheDocument();
    expect(window.location.pathname).toBe("/projeto/juntos");
    expect(screen.queryByRole("dialog", { name: "Buscar e navegar" })).not.toBeInTheDocument();
  });

  it("mostra mensagem quando nada é encontrado e fecha com Esc", async () => {
    const { user } = renderAppAt("/");
    await screen.findByRole("heading", { level: 1, name: "Alexandre Diogo" });
    await user.click(screen.getAllByRole("button", { name: "Buscar e navegar" })[0]!);
    const dialog = await screen.findByRole("dialog", { name: "Buscar e navegar" });
    await user.type(within(dialog).getByRole("combobox"), "zzzz");
    expect(within(dialog).getByText(/Nada encontrado/)).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "Buscar e navegar" })).not.toBeInTheDocument();
  });
});
