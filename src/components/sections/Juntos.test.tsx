import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Juntos } from "@/components/sections/Juntos";
import { juntos } from "@/data/portfolio";
import { renderWithPortfolio } from "@/test/render";

describe("Juntos", () => {
  it("mostra o título, a frase do app e os destaques", () => {
    // Arrange / Act
    renderWithPortfolio(<Juntos />);

    // Assert
    expect(screen.getByRole("heading", { level: 2, name: juntos.name })).toBeInTheDocument();
    expect(screen.getByText(juntos.tagline)).toBeInTheDocument();
    const destaques = within(screen.getByRole("list", { name: "Destaques" })).getAllByRole("listitem");
    expect(destaques).toHaveLength(juntos.highlights.length);
    for (const h of juntos.highlights) expect(screen.getByText(h.title)).toBeInTheDocument();
  });

  it("os prints do app têm texto alternativo e carregam sob demanda", () => {
    renderWithPortfolio(<Juntos />);

    for (const shot of [juntos.shots.desktop, juntos.shots.phone]) {
      const img = screen.getByAltText(shot.alt);
      expect(img).toHaveAttribute("loading", "lazy");
      expect(img).toHaveAttribute("src", shot.src);
    }
  });

  it("o link do código abre em nova aba com rel='noopener noreferrer'", () => {
    renderWithPortfolio(<Juntos />);

    const codigo = screen.getByRole("link", { name: /Ver o código no GitHub/ });

    expect(codigo).toHaveAttribute("href", juntos.repoUrl);
    expect(codigo).toHaveAttribute("target", "_blank");
    expect(codigo).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("sem appUrl não mostra 'Abrir o app'", () => {
    renderWithPortfolio(<Juntos project={{ ...juntos, appUrl: undefined }} />);

    expect(screen.queryByRole("link", { name: /Abrir o app/ })).not.toBeInTheDocument();
  });

  it("com appUrl mostra 'Abrir o app' apontando para o endereço, em nova aba e seguro", () => {
    const appUrl = "https://app.example.com";

    renderWithPortfolio(<Juntos project={{ ...juntos, appUrl }} />);

    const abrir = screen.getByRole("link", { name: /Abrir o app/ });
    expect(abrir).toHaveAttribute("href", appUrl);
    expect(abrir).toHaveAttribute("target", "_blank");
    expect(abrir).toHaveAttribute("rel", "noopener noreferrer");
  });
});
