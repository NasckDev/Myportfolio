import type { BrowserContext, Page } from "@playwright/test";

export const ROUTES = ["/", "/projetos", "/projeto/juntos", "/projeto/coverlist", "/design", "/codigo", "/jogo", "/habilidades", "/experiencia", "/contato", "/nao-existe"] as const;

export const VIEWPORTS = [
  { name: "celular", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 900 },
] as const;

/** Sem Functions no `vite preview`: a API de visitas responde "indisponível", como sem Redis. */
export async function prepare(ctx: BrowserContext, { skipBoot = true } = {}) {
  await ctx.route("**/api/**", (r) => r.fulfill({ status: 200, contentType: "application/json", body: '{"available":false}' }));
  if (skipBoot) await ctx.addInitScript(() => sessionStorage.setItem("nasck-boot", "1"));
}

/** Coleta erros de console e exceções da página. */
export function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
}

/** Rola a página inteira para disparar imagens preguiçosas e revelações. */
export async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
    }
    window.scrollTo(0, 0);
  });
}
