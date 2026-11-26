import { expect, test } from "@playwright/test";
import { collectErrors, prepare } from "./helpers";

test.describe("navegação e teclado (1440 px)", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("cada rota real responde com o próprio título e as demos convivem com /projetos", async ({ page, context, request }) => {
    await prepare(context);
    const pages: [string, RegExp][] = [
      ["/", /Alexandre Diogo, engenheiro de software/],
      ["/projetos", /^Projetos \|/],
      ["/projeto/garrafao", /^Garrafão, estudo de caso/],
      ["/design", /^Design \|/],
      ["/contato", /^Contato \|/],
    ];
    for (const [path, title] of pages) {
      await page.goto(path);
      await expect(page).toHaveTitle(title);
      expect(await page.locator('link[rel="canonical"]').getAttribute("href")).toMatch(/^https:\/\/nasck\.vercel\.app/);
    }
    const demo = await request.get("/projetos/insighthub/");
    expect(demo.status()).toBe(200);
    expect(await demo.text()).not.toContain('class="static-snapshot"');
    const listing = await request.get("/projetos/");
    expect(await listing.text()).toContain('class="static-snapshot"');
  });

  test("Tab começa no skip link, que leva o foco ao conteúdo", async ({ page, context }) => {
    await prepare(context);
    await page.goto("/habilidades");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Pular para o conteúdo" });
    await expect(skip).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("main#conteudo")).toBeFocused();
    await expect(page.getByRole("heading", { level: 1, name: "Habilidades" })).toBeVisible();
  });

  test("Ctrl K abre a busca, setas escolhem, Enter abre e Esc fecha", async ({ page, context }) => {
    await prepare(context);
    const errors = collectErrors(page);
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.keyboard.press("Control+k");
    const dialog = page.getByRole("dialog", { name: "Buscar e navegar" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("combobox")).toBeFocused();
    await page.keyboard.type("cover");
    await expect(dialog.getByRole("option").first()).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/projeto\/coverlist$/);
    await expect(page.getByRole("heading", { level: 1, name: "Coverlist" })).toBeVisible();
    await expect(page.locator("main#conteudo")).toBeFocused();

    await page.keyboard.press("Control+k");
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    expect(errors).toEqual([]);
  });

  test("Aparência: escolha persiste depois de recarregar e o diálogo fecha com Esc", async ({ page, context }) => {
    await prepare(context);
    await page.goto("/contato");
    await page.getByRole("button", { name: "Aparência do site" }).click();
    const dialog = page.getByRole("dialog", { name: "Aparência" });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("radio", { name: "Escuro" }).check({ force: true });
    await dialog.getByRole("radio", { name: "Cobalto" }).check({ force: true });
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--accent").trim())).toBe("#2D5BFF");
  });

  test("voltar restaura a rolagem e as setas trocam de estudo de caso", async ({ page, context }) => {
    await prepare(context);
    await page.goto("/projetos");
    const card = page.locator('.pcard[data-id="opsflow"]');
    await expect(card).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, 900));
    await card.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const before = await page.evaluate(() => window.scrollY);
    expect(before).toBeGreaterThan(300);
    await card.click();
    await expect(page).toHaveURL(/\/projeto\/opsflow$/);
    await expect(page.getByRole("heading", { level: 1, name: "OpsFlow" })).toBeVisible();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(50);
    await page.keyboard.press("ArrowRight");
    await expect(page).toHaveURL(/\/projeto\/fiscotrack$/);
    await page.goBack();
    await page.goBack();
    await expect(page).toHaveURL(/\/projetos$/);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(before - 80);
  });

  test("lightbox do estudo de caso abre, troca com as setas e fecha com Esc", async ({ page, context }) => {
    await prepare(context);
    await page.goto("/projeto/opsflow");
    await page.getByRole("button", { name: /^Ampliar: Quadro kanban/ }).click();
    const lb = page.getByRole("dialog", { name: "Imagem ampliada" });
    await expect(lb).toBeVisible();
    await expect(lb.getByText(/2 de 4/)).toBeVisible();
    await lb.getByRole("button", { name: "Próxima imagem" }).click();
    await expect(lb.getByText(/3 de 4/)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(lb).toBeHidden();
  });

  test("hover no cartão toca o vídeo quando o projeto tem prévia; sem vídeo, fica a imagem", async ({ page, context }) => {
    await prepare(context);
    await page.goto("/projetos");
    const videos = page.locator(".pcard video");
    const count = await videos.count();
    if (count === 0) {
      test.info().annotations.push({ type: "observação", description: "Nenhum projeto com preview.mp4/.webm ainda (meta.json com video:false)." });
      await page.locator('.pcard[data-id="insighthub"]').hover();
      await expect(page.locator('.pcard[data-id="insighthub"] .cv-screen img')).toBeVisible();
      return;
    }
    const card = page.locator(".pcard", { has: page.locator("video") }).first();
    const video = card.locator("video");
    expect(await video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
    await card.hover();
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => !v.paused)).toBe(true);
    await page.mouse.move(5, 5);
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused && v.currentTime === 0)).toBe(true);
  });
});

test.describe("celular (390 px)", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("dock inferior navega e a folha Mais abre as outras páginas", async ({ page, context }) => {
    await prepare(context);
    await page.goto("/");
    const dock = page.getByRole("navigation", { name: "Páginas (atalhos)" });
    await expect(dock).toBeVisible();
    await expect(page.locator(".side")).toBeHidden();
    await dock.getByRole("link", { name: "Projetos" }).click();
    await expect(page).toHaveURL(/\/projetos$/);
    await expect(dock.getByRole("link", { name: "Projetos" })).toHaveAttribute("aria-current", "page");
    await dock.getByRole("button", { name: "Mais" }).click();
    const more = page.getByRole("dialog", { name: "Mais páginas" });
    await expect(more).toBeVisible();
    await more.getByRole("link", { name: "Experiência" }).click();
    await expect(page).toHaveURL(/\/experiencia$/);
    await expect(more).toBeHidden();
    await expect(dock.getByRole("button", { name: "Mais" })).toHaveAttribute("aria-current", "page");
  });

  test("sem prévia em vídeo em tela de toque", async ({ page, context }) => {
    await prepare(context);
    await page.goto("/projetos");
    await expect(page.locator(".pcard video")).toHaveCount(0);
  });
});

test.describe("abertura", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("aparece só na primeira visita da sessão e pode ser pulada com uma tecla", async ({ page, context }) => {
    await prepare(context, { skipBoot: false });
    await page.goto("/");
    const boot = page.getByTestId("boot");
    await expect(boot).toBeVisible();
    await page.keyboard.press("Space");
    await expect(boot).toBeHidden({ timeout: 3000 });
    await page.goto("/projetos");
    await expect(page.getByTestId("boot")).toHaveCount(0);
  });

  test("não aparece com prefers-reduced-motion", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    await prepare(ctx, { skipBoot: false });
    const page = await ctx.newPage();
    await page.goto("http://localhost:5181/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByTestId("boot")).toHaveCount(0);
    await ctx.close();
  });
});
