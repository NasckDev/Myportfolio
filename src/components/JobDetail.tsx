import { Dialog } from "@/components/Dialog";
import { Icon } from "@/components/Icon";
import { LINKS } from "@/data/site";
import type { CompanyMark, Job } from "@/data/types";
import { ExtLink } from "@/router/Link";

/** Logos das empresas sobre uma placa clara, para manter as cores oficiais nos dois temas. */
export function CompanyMarks({ marks, className }: { marks: readonly CompanyMark[]; className?: string }) {
  return (
    <span className={`marks${className ? ` ${className}` : ""}`}>
      {marks.map((m) =>
        "src" in m ? (
          <span className="mark" key={m.src}>
            <img src={m.src} alt={m.alt} width={m.width} height={m.height} loading="lazy" decoding="async" />
          </span>
        ) : (
          <span className="mark mono" key={m.mono} role="img" aria-label={m.alt}>
            {m.mono}
          </span>
        ),
      )}
    </span>
  );
}

function Section({ id, title, items }: { id: string; title: string; items: readonly string[] }) {
  return (
    <section className="jd-sec" aria-labelledby={id}>
      <h3 id={id}>{title}</h3>
      <ul>
        {items.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
    </section>
  );
}

function JobBody({ job, onClose }: { job: Job; onClose: () => void }) {
  const d = job.detail;
  return (
    <div className="jd">
      <header className="jd-head">
        <div className="jd-top">
          <CompanyMarks marks={job.marks} />
          <button type="button" className="icon-btn" aria-label="Fechar" onClick={onClose}>
            <Icon name="x" />
          </button>
        </div>
        <p className="small muted">{job.when}</p>
        <h2 className="h2" id="job-t">
          {job.company}
        </h2>
        <p className="muted">{job.role}</p>
      </header>
      <p className="lead">{d.context}</p>
      <Section id="jd-did" title="O que eu fazia" items={d.did} />
      {d.ai ? <Section id="jd-ai" title="IA no dia a dia" items={d.ai} /> : null}
      {d.highlights ? <Section id="jd-hl" title="Entregas em destaque" items={d.highlights} /> : null}
      <section className="jd-sec" aria-labelledby="jd-st">
        <h3 id="jd-st">Stack</h3>
        <div className="chips">
          {d.stack.map((t) => (
            <span className="chip" key={t}>
              {t}
            </span>
          ))}
        </div>
      </section>
      <footer className="jd-foot">
        <ExtLink className="btn btn-line" href={LINKS.cv}>
          <Icon name="download" />
          Currículo em PDF
        </ExtLink>
        <button type="button" className="btn btn-ink" onClick={onClose}>
          Fechar
        </button>
      </footer>
    </div>
  );
}

/** Detalhe de uma experiência em diálogo modal: foco preso, Esc fecha e o foco volta ao botão. */
export function JobDialog({ job, onClose }: { job: Job | null; onClose: () => void }) {
  return (
    <Dialog open={!!job} id="job" labelledBy="job-t" onClose={onClose}>
      {job ? <JobBody job={job} onClose={onClose} /> : null}
    </Dialog>
  );
}
