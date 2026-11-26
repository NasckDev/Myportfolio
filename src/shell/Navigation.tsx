import { useLayoutEffect, useRef, type CSSProperties } from "react";
import { Icon, Logo } from "@/components/Icon";
import { PROJECTS, projectPath } from "@/data/projects";
import { labelOf, MORE_PAGES, NAV } from "@/data/routes";
import { AVAILABILITY, LINKS } from "@/data/site";
import { ACCENTS, effectiveDark, setPref, usePrefs, type AccentKey } from "@/lib/prefs";
import { ExtLink, Link } from "@/router/Link";
import { useRoute } from "@/router/router";
import { useUi } from "./ui";

export const isMac = (): boolean => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
export const shortcutLabel = (): string => (isMac() ? "⌘ K" : "Ctrl K");

export function Brand() {
  return (
    <Link className="brand" to="/" aria-label="nasck, início">
      <Logo />
      <span className="brand-t">nasck</span>
    </Link>
  );
}

function QuickPrefs() {
  const prefs = usePrefs();
  return (
    <div className="quick">
      {(Object.entries(ACCENTS) as [AccentKey, readonly [string, string, string]][]).map(([k, [c, , n]]) => (
        <button
          key={k}
          type="button"
          className="dot"
          style={{ "--c": c } as CSSProperties}
          aria-label={`Cor de destaque: ${n}`}
          aria-pressed={prefs.accent === k}
          onClick={() => setPref("accent", k)}
        />
      ))}
      <button type="button" className="mini" aria-label="Alternar tema claro e escuro" onClick={() => setPref("theme", effectiveDark() ? "light" : "dark")}>
        <Icon name="contrast" />
      </button>
    </div>
  );
}

export function SideNav() {
  const route = useRoute();
  const { openPanel } = useUi();
  const navRef = useRef<HTMLElement>(null);
  const indRef = useRef<HTMLSpanElement>(null);
  const prefs = usePrefs();

  useLayoutEffect(() => {
    const place = () => {
      const act = navRef.current?.querySelector<HTMLElement>('a[aria-current="page"]');
      const ind = indRef.current;
      if (!ind) return;
      if (!act) {
        ind.classList.remove("on");
        return;
      }
      ind.style.height = `${act.offsetHeight}px`;
      ind.style.transform = `translateY(${act.offsetTop}px)`;
      ind.classList.add("on");
    };
    place();
    window.addEventListener("resize", place);
    document.fonts?.ready.then(place).catch(() => undefined);
    return () => window.removeEventListener("resize", place);
  }, [route, prefs.corners]);

  return (
    <aside className="side">
      <div className="side-in">
        <Brand />
        <button type="button" className="side-search" aria-label={`Buscar ${shortcutLabel()}`} onClick={() => openPanel("palette")}>
          <Icon name="search" />
          <span>Buscar</span>{" "}
          <kbd className="kbd">{shortcutLabel()}</kbd>
        </button>
        <nav className="snav" aria-label="Páginas" ref={navRef}>
          <span className="snav-ind" ref={indRef} />
          {NAV.map((n) => (
            <span key={n.id} style={{ display: "contents" }}>
              {n.id === "projetos" ? <span className="snav-l">Trabalho</span> : null}
              {n.id === "habilidades" ? <span className="snav-l">Sobre mim</span> : null}
              <Link to={n.path} aria-current={route.tab === n.id ? "page" : undefined} aria-label={n.label}>
                <Icon name={n.icon} />
                <span>{n.label}</span>
              </Link>
            </span>
          ))}
        </nav>
        <div className="side-label">Apps</div>
        <nav className="side-proj" aria-label="Projetos">
          {PROJECTS.filter((p) => p.id !== "portfolio").map((p) => (
            <Link
              key={p.id}
              to={projectPath(p.id)}
              style={{ "--pc": p.color } as CSSProperties}
              aria-current={route.name === "projeto" && route.projectId === p.id ? "page" : undefined}
            >
              {p.name}
            </Link>
          ))}
        </nav>
        <div className="side-foot">
          <span className="avail">Disponível para vagas sênior</span>
          <div className="side-links">
            <ExtLink href={LINKS.github}>GitHub</ExtLink>
            <ExtLink href={LINKS.linkedin}>LinkedIn</ExtLink>
          </div>
          <QuickPrefs />
        </div>
      </div>
      <span className="sr">{AVAILABILITY}</span>
    </aside>
  );
}

export function Dock() {
  const route = useRoute();
  const { openPanel, panel } = useUi();
  const inMore = route.tab !== null && MORE_PAGES.includes(route.tab);
  return (
    <nav className="dock" aria-label="Páginas (atalhos)">
      {NAV.filter((n) => !MORE_PAGES.includes(n.id)).map((n) => (
        <Link key={n.id} to={n.path} aria-current={route.tab === n.id ? "page" : undefined}>
          <Icon name={n.icon} />
          {n.label}
        </Link>
      ))}
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={panel === "more"}
        aria-current={inMore ? "page" : undefined}
        onClick={() => openPanel("more")}
      >
        <Icon name="menu" />
        Mais
      </button>
    </nav>
  );
}

export function MoreLinks() {
  const { openPanel, closePanel } = useUi();
  return (
    <div className="more-grid">
      {MORE_PAGES.map((id) => {
        const n = NAV.find((x) => x.id === id)!;
        return (
          <Link key={id} to={n.path} onClick={closePanel}>
            <Icon name={n.icon} />
            {labelOf(id)}
          </Link>
        );
      })}
      <ExtLink href={LINKS.github}>
        <Icon name="code" />
        GitHub
      </ExtLink>
      <button type="button" onClick={() => openPanel("palette")}>
        <Icon name="search" />
        Buscar
      </button>
      <button type="button" onClick={() => openPanel("appearance")}>
        <Icon name="sliders" />
        Aparência
      </button>
    </div>
  );
}
