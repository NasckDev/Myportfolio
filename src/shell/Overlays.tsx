import { useEffect, useRef, useState } from "react";
import { Dialog } from "@/components/Dialog";
import { Icon, Logo } from "@/components/Icon";
import { PORTRAIT } from "@/data/site";
import { scrollBehavior } from "@/lib/motion";
import { setPref, systemWantsLessMotion, usePrefs } from "@/lib/prefs";
import { readStorage, writeStorage } from "@/lib/storage";
import { MoreLinks } from "./Navigation";
import { useUi } from "./ui";

export function Toast() {
  const { toastMsg, toastOn } = useUi();
  return (
    <div className={`toast${toastOn ? " on" : ""}`} role="status" aria-live="polite">
      {toastMsg}
    </div>
  );
}

export function MoreSheet() {
  const { panel, closePanel } = useUi();
  return (
    <Dialog open={panel === "more"} id="more" label="Mais páginas" onClose={() => panel === "more" && closePanel()}>
      <MoreLinks />
    </Dialog>
  );
}

function LightboxBody() {
  const { lightbox, closeLightbox } = useUi();
  const [i, setI] = useState(lightbox?.index ?? 0);
  if (!lightbox) return null;
  const items = lightbox.items;
  const cur = items[i] ?? items[0]!;
  const step = (d: number) => setI((v) => (v + d + items.length) % items.length);
  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions -- setas trocam a imagem; cada ação também tem botão
    <div
      className="lb"
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") step(-1);
        else if (e.key === "ArrowRight") step(1);
      }}
    >
      <button type="button" className="icon-btn" id="lb-prev" aria-label="Imagem anterior" onClick={() => step(-1)}>
        <Icon name="back" />
      </button>
      <figure>
        <img src={cur.src} alt={cur.caption} />
        <figcaption>
          <span>{cur.caption}</span>
          <span id="lb-n">
            {i + 1} de {items.length}
          </span>
        </figcaption>
      </figure>
      <button type="button" className="icon-btn" id="lb-next" aria-label="Próxima imagem" style={{ transform: "scaleX(-1)" }} onClick={() => step(1)}>
        <Icon name="back" />
      </button>
      <button type="button" className="icon-btn lb-x" aria-label="Fechar" onClick={closeLightbox}>
        <Icon name="x" />
      </button>
    </div>
  );
}

export function Lightbox() {
  const { lightbox, closeLightbox } = useUi();
  return (
    <Dialog open={!!lightbox} id="lightbox" label="Imagem ampliada" onClose={closeLightbox}>
      <LightboxBody />
    </Dialog>
  );
}

export function BackToTop() {
  const ref = useRef<HTMLButtonElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      ref.current?.style.setProperty("--p", (max > 0 ? Math.min(1, window.scrollY / max) : 0).toFixed(4));
      setOn(window.scrollY > 700);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <button
      ref={ref}
      type="button"
      className={`totop${on ? " on" : ""}`}
      aria-label="Voltar ao topo"
      tabIndex={on ? 0 : -1}
      aria-hidden={on ? undefined : true}
      onClick={() => window.scrollTo({ top: 0, behavior: scrollBehavior() })}
    >
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="24" r="21" />
        <circle className="tt-p" cx="24" cy="24" r="21" pathLength={1} />
      </svg>
      <Icon name="back" style={{ transform: "rotate(90deg)" }} />
    </button>
  );
}

const NOTE_KEY = "nasck-aviso-movimento";
const NOTE_MS = 7000;

/** Aviso compacto e não bloqueante: aparece uma vez, some sozinho e lembra que foi fechado. */
export function MotionNote() {
  const prefs = usePrefs();
  const { toast } = useUi();
  const [hidden, setHidden] = useState(() => readStorage(NOTE_KEY) === "1");
  const eligible = !hidden && prefs.motion === "auto" && systemWantsLessMotion();

  useEffect(() => {
    if (!eligible) return;
    writeStorage(NOTE_KEY, "1");
    const t = window.setTimeout(() => setHidden(true), NOTE_MS);
    return () => window.clearTimeout(t);
  }, [eligible]);

  if (!eligible) return null;
  return (
    <div className="note-bar" role="status">
      <span>Animações suaves, como seu sistema pede.</span>
      <button
        type="button"
        className="btn btn-accent small-btn"
        onClick={() => {
          setPref("motion", "full");
          setHidden(true);
          toast("Animações ligadas");
        }}
      >
        Ligar
      </button>
      <button type="button" className="icon-btn" aria-label="Fechar aviso" onClick={() => setHidden(true)}>
        <Icon name="x" />
      </button>
    </div>
  );
}

const BOOT_KEY = "nasck-boot";
const BOOT_MIN_MS = 1300;
const BOOT_MAX_MS = 2600;

/** A abertura só aparece na primeira visita da sessão, nunca com movimento suave. */
export function shouldBoot(): boolean {
  return readStorage(BOOT_KEY, "session") !== "1" && document.documentElement.dataset.motion !== "soft";
}

/** Abertura animada: conta até 100 enquanto fontes e retrato carregam; clique ou tecla pulam. */
export function Boot({ onDone }: { onDone: () => void }) {
  const [out, setOut] = useState(false);
  const [gone, setGone] = useState(false);
  const nRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLElement>(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    let ready = false;
    let fin = false;
    const timers: number[] = [];
    const t0 = performance.now();
    const pic = new Image();
    pic.src = PORTRAIT.cutout;
    Promise.race([
      Promise.all([document.fonts?.ready, pic.decode?.().catch(() => undefined)]),
      new Promise((r) => window.setTimeout(r, BOOT_MAX_MS)),
    ]).then(() => {
      ready = true;
    });
    const finish = () => {
      if (fin) return;
      fin = true;
      if (nRef.current) nRef.current.textContent = "100";
      barRef.current?.style.setProperty("transform", "scaleX(1)");
      writeStorage(BOOT_KEY, "1", "session");
      setOut(true);
      timers.push(window.setTimeout(() => doneRef.current(), 420));
      timers.push(window.setTimeout(() => setGone(true), 1000));
    };
    let raf = 0;
    const step = (t: number) => {
      if (fin) return;
      const k = Math.min(1, (t - t0) / BOOT_MIN_MS);
      const e = 1 - Math.pow(1 - k, 3);
      const v = ready ? e : Math.min(e, 0.9);
      if (nRef.current) nRef.current.textContent = String(Math.round(v * 100));
      barRef.current?.style.setProperty("transform", `scaleX(${v})`);
      if (k >= 1 && ready) return finish();
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    window.addEventListener("keydown", finish, { once: true });
    window.addEventListener("pointerdown", finish, { once: true });
    return () => {
      cancelAnimationFrame(raf);
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener("keydown", finish);
      window.removeEventListener("pointerdown", finish);
    };
  }, []);

  if (gone) return null;
  return (
    <div className={`boot${out ? " out" : ""}`} aria-hidden="true" data-testid="boot">
      <div className="boot-mid">
        <Logo className="logo boot-logo" />
        <span className="boot-brand">
          {"nasck".split("").map((c, i) => (
            <span key={i} style={{ "--i": i } as React.CSSProperties}>
              {c}
            </span>
          ))}
        </span>
      </div>
      <div className="boot-low">
        <span>Alexandre Diogo, engenheiro de software</span>
        <b ref={nRef}>0</b>
      </div>
      <div className="boot-bar">
        <i ref={barRef} />
      </div>
    </div>
  );
}
