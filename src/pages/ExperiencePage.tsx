import { useEffect, useRef } from "react";
import { Arrow } from "@/components/Blocks";
import { Icon } from "@/components/Icon";
import { EDU, INTERESTS, JOBS } from "@/data/content";
import { LINKS, PERSON, PORTRAIT } from "@/data/site";
import { useReveal } from "@/hooks/useReveal";
import { ExtLink, Link } from "@/router/Link";
import "@/styles/experience.css";

/** Linha do tempo: a barra laranja cresce com a rolagem e marca os empregos já lidos. */
function useTimeline(ref: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const tl = ref.current;
      if (!tl) return;
      const rc = tl.getBoundingClientRect();
      const mark = window.innerHeight * 0.62;
      const tp = Math.max(0, Math.min(1, (mark - rc.top - 34) / Math.max(1, rc.height - 68)));
      tl.style.setProperty("--tp", tp.toFixed(4));
      tl.querySelectorAll<HTMLElement>(".xp").forEach((x) => x.classList.toggle("on", x.getBoundingClientRect().top + 30 < mark));
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
  }, [ref]);
}

export default function ExperiencePage() {
  const ref = useRef<HTMLDivElement>(null);
  const tl = useRef<HTMLDivElement>(null);
  useReveal(ref);
  useTimeline(tl);
  return (
    <div className="stack" ref={ref}>
      <div className="sheet">
        <div className="view-head" style={{ paddingBottom: 0 }}>
          <h1 className="display">Experiência</h1>
          <p className="lead muted">
            Seis anos como engenheiro de software, do primeiro estágio em SAP a produto SaaS com IA: consultoria, um projeto de telecom de grande porte e, hoje, time de produto.
          </p>
        </div>
      </div>
      <div className="about">
        <aside className="me" aria-label="Sobre mim">
          <img src={PORTRAIT.photo} alt={PORTRAIT.photoAlt} width={720} height={900} decoding="async" />
          <div className="tx">
            <div>
              <h2 className="h3">{PERSON.name}</h2>
              <p className="muted">Engenheiro de software, São Paulo</p>
            </div>
            <div className="links">
              <Link className="btn btn-accent" to="/contato">
                Entrar em contato
              </Link>
              <ExtLink className="btn btn-line" href={LINKS.cv}>
                <Icon name="download" />
                Currículo
              </ExtLink>
            </div>
            <ExtLink className="btn btn-line" href={LINKS.linkedin}>
              LinkedIn
            </ExtLink>
          </div>
        </aside>
        <div className="stack">
          <section className="sheet" aria-labelledby="xp-t" data-sec="Trajetória">
            <h2 className="h2" id="xp-t">
              Trajetória
            </h2>
            <div className="tl" ref={tl}>
              <div className="tl-line" aria-hidden="true">
                <i />
              </div>
              {JOBS.map((job, k) => (
                <article className="xp" key={job.when} aria-labelledby={`job-${k}`}>
                  <div className="xp-when">
                    <span>{job.when}</span>
                    {k === 0 ? <span className="chip now">Atual</span> : null}
                  </div>
                  <div className="xp-body">
                    <div>
                      <h3 className="h3" id={`job-${k}`}>
                        {job.company}
                      </h3>
                      <p className="muted">{job.role}</p>
                    </div>
                    <ul>
                      {job.items.map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                    <div className="chips">
                      {job.tech.map((t) => (
                        <span className="chip" key={t}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
          <section className="sheet" style={{ display: "grid", gap: 16 }} data-sec="Como trabalho" aria-labelledby="hw-t">
            <h2 className="h2" id="hw-t">
              Trabalho entre engenharia, produto e design
            </h2>
            <p className="lead">
              Entendo a regra de negócio, modelo os estados da interface e entrego componentes que o time consegue manter. Gosto de trabalhar perto de Produto e Design, questionando requisitos e propondo caminhos mais simples.
            </p>
            <p className="lead muted">Meu foco hoje são interfaces complexas: Design Systems, produtos orientados a dados, acessibilidade e integrações com estados assíncronos.</p>
            <p className="lead muted">
              No back-end, trabalhei com microsserviços e APIs em Node.js e NestJS, construí o servidor e o banco do Juntos, os proxies de APIs públicas do Coverlist e do Garrafão e tenho experiência com C#.
            </p>
            <div className="chips">
              {INTERESTS.map((s) => (
                <span className="chip" key={s}>
                  {s}
                </span>
              ))}
            </div>
            <div className="links">
              <Link className="btn btn-ink" to="/habilidades">
                Ver habilidades e evidências
                <Arrow />
              </Link>
            </div>
          </section>
          <section className="sheet" aria-labelledby="ed-t" data-sec="Formação">
            <h2 className="h2" id="ed-t" style={{ marginBottom: 12 }}>
              Formação e certificações
            </h2>
            <ul className="edu">
              {EDU.map(([a, b]) => (
                <li key={a}>
                  <b>{a}</b>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
