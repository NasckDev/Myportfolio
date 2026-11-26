import { useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { Icon } from "@/components/Icon";
import { GAME } from "@/data/content";
import { LINKS } from "@/data/site";
import { useReveal } from "@/hooks/useReveal";
import { ExtLink } from "@/router/Link";
import "@/styles/game.css";

/** Véspera: a cena fica no escuro e uma "lanterna" acompanha o cursor ou o dedo; o botão acende tudo. */
export default function GamePage() {
  const ref = useRef<HTMLDivElement>(null);
  const lantern = useRef<HTMLElement>(null);
  const [lit, setLit] = useState(false);
  useReveal(ref);

  const aim = (e: PointerEvent<HTMLElement>) => {
    const el = lantern.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--lx", `${e.clientX - r.left}px`);
    el.style.setProperty("--ly", `${e.clientY - r.top}px`);
  };

  return (
    <div className="stack" ref={ref}>
      <section className={`lantern${lit ? " lit" : ""}`} aria-labelledby="vs-t" ref={lantern} onPointerMove={aim} onPointerDown={aim} data-testid="lantern">
        <img src={GAME.image} alt={GAME.alt} decoding="async" />
        <div className="dark" />
        <div className="scrim" />
        <div className="lantern-in">
          <h1 className="display" id="vs-t">
            Véspera
          </h1>
          <p className="lead">{GAME.lead}</p>
          <div className="chips">
            {GAME.chips.map((s) => (
              <span className="chip" key={s} style={{ borderColor: "rgba(255,255,255,.3)" }}>
                {s}
              </span>
            ))}
          </div>
          <div className="links">
            <ExtLink className="btn btn-tile" href={LINKS.vespera}>
              Site do jogo
              <span className="ar" style={{ background: GAME.color, color: "#fff" }}>
                <Icon name="arrow" />
              </span>
            </ExtLink>
            <ExtLink className="btn btn-ghost-tile" href={LINKS.vesperaReleases}>
              <Icon name="download" />
              Baixar o jogo
            </ExtLink>
            <ExtLink className="btn btn-ghost-tile" href={LINKS.vesperaRepo}>
              Código
            </ExtLink>
            <button type="button" className="btn btn-ghost-tile" aria-pressed={lit} onClick={() => setLit((v) => !v)}>
              {lit ? "Apagar a cena" : "Iluminar a cena"}
            </button>
          </div>
          <p className="hint">Mova o cursor ou o dedo sobre a imagem para iluminar a cena.</p>
        </div>
      </section>
      <div className="feats-grid" style={{ marginTop: 0, "--pc": GAME.color, "--pf": "#fff" } as CSSProperties} data-sec="Sobre o jogo">
        {GAME.feats.map(([t, d]) => (
          <div className="feat-card" key={t} style={{ background: "var(--sheet)" }}>
            <span className="ck">
              <Icon name="check" />
            </span>
            <b>{t}</b>
            <p className="muted">{d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
