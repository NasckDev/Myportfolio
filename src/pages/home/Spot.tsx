import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Arrow, Feats } from "@/components/Blocks";
import { Cover } from "@/components/Cover";
import { Icon } from "@/components/Icon";
import { mediaOf } from "@/data/media";
import { getProject, projectPath, SPOT_IDS } from "@/data/projects";
import { isSoftMotion } from "@/lib/motion";
import { ExtLink, Link } from "@/router/Link";

const SWAP_MS = 330;
const two = (n: number) => String(n).padStart(2, "0");

/** Vitrine "Outros produtos": troca sozinha (barra de 7 s na aba), pausa com o cursor em cima ou no botão. */
export function Spot() {
  const [cur, setCur] = useState(0);
  const [shown, setShown] = useState(0);
  const [go, setGo] = useState(false);
  const [paused, setPaused] = useState(false);
  const [pop, setPop] = useState(-1);
  const stageRef = useRef<HTMLDivElement>(null);
  const timer = useRef(0);
  const tabsRef = useRef<HTMLDivElement>(null);

  const show = (i: number, anim = true) => {
    const next = (i + SPOT_IDS.length) % SPOT_IDS.length;
    setCur(next);
    window.clearTimeout(timer.current);
    if (!anim || isSoftMotion()) {
      setGo(false);
      setShown(next);
      setPop(-1);
      return;
    }
    setPop(next);
    setGo(false);
    requestAnimationFrame(() => setGo(true));
    timer.current = window.setTimeout(() => setShown(next), SWAP_MS);
  };

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const p = getProject(SPOT_IDS[shown]!)!;
  const nextColor = getProject(SPOT_IDS[cur]!)!.color;
  const media = mediaOf(p.id);
  const main = p.links[0]!;

  return (
    <section className={`sheet spot${paused ? " paused" : ""}`} aria-label="Outros produtos">
      <div className="spot-tabs" ref={tabsRef}>
        <span className="spot-lbl" aria-hidden="true">
          Outros produtos
        </span>
        <div role="tablist" aria-label="Outros produtos" style={{ display: "contents" }}>
        {SPOT_IDS.map((id, i) => {
          const pr = getProject(id)!;
          return (
            <button
              type="button"
              key={id}
              role="tab"
              id={`spot-tab-${id}`}
              aria-selected={i === cur}
              aria-controls="spot-stage"
              tabIndex={i === cur ? 0 : -1}
              className={`spot-tab${pop === i ? " pop" : ""}`}
              style={{ "--pc": pr.color } as CSSProperties}
              onClick={() => show(i)}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                  e.preventDefault();
                  const n = (i + (e.key === "ArrowRight" ? 1 : -1) + SPOT_IDS.length) % SPOT_IDS.length;
                  show(n);
                  tabsRef.current?.querySelector<HTMLElement>(`#spot-tab-${SPOT_IDS[n]}`)?.focus();
                }
              }}
            >
              <span>{pr.name}</span>
              <i
                className="bar"
                onAnimationEnd={() => {
                  if (i === cur) show(cur + 1);
                }}
              />
            </button>
          );
        })}
        </div>
        <span className="spot-ctl">
          <button type="button" className="icon-btn" aria-label="App anterior" onClick={() => show(cur - 1)}>
            <Icon name="back" />
          </button>
          <button
            type="button"
            className="icon-btn"
            aria-pressed={paused}
            aria-label={paused ? "Continuar a troca automática" : "Pausar a troca automática"}
            onClick={() => setPaused((v) => !v)}
          >
            <Icon name={paused ? "play" : "pause"} />
          </button>
          <button type="button" className="icon-btn" aria-label="Próximo app" style={{ transform: "scaleX(-1)" }} onClick={() => show(cur + 1)}>
            <Icon name="back" />
          </button>
        </span>
      </div>
      <div
        className={`spot-stage${go ? " go" : ""}`}
        id="spot-stage"
        role="tabpanel"
        aria-labelledby={`spot-tab-${SPOT_IDS[cur]}`}
        ref={stageRef}
        style={{ "--pc": p.color, "--pf": p.on, "--nx": nextColor } as CSSProperties}
        onAnimationEnd={(e) => {
          if (e.target === stageRef.current) setGo(false);
        }}
      >
        <Cover project={p} media={media} className="spot-cover" decorative />
        <div className="spot-info">
          <span className="spot-top">
            <span className="spot-count">
              {two(shown + 1)} / {two(SPOT_IDS.length)}
            </span>
            <span className={`status${p.live ? " live" : ""}`}>{p.status}</span>
          </span>
          <h3 className="spot-name">{p.name}</h3>
          <p className="lead" style={{ fontWeight: 650 }}>
            {p.pitch}
          </p>
          <Feats items={p.feats} limit={3} />
          <div className="links">
            <ExtLink className="btn btn-ink" href={main[1]}>
              {main[0]}
              <Arrow />
            </ExtLink>
            <Link className="btn btn-line" to={projectPath(p.id)}>
              Ver estudo de caso
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
