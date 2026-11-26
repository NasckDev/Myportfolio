import { Icon } from "@/components/Icon";
import { NAV } from "@/data/routes";
import { nf, PERSON } from "@/data/site";
import { useVisits } from "@/hooks/useCounters";
import { Link } from "@/router/Link";
import { useRoute } from "@/router/router";
import { shortcutLabel } from "./Navigation";
import { useUi } from "./ui";

function Pager() {
  const route = useRoute();
  if (route.name === "projeto" || route.name === "nao-encontrada") return null;
  const i = NAV.findIndex((n) => n.id === route.name);
  const prev = NAV[i - 1];
  const next = NAV[i + 1];
  return (
    <nav className="pager" aria-label="Continuar navegando">
      {prev ? (
        <Link className="pg" to={prev.path}>
          <span className="c">
            <Icon name="back" />
          </span>
          <span>
            <small>Página anterior</small>
            <b>{prev.label}</b>
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link className="pg nx" to={next.path}>
          <span>
            <small>Próxima página</small>
            <b>{next.label}</b>
          </span>
          <span className="c">
            <Icon name="back" />
          </span>
        </Link>
      ) : null}
    </nav>
  );
}

export function Footer() {
  const route = useRoute();
  const { copyEmail } = useUi();
  const visits = useVisits();
  return (
    <footer className="wrap">
      <Pager />
      {route.name !== "contato" ? (
        <section className="contact cta on-dark" aria-labelledby="ct-t">
          <div>
            <h2 className="display" id="ct-t">
              Procurando um engenheiro
              <br />
              de software sênior?
            </h2>
            <div className="modes">
              <span className="chip">Front-end ou full stack</span>
              <span className="chip">React, TypeScript e Node.js</span>
              <span className="chip">6 anos de experiência</span>
              <span className="chip">Remoto ou híbrido em SP</span>
            </div>
          </div>
          <div className="contact-row">
            <Link className="btn btn-accent" to="/contato">
              Entrar em contato
              <span className="ar">
                <Icon name="arrow" />
              </span>
            </Link>
            <button type="button" className="btn btn-ghost-tile" onClick={copyEmail}>
              <Icon name="copy" />
              Copiar e-mail
            </button>
          </div>
        </section>
      ) : null}
      <div className="foot">
        <span>
          {PERSON.fullName}, {PERSON.city}
        </span>
        {visits !== null ? <span>{nf(visits)} visitas</span> : null}
        <span className="kbd-hint">{shortcutLabel()} abre a busca em qualquer página</span>
      </div>
    </footer>
  );
}
