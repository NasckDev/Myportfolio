import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { collectErrors, prepare } from "./helpers";

const FORMSUBMIT = "https://formsubmit.co/ajax/**";

async function fillContact(page: Page) {
  await page.goto("/contato");
  await page.getByRole("textbox", { name: "Seu nome" }).fill("Ana Souza");
  await page.getByRole("textbox", { name: "Seu e-mail" }).fill("ana@acme.com");
  await page.getByRole("textbox", { name: "Sua empresa" }).fill("Acme");
}

test.describe("Contato: envio automático", () => {
  test("envia pelo FormSubmit, mantém o mailto e anuncia o sucesso", async ({ page, context }) => {
    await prepare(context);
    const errors = collectErrors(page);
    let body: Record<string, unknown> | null = null;
    let url = "";
    await context.route(FORMSUBMIT, async (r) => {
      url = r.request().url();
      body = r.request().postDataJSON() as Record<string, unknown>;
      await r.fulfill({ status: 200, contentType: "application/json", body: '{"success":"true","message":"The form was submitted successfully."}' });
    });
    await fillContact(page);
    await expect(page.getByRole("link", { name: "Abrir no meu e-mail" })).toHaveAttribute("href", /^mailto:/);
    await page.getByRole("button", { name: "Enviar mensagem" }).click();
    await expect(page.getByText("Mensagem enviada. A resposta chega no e-mail informado.")).toBeVisible();
    expect(url).toBe("https://formsubmit.co/ajax/aleh.dnascimento@gmail.com");
    expect(body).toMatchObject({ name: "Ana Souza", email: "ana@acme.com", _replyto: "ana@acme.com", company: "Acme" });
    expect(String(body!._subject)).toMatch(/^\[Portfólio\] Vaga/);

    await page.getByRole("button", { name: "Enviar mensagem" }).click();
    await expect(page.getByText(/Aguarde \d+ s/)).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("antes da ativação ou com falha, sugere o outro botão", async ({ page, context }) => {
    await prepare(context);
    let calls = 0;
    await context.route(FORMSUBMIT, (r) => {
      calls += 1;
      return calls === 1
        ? r.fulfill({ status: 200, contentType: "application/json", body: '{"success":"false","message":"This form needs Activation."}' })
        : r.abort("failed");
    });
    await fillContact(page);
    await page.getByRole("button", { name: "Enviar mensagem" }).click();
    await expect(page.getByText(/envio automático ainda está sendo ativado/)).toContainText("Abrir no meu e-mail");
    await page.evaluate(() => sessionStorage.removeItem("nasck-contact-sends"));
    await page.getByRole("button", { name: "Enviar mensagem" }).click();
    await expect(page.getByText(/Não foi possível enviar agora/)).toContainText("Abrir no meu e-mail");
  });

  test("valida o e-mail sem chamar o serviço", async ({ page, context }) => {
    await prepare(context);
    let calls = 0;
    await context.route(FORMSUBMIT, (r) => {
      calls += 1;
      return r.abort();
    });
    await page.goto("/contato");
    const mail = page.getByRole("textbox", { name: "Seu e-mail" });
    await mail.fill("ana@");
    await page.getByRole("button", { name: "Enviar mensagem" }).click();
    await expect(page.getByText("Informe um e-mail válido para a resposta.")).toBeVisible();
    await expect(mail).toBeFocused();
    expect(calls).toBe(0);
  });
});

test.describe("Busca (Ctrl K)", () => {
  async function openPalette(page: Page) {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.keyboard.press("Control+k");
    const dialog = page.getByRole("dialog", { name: "Buscar e navegar" });
    await expect(dialog.getByRole("combobox")).toBeFocused();
    return dialog;
  }

  test("'react' traz a habilidade primeiro, agrupa por tipo e mostra o motivo", async ({ page, context }) => {
    await prepare(context);
    const dialog = await openPalette(page);
    await page.keyboard.type("react");
    await expect(dialog.getByRole("option").first()).toContainText("React");
    await expect(dialog.getByRole("option").first()).toHaveAttribute("aria-selected", "true");
    const projects = dialog.getByRole("group", { name: "Projetos" });
    await expect(projects.getByRole("option", { name: /Juntos/ })).toContainText("React 19");
    await expect(dialog.getByRole("group", { name: "Experiência" })).toBeVisible();
    await expect(dialog.getByRole("status")).toHaveText(/\d+ resultados/);

    const results = await new AxeBuilder({ page }).include("#palette").withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(results.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => v.id)).toEqual([]);
  });

  test("'ey' e 'vivo' acham a experiência e Enter abre o detalhe da empresa", async ({ page, context }) => {
    await prepare(context);
    const dialog = await openPalette(page);
    await page.keyboard.type("vivo");
    await expect(dialog.getByRole("option").first()).toContainText("Vivo");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/experiencia$/);
    await expect(page.getByRole("heading", { level: 1, name: "Experiência" })).toBeVisible();
    const job = page.getByRole("dialog", { name: /Vivo/ });
    await expect(job).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(job).toBeHidden();

    await page.keyboard.press("Control+k");
    await expect(dialog.getByRole("combobox")).toBeFocused();
    await page.keyboard.type("ey");
    await expect(dialog.getByRole("group").first()).toHaveAttribute("aria-label", "Experiência");
  });

  test("sem resultado, sugere buscas e Esc fecha", async ({ page, context }) => {
    await prepare(context);
    const dialog = await openPalette(page);
    await page.keyboard.type("zzzz");
    await expect(dialog.getByText(/Nada encontrado/)).toBeVisible();
    await expect(dialog.getByRole("status")).toHaveText("Nenhum resultado");
    await dialog.getByRole("button", { name: "IA" }).click();
    await expect(dialog.getByRole("combobox")).toHaveValue("IA");
    await expect(dialog.getByRole("option").first()).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });
});
