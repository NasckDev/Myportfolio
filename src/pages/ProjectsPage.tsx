import { readStorage, writeStorage } from "@/lib/storage";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { DesignTeaser } from "@/components/Blocks";
import { Icon } from "@/components/Icon";
import { ProjectCard, StatusLabel } from "@/components/ProjectCard";
import { PRODUCT_WORD } from "@/data/content";
import { mediaOf } from "@/data/media";
import { FILTERS, filterProjects, getProject, PROJECTS, projectPath } from "@/data/projects";
import type { Project } from "@/data/types";
import { useReveal } from "@/hooks/useReveal";
import { canHover, isSoftMotion } from "@/lib/motion";
import { setPref, usePrefs } from "@/lib/prefs";
import { Link } from "@/router/Link";
import "@/styles/projects.css";

/** Filtro escolhido fica na memória da sessão (voltar à página mantém a seleção). */
const MEMORY_KEY = "nasck-filtro";
const remembered = (): string => readStorage(MEMORY_KEY, "session") ?? "Todos";

const countFor = (f: string) => filterProjects(f).length;

/** Prévia que segue o cursor sobre as linhas da lista (só com mouse e movimento completo). */
function Peek() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const peek = ref.current;
    if (!peek || !canHover()) return;
    let kx = 0;
    let ky = 0;
    let tx = 0;
    let ty = 0;
    let on = false;
    let raf = 0;
    const loop = () => {
      kx += (tx - kx) * 0.2;
      ky += (ty - ky) * 0.2;
      peek.style.transform = `translate(${kx.toFixed(1)}px,${ky.toFixed(1)}px)`;
      if (on) raf = requestAnimationFrame(loop);
    };
    const move = (e: PointerEvent) => {
      const row = (e.target as Element | null)?.closest?.<HTMLElement>(".prow");
      const p = row ? getProject(row.dataset.id ?? "") : undefined;
      const shot = p ? mediaOf(p.id).shots[0] : undefined;
      if (p && shot && !isSoftMotion() && e.pointerType !== "touch" && window.innerWidth > 900) {
        if (peek.dataset.id !== p.id) {
          peek.dataset.id = p.id;
          peek.style.setProperty("--pc", p.color);
          const frame = document.createElement("div");
          frame.className = "cv-browser";
          frame.innerHTML = '<div class="cv-bar"><i></i><i></i><i></i></div><div class="cv-screen"></div>';
          frame.querySelector(".cv-screen")!.append(Object.assign(document.createElement("img"), { src: shot.src, alt: "" }));
          peek.replaceChildren(frame);
        }
        tx = Math.min(e.clientX + 26, window.innerWidth - 340);
        ty = Math.max(12, e.clientY - 110);
        if (!on) {
          on = true;
          kx = tx;
          ky = ty;
          peek.classList.add("on");
          loop();
        }
      } else if (on) {
        on = false;
        peek.classList.remove("on");
      }
    };
    document.addEventListener("pointermove", move, { passive: true });
    return () => {
      document.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);
  return <div id="peek" ref={ref} aria-hidden="true" />;
}

function Row({ project, style }: { project: Project; style?: CSSProperties }) {
  return (
    <Link
      className={`prow${style ? " swapin" : ""}`}
      to={projectPath(project.id)}
      data-id={project.id}
      style={{ "--pc": project.color, "--pf": project.on, ...style } as CSSProperties}
    >
      <span className="nm">
        <b className="h3">{project.name}</b>
        <span className="muted small">{project.kind}</span>
      </span>
      <span className="sum">
        <b>{project.pitch}</b> <span className="muted">{project.summary}</span>
      </span>
      <StatusLabel project={project} />
      <span className="go" aria-hidden="true">
        <Icon name="arrow" />
      </span>
    </Link>
  );
}

export default function ProjectsPage() {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref);
  const prefs = usePrefs();
  const [filter, setFilter] = useState(remembered());
  const [changed, setChanged] = useState(0);
  const mode = prefs.plist;
  const list = filterProjects(filter);

  const pick = (f: string) => {
    writeStorage(MEMORY_KEY, f, "session");
    setFilter(f);
    setChanged((n) => n + 1);
  };

  return (
    <div className="stack" ref={ref}>
      <div className="sheet">
        <div className="view-head">
          <h1 className="display">Projetos</h1>
          <p className="lead muted">
            {PRODUCT_WORD} produtos publicados e este portfólio. Cada um tem demonstração, estudo de caso e código-fonte.
          </p>
          <div className="filters">
            <div className="filters" role="group" aria-label="Filtrar projetos">
              {FILTERS.map((f) => (
                <button type="button" key={f} className="fbtn" aria-pressed={f === filter} onClick={() => pick(f)}>
                  {f}
                  <span>{countFor(f)}</span>
                </button>
              ))}
            </div>
            <div className="vt" role="group" aria-label="Formato da lista">
              <button type="button" aria-pressed={mode === "grid"} aria-label="Ver em grade" onClick={() => setPref("plist", "grid")}>
                <Icon name="grid" />
              </button>
              <button type="button" aria-pressed={mode === "list"} aria-label="Ver em lista" onClick={() => setPref("plist", "list")}>
                <Icon name="list" />
              </button>
            </div>
          </div>
        </div>
        <p className={`result${changed ? " flash" : ""}`} key={`r-${changed}`} aria-live="polite" data-testid="result">
          <b>{list.length}</b> de {PROJECTS.length} projetos
          {filter === "Todos" ? null : (
            <>
              {" "}
              com <mark>{filter}</mark>
            </>
          )}
        </p>
        {mode === "grid" ? (
          <div className="pgrid" data-testid="project-grid" key={`g-${changed}`}>
            {list.map((p, i) => (
              <ProjectCard project={p} key={p.id} className={changed ? "swapin" : undefined} style={{ "--n": i } as CSSProperties} />
            ))}
          </div>
        ) : (
          <div className="plist" data-testid="project-list" key={`l-${changed}`}>
            {list.map((p, i) => (
              <Row project={p} key={p.id} style={changed ? ({ "--n": i } as CSSProperties) : undefined} />
            ))}
          </div>
        )}
      </div>
      <section className="sheet" aria-labelledby="more-t">
        <div className="sec-head">
          <div>
            <h2 className="h2" id="more-t">
              Design de interfaces
            </h2>
            <p className="muted" style={{ marginTop: 10 }}>
              Estudos de interface publicados, com animação e 3D.
            </p>
          </div>
          <div className="links" style={{ margin: 0 }}>
            <Link className="btn btn-line" to="/design">
              Ver todos os estudos
            </Link>
            <Link className="btn btn-line" to="/jogo">
              Véspera, jogo em pixel art
            </Link>
          </div>
        </div>
        <DesignTeaser />
      </section>
      {mode === "list" ? <Peek /> : null}
    </div>
  );
}
