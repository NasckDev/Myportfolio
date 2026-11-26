import { describe, expect, it } from "vitest";
import { contrastRatio as contrast } from "@/lib/contrast";
import { media } from "@/test/setup";
import { ACCENTS, applyPrefs, DEFAULT_PREFS, getPrefs, loadPrefs, PREFS_KEY, reloadPrefs, resetPrefs, setPref } from "./prefs";

describe("preferências de Aparência", () => {
  it("salva cada escolha no localStorage e aplica no <html>", () => {
    setPref("theme", "dark");
    setPref("accent", "cobalto");
    setPref("corners", "square");
    setPref("motion", "reduced");
    const saved = JSON.parse(localStorage.getItem(PREFS_KEY)!);
    expect(saved).toMatchObject({ theme: "dark", accent: "cobalto", corners: "square", motion: "reduced" });
    const root = document.documentElement;
    expect(root.dataset.theme).toBe("dark");
    expect(root.style.getPropertyValue("--accent")).toBe(ACCENTS.cobalto[0]);
    expect(root.style.getPropertyValue("--pill")).toBe("5px");
    expect(root.dataset.motion).toBe("soft");
  });

  it("recupera as escolhas salvas e ignora valores inválidos", () => {
    localStorage.setItem(PREFS_KEY, JSON.stringify({ theme: "light", accent: "roxo", motion: "full", extra: 1 }));
    expect(loadPrefs()).toEqual({ ...DEFAULT_PREFS, theme: "light", motion: "full" });
    localStorage.setItem(PREFS_KEY, "{quebrado");
    expect(loadPrefs()).toEqual(DEFAULT_PREFS);
    reloadPrefs();
    expect(getPrefs()).toEqual(DEFAULT_PREFS);
  });

  it("no automático, segue o pedido de menos movimento do sistema", () => {
    media.reduced = true;
    applyPrefs({ ...DEFAULT_PREFS });
    expect(document.documentElement.dataset.motion).toBe("soft");
    applyPrefs({ ...DEFAULT_PREFS, motion: "full" });
    expect(document.documentElement.dataset.motion).toBe("full");
  });

  it("restaurar volta ao padrão e limpa o armazenamento", () => {
    setPref("accent", "lima");
    resetPrefs();
    expect(getPrefs()).toEqual(DEFAULT_PREFS);
    expect(localStorage.getItem(PREFS_KEY)).toBeNull();
    expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
  });

  it("toda cor de destaque tem contraste AA com o texto sobre ela", () => {
    for (const [, [bg, fg, name]] of Object.entries(ACCENTS)) {
      expect(contrast(bg, fg), name).toBeGreaterThanOrEqual(4.5);
    }
  });
});

