import { useRef } from "react";
import { Arrow } from "@/components/Blocks";
import { DESIGNS } from "@/data/content";
import { mediaOf } from "@/data/media";
import { projectPath } from "@/data/projects";
import { useReveal } from "@/hooks/useReveal";
import { ExtLink, Link } from "@/router/Link";
import "@/styles/design.css";

export default function DesignPage() {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref);
  const juntos = mediaOf("juntos").shots[0];
  const nasck = mediaOf("nasckui").shots[1] ?? mediaOf("nasckui").shots[0];
  return (
    <div className="stack" ref={ref}>
      <div className="sheet">
        <div className="view-head" style={{ paddingBottom: 0 }}>
          <h1 className="display">Design</h1>
          <p className="lead muted">Estudos de interface publicados como páginas funcionais, com animação, 3D e áudio. Todos têm versão ao vivo.</p>
        </div>
      </div>
      <div className="lab-grid" data-sec="Estudos">
        {DESIGNS.map((d) => (
          <article className="study" key={d.id} aria-labelledby={`st-${d.id}`}>
            <div className="pic">
              <img src={d.image} alt={d.alt} loading="lazy" decoding="async" />
            </div>
            <div className="tx">
              <div className="pname">
                <h2 className="h3" id={`st-${d.id}`}>
                  {d.name}
                </h2>
                <span className="kind">{d.kind}</span>
              </div>
              <p className="muted">{d.text}</p>
              <div className="chips">
                {d.tools.map((t) => (
                  <span className="chip" key={t}>
                    {t}
                  </span>
                ))}
              </div>
              <div className="links">
                <ExtLink className="btn btn-ink" href={d.live}>
                  Ver ao vivo<span className="sr">: {d.name}</span>
                  <Arrow />
                </ExtLink>
                {d.caseId ? (
                  <Link className="btn btn-line" to={projectPath(d.caseId)}>
                    Estudo de caso<span className="sr"> do {d.name}</span>
                  </Link>
                ) : null}
                {d.code ? (
                  <ExtLink className="btn btn-line" href={d.code}>
                    Código-fonte<span className="sr"> do {d.name}</span>
                  </ExtLink>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
      <section className="sheet" aria-labelledby="dj-t" data-sec="Design em produto">
        <div className="sec-head">
          <div>
            <h2 className="h2" id="dj-t">
              Design aplicado aos produtos
            </h2>
            <p className="muted" style={{ marginTop: 10, maxWidth: "60ch" }}>
              Cada produto tem identidade visual própria, temas claro e escuro e versão para celular.
            </p>
          </div>
          <Link className="btn btn-line" to="/projetos">
            Ver projetos
          </Link>
        </div>
        <div className="teaser two">
          <Link to={projectPath("juntos")}>
            {juntos ? <img src={juntos.src} alt="" loading="lazy" decoding="async" /> : null}
            <span>
              Juntos<small>Finanças da casa, mobile-first</small>
            </span>
          </Link>
          <Link to={projectPath("nasckui")}>
            {nasck ? <img src={nasck.src} alt="" loading="lazy" decoding="async" /> : null}
            <span>
              Nasck UI<small>Design System em React e Angular</small>
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
