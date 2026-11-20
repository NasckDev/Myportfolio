import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Cases } from "@/components/sections/Cases";
import { cases } from "@/data/portfolio";
import { renderWithPortfolio } from "@/test/render";

/**
 * O card inteiro é o contêiner [data-spot] em volta do título do case.
 * Busca pelo texto do <h3> (e não por role) porque os cases extras ficam em um bloco
 * aria-hidden + visibility:hidden até "Ver mais projetos", e aí o nome acessível é vazio.
 */
function cardOf(name: string): HTMLElement {
  const card = screen.getByText(name, { selector: "h3" }).closest<HTMLElement>("[data-spot]");
  if (!card) throw new Error(`card do ${name} não encontrado`);
  return card;
}

describe("Cases", () => {
  it("marca cada projeto com demo como 'Demo no ar', sem selo de construção, com a versão 1.0 prevista", () => {
    // Arrange
    const comDemo = cases.filter((c) => c.demoUrl && c.eta);
    expect(comDemo.length).toBeGreaterThan(0);

    // Act
    renderWithPortfolio(<Cases />);

    // Assert
    for (const c of comDemo) {
      const card = cardOf(c.name);
      expect(within(card).getAllByText("Demo no ar").length).toBeGreaterThan(0);
      expect(within(card).getByText(`versão 1.0 em ${c.eta?.toLowerCase()}`)).toBeInTheDocument();
      expect(within(card).queryByText("Em construção")).not.toBeInTheDocument();
      // Pelo texto: nos cases extras (bloco aria-hidden até "Ver mais projetos") o nome acessível fica vazio.
      expect(within(card).getByText("Ver a demo", { selector: "button" })).toBeInTheDocument();
    }
  });

  it("mostra o case já publicado como 'Publicado', sem selo de construção", () => {
    renderWithPortfolio(<Cases />);

    const card = cardOf("Myportfolio");

    expect(within(card).getByText("Publicado")).toBeInTheDocument();
    expect(within(card).queryByText("Em construção")).not.toBeInTheDocument();
  });

  it("filtrar por 'Angular' destaca o OpsFlow e esmaece os cases sem a tag", async () => {
    // Arrange
    const { user } = renderWithPortfolio(<Cases />);
    const angular = screen.getByRole("button", { name: "Angular" });

    // Act
    await user.click(angular);

    // Assert
    expect(angular).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Todos" })).toHaveAttribute("aria-pressed", "false");
    expect(cardOf("OpsFlow").style.opacity).toBe("1");
    expect(cardOf("InsightHub").style.opacity).toBe("0.35");
  });

  it("'Ver mais projetos' revela os cases extras e passa a oferecer 'Mostrar menos'", async () => {
    const { user } = renderWithPortfolio(<Cases />);
    const toggle = screen.getByRole("button", { name: /Ver mais projetos/ });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    await user.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(toggle).toHaveTextContent("Mostrar menos");
    expect(cardOf("Myportfolio").closest("[aria-hidden]")).toHaveAttribute("aria-hidden", "false");
  });
});
