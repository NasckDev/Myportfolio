import { useRef } from "react";
import { Arrow } from "@/components/Blocks";
import { PROJECTS, projectPath } from "@/data/projects";
import { useReveal } from "@/hooks/useReveal";
import { Link } from "@/router/Link";
import { useUi } from "@/shell/ui";

export default function NotFoundPage() {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref);
  const { openPanel } = useUi();
  return (
    <div className="stack" ref={ref}>
      <div className="sheet nf">
        <div className="view-head">
          <p className="chap-k">
            <b>404</b>Página não encontrada
          </p>
          <h1 className="display">Nada por aqui</h1>
          <p className="lead muted">O endereço pode ter mudado ou ter sido digitado errado. Os caminhos abaixo levam ao que importa.</p>
          <div className="links">
            <Link className="btn btn-ink" to="/">
              Ir para o início
              <Arrow />
            </Link>
            <Link className="btn btn-line" to="/projetos">
              Ver projetos
            </Link>
            <button type="button" className="btn btn-line" onClick={() => openPanel("palette")}>
              Buscar no site
            </button>
          </div>
        </div>
        <ul className="repo-list nf-card" aria-label="Estudos de caso">
          {PROJECTS.filter((p) => p.id !== "portfolio").map((p) => (
            <li key={p.id}>
              <Link to={projectPath(p.id)}>
                <b>{p.name}</b>
                <span className="q">{p.kind}</span>
                <span className="st">Estudo de caso</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
