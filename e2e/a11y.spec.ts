import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { collectErrors, prepare, ROUTES, scrollThrough, VIEWPORTS } from "./helpers";

for (const vp of VIEWPORTS) {
  for (const scheme of ["light", "dark"] as const) {
    test.describe(`${vp.name} ${vp.width}px, tema ${scheme === "light" ? "claro" : "escuro"}`, () => {
      test.use({ viewport: { width: vp.width, height: vp.height }, colorScheme: scheme, reducedMotion: "reduce" });

      for (const route of ROUTES) {
        test(`${route}: sem violações axe sérias/críticas e sem erros no console`, async ({ page, context }) => {
          await prepare(context);
          const errors = collectErrors(page);
          const res = await page.goto(route);
          // Na Vercel a rota desconhecida recebe 404.html (status 404); o `vite preview` devolve o app (200).
          expect(res?.status(), "status HTTP").toBeLessThan(route === "/nao-existe" ? 500 : 300);
          await expect(page.locator("main#conteudo h1").first()).toBeVisible();
          await scrollThrough(page);
          const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
          const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
          expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 4).join(" | ")}`)).toEqual([]);
          expect(errors).toEqual([]);
        });
      }
    });
  }
}
