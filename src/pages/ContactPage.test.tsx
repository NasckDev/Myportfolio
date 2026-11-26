import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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

  it("sem chave do Web3Forms, não mostra Enviar e oferece e-mail e copiar", () => {
    renderWithApp(<ContactPage />);
    expect(screen.queryByRole("button", { name: /Enviar mensagem/ })).not.toBeInTheDocument();
    const open = screen.getByRole("link", { name: "Abrir no meu e-mail" });
    expect(open.getAttribute("href")).toMatch(/^mailto:aleh\.dnascimento@gmail\.com\?subject=Vaga/);
    expect(screen.getByRole("button", { name: "Copiar" })).toBeInTheDocument();
  });

  it("tem armadilha para robôs fora da navegação por teclado", () => {
    const { container } = renderWithApp(<ContactPage />);
    const hp = container.querySelector(".hp input");
    expect(hp).toHaveAttribute("tabindex", "-1");
    expect(hp?.closest("[aria-hidden='true']")).not.toBeNull();
  });
});
