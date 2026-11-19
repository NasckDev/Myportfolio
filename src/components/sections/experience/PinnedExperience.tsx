import { useEffect, useRef, useState } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { jobs, type Job } from "@/data/portfolio";
import { live, onScrollFrame, setStyle } from "@/lib/live";
import { loadThree, whenNear } from "@/three/loadThree";
import { createXpScene } from "@/three/xpScene";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { CaseLink, JobItems, pad } from "./shared";

const js = jobs.slice().reverse();
const n = js.length;

/** Contexto da vaga com o destaque "Vivo" quando aparece. */
function JobContext({ text }: { text: string }) {
  const vi = text.indexOf("Vivo");
  if (vi < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, vi)}
      <strong className="rounded-md px-[7px] py-px font-bold" style={{ color: "#8A2BE2", background: "rgba(138,43,226,.12)" }}>
        Vivo
      </strong>
      {text.slice(vi + 4)}
    </>
  );
}

interface SlideProps {
  job: Job;
  i: number;
  idx: number;
  short: boolean;
  tiny: boolean;
  onOpenCase: (i: number) => void;
}

function JobSlide({ job, i, idx, short, tiny, onOpenCase }: SlideProps) {
  const on = i === idx;
  const rel = i - idx;
  return (
    <article
      aria-hidden={!on}
      className="absolute inset-0 flex flex-col overflow-hidden"
      style={{
        justifyContent: "safe center",
        gap: short ? 10 : 14,
        opacity: on ? 1 : 0,
        transform: on ? "none" : `translateY(${rel > 0 ? 40 : -40}px) scale(.97)`,
        filter: on ? "none" : "blur(8px)",
        pointerEvents: on ? "auto" : "none",
        visibility: on ? "visible" : "hidden",
        transition: `opacity .6s ease,transform .8s cubic-bezier(.2,.8,.2,1),filter .6s ease,visibility 0s linear ${on ? "0s" : ".6s"}`,
      }}
    >
      <div className="mono flex items-center gap-3 text-[13px] font-semibold text-accent-text">
        <span>
          {pad(i + 1)} / {pad(n)}
        </span>
        <span className="h-px w-10 bg-line2" />
        <span className="font-medium text-muted">{job.period}</span>
      </div>
      <h3 className="stretch-122 m-0 font-bold text-head" style={{ fontSize: "clamp(30px,min(4.2vw,6.4vh),58px)", lineHeight: 1, letterSpacing: "-.03em" }}>
        {job.company}
      </h3>
      <span className="font-semibold text-ink" style={{ fontSize: "clamp(17px,1.5vw,19px)" }}>
        {job.role}
      </span>
      <p className="m-0 max-w-[48ch] text-[16px] leading-[1.6] text-muted" style={{ display: tiny ? "none" : "block" }}>
        <JobContext text={job.context} />
      </p>
      <JobItems items={job.items} on={on} hiddenTransform="translateY(10px)" delay={220} step={80} fadeDur=".45s" moveDur=".6s" style={{ display: short ? "none" : "flex" }} />
      <CaseLink job={job} onOpen={onOpenCase} surface />
    </article>
  );
}

/** Desktop: seção fixada com cena 3D; o scroll avança pelas experiências. */
export function PinnedExperience() {
  const { vp, openCase } = usePortfolio();
  const xpRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const short = vp.vh < 760;
  const tiny = vp.vh < 620;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let dead = false;
    let scene: { dispose: () => void } | null = null;
    const stopWatching = whenNear(mount, () => {
      loadThree()
        .then((THREE) => {
          if (dead) return;
          try {
            scene = createXpScene(THREE, mount, n);
          } catch (e) {
            console.warn(e);
          }
        })
        .catch(() => {});
    });
    return () => {
      dead = true;
      stopWatching();
      scene?.dispose();
    };
  }, []);

  // Progresso pelo scroll: só roda quando o scroll muda e só escreve o que mudou.
  useEffect(
    () =>
      onScrollFrame(() => {
        const xp = xpRef.current;
        if (!xp) return;
        const r = xp.getBoundingClientRect();
        const span = r.height - innerHeight;
        const p = Math.min(1, Math.max(0, -r.top / (span > 0 ? span : 1)));
        const i = Math.min(n - 1, Math.floor(p * n));
        live.xpP = p;
        if (i !== live.xpIdx) {
          live.xpIdx = i;
          setIdx(i);
        }
        const ps = p.toFixed(4);
        setStyle(fillRef.current, "transform", `scaleX(${ps})`);
        setStyle(trackRef.current, "--p", ps);
      }),
    [],
  );

  useEffect(
    () => () => {
      live.xpIdx = 0;
      live.xpP = 0;
    },
    [],
  );

  const go = (i: number) => {
    const el = xpRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + live.scrollY;
    const span = el.offsetHeight - innerHeight;
    window.scrollTo({ top: top + (span * (i + 0.5)) / n, behavior: live.motion ? "smooth" : "auto" });
  };

  return (
    <div ref={xpRef} className="relative" style={{ height: `calc(${n * 95 + 100}vh / var(--zoom, 1))` }}>
      <div className="h-vp sticky top-0 overflow-hidden">
        <div ref={mountRef} aria-hidden="true" className="absolute inset-0" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(90deg,var(--bg) 0%,var(--bg) 24%,transparent 56%),linear-gradient(0deg,var(--bg) 0%,transparent 20%),linear-gradient(180deg,var(--bg) 0%,transparent 18%)" }}
        />
        <div
          className="relative mx-auto box-border flex h-full max-w-[1180px] flex-col"
          style={{ padding: "clamp(84px,12vh,124px) clamp(20px,4vw,40px) clamp(16px,4vh,40px)", gap: "clamp(10px,2.6vh,26px)" }}
        >
          <div className="flex max-w-[560px] flex-col" style={{ gap: "clamp(6px,1.2vh,10px)" }}>
            <SectionLabel>03 — EXPERIÊNCIA</SectionLabel>
            <h2 className="stretch-120 font-bold text-head" style={{ fontSize: "clamp(26px,min(3.4vw,5.4vh),44px)", lineHeight: 1.08, letterSpacing: "-.025em" }}>
              Trajetória profissional.
            </h2>
          </div>
          <div className="relative min-h-0 max-w-[540px] flex-1">
            {js.map((j, i) => (
              <JobSlide key={j.company} job={j} i={i} idx={idx} short={short} tiny={tiny} onOpenCase={openCase} />
            ))}
          </div>
          <div className="flex flex-col gap-1">
            <div ref={trackRef} className="relative h-1 rounded bg-line2" style={{ ["--p" as string]: 0 }}>
              <span
                ref={fillRef}
                className="absolute inset-0 origin-left rounded"
                style={{ background: "linear-gradient(90deg,#0A3C6E,#1783C1 70%,#6CC0EE)", boxShadow: "0 0 12px rgba(23,131,193,.55)", transform: "scaleX(0)" }}
              />
              <span
                aria-hidden="true"
                className="absolute top-1/2 -ml-[7px] -mt-[7px] box-border size-[14px] rounded-full bg-white"
                style={{ left: "calc(var(--p) * 100%)", border: "3px solid #1783C1", boxShadow: "0 0 0 5px rgba(23,131,193,.18),0 2px 8px rgba(10,60,110,.35)" }}
              />
            </div>
            <div className="flex gap-4">
              {js.map((j, i) => {
                const on = i === idx;
                return (
                  <button
                    key={j.company}
                    type="button"
                    onClick={() => go(i)}
                    aria-current={on ? "step" : undefined}
                    className="flex min-w-0 flex-1 cursor-pointer flex-col items-start gap-1 border-0 bg-transparent pt-2.5 text-left leading-[1.6] hover:text-head!"
                    style={{ color: i <= idx ? "var(--head)" : "var(--muted)", transition: "color .3s" }}
                  >
                    <span className="mono flex items-center gap-2 text-[12.5px] font-semibold">
                      <span className="size-2.5 rounded-full" style={{ background: i <= idx ? "#1783C1" : "var(--line2)", boxShadow: on ? "0 0 0 5px rgba(23,131,193,.2)" : "none", transition: "background .3s,box-shadow .3s" }} />
                      {pad(i + 1)}
                    </span>
                    <span className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[15px] font-bold">{j.company}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
