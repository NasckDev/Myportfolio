import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ALL_SKILLS, JOBS } from "@/data/content";
import { PROJECTS } from "@/data/projects";
import { NAV } from "@/data/routes";
import { search } from "@/lib/search";
import { renderAppAt } from "@/test/render";
import { buildActions, DEFAULT_GROUPS, GROUPS } from "./paletteIndex";

const actions = buildActions(vi.fn(), vi.fn());
const top = (q: string) => search(actions, q, DEFAULT_GROUPS);

describe("índice da busca", () => {
  it("é montado a partir dos dados: toda página, projeto, habilidade e experiência entra", () => {
    const labels = (group: string) => actions.filter((a) => a.group === group).map((a) => a.label);
    expect(labels(GROUPS.pages)).toEqual(NAV.map((n) => n.label));
    expect(labels(GROUPS.projects)).toEqual(PROJECTS.map((p) => p.name));
    expect(labels(GROUPS.skills)).toEqual([...ALL_SKILLS]);
    expect(labels(GROUPS.jobs)).toEqual(JOBS.map((j) => j.company));
    for (const g of [GROUPS.code, GROUPS.design, GROUPS.game, GROUPS.edu]) expect(labels(g).length).toBeGreaterThan(0);
  });

  it("cada projeto é o primeiro resultado do próprio nome", () => {
    for (const p of PROJECTS) expect(top(p.name)[0]?.hits[0]?.entry.label).toBe(p.name);
  });

  it("sem busca, mostra páginas, projetos e ações", () => {
    expect(top("").map((g) => g.group)).toEqual([GROUPS.pages, GROUPS.projects, GROUPS.actions]);
  });

  it("'react' traz a habilidade primeiro e explica os projetos pela stack", () => {
    const groups = top("react");
    expect(groups[0]?.group).toBe(GROUPS.skills);
    expect(groups[0]?.hits[0]?.entry.label).toBe("React");
    expect(groups.map((g) => g.group)).toEqual(expect.arrayContaining([GROUPS.projects, GROUPS.jobs]));
    const juntos = groups.flatMap((g) => g.hits).find((h) => h.entry.label === "Juntos");
    expect(juntos?.why?.text).toMatch(/React 19/);
  });

  it("acha experiências e formação por empresa, cliente e sinônimo", () => {
    expect(top("ey")[0]?.group).toBe(GROUPS.jobs);
    expect(top("vivo")[0]?.hits[0]?.entry.label).toMatch(/Vivo/);
    const ia = top("ia");
    expect(ia.find((g) => g.group === GROUPS.skills)?.hits[0]?.entry.label).toMatch(/ IA |^IA/);
    expect(ia.flatMap((g) => g.hits).map((h) => h.entry.label)).toEqual(expect.arrayContaining(["InsightHub", "MindMiners"]));
    expect(top("ts")[0]?.hits[0]?.entry.label).toBe("TypeScript");
    expect(top("curriculo")[0]?.group).toBe(GROUPS.actions);
  });
});

describe("busca (Ctrl K)", () => {
  it("abre com Ctrl K, agrupa, anuncia a contagem, navega com as setas e abre com Enter", async () => {
    const { user } = renderAppAt("/");
    await screen.findByRole("heading", { level: 1, name: "Alexandre Diogo" });
    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    const dialog = await screen.findByRole("dialog", { name: "Buscar e navegar" });
    const input = within(dialog).getByRole("combobox");
    expect(input).toHaveFocus();

    await user.type(input, "juntos");
    const options = within(dialog).getAllByRole("option");
    expect(options[0]).toHaveTextContent("Juntos");
    expect(options[0]).toHaveAttribute("aria-selected", "true");
    expect(input).toHaveAttribute("aria-activedescendant", options[0]!.id);
    expect(within(dialog).getByRole("group", { name: "Projetos" })).toContainElement(options[0]!);
    expect(options[0]!.querySelector("mark")).toHaveTextContent("Juntos");
    expect(within(dialog).getByText(/^\d+ resultados?$/)).toHaveAttribute("role", "status");

    await user.keyboard("{ArrowDown}");
    expect(within(dialog).getAllByRole("option")[1]).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{ArrowUp}{Enter}");

    expect(await screen.findByRole("heading", { level: 1, name: "Juntos" })).toBeInTheDocument();
    expect(window.location.pathname).toBe("/projeto/juntos");
    expect(screen.queryByRole("dialog", { name: "Buscar e navegar" })).not.toBeInTheDocument();
  });

  it("mostra por que o resultado casou", async () => {
    const { user } = renderAppAt("/");
    await screen.findByRole("heading", { level: 1, name: "Alexandre Diogo" });
    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    const dialog = await screen.findByRole("dialog", { name: "Buscar e navegar" });
    await user.type(within(dialog).getByRole("combobox"), "react");
    expect(within(dialog).getAllByRole("option")[0]).toHaveTextContent(/^React/);
    const juntos = within(within(dialog).getByRole("group", { name: "Projetos" })).getAllByRole("option")[0]!;
    expect(juntos.querySelector(".pal-why")).toHaveTextContent(/React 19/);
  });

  it("estado vazio sugere buscas, anuncia nenhum resultado e fecha com Esc", async () => {
    const { user } = renderAppAt("/");
    await screen.findByRole("heading", { level: 1, name: "Alexandre Diogo" });
    await user.click(screen.getAllByRole("button", { name: "Buscar e navegar" })[0]!);
    const dialog = await screen.findByRole("dialog", { name: "Buscar e navegar" });
    const input = within(dialog).getByRole("combobox");
    await user.type(input, "zzzz");
    expect(within(dialog).getByText(/Nada encontrado/)).toBeInTheDocument();
    expect(within(dialog).getByText("Nenhum resultado")).toHaveAttribute("role", "status");
    expect(input).toHaveAttribute("aria-expanded", "false");

    await user.click(within(dialog).getByRole("button", { name: "IA" }));
    expect(input).toHaveValue("IA");
    expect(input).toHaveFocus();
    expect(within(dialog).getAllByRole("option").length).toBeGreaterThan(0);

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "Buscar e navegar" })).not.toBeInTheDocument();
  });
});
