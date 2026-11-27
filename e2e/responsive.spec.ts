import { expect, test, type Page } from "@playwright/test";
import { prepare, ROUTES, scrollThrough } from "./helpers";

const WIDTHS = [320, 360, 375, 390, 414, 768, 834, 1024, 1180, 1280, 1366, 1440, 1920] as const;

/**
 * Elementos visíveis que passam da viewport na horizontal. Ignora o que está dentro de um contêiner
 * que corta ou rola na horizontal (faixa de tecnologias, galeria, código), porque ali nada vaza da tela.
 */
async function overflowing(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const clipped = (el: Element): boolean => {
      for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
        const ox = getComputedStyle(p).overflowX;
        if (ox !== "visible") return true;
      }
      return false;
    };
    const out: string[] = [];
    for (const el of Array.from(document.querySelectorAll("body *"))) {
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden" || Number(cs.opacity) === 0) continue;
      if (el.closest(".sr, dialog:not([open]), #peek, .skip")) continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if ((r.right > vw + 1 || r.left < -1) && !clipped(el)) {
        const id = el.id ? `#${el.id}` : "";
        const cls = typeof el.className === "string" && el.className ? `.${el.className.trim().split(/\s+/).join(".")}` : "";
        out.push(`${el.tagName.toLowerCase()}${id}${cls} [${Math.round(r.left)}, ${Math.round(r.right)}] vw=${vw}`);
      }
    }
    return out.slice(0, 8);
  });
}

for (const scheme of ["light", "dark"] as const) {
  for (const width of WIDTHS) {
    test(`${width}px, tema ${scheme === "light" ? "claro" : "escuro"}: nenhuma rota com rolagem horizontal nem elemento para fora da tela`, async ({ browser }) => {
      test.setTimeout(180_000);
      const ctx = await browser.newContext({ viewport: { width, height: width < 700 ? 800 : 900 }, colorScheme: scheme, reducedMotion: "reduce" });
      await prepare(ctx);
      const page = await ctx.newPage();
      const problems: string[] = [];
      for (const route of ROUTES) {
        await page.goto(route);
        await expect(page.locator("main#conteudo h1").first()).toBeVisible();
        await scrollThrough(page);
        const sw = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
        if (sw[0]! > sw[1]!) problems.push(`${route}: scrollWidth ${sw[0]} > clientWidth ${sw[1]}`);
        for (const o of await overflowing(page)) problems.push(`${route}: ${o}`);
      }
      await ctx.close();
      expect(problems).toEqual([]);
    });
  }
}

const SHORT_SCREENS = [[1920, 1080], [1440, 900], [1536, 864], [1366, 768], [1280, 720], [1280, 600], [1024, 600], [960, 500]] as const;

for (const [width, height] of SHORT_SCREENS) {
  test(`${width}x${height}: a barra lateral cabe inteira, sem cortar item nem rodapé`, async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce" });
    await prepare(ctx);
    const page = await ctx.newPage();
    const problems: string[] = [];
    for (const route of ["/", "/projetos", "/projeto/fiscotrack"]) {
      await page.goto(route);
      await expect(page.locator("main#conteudo h1").first()).toBeVisible();
      const [client, scroll] = await page.locator(".side-in").evaluate((el) => [el.clientHeight, el.scrollHeight]);
      if (scroll! > client!) problems.push(`${route}: ${scroll} > ${client}`);
    }
    await ctx.close();
    expect(problems).toEqual([]);
  });
}
