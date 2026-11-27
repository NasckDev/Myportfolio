import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { jsonResponse } from "@/test/http";
import { renderWithApp } from "@/test/render";
import ContactPage from "./ContactPage";

describe("Contato", () => {
  it("gera o texto pelas opções, deixa editar e refazer", async () => {
    const { user } = renderWithApp(<ContactPage />);
    const msg = screen.getByRole("textbox", { name: "Mensagem" });
    expect((msg as HTMLTextAreaElement).value).toContain("engenharia de software sênior, remota");

    await user.type(screen.getByRole("textbox", { name: "Sua empresa" }), "Acme");
    await user.click(screen.getByRole("radio", { name: "Tech lead" }));
    expect((msg as HTMLTextAreaElement).value).toContain("Represento a Acme e temos uma oportunidade de tech lead");

    await user.click(screen.getByRole("radio", { name: "Outra" }));
    await user.type(screen.getByRole("textbox", { name: "Qual vaga?" }), "staff");
    expect((msg as HTMLTextAreaElement).value).toContain("oportunidade de staff");

    await user.type(msg, " Obrigado.");
    expect(screen.getByRole("button", { name: "Refazer o texto" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Refazer o texto" }));
    expect((msg as HTMLTextAreaElement).value).not.toContain("Obrigado");
  });

  it("mantém Abrir no meu e-mail e Copiar ao lado do envio automático", () => {
    renderWithApp(<ContactPage />);
    expect(screen.getByRole("button", { name: "Enviar mensagem" })).toHaveAccessibleDescription(/direto para o meu e-mail/);
    const open = screen.getByRole("link", { name: "Abrir no meu e-mail" });
    expect(open.getAttribute("href")).toMatch(/^mailto:aleh\.dnascimento@gmail\.com\?subject=Vaga/);
    expect(screen.getByRole("button", { name: "Copiar" })).toBeInTheDocument();
  });

  it("envia automaticamente pelo FormSubmit e anuncia o sucesso", async () => {
    const { user } = renderWithApp(<ContactPage />);
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ success: "true" }));
    await user.type(screen.getByRole("textbox", { name: "Seu e-mail" }), "ana@acme.com");
    await user.click(screen.getByRole("button", { name: "Enviar mensagem" }));
    expect(await screen.findByText("Mensagem enviada. A resposta chega no e-mail informado.")).toHaveAttribute("role", "status");
    const call = vi.mocked(fetch).mock.calls.find(([u]) => String(u).includes("formsubmit.co"));
    expect(call?.[0]).toBe("https://formsubmit.co/ajax/aleh.dnascimento@gmail.com");
    expect(JSON.parse(String(call?.[1]?.body))).toMatchObject({ email: "ana@acme.com", _replyto: "ana@acme.com" });

    await user.click(screen.getByRole("button", { name: "Enviar mensagem" }));
    expect(await screen.findByText(/Aguarde \d+ s/)).toBeInTheDocument();
    expect(vi.mocked(fetch).mock.calls.filter(([u]) => String(u).includes("formsubmit.co"))).toHaveLength(1);
  });

  it("valida o e-mail antes de enviar, sem chamar o serviço", async () => {
    const { user } = renderWithApp(<ContactPage />);
    const mail = screen.getByRole("textbox", { name: "Seu e-mail" });
    await user.type(mail, "ana@");
    await user.click(screen.getByRole("button", { name: "Enviar mensagem" }));
    expect(await screen.findByText("Informe um e-mail válido para a resposta.")).toBeInTheDocument();
    expect(mail).toHaveFocus();
    expect(mail).toHaveAttribute("aria-invalid", "true");
    expect(vi.mocked(fetch).mock.calls.some(([u]) => String(u).includes("formsubmit.co"))).toBe(false);
  });

  it("sem ativação ou com falha, sugere o outro botão sem erro técnico", async () => {
    const { user } = renderWithApp(<ContactPage />);
    await user.type(screen.getByRole("textbox", { name: "Seu e-mail" }), "ana@acme.com");
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ success: "false", message: "This form needs Activation." }));
    await user.click(screen.getByRole("button", { name: "Enviar mensagem" }));
    expect(await screen.findByText(/envio automático ainda está sendo ativado/)).toHaveTextContent("Abrir no meu e-mail");

    sessionStorage.clear();
    vi.mocked(fetch).mockRejectedValueOnce(new TypeError("Failed to fetch"));
    await user.click(screen.getByRole("button", { name: "Enviar mensagem" }));
    const status = await screen.findByText(/Não foi possível enviar agora/);
    expect(status).toHaveTextContent("Abrir no meu e-mail");
    expect(status).not.toHaveTextContent(/fetch|TypeError/);
  });

  it("tem armadilha para robôs fora da navegação por teclado", () => {
    const { container } = renderWithApp(<ContactPage />);
    const hp = container.querySelector(".hp input");
    expect(hp).toHaveAttribute("tabindex", "-1");
    expect(hp?.closest("[aria-hidden='true']")).not.toBeNull();
  });

  it("com a armadilha preenchida, finge sucesso e não envia nada", async () => {
    const { user, container } = renderWithApp(<ContactPage />);
    fireEvent.change(container.querySelector(".hp input")!, { target: { value: "spam" } });
    await user.type(screen.getByRole("textbox", { name: "Seu e-mail" }), "bot@spam.com");
    await user.click(screen.getByRole("button", { name: "Enviar mensagem" }));
    expect(await screen.findByText("Mensagem enviada.")).toBeInTheDocument();
    expect(vi.mocked(fetch).mock.calls.some(([u]) => String(u).includes("formsubmit.co"))).toBe(false);
  });
});
