import { useMemo, useRef, useState } from "react";
import { Dialog } from "@/components/Dialog";
import { Icon } from "@/components/Icon";
import { ALL_SKILLS, DESIGNS } from "@/data/content";
import { PROJECTS, projectPath } from "@/data/projects";
import { NAV } from "@/data/routes";
import { EMAIL, LINKS } from "@/data/site";
import { ACCENTS, effectiveDark, getPrefs, setPref, type AccentKey } from "@/lib/prefs";
import { useNavigate, type NavigateOptions } from "@/router/router";
import { useUi } from "./ui";

export interface PaletteAction {
  group: string;
  label: string;
  hint?: string;
  keywords?: string;
  run: () => void;
}

export const normalize = (s: string): string =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

/** Sem busca, esconde as habilidades (lista longa); com busca, procura em rótulo, dica, palavras-chave e grupo. */
export function searchActions(actions: readonly PaletteAction[], query: string): PaletteAction[] {
  const q = normalize(query.trim());
  if (!q) return actions.filter((a) => a.group !== "Habilidades");
  return actions.filter((a) => normalize(`${a.label} ${a.hint ?? ""} ${a.keywords ?? ""} ${a.group}`).includes(q));
}

function openUrl(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

export function buildActions(navigate: (to: string, o?: NavigateOptions) => void, copyEmail: () => void): PaletteAction[] {
  const designStudies = DESIGNS.filter((d) => !d.caseId);
  return [
    ...NAV.map((n) => ({ group: "Ir para", label: n.label, run: () => navigate(n.path) })),
    ...PROJECTS.map((p) => ({
      group: "Projetos",
      label: p.name,
      hint: p.kind,
      keywords: `${p.stack.join(" ")} ${p.tags.join(" ")}`,
      run: () => navigate(projectPath(p.id)),
    })),
    { group: "Jogo", label: "Véspera", hint: "Jogo em pixel art", run: () => navigate("/jogo") },
    ...designStudies.map((d) => ({ group: "Design", label: d.name, hint: d.kind, run: () => navigate("/design") })),
    ...ALL_SKILLS.map((s) => ({
      group: "Habilidades",
      label: s,
      hint: "Ver onde foi aplicada",
      run: () => navigate("/habilidades", { state: { skill: s, jump: true } }),
    })),
    { group: "Ações", label: "Copiar e-mail", hint: EMAIL, run: copyEmail },
    { group: "Ações", label: "Abrir currículo em PDF", run: () => openUrl(LINKS.cv) },
    { group: "Ações", label: "Abrir LinkedIn", run: () => openUrl(LINKS.linkedin) },
    { group: "Ações", label: "Abrir GitHub", run: () => openUrl(LINKS.github) },
    {
      group: "Ações",
      label: "Alternar tema claro e escuro",
      keywords: "dark light escuro claro",
      run: () => setPref("theme", effectiveDark() ? "light" : "dark"),
    },
    {
      group: "Ações",
      label: "Trocar a cor de destaque",
      keywords: "accent cor",
      run: () => {
        const ks = Object.keys(ACCENTS) as AccentKey[];
        setPref("accent", ks[(ks.indexOf(getPrefs().accent) + 1) % ks.length]!);
      },
    },
  ];
}

function PaletteBody({ onDone }: { onDone: (a: PaletteAction) => void }) {
  const navigate = useNavigate();
  const { copyEmail } = useUi();
  const actions = useMemo(() => buildActions(navigate, copyEmail), [navigate, copyEmail]);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);
  const items = useMemo(() => searchActions(actions, query), [actions, query]);

  const select = (i: number) => {
    if (!items.length) return;
    const next = (i + items.length) % items.length;
    setIndex(next);
    listRef.current?.querySelector(`#pal-${next}`)?.scrollIntoView({ block: "nearest" });
  };

  let group = "";
  return (
    <>
      <div className="pal-in">
        <Icon name="search" />
        <input
          type="text"
          placeholder="Buscar projeto, página ou ação"
          autoComplete="off"
          spellCheck={false}
          role="combobox"
          aria-label="Buscar projeto, página ou ação"
          aria-expanded="true"
          aria-controls="pal-list"
          aria-autocomplete="list"
          aria-activedescendant={items.length ? `pal-${index}` : undefined}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIndex(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              select(index + 1);
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              select(index - 1);
            } else if (e.key === "Enter") {
              e.preventDefault();
              const a = items[index];
              if (a) onDone(a);
            }
          }}
        />
      </div>
      <ul id="pal-list" role="listbox" aria-label="Resultados" ref={listRef}>
        {items.length === 0 ? (
          <li className="pal-empty" role="presentation">
            Nada encontrado para “{query}”. Tente o nome de um projeto ou uma tecnologia.
          </li>
        ) : (
          items.map((a, i) => {
            const head =
              a.group !== group ? (
                <li className="pal-g" role="presentation" key={`g-${a.group}`}>
                  {a.group}
                </li>
              ) : null;
            group = a.group;
            return [
              head,
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events -- o teclado age pelo combobox (setas e Enter)
              <li
                key={`${a.group}-${a.label}`}
                className="pal-i"
                role="option"
                id={`pal-${i}`}
                aria-selected={i === index}
                onClick={() => onDone(a)}
                onPointerMove={() => i !== index && setIndex(i)}
              >
                {a.label}
                {a.hint ? <small>{a.hint}</small> : null}
              </li>,
            ];
          })
        )}
      </ul>
      <div className="pal-foot" aria-hidden="true">
        <span>↑ ↓ para escolher</span>
        <span>Enter para abrir</span>
        <span>Esc para fechar</span>
      </div>
    </>
  );
}

export function Palette() {
  const { panel, closePanel } = useUi();
  const pending = useRef<PaletteAction | null>(null);
  return (
    <Dialog
      open={panel === "palette"}
      id="palette"
      label="Buscar e navegar"
      onClose={() => {
        if (panel === "palette") closePanel();
        const a = pending.current;
        pending.current = null;
        a?.run();
      }}
    >
      <PaletteBody
        onDone={(a) => {
          pending.current = a;
          closePanel();
        }}
      />
    </Dialog>
  );
}
