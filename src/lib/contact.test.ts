import { describe, expect, it } from "vitest";
import { contactMessage, contactSubject, isEmail, mailtoHref, type ContactInput } from "./contact";

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
