import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PREFS_KEY } from "@/lib/prefs";
import { renderAppAt } from "@/test/render";

describe("painel Aparência", () => {
  it("abre pelo botão, troca tema e cor e persiste", async () => {
    const { user } = renderAppAt("/contato");
    await screen.findByRole("heading", { level: 1, name: "Contato" });
    await user.click(screen.getByRole("button", { name: "Aparência do site" }));
    const dialog = await screen.findByRole("dialog", { name: "Aparência" });
    await user.click(within(dialog).getByRole("radio", { name: "Escuro" }));
    await user.click(within(dialog).getByRole("radio", { name: "Lima" }));
    await user.click(within(dialog).getByRole("radio", { name: "Suave" }));
    expect(within(dialog).getByRole("radio", { name: "Escuro" })).toBeChecked();
    expect(JSON.parse(localStorage.getItem(PREFS_KEY)!)).toMatchObject({ theme: "dark", accent: "lima", motion: "reduced" });
    expect(document.documentElement.dataset.theme).toBe("dark");
    await user.click(within(dialog).getByRole("button", { name: "Restaurar padrão" }));
    expect(within(within(dialog).getByRole("group", { name: "Tema" })).getByRole("radio", { name: "Automático" })).toBeChecked();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "Aparência" })).not.toBeInTheDocument();
  });
});
