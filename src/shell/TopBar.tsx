import { useEffect, useRef, useState, type RefObject } from "react";
import { Icon } from "@/components/Icon";
import { getProject } from "@/data/projects";
import { labelOf } from "@/data/routes";
import { LINKS } from "@/data/site";
import { scrollBehavior } from "@/lib/motion";
import { ExtLink, Link } from "@/router/Link";
import { useRouter } from "@/router/router";
import { Brand } from "./Navigation";
import { useUi } from "./ui";

function Crumbs() {
  const { route } = useRouter();
  let body;
  if (route.name === "inicio") body = <span aria-current="page">Início</span>;
  else if (route.name === "projeto")
    body = (
      <>
        <Link to="/projetos">Projetos</Link>
        <span className="sep" aria-hidden="true">/</span>
        <span aria-current="page">{getProject(route.projectId)?.name}</span>
      </>
    );
  else
    body = (
      <>
        <Link to="/">Início</Link>
        <span className="sep" aria-hidden="true">/</span>
        <span aria-current="page">{route.name === "nao-encontrada" ? "Página não encontrada" : labelOf(route.name)}</span>
      </>
    );
  return (
    <nav className="crumbs" aria-label="Você está em">
      {body}
    </nav>
  );
}

/** Seções da página atual (elementos com data-sec), relidas quando o conteúdo muda. */
function useSections(main: RefObject<HTMLElement | null>, key: string) {
  const [sections, setSections] = useState<HTMLElement[]>([]);
  useEffect(() => {
    const el = main.current;
    if (!el) return;
    const scan = () => {
      const found = Array.from(el.querySelectorAll<HTMLElement>("[data-sec]"));
      setSections((cur) => (cur.length === found.length && cur.every((s, i) => s === found[i]) ? cur : found));
    };
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(el, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, [main, key]);
  return sections;
}

export function TopBar({ main }: { main: RefObject<HTMLElement | null> }) {
  const { location } = useRouter();
  const { openPanel, togglePanel } = useUi();
  const sections = useSections(main, location.key);
  const [current, setCurrent] = useState(0);
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      barRef.current?.style.setProperty("--p", p.toFixed(4));
      if (sections.length > 1) {
        let cur = 0;
        sections.forEach((s, i) => {
          if (s.getBoundingClientRect().top < window.innerHeight * 0.35) cur = i;
        });
        setCurrent(cur);
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [sections]);

  return (
    <header className="top">
      <div className="top-in">
        <Brand />
        <Crumbs />
        {sections.length > 1 ? (
          <div className="secnav" role="group" aria-label="Seções desta página">
            {sections.map((s, i) => (
              <button
                type="button"
                key={i}
                aria-current={i === current ? "true" : undefined}
                onClick={() => s.scrollIntoView({ behavior: scrollBehavior(), block: "start" })}
              >
                {s.dataset.sec}
              </button>
            ))}
          </div>
        ) : (
          <div className="secnav" aria-hidden="true" />
        )}
        <div className="top-actions">
          <button type="button" className="btn search-btn" aria-label="Buscar e navegar" onClick={() => openPanel("palette")}>
            <Icon name="search" />
          </button>
          <button type="button" className="icon-btn" aria-label="Aparência do site" aria-haspopup="dialog" onClick={() => togglePanel("appearance")}>
            <Icon name="sliders" />
          </button>
          <ExtLink className="btn btn-line gh" href={LINKS.github}>
            GitHub
          </ExtLink>
          <Link className="btn btn-accent" to="/contato">
            Entrar em contato
          </Link>
        </div>
        <span className="scrollbar" ref={barRef} />
      </div>
    </header>
  );
}
