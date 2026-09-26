import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { cases, GITHUB_URL, LINKEDIN_URL, paletteNav } from "@/data/portfolio";
import { normalize } from "@/lib/text";
import { useFocusTrap } from "@/hooks/useFocusTrap";

interface Item {
  group: string;
  label: string;
  icon: string;
  hint: string;
  kw?: string;
  act: () => void;
}

export function CommandPalette() {
  const { palette, theme, motion, closePalette, scrollToId, openCase, copyEmail, openModal, copySkills, setTheme, toggleMotion } = usePortfolio();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const dlgRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dlgRef, palette);

  useEffect(() => {
    if (!palette) return;
    setQ("");
    setSel(0);
    const f = () => inputRef.current?.focus({ preventScroll: true });
    const raf = requestAnimationFrame(f);
    const t = window.setTimeout(f, 120);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t);
    };
  }, [palette]);

  const all = useMemo<Item[]>(
    () => [
      ...paletteNav.map(([id, l], i) => ({ group: "Navegar", label: l, icon: "#", hint: "0" + (i + 1), act: () => scrollToId(id) })),
      ...cases.map((c, i) => ({ group: "Projetos", label: `Abrir ${c.name}`, icon: c.num, hint: c.kind, kw: c.tags.join(" "), act: () => openCase(i) })),
      { group: "Ações", label: "Copiar e-mail", icon: "@", hint: "contato", act: () => void copyEmail() },
      { group: "Ações", label: "Baixar currículo", icon: "↓", hint: "PDF", kw: "cv curriculo resume", act: () => openModal("cv") },
      { group: "Ações", label: "Copiar lista de habilidades", icon: "≡", hint: "skills", kw: "habilidades tecnologias stack", act: () => void copySkills() },
      { group: "Ações", label: "Atalhos de teclado", icon: "?", hint: "ajuda", act: () => openModal("keys") },
      { group: "Ações", label: "Abrir GitHub", icon: "gh", hint: "↗", kw: "repositorios codigo", act: () => window.open(GITHUB_URL, "_blank", "noopener") },
      { group: "Ações", label: "Abrir LinkedIn", icon: "in", hint: "↗", act: () => window.open(LINKEDIN_URL, "_blank", "noopener") },
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
  const list = nq ? all.filter((it) => normalize(`${it.group} ${it.label} ${it.hint} ${it.kw || ""}`).includes(nq)) : all;
  const cur = Math.min(sel, Math.max(0, list.length - 1));

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-idx="${cur}"]`)?.scrollIntoView({ block: "nearest" });
  }, [cur]);

  const run = (it: Item) => {
    closePalette();
    window.setTimeout(it.act, 60);
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
        <div className="flex items-center gap-3 border-b border-line px-[18px] py-4">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setSel(0);
            }}
            onKeyDown={onKey}
            placeholder="Buscar seções, cases ou ações…"
            aria-label="Buscar"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={list[cur] ? `palette-opt-${cur}` : undefined}
            className="flex-1 border-0 bg-transparent text-[17px] font-medium text-head outline-0 placeholder:text-muted"
          />
          <span className="mono rounded-md border border-line px-[7px] py-[3px] text-[12px] font-medium text-muted leading-normal">esc</span>
        </div>
        <div ref={listRef} id="palette-list" role="listbox" className="overflow-y-auto overflow-x-hidden p-2" style={{ maxHeight: "min(420px,56vh)" }}>
          {list.map((it, i) => (
            <div key={it.group + it.label}>
              {(i === 0 || list[i - 1].group !== it.group) && <div className="mono px-3 pb-1.5 pt-2.5 text-[12px] text-muted">{it.group}</div>}
              <button
                type="button"
                id={`palette-opt-${i}`}
                data-idx={i}
                role="option"
                aria-selected={i === cur}
                tabIndex={-1}
                onClick={() => run(it)}
                onMouseEnter={() => sel !== i && setSel(i)}
                className="box-border flex w-full cursor-pointer items-center gap-3 rounded-[14px] border-0 px-3.5 py-3 text-left text-[15.5px] font-medium text-ink"
                style={{ background: i === cur ? "var(--chip)" : "transparent" }}
              >
                <span className="mono grid size-[30px] place-items-center rounded-[10px] bg-chip text-[13px] font-semibold text-chip-text leading-normal">{it.icon}</span>
                <span className="flex-1">{it.label}</span>
                <span className="mono text-[12px] text-muted">{it.hint}</span>
              </button>
            </div>
          ))}
          {!list.length && <div className="px-3.5 py-7 text-left text-[15px] text-muted">Nada encontrado para “{q}”.</div>}
        </div>
        <div className="mono flex gap-4 border-t border-line px-[18px] py-3 text-[12px] text-muted">
          <span>↑↓ navegar</span>
          <span>↵ abrir</span>
          <span>esc fechar</span>
        </div>
      </div>
    </>
  );
}
