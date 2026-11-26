import { useRef, type CSSProperties } from "react";
import { Arrow } from "@/components/Blocks";
import { Cover } from "@/components/Cover";
import { Icon } from "@/components/Icon";
import { StatusLabel } from "@/components/ProjectCard";
import { mediaOf } from "@/data/media";
import { getProject, PROJECTS, projectPath } from "@/data/projects";
import { useReveal } from "@/hooks/useReveal";
import { ExtLink, Link } from "@/router/Link";
import { useRoute } from "@/router/router";
import { useUi, type LightboxItem } from "@/shell/ui";
import "@/styles/case.css";

export default function CasePage() {
  const route = useRoute();
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref);
  const { openLightbox } = useUi();
  const p = route.name === "projeto" ? getProject(route.projectId) : undefined;
  if (!p) return null;
  const media = mediaOf(p.id);
  const i = PROJECTS.indexOf(p);
  const nx = PROJECTS[(i + 1) % PROJECTS.length]!;
  const gallery: LightboxItem[] = [...media.shots, ...(media.mobile ? [media.mobile] : [])];
  const zoom = (src: string) => openLightbox(gallery, Math.max(0, gallery.findIndex((g) => g.src === src)));

  return (
    <div className="stack" ref={ref}>
      <article className="sheet" style={{ "--pc": p.color, "--pf": p.on } as CSSProperties}>
        <div className="case-head" data-sec="Visão geral">
          <Link className="back" to="/projetos">
            <span className="c">
              <Icon name="back" />
            </span>
            Projetos
          </Link>
          <h1 className="display">{p.name}</h1>
          <p className="lead">{p.title}</p>
          <div className="case-meta">
            <StatusLabel project={p} />
            <span>
              <span className="muted">Atuação:</span> <b>{p.role}</b>
            </span>
            <div className="links">
              {p.links.map(([label, url], k) => (
                <ExtLink className={`btn ${k ? "btn-line" : "btn-ink"}`} href={url} key={url}>
                  {label}
                  {k ? null : <Arrow />}
                </ExtLink>
              ))}
            </div>
          </div>
        </div>
        <Cover project={p} media={media} xl />
        <section data-sec="O que faz" aria-labelledby="cs-what" style={{ marginTop: "clamp(22px,3vw,36px)" }}>
          <div className="sec-head" style={{ marginBottom: 0 }}>
            <h2 className="h2" id="cs-what">
              {p.pitch}
            </h2>
          </div>
          <div className="feats-grid">
            {p.feats.map(([t, d]) => (
              <div className="feat-card" key={t}>
                <span className="ck">
                  <Icon name="check" />
                </span>
                <b>{t}</b>
                <p className="muted">{d}</p>
              </div>
            ))}
          </div>
        </section>
        <div className="case-grid" data-sec="Engenharia">
          <section className="block" aria-labelledby="cs-prob">
            <h2 id="cs-prob">O problema</h2>
            <p>{p.problem}</p>
            <div className="chips">
              {p.stack.map((s) => (
                <span className="chip" key={s}>
                  {s}
                </span>
              ))}
            </div>
          </section>
          <section className="block" aria-labelledby="cs-dec">
            <h2 id="cs-dec">Decisões de engenharia</h2>
            <ul className="dec">
              {p.decisions.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </section>
        </div>
        {p.counts ? (
          <div className="proof" data-sec="Provas">
            {p.counts.map(([n, l]) => (
              <div className="tile on-dark" key={l}>
                <b className="big-n">{n}</b>
                <span>{l}</span>
              </div>
            ))}
          </div>
        ) : null}
        <div className="case-grid two-even">
          <section className="block" aria-labelledby="cs-a11y">
            <h2 id="cs-a11y">Acessibilidade</h2>
            <p>{p.a11y}</p>
          </section>
          <section className="block" aria-labelledby="cs-tests">
            <h2 id="cs-tests">Testes</h2>
            <p>{p.tests}</p>
          </section>
        </div>
        {gallery.length ? (
          <section style={{ marginTop: "clamp(24px,3.4vw,44px)" }} aria-labelledby="cs-shots" data-sec="Telas">
            <div className="sec-head">
              <h2 className="h2" id="cs-shots">
                Telas
              </h2>
              <span className="muted small">Capturas reais, com dados fictícios ou públicos. Clique para ampliar.</span>
            </div>
            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- faixa rolável na horizontal precisa de foco pelo teclado */}
            <div className="gallery" tabIndex={0} role="region" aria-label="Galeria de telas">
              {gallery.map((g, k) => {
                const isMobile = media.mobile?.src === g.src;
                return (
                  <figure className={isMobile ? "m" : undefined} key={g.src}>
                    <button type="button" className="zoom" aria-label={`Ampliar: ${g.caption}`} onClick={() => zoom(g.src)}>
                      <img src={g.src} alt={g.caption} loading={k < 2 ? "eager" : "lazy"} decoding="async" />
                    </button>
                    <figcaption>{g.caption}</figcaption>
                  </figure>
                );
              })}
            </div>
          </section>
        ) : null}
      </article>
      <Link className="next" to={projectPath(nx.id)} style={{ "--pc": nx.color, "--pf": nx.on } as CSSProperties}>
        <span>
          <span style={{ fontWeight: 640 }}>Próximo projeto</span>
          <span className="display" style={{ display: "block", marginTop: 8 }}>
            {nx.name}
          </span>
        </span>
        <span className="go" aria-hidden="true">
          <Icon name="arrow" />
        </span>
      </Link>
    </div>
  );
}
