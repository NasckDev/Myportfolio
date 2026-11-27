import { describe, expect, it, vi } from "vitest";
import { jsonResponse } from "@/test/http";
import {
  CONTACT_LIMITS,
  contactMessage,
  contactSubject,
  isEmail,
  mailtoHref,
  SEND_INTERVAL_MS,
  SEND_SESSION_MAX,
  sendCooldown,
  sendViaFormSubmit,
  validateContact,
  type ContactInput,
} from "./contact";

const base: ContactInput = { name: "", email: "", company: "", role: "front-end sênior", roleOther: "", mode: "remota", modeOther: "" };

describe("gerador de texto do contato", () => {
  it("monta a mensagem padrão sem empresa nem assinatura", () => {
    expect(contactMessage(base)).toBe(
      "Olá, Alexandre.\n\nTemos uma oportunidade de front-end sênior, remota. Conheci seu portfólio e gostaria de apresentar a vaga.\n\nPodemos agendar uma conversa?",
    );
    expect(contactSubject(base)).toBe("Vaga de front-end sênior");
  });

  it("usa empresa, vaga e modelo personalizados e assina com nome e e-mail", () => {
    const msg = contactMessage({ ...base, company: " Acme ", role: "outra", roleOther: "staff engineer", mode: "outro", modeOther: "presencial em Campinas", name: "Ana", email: "ana@acme.com" });
    expect(msg).toContain("Represento a Acme e temos uma oportunidade de staff engineer, presencial em Campinas.");
    expect(msg.endsWith("Podemos agendar uma conversa?\n\nAna\nana@acme.com")).toBe(true);
    expect(contactSubject({ ...base, company: "Acme", role: "outra", roleOther: "" })).toBe("Vaga na Acme");
  });

  it("valida e-mail e codifica o link mailto", () => {
    expect(isEmail("ana@acme.com")).toBe(true);
    expect(isEmail("ana@acme")).toBe(false);
    expect(isEmail(" ")).toBe(false);
    expect(mailtoHref("x@y.com", "Vaga & co", "Olá\nmundo")).toBe("mailto:x@y.com?subject=Vaga%20%26%20co&body=Ol%C3%A1%0Amundo");
  });
});

describe("envio automático", () => {
  const ok = { name: "Ana", email: "ana@acme.com", company: "Acme", message: "Olá, temos uma vaga." };

  it("valida e-mail, mensagem e tamanhos máximos na ordem dos campos", () => {
    expect(validateContact(ok)).toEqual([]);
    expect(validateContact({ ...ok, email: "ana@", message: "oi" }).map((p) => p.field)).toEqual(["email", "message"]);
    expect(validateContact({ ...ok, name: "a".repeat(CONTACT_LIMITS.name + 1) })[0]?.field).toBe("name");
    expect(validateContact({ ...ok, company: "a".repeat(CONTACT_LIMITS.company + 1) })[0]?.field).toBe("company");
    expect(validateContact({ ...ok, message: "a".repeat(CONTACT_LIMITS.message + 1) })[0]?.text).toMatch(/até 5000/);
  });

  it("libera um envio por intervalo e bloqueia depois do máximo da sessão", () => {
    expect(sendCooldown([], 0)).toBe(0);
    expect(sendCooldown([1000], 1000 + 10_000)).toBe(SEND_INTERVAL_MS - 10_000);
    expect(sendCooldown([1000], 1000 + SEND_INTERVAL_MS)).toBe(0);
    expect(sendCooldown(Array.from({ length: SEND_SESSION_MAX }, (_, i) => i), 1e12)).toBe(Infinity);
  });

  const payload = { ...ok, subject: "Vaga\r\nna Acme" };

  it("envia ao FormSubmit em JSON com assunto, resposta ao visitante e sem quebras no assunto", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse({ success: "true", message: "The form was submitted successfully." }));
    expect(await sendViaFormSubmit("dono@site.com", payload)).toBe("ok");
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("https://formsubmit.co/ajax/dono@site.com");
    expect(init?.method).toBe("POST");
    expect(init?.headers).toMatchObject({ "Content-Type": "application/json", Accept: "application/json" });
    expect(JSON.parse(String(init?.body))).toMatchObject({
      name: "Ana",
      email: "ana@acme.com",
      company: "Acme",
      _subject: "[Portfólio] Vaga na Acme",
      _replyto: "ana@acme.com",
      _template: "table",
    });
  });

  it("distingue formulário ainda não ativado de falha", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ success: "false", message: "This form needs Activation. We've sent you an email containing an 'Activate Form' link." }));
    expect(await sendViaFormSubmit("dono@site.com", payload)).toBe("activation");
    vi.mocked(fetch).mockResolvedValueOnce(new Response("erro", { status: 500 }));
    expect(await sendViaFormSubmit("dono@site.com", payload)).toBe("failed");
    vi.mocked(fetch).mockRejectedValueOnce(new TypeError("Failed to fetch"));
    expect(await sendViaFormSubmit("dono@site.com", payload)).toBe("failed");
  });
});
