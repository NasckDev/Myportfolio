import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PROJECTS } from "@/data/projects";
import { PREFS_KEY } from "@/lib/prefs";
import { renderWithApp } from "@/test/render";
import ProjectsPage from "./ProjectsPage";

describe("Projetos", () => {
  it("lista todos os projetos e filtra por tecnologia", async () => {
    const { user } = renderWithApp(<ProjectsPage />);
    const grid = screen.getByTestId("project-grid");
    expect(within(grid).getAllByRole("link")).toHaveLength(PROJECTS.length);
    expect(screen.getByTestId("result")).toHaveTextContent(`${PROJECTS.length} de ${PROJECTS.length} projetos`);

    await user.click(screen.getByRole("button", { name: /^Angular/ }));
    const filtered = within(screen.getByTestId("project-grid")).getAllByRole("link");
    expect(filtered.map((a) => a.getAttribute("data-id"))).toEqual(["opsflow", "nasckui"]);
    expect(screen.getByRole("button", { name: /^Angular/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("result")).toHaveTextContent("2 de 8 projetos com Angular");
  });

  it("tem o filtro de APIs públicas com Coverlist e Garrafão", async () => {
    const { user } = renderWithApp(<ProjectsPage />);
    await user.click(screen.getByRole("button", { name: /^APIs públicas/ }));
    const ids = within(screen.getByTestId("project-grid"))
      .getAllByRole("link")
      .map((a) => a.getAttribute("data-id"));
    expect(ids).toEqual(["coverlist", "garrafao"]);
  });

  it("alterna grade e lista e guarda a escolha", async () => {
    const { user } = renderWithApp(<ProjectsPage />);
    await user.click(screen.getByRole("button", { name: "Ver em lista" }));
    expect(screen.queryByTestId("project-grid")).not.toBeInTheDocument();
    expect(within(screen.getByTestId("project-list")).getAllByRole("link")).toHaveLength(PROJECTS.length);
    expect(screen.getByRole("button", { name: "Ver em lista" })).toHaveAttribute("aria-pressed", "true");
    expect(JSON.parse(localStorage.getItem(PREFS_KEY)!).plist).toBe("list");
    await user.click(screen.getByRole("button", { name: "Ver em grade" }));
    expect(screen.getByTestId("project-grid")).toBeInTheDocument();
  });

  it("cada cartão leva ao estudo de caso pelo caminho real", () => {
    renderWithApp(<ProjectsPage />);
    const card = within(screen.getByTestId("project-grid")).getAllByRole("link")[0]!;
    expect(card).toHaveAttribute("href", "/projeto/juntos");
  });
});
