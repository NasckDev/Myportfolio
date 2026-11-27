import { Fragment, useMemo, useRef, useState } from "react";
import { Dialog } from "@/components/Dialog";
import { Icon } from "@/components/Icon";
import { MAIN_STACK } from "@/data/content";
import { search, splitMarks, type Range } from "@/lib/search";
import { useNavigate } from "@/router/router";
import { buildActions, DEFAULT_GROUPS, type PaletteAction } from "./paletteIndex";
import { useUi } from "./ui";
import "@/styles/palette.css";

const SUGGESTIONS = [...MAIN_STACK.slice(0, 3).map(([label]) => label), "IA", "Acessibilidade"];

function Marks({ text, ranges }: { text: string; ranges: readonly Range[] }) {
  return (
    <>
      {splitMarks(text, ranges).map((part, i) => (part.mark ? <mark key={i}>{part.text}</mark> : <Fragment key={i}>{part.text}</Fragment>))}
    </>
  );
}

const countText = (n: number) => (n === 0 ? "Nenhum resultado" : n === 1 ? "1 resultado" : `${n} resultados`);

function PaletteBody({ onDone }: { onDone: (a: PaletteAction) => void }) {
  const navigate = useNavigate();
  const { copyEmail } = useUi();
  const actions = useMemo(() => buildActions(navigate, copyEmail), [navigate, copyEmail]);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const groups = useMemo(() => search(actions, query, DEFAULT_GROUPS), [actions, query]);
  const flat = useMemo(() => groups.flatMap((g) => g.hits), [groups]);
  const searching = query.trim() !== "";

  const select = (i: number) => {
    if (!flat.length) return;
    const next = (i + flat.length) % flat.length;
    setIndex(next);
    listRef.current?.querySelector(`#pal-${next}`)?.scrollIntoView({ block: "nearest" });
  };

  const update = (q: string) => {
    setQuery(q);
    setIndex(0);
    listRef.current?.scrollTo?.({ top: 0 });
  };

  let n = -1;
  return (
    <>
      <div className="pal-in">
        <Icon name="search" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Buscar projeto, tecnologia, experiência ou ação"
          autoComplete="off"
          spellCheck={false}
          role="combobox"
          aria-label="Buscar no site"
          aria-expanded={flat.length > 0}
          aria-controls="pal-list"
          aria-autocomplete="list"
          aria-describedby="pal-count"
          aria-activedescendant={flat.length ? `pal-${index}` : undefined}
          value={query}
          onChange={(e) => update(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              select(index + 1);
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              select(index - 1);
            } else if (e.key === "Enter") {
              e.preventDefault();
              const hit = flat[index];
              if (hit) onDone(hit.entry);
            }
          }}
        />
      </div>
      <p className="sr" id="pal-count" role="status">
        {searching ? countText(flat.length) : ""}
      </p>
      <div id="pal-list" role="listbox" aria-label="Resultados" ref={listRef}>
        {groups.map((g) => (
          <div role="group" aria-label={g.group} key={g.group}>
            <div className="pal-g" aria-hidden="true">
              {g.group}
            </div>
            {g.hits.map((hit) => {
              const i = ++n;
              const a = hit.entry;
              return (
                // eslint-disable-next-line jsx-a11y/click-events-have-key-events -- o teclado age pelo combobox (setas e Enter)
                <div
                  key={`${a.group}-${a.label}`}
                  className="pal-i"
                  role="option"
                  id={`pal-${i}`}
                  tabIndex={-1}
                  aria-selected={i === index}
                  onClick={() => onDone(a)}
                  onPointerMove={() => i !== index && setIndex(i)}
                >
                  <span className="pal-t">
                    <span className="pal-l">
                      <Marks text={a.label} ranges={hit.label} />
                    </span>
                    {hit.why ? (
                      <span className="pal-why">
                        <Marks text={hit.why.text} ranges={hit.why.ranges} />
                      </span>
                    ) : null}
                  </span>
                  {a.hint ? (
                    <small>
                      <Marks text={a.hint} ranges={hit.hint} />
                    </small>
                  ) : null}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      {searching && flat.length === 0 ? (
        <div className="pal-empty">
          <p>Nada encontrado para “{query.trim()}”.</p>
          <p className="pal-sug">
            <span>Tente:</span>
            {SUGGESTIONS.map((s) => (
              <button
                type="button"
                key={s}
                className="chip"
                onClick={() => {
                  update(s);
                  inputRef.current?.focus();
                }}
              >
                {s}
              </button>
            ))}
          </p>
        </div>
      ) : null}
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
