import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { normalizePath, parseRoute } from "@/data/routes";
import { renderAppAt } from "@/test/render";

describe("parseRoute", () => {
  it("reconhece as páginas, com ou sem barra final", () => {
    expect(parseRoute("/")).toEqual({ name: "inicio", tab: "inicio" });
    expect(parseRoute("/projetos/")).toEqual({ name: "projetos", tab: "projetos" });
    expect(parseRoute("/Contato")).toEqual({ name: "contato", tab: "contato" });
    expect(normalizePath("/codigo/?x=1#a")).toBe("/codigo");
  });

  it("reconhece estudos de caso existentes e manda o resto para a 404", () => {
    expect(parseRoute("/projeto/juntos")).toEqual({ name: "projeto", tab: "projetos", projectId: "juntos" });
    expect(parseRoute("/projeto/nao-existe").name).toBe("nao-encontrada");
    expect(parseRoute("/projetos/insighthub").name).toBe("nao-encontrada");
    expect(parseRoute("/qualquer").name).toBe("nao-encontrada");
  });
});

describe("roteamento no app", () => {
  it("abre a página da URL com título e navegação marcada", async () => {
    renderAppAt("/projetos");
    expect(await screen.findByRole("heading", { level: 1, name: "Projetos" })).toBeInTheDocument();
    const nav = screen.getByRole("navigation", { name: "Páginas" });
    expect(within(nav).getByRole("link", { name: "Projetos" })).toHaveAttribute("aria-current", "page");
    expect(document.title).toBe("Projetos | Alexandre Diogo");
  });

  it("mostra a 404 para caminho desconhecido", async () => {
    renderAppAt("/nao-existe");
    expect(await screen.findByRole("heading", { level: 1, name: "Nada por aqui" })).toBeInTheDocument();
    expect(document.title).toMatch(/Página não encontrada/);
  });

  it("abre o estudo de caso pelo caminho real", async () => {
    renderAppAt("/projeto/coverlist");
    expect(await screen.findByRole("heading", { level: 1, name: "Coverlist" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Decisões de engenharia" })).toBeInTheDocument();
  });

  it("navega por link interno sem recarregar e atualiza a URL", async () => {
    const { user } = renderAppAt("/projetos");
    await screen.findByRole("heading", { level: 1, name: "Projetos" });
    const nav = screen.getByRole("navigation", { name: "Páginas" });
    await user.click(within(nav).getByRole("link", { name: "Contato" }));
    expect(await screen.findByRole("heading", { level: 1, name: "Contato" })).toBeInTheDocument();
    expect(window.location.pathname).toBe("/contato");
    expect(document.activeElement).toHaveAttribute("id", "conteudo");
  });
});
