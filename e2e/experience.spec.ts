import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { collectErrors, prepare, VIEWPORTS } from "./helpers";

for (const vp of VIEWPORTS) {
  for (const scheme of ["light", "dark"] as const) {
    test.describe(`experiência detalhada, ${vp.name} ${vp.width}px, tema ${scheme === "light" ? "claro" : "escuro"}`, () => {
      test.use({ viewport: { width: vp.width, height: vp.height }, colorScheme: scheme, reducedMotion: "reduce" });

      test("logos carregam, o diálogo abre pelo teclado, passa no axe e Esc devolve o foco", async ({ page, context }) => {
        await prepare(context);
        const errors = collectErrors(page);
        await page.goto("/experiencia");
        const logos = page.locator(".xp .mark img");
        await expect(logos).toHaveCount(7);
        for (const img of await logos.all()) {
          await img.scrollIntoViewIfNeeded();
          await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
        }

        const opener = page.getByRole("button", { name: "Ver o que eu fazia: EY, projeto Vivo (Telefônica), jul/2023 a ago/2025" });
        await opener.focus();
        await page.keyboard.press("Enter");
        const dialog = page.getByRole("dialog", { name: "EY, projeto Vivo (Telefônica)" });
        await expect(dialog).toBeVisible();
        await expect(dialog.getByRole("heading", { name: "O que eu fazia" })).toBeVisible();
        await expect(dialog.getByRole("button", { name: "Fechar" }).first()).toBeFocused();
        const box = await dialog.boundingBox();
        expect(box!.x).toBeGreaterThanOrEqual(0);
        expect(box!.x + box!.width).toBeLessThanOrEqual(vp.width);

        const results = await new AxeBuilder({ page }).include("#job").withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
        expect(results.violations.map((v) => v.id)).toEqual([]);

        await page.keyboard.press("Escape");
        await expect(dialog).toBeHidden();
        await expect(opener).toBeFocused();
        expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
        expect(errors).toEqual([]);
      });
    });
  }
}

test.describe("ligações entre Início, Habilidades e Experiência (1440 px)", () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });

  test("o cartão do Início abre a experiência certa em detalhe", async ({ page, context }) => {
    await prepare(context);
    await page.goto("/");
    await page.locator(".jobc").first().click();
    await expect(page).toHaveURL(/\/experiencia$/);
    await expect(page.getByRole("dialog", { name: "MindMiners" })).toBeVisible();
  });

  test("a habilidade MCP leva ao trabalho na MindMiners", async ({ page, context }) => {
    await prepare(context);
    await page.goto("/habilidades");
    await page.getByRole("button", { name: /^MCP \(Model Context Protocol\)/ }).click();
    const panel = page.getByTestId("xpanel");
    await expect(panel).toContainText("Grafana e no Loki");
    await panel.getByRole("link", { name: /MindMiners/ }).click();
    const dialog = page.getByRole("dialog", { name: "MindMiners" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { name: "IA no dia a dia" })).toBeVisible();
  });

  test("código: trecho tem origem com linhas, quebra de linhas e link para as linhas no GitHub", async ({ page, context }) => {
    await prepare(context);
    await page.goto("/codigo");
    await page.getByRole("tab", { name: /Regras de permissão/ }).click();
    const win = page.locator("#code-win");
    await expect(win).toContainText("linhas 71 a 107");
    await expect(win.getByRole("link", { name: "Abrir estas linhas no GitHub" })).toHaveAttribute("href", /workflow-machine\.ts#L71-L107$/);
    const wrap = win.getByRole("button", { name: "Quebrar linhas" });
    await wrap.click();
    await expect(wrap).toHaveAttribute("aria-pressed", "true");
    await expect(win.locator("pre")).toHaveClass(/wrap/);
  });
});
