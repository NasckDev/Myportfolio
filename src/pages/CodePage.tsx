import { readStorage, writeStorage } from "@/lib/storage";
import { useRef, useState, type CSSProperties } from "react";
import { Arrow } from "@/components/Blocks";
import { CodeBlock } from "@/components/Code";
import { REPOS } from "@/data/content";
import { getProject, projectPath } from "@/data/projects";
import { LINKS, nf } from "@/data/site";
import { SNIPPETS } from "@/data/snippets";
import { TOTAL_E2E, TOTAL_UNIT } from "@/data/testCounts";
import { useReveal } from "@/hooks/useReveal";
import { ExtLink, Link } from "@/router/Link";
import { useUi } from "@/shell/ui";
import "@/styles/code.css";

const MEMORY_KEY = "nasck-trecho";
const remembered = (): string => readStorage(MEMORY_KEY, "session") ?? SNIPPETS[0]!.id;

export default function CodePage() {
  const ref = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  useReveal(ref);
  const { copy } = useUi();
  const [cur, setCur] = useState(remembered());
  const [changed, setChanged] = useState(0);
  const s = SNIPPETS.find((x) => x.id === cur) ?? SNIPPETS[0]!;
  const p = getProject(s.id)!;
  const idx = SNIPPETS.indexOf(s);

  const pick = (id: string) => {
    if (id === cur) return;
    writeStorage(MEMORY_KEY, id, "session");
    setCur(id);
    setChanged((n) => n + 1);
  };

  return (
    <div className="stack" ref={ref}>
      <div className="sheet">
        <div className="view-head">
          <h1 className="display">Código</h1>
          <p className="lead muted">
            Quatro trechos extraídos dos repositórios, selecionados por mostrarem a abordagem: regras de negócio isoladas da interface, em funções puras e testadas. Os projetos somam {nf(TOTAL_UNIT)} testes automatizados e {nf(TOTAL_E2E)} cenários de ponta a ponta.
          </p>
        </div>
        <div className="code-wrap" data-sec="Trechos">
          <div className="code-tabs" role="tablist" aria-label="Trechos de código" ref={tabsRef}>
            {SNIPPETS.map((x, i) => {
              const xp = getProject(x.id)!;
              const selected = x.id === cur;
              return (
                <button
                  type="button"
                  key={x.id}
                  role="tab"
                  id={`tab-${x.id}`}
                  aria-selected={selected}
                  aria-controls="code-win"
                  tabIndex={selected ? 0 : -1}
                  className={`code-tab${selected && changed ? " pop" : ""}`}
                  style={{ "--pc": xp.color } as CSSProperties}
                  onClick={() => pick(x.id)}
                  onKeyDown={(e) => {
                    const d = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
                    if (!d) return;
                    e.preventDefault();
                    const n = SNIPPETS[(i + d + SNIPPETS.length) % SNIPPETS.length]!;
                    pick(n.id);
                    tabsRef.current?.querySelector<HTMLElement>(`#tab-${n.id}`)?.focus();
                  }}
                >
                  <span className="pj">{xp.name}</span>
                  <b>{x.title}</b>
                  <small>{x.file}</small>
                </button>
              );
            })}
          </div>
          <div
            className={`code-win on-dark${changed ? " changed" : ""}`}
            role="tabpanel"
            id="code-win"
            aria-labelledby={`tab-${s.id}`}
            key={`w-${changed}`}
            style={{ "--pc": p.color } as CSSProperties}
          >
            <div className="code-bar">
              <span>
                <b className="code-proj">{p.name}</b>
                <span className="code-n">
                  Trecho {idx + 1} de {SNIPPETS.length}
                </span>
                {s.repoName}/{s.file}
              </span>
              <button type="button" onClick={() => copy(s.code, "Trecho copiado")}>
                Copiar trecho
              </button>
            </div>
            <CodeBlock code={s.code} label={`Código: ${s.file}`} />
            <div className="code-why">
              <p>{s.why}</p>
              <p>
                <ExtLink href={s.url}>Ver o arquivo completo no GitHub</ExtLink> ou <Link to={projectPath(p.id)}>ver o estudo de caso do {p.name}</Link>.
              </p>
            </div>
          </div>
        </div>
      </div>
      <section className="sheet" aria-labelledby="rp-t" data-sec="Repositórios">
        <div className="sec-head">
          <h2 className="h2" id="rp-t">
            Repositórios
          </h2>
          <ExtLink className="btn btn-line" href={`${LINKS.github}?tab=repositories`}>
            Perfil no GitHub
          </ExtLink>
        </div>
        <ul className="repo-list">
          {REPOS.map(([n, d, q, u]) => (
            <li key={n}>
              <ExtLink href={u}>
                <b>{n}</b>
                <span className="q">{d}</span>
                <span className="st">{q}</span>
              </ExtLink>
            </li>
          ))}
        </ul>
      </section>
      <ExtLink className="ghband on-dark" href={LINKS.github}>
        <span>
          <span className="muted" style={{ fontWeight: 650 }}>
            Todo o código é público
          </span>
          <span className="display">
            github.com/
            <wbr />
            NasckDev
          </span>
        </span>
        <span className="btn btn-accent">
          Acessar o GitHub
          <Arrow />
        </span>
      </ExtLink>
    </div>
  );
}
