import type { CSSProperties, ReactNode } from "react";
import { DESIGNS, SPECIALTIES } from "@/data/content";
import { Link } from "@/router/Link";
import { Icon } from "./Icon";

export function ChapHead({ n, k, title, text, href, cta, titleId }: { n: string; k: string; title?: string; text?: string; href?: string; cta?: string; titleId?: string }) {
  return (
    <header className="chap-head">
      <div>
        <span className="chap-k">
          <b>{n}</b>
          {k}
        </span>
        {title ? (
          <h2 className="h2" id={titleId}>
            {title}
          </h2>
        ) : null}
        {text ? <p className="muted">{text}</p> : null}
      </div>
      {href && cta ? (
        <Link className="btn btn-line" to={href}>
          {cta}
        </Link>
      ) : null}
    </header>
  );
}

/** Cartões de especialidade: cada um abre a habilidade correspondente na página Habilidades. */
export function SpecCards() {
  return (
    <div className="principles">
      {SPECIALTIES.map(([icon, title, text, skill]) => (
        <Link className="principle" to="/habilidades" state={{ skill, jump: true }} key={title}>
          <span className="pi">
            <Icon name={icon} />
          </span>
          <b>{title}</b>
          <p className="muted">{text}</p>
          <span className="lk">Ver onde foi aplicada</span>
        </Link>
      ))}
    </div>
  );
}

export function DesignTeaser() {
  return (
    <div className="teaser two">
      {DESIGNS.map((d) => (
        <Link to="/design" key={d.id}>
          <img src={d.image} alt="" loading="lazy" decoding="async" />
          <span>
            {d.name}
            <small>{d.kind}</small>
          </span>
        </Link>
      ))}
    </div>
  );
}

export function Chips({ items, style }: { items: readonly ReactNode[]; style?: CSSProperties }) {
  return (
    <div className="chips">
      {items.map((s, i) => (
        <span className="chip" key={i} style={style}>
          {s}
        </span>
      ))}
    </div>
  );
}

/** Lista com marcador de check (recursos de um produto). */
export function Feats({ items, limit }: { items: readonly (readonly [string, string])[]; limit?: number }) {
  return (
    <ul className="feats">
      {items.slice(0, limit ?? items.length).map(([t, d]) => (
        <li key={t}>
          <span className="ck">
            <Icon name="check" />
          </span>
          <span>
            <b>{t}.</b> <span className="muted">{d}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export function Arrow() {
  return (
    <span className="ar">
      <Icon name="arrow" />
    </span>
  );
}
