import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { cases, GITHUB_URL, LINKEDIN_URL, paletteNav } from "@/data/portfolio";
import { normalize } from "@/lib/text";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { CloseIcon, SearchIcon } from "@/components/ui/icons";

interface Item {
  group: string;
  label: string;
  icon: string;
  hint: string;
  kw?: string;
  external?: boolean;
  act: () => void;
}

interface Group {
  name: string;
  items: { it: Item; idx: number }[];
}

/** Espera o fechamento da paleta começar antes de executar a ação (ex.: rolar ou abrir outro diálogo). */
const RUN_DELAY_MS = 60;
/** Segunda tentativa de foco, para quando a transição de abertura ainda não terminou no primeiro frame. */
const FOCUS_RETRY_MS = 120;

const openExternal = (url: string) => window.open(url, "_blank", "noopener,noreferrer");

/** Agrupa os itens filtrados mantendo a ordem e o índice global usado pelo aria-activedescendant. */
function groupItems(list: Item[]): Group[] {
  const groups: Group[] = [];
  list.forEach((it, idx) => {
    const last = groups[groups.length - 1];
    if (last && last.name === it.group) last.items.push({ it, idx });
    else groups.push({ name: it.group, items: [{ it, idx }] });
  });
  return groups;
}

export function CommandPalette() {
  const { vp, palette, theme, motion, closePalette, scrollToId, openCase, copyEmail, openModal, copySkills, setTheme, toggleMotion } = usePortfolio();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const dlgRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  // No toque (sem ponteiro fino) a paleta é o menu do celular: sem dicas de teclado e sem abrir o teclado virtual.
  const touch = !vp.fine;
  useFocusTrap(dlgRef, palette);

  useEffect(() => {
    if (!palette) return;
    setQ("");
    setSel(0);
    // O teclado virtual cobriria a lista: no toque o foco vai para o botão Fechar.
    const f = () => (touch ? closeRef.current : inputRef.current)?.focus({ preventScroll: true });
    const raf = requestAnimationFrame(f);
    const t = window.setTimeout(f, FOCUS_RETRY_MS);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t);
    };
  }, [palette, touch]);

  const all = useMemo<Item[]>(
    () => [
      ...paletteNav.map(([id, l], i) => ({ group: "Navegar", label: l, icon: "#", hint: "0" + (i + 1), act: () => scrollToId(id) })),
      ...cases.map((c, i) => ({ group: "Projetos", label: `Abrir ${c.name}`, icon: c.num, hint: c.kind, kw: c.tags.join(" "), act: () => openCase(i) })),
      { group: "Ações", label: "Copiar e-mail", icon: "@", hint: "contato", act: () => void copyEmail() },
      { group: "Ações", label: "Baixar currículo", icon: "↓", hint: "PDF", kw: "cv curriculo resume", act: () => openModal("cv") },
      { group: "Ações", label: "Copiar lista de habilidades", icon: "≡", hint: "skills", kw: "habilidades tecnologias stack", act: () => void copySkills() },
      { group: "Ações", label: "Atalhos de teclado", icon: "?", hint: "ajuda", act: () => openModal("keys") },
      { group: "Ações", label: "Abrir GitHub", icon: "gh", hint: "↗", kw: "repositorios codigo", external: true, act: () => openExternal(GITHUB_URL) },
      { group: "Ações", label: "Abrir LinkedIn", icon: "in", hint: "↗", external: true, act: () => openExternal(LINKEDIN_URL) },
      {
        group: "Preferências",
        label: theme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro",
        icon: "◐",
        hint: "tema",
        kw: "dark mode escuro claro",
        act: () => setTheme(theme === "dark" ? "light" : "dark", innerWidth / 2, innerHeight * 0.2),
      },
      { group: "Preferências", label: motion ? "Desligar animações" : "Ligar animações", icon: "~", hint: "movimento", act: toggleMotion },
    ],
    [theme, motion, scrollToId, openCase, copyEmail, openModal, copySkills, setTheme, toggleMotion],
  );

  const nq = normalize(q.trim());
  // Atalhos de teclado não fazem sentido no toque.
  const pool = touch ? all.filter((it) => it.label !== "Atalhos de teclado") : all;
  const list = nq ? pool.filter((it) => normalize(`${it.group} ${it.label} ${it.hint} ${it.kw || ""}`).includes(nq)) : pool;
  const groups = groupItems(list);
  const cur = Math.min(sel, Math.max(0, list.length - 1));
  // No toque, sem busca, nenhum item aparece pré-selecionado (não há setas para mover a seleção).
  const showSel = !touch || nq !== "";

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-idx="${cur}"]`)?.scrollIntoView({ block: "nearest" });
  }, [cur]);

  const run = (it: Item) => {
    closePalette();
    window.setTimeout(it.act, RUN_DELAY_MS);
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    const n = list.length;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSel(n ? (cur + 1) % n : 0);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSel(n ? (cur - 1 + n) % n : 0);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (list[cur]) run(list[cur]);
    }
  };

  return (
    <>
      <div
        aria-hidden="true"
        onClick={closePalette}
        className="fixed inset-0 z-[120]"
        style={{ background: "rgba(4,14,28,.45)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", opacity: palette ? 1 : 0, pointerEvents: palette ? "auto" : "none", transition: "opacity .2s" }}
      />
      <div
        ref={dlgRef}
        role="dialog"
        aria-modal="true"
        aria-label="Busca e comandos"
        aria-hidden={!palette}
        inert={!palette}
        className="fixed left-1/2 top-[14vh] z-[121] w-[min(620px,calc(100%-24px))] overflow-hidden rounded-3xl border border-line bg-surface"
        style={{
          boxShadow: "0 40px 90px -30px rgba(0,0,0,.55)",
          opacity: palette ? 1 : 0,
          transform: `translateX(-50%) ${palette ? "scale(1)" : "scale(.96) translateY(-8px)"}`,
          pointerEvents: palette ? "auto" : "none",
          transition: "opacity .2s,transform .28s cubic-bezier(.2,.8,.2,1)",
        }}
      >
        <div className="flex items-center gap-3 border-b border-line py-2.5 pl-[18px] pr-2.5">
          <SearchIcon size={18} stroke="var(--muted)" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setSel(0);
            }}
            onKeyDown={onKey}
            placeholder={touch ? "Buscar…" : "Buscar seções, cases ou ações…"}
            aria-label="Buscar"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-autocomplete="list"
            aria-activedescendant={showSel && list[cur] ? `palette-opt-${cur}` : undefined}
            enterKeyHint="go"
            className="min-w-0 flex-1 rounded-lg border-0 bg-transparent py-2 text-[17px] font-medium text-head placeholder:text-muted"
          />
          {!touch && <span aria-hidden="true" className="mono rounded-md border border-line px-[7px] py-[3px] text-[12px] font-medium text-muted leading-normal">esc</span>}
          <button
            ref={closeRef}
            type="button"
            onClick={closePalette}
            aria-label="Fechar"
            className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full border border-line bg-bg2 text-head hover:border-accent"
          >
            <CloseIcon size={17} sw={2.2} />
          </button>
        </div>
        <div
          ref={listRef}
          id="palette-list"
          role="listbox"
          aria-label="Resultados"
          className="overflow-y-auto overflow-x-hidden overscroll-contain p-2"
          style={{ maxHeight: "min(420px,56vh)" }}
        >
          {groups.map((g) => {
            const gid = "palette-group-" + normalize(g.name).replace(/\W+/g, "-");
            return (
              <div key={g.name} role="group" aria-labelledby={gid}>
                <div id={gid} role="presentation" className="mono px-3 pb-1.5 pt-2.5 text-[12px] text-muted">
                  {g.name}
                </div>
                {g.items.map(({ it, idx }) => {
                  const on = showSel && idx === cur;
                  return (
                    <button
                      key={it.label}
                      type="button"
                      id={`palette-opt-${idx}`}
                      data-idx={idx}
                      role="option"
                      aria-selected={on}
                      tabIndex={-1}
                      onClick={() => run(it)}
                      onMouseEnter={() => sel !== idx && setSel(idx)}
                      className="box-border flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-[14px] border-0 px-3.5 py-3 text-left text-[15.5px] font-medium text-ink"
                      style={{ background: on ? "var(--chip)" : "transparent" }}
                    >
                      <span aria-hidden="true" className="mono grid size-[30px] place-items-center rounded-[10px] bg-chip text-[13px] font-semibold text-chip-text leading-normal">
                        {it.icon}
                      </span>
                      <span className="flex-1">
                        {it.label}
                        {it.external && <span className="sr-only"> (abre em nova aba)</span>}
                      </span>
                      <span aria-hidden="true" className="mono text-[12px] text-muted">
                        {it.hint}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
        {!list.length && (
          <div role="status" className="px-[22px] pb-7 pt-5 text-left text-[15px] text-muted">
            Nada encontrado para “{q}”.
          </div>
        )}
        {!touch && (
          <div aria-hidden="true" className="mono flex gap-4 border-t border-line px-[18px] py-3 text-[12px] text-muted">
            <span>↑↓ navegar</span>
            <span>↵ abrir</span>
            <span>esc fechar</span>
          </div>
        )}
      </div>
    </>
  );
}
