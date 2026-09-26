import { useEffect, useRef, useState } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { live } from "@/lib/live";

const MSGS = ["carregando fontes", "montando componentes", "renderizando cena 3D", "pronto"];
const SQ_TRANSITION = "transform .5s cubic-bezier(.34,1.56,.64,1),opacity .3s,border-radius .4s,background .4s";

export function Loader() {
  const { motion, setHeroReady } = usePortfolio();
  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const msgRef = useRef<HTMLSpanElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const sqRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const skip = useRef(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    let dead = false;
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms));
    if (!el || !live.motion) {
      setGone(true);
      setHeroReady();
      return;
    }
    document.body.style.overflow = "hidden";
    const sq = sqRefs.current;
    sq.forEach((s, i) =>
      later(() => {
        if (!s) return;
        s.style.opacity = "1";
        s.style.transform = "scale(1)";
      }, 60 + i * 110),
    );
    later(() => {
      const s = sq[3];
      if (!s) return;
      s.style.borderRadius = "999px";
      s.style.background = "#1783C1";
    }, 620);
    let fontsOk = !document.fonts;
    document.fonts?.ready.then(() => {
      fontsOk = true;
    });
    const t0 = performance.now();
    let v = 0;
    let raf = 0;
    const step = (now: number) => {
      if (dead) return;
      const e = now - t0;
      const ready = (fontsOk && live.hero3dReady) || e > 1700 || skip.current;
      const target = ready && e > 950 ? 1 : Math.min(0.9, e / 1100);
      v += (target - v) * (skip.current ? 0.4 : 0.14);
      if (target === 1 && v > 0.995) v = 1;
      if (barRef.current) barRef.current.style.transform = `scaleX(${v.toFixed(3)})`;
      if (pctRef.current) pctRef.current.textContent = Math.round(v * 100) + "%";
      if (msgRef.current) msgRef.current.textContent = v >= 1 ? MSGS[3] : MSGS[Math.min(2, Math.floor(v * 3))];
      if (v >= 1) {
        later(() => {
          el.style.clipPath = "inset(0 0 100% 0)";
          document.body.style.overflow = "";
          later(setHeroReady, 280);
          later(() => setGone(true), 950);
        }, 160);
        return;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      timers.forEach((t) => window.clearTimeout(t));
    };
    // O loader roda uma única vez, na montagem.
  }, [setHeroReady]);

  if (gone || !motion) return null;

  return (
    <div
      ref={rootRef}
      role="status"
      aria-label="Carregando portfólio"
      onClick={() => {
        skip.current = true;
      }}
      className="fixed inset-0 z-[300] flex items-center justify-center bg-bg"
      style={{ clipPath: "inset(0 0 0 0)", transition: "clip-path .9s cubic-bezier(.76,0,.24,1)" }}
    >
      <div
        aria-hidden="true"
        className="dot-grid pointer-events-none absolute inset-0"
        style={{ WebkitMaskImage: "radial-gradient(circle at 50% 50%,#000 0%,transparent 55%)", maskImage: "radial-gradient(circle at 50% 50%,#000 0%,transparent 55%)" }}
      />
      <div className="relative flex w-[min(340px,80vw)] flex-col gap-[22px]">
        <div className="flex items-center gap-4">
          <span className="grid shrink-0 grid-cols-[14px_14px] gap-[5px]">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                ref={(n) => {
                  sqRefs.current[i] = n;
                }}
                className="size-[14px] rounded-[3px] bg-head"
                style={{ opacity: 0, transform: "scale(.3)", transition: SQ_TRANSITION }}
              />
            ))}
          </span>
          <span className="flex flex-col gap-1 leading-[1.1]">
            <span className="flex items-baseline gap-1.5 text-[18px] text-head">
              <span className="stretch-118 font-bold">Alexandre</span>
              <span className="text-muted">Nascimento</span>
            </span>
            <span className="mono text-[12px] text-accent-text">Software Engineer</span>
          </span>
        </div>
        <div className="h-[3px] overflow-hidden rounded-[3px] bg-line">
          <div ref={barRef} className="h-full w-full origin-left rounded-[3px]" style={{ background: "linear-gradient(90deg,#0A3C6E,#1783C1,#6CC0EE)", transform: "scaleX(0)" }} />
        </div>
        <div className="mono flex justify-between gap-3 text-[12.5px] text-muted">
          <span ref={msgRef}>iniciando</span>
          <span ref={pctRef} className="tabular-nums">
            0%
          </span>
        </div>
      </div>
    </div>
  );
}
