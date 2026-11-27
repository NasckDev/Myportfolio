import { ALL_SKILLS, DESIGNS, EDU, GAME, JOBS, REPOS, SKILLS } from "@/data/content";
import { PROJECTS, projectPath } from "@/data/projects";
import { metaFor, NAV } from "@/data/routes";
import { EMAIL, LINKS } from "@/data/site";
import { SNIPPETS } from "@/data/snippets";
import type { SearchEntry } from "@/lib/search";
import { ACCENTS, effectiveDark, getPrefs, setPref, type AccentKey } from "@/lib/prefs";
import type { NavigateOptions } from "@/router/router";

export interface PaletteAction extends SearchEntry {
  run: () => void;
}

export const GROUPS = {
  pages: "Páginas",
  projects: "Projetos",
  skills: "Habilidades",
  jobs: "Experiência",
  edu: "Formação",
  code: "Código",
  design: "Design",
  game: "Jogo",
  actions: "Ações",
} as const;

/** Sem busca, a paleta mostra só estes grupos (as listas longas aparecem ao digitar). */
export const DEFAULT_GROUPS: readonly string[] = [GROUPS.pages, GROUPS.projects, GROUPS.actions];

function openUrl(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

const skillGroup = (skill: string) => SKILLS.find(([, items]) => items.some(([s]) => s === skill))?.[0];

/** Índice da busca, montado a partir dos dados do site: conteúdo novo entra sem mexer aqui. */
export function buildActions(navigate: (to: string, o?: NavigateOptions) => void, copyEmail: () => void): PaletteAction[] {
  const go = (path: string) => () => navigate(path);
  const projectNames = new Set([...PROJECTS.map((p) => p.name), GAME.name]);
  return [
    ...NAV.map((n) => ({ group: GROUPS.pages, label: n.label, text: metaFor({ name: n.id, tab: n.id }).description, run: go(n.path) })),
    ...PROJECTS.map((p) => ({
      group: GROUPS.projects,
      label: p.name,
      hint: p.kind,
      terms: [...p.stack, ...p.tags],
      text: `${p.title} ${p.summary} ${p.pitch}`,
      run: go(projectPath(p.id)),
    })),
    ...ALL_SKILLS.map((s) => ({
      group: GROUPS.skills,
      label: s,
      hint: "Ver onde foi aplicada",
      terms: [skillGroup(s) ?? ""].filter(Boolean),
      run: () => navigate("/habilidades", { state: { skill: s, jump: true } }),
    })),
    ...JOBS.map((j) => ({
      group: GROUPS.jobs,
      label: j.company,
      hint: `${j.role}, ${j.when}`,
      terms: j.tech,
      text: j.items.join(" "),
      run: () => navigate("/experiencia", { state: { job: j.id } }),
    })),
    ...EDU.map(([title, where]) => ({ group: GROUPS.edu, label: title, hint: where, run: go("/experiencia") })),
    ...SNIPPETS.map((s) => ({
      group: GROUPS.code,
      label: s.title,
      hint: PROJECTS.find((p) => p.id === s.id)?.name ?? s.repoName,
      terms: [s.file],
      text: s.why,
      run: go("/codigo"),
    })),
    ...REPOS.filter(([name]) => !projectNames.has(name)).map(([name, desc, proof, url]) => ({
      group: GROUPS.code,
      label: name,
      hint: "Repositório no GitHub",
      terms: [proof],
      text: desc,
      run: () => openUrl(url),
    })),
    ...DESIGNS.filter((d) => !d.caseId).map((d) => ({ group: GROUPS.design, label: d.name, hint: d.kind, terms: d.tools, text: d.text, run: go("/design") })),
    { group: GROUPS.game, label: GAME.name, hint: "Jogo em pixel art", terms: GAME.chips, text: GAME.lead, run: go("/jogo") },
    { group: GROUPS.actions, label: "Copiar e-mail", hint: EMAIL, terms: ["contato", "e-mail"], run: copyEmail },
    { group: GROUPS.actions, label: "Abrir currículo em PDF", terms: ["cv", "baixar", "download"], run: () => openUrl(LINKS.cv) },
    { group: GROUPS.actions, label: "Abrir currículo para ATS", terms: ["cv", "baixar", "download"], run: () => openUrl(LINKS.cvAts) },
    { group: GROUPS.actions, label: "Abrir LinkedIn", run: () => openUrl(LINKS.linkedin) },
    { group: GROUPS.actions, label: "Abrir GitHub", terms: ["código-fonte", "repositórios"], run: () => openUrl(LINKS.github) },
    { group: GROUPS.actions, label: "Abrir CodePen", run: () => openUrl(LINKS.codepen) },
    {
      group: GROUPS.actions,
      label: "Alternar tema claro e escuro",
      terms: ["dark", "light", "aparência"],
      run: () => setPref("theme", effectiveDark() ? "light" : "dark"),
    },
    {
      group: GROUPS.actions,
      label: "Trocar a cor de destaque",
      terms: ["accent", "aparência"],
      run: () => {
        const ks = Object.keys(ACCENTS) as AccentKey[];
        setPref("accent", ks[(ks.indexOf(getPrefs().accent) + 1) % ks.length]!);
      },
    },
  ];
}
