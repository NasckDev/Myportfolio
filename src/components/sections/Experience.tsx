import { useEffect, useRef, useState } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { jobs } from "@/data/portfolio";
import { live, onFrame } from "@/lib/live";
import { loadThree, whenNear } from "@/three/loadThree";
import { createXpScene } from "@/three/xpScene";
import { Reveal } from "@/components/motion/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ChevronDownIcon } from "@/components/ui/icons";

const pad = (x: number) => String(x).padStart(2, "0");
const Bullet = () => <span className="mt-[9px] size-1.5 shrink-0 rounded-full" style={{ background: "#1783C1", boxShadow: "0 0 0 4px rgba(23,131,193,.15)" }} />;

function PinnedExperience() {
  const { vp, openCase } = usePortfolio();
  const xpRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const js = jobs.slice().reverse();
  const n = js.length;
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
  }, [n]);

  useEffect(
    () =>
      onFrame(() => {
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
        if (fillRef.current) fillRef.current.style.transform = `scaleX(${p.toFixed(4)})`;
        trackRef.current?.style.setProperty("--p", p.toFixed(4));
      }),
    [n],
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
            {js.map((j, i) => {
              const on = i === idx;
              const rel = i - idx;
              const vi = j.context.indexOf("Vivo");
              return (
                <article
                  key={j.company}
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
                    <span className="font-medium text-muted">{j.period}</span>
                  </div>
                  <h3 className="stretch-122 m-0 font-bold text-head" style={{ fontSize: "clamp(30px,min(4.2vw,6.4vh),58px)", lineHeight: 1, letterSpacing: "-.03em" }}>
                    {j.company}
                  </h3>
                  <span className="font-semibold text-ink" style={{ fontSize: "clamp(17px,1.5vw,19px)" }}>
                    {j.role}
                  </span>
                  <p className="m-0 max-w-[48ch] text-[16px] leading-[1.6] text-muted" style={{ display: tiny ? "none" : "block" }}>
                    {vi < 0 ? (
                      j.context
                    ) : (
                      <>
                        {j.context.slice(0, vi)}
                        <strong className="rounded-md px-[7px] py-px font-bold" style={{ color: "#8A2BE2", background: "rgba(138,43,226,.12)" }}>
                          Vivo
                        </strong>
                        {j.context.slice(vi + 4)}
                      </>
                    )}
                  </p>
                  <ul className="m-0 list-none flex-col gap-2 p-0" style={{ display: short ? "none" : "flex" }}>
                    {j.items.map((t, k) => (
                      <li
                        key={t}
                        className="flex gap-3 text-[16px] leading-normal"
                        style={{
                          opacity: on ? 1 : 0,
                          transform: on ? "none" : "translateY(10px)",
                          transition: `opacity .45s ease ${on ? 220 + k * 80 : 0}ms,transform .6s cubic-bezier(.2,.8,.2,1) ${on ? 220 + k * 80 : 0}ms`,
                        }}
                      >
                        <Bullet />
                        {t}
                      </li>
                    ))}
                  </ul>
                  {j.caseIndex !== undefined && (
                    <button
                      type="button"
                      onClick={() => openCase(j.caseIndex!)}
                      className="flex cursor-pointer items-center gap-2 self-start rounded-full border border-line2 bg-surface px-3.5 py-2 text-[14px] font-semibold text-head hover:border-brand"
                    >
                      <span className="mono whitespace-nowrap text-[12px] text-muted">case relacionado</span>
                      {j.case} →
                    </button>
                  )}
                </article>
              );
            })}
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

function ListExperience() {
  const { vp, openJob, setOpenJob, openCase } = usePortfolio();
  const tlRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const headRef = useRef<HTMLSpanElement>(null);

  useEffect(
    () =>
      onFrame(() => {
        const tl = tlRef.current, fill = fillRef.current;
        if (!tl || !fill) return;
        const r = tl.getBoundingClientRect(), line = innerHeight * 0.6;
        const p = Math.min(1, Math.max(0, (line - r.top) / r.height));
        fill.style.transform = `scaleY(${p})`;
        const head = headRef.current;
        if (head) {
          head.style.transform = `translateY(${p * (r.height - 20)}px)`;
          head.style.opacity = p > 0.01 && p < 0.995 ? "1" : "0";
        }
        tl.querySelectorAll<HTMLElement>("[data-tldot]").forEach((d) => {
          const on = d.getBoundingClientRect().top < line;
          d.style.background = on ? "#1783C1" : "var(--bg)";
          d.style.borderColor = on ? "#1783C1" : "var(--line2)";
          d.style.boxShadow = on ? "0 0 0 6px rgba(23,131,193,.18), 0 0 18px rgba(23,131,193,.5)" : "none";
          d.style.transform = on ? "scale(1)" : "scale(.6)";
        });
      }),
    [],
  );

  return (
    <div className="container-x grid items-start gap-x-[72px] gap-y-10" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,380px),1fr))" }}>
      <div className="top-[120px] flex flex-col gap-4" style={{ position: vp.w >= 900 ? "sticky" : "static" }}>
        <SectionLabel>03 — EXPERIÊNCIA</SectionLabel>
        <Reveal as="h2" className="stretch-115 font-bold text-head" style={{ fontSize: "clamp(26px,3vw,36px)", lineHeight: 1.15, letterSpacing: "-.02em" }}>
          Trajetória profissional.
        </Reveal>
        <Reveal as="p" delay={80} className="max-w-[50ch] text-[17px] text-muted">
          Do curso técnico em 2018 ao frontend pleno na MindMiners, passando por estágio, graduação e quatro anos de EY.
        </Reveal>
      </div>
      <div ref={tlRef} className="relative pl-8">
        <span className="absolute bottom-2.5 left-[7px] top-2.5 w-0.5 rounded-sm bg-line" />
        <span ref={fillRef} className="absolute bottom-2.5 left-[7px] top-2.5 w-0.5 origin-top rounded-sm" style={{ background: "linear-gradient(#1783C1,#0A3C6E)", transform: "scaleY(0)" }} />
        <span
          ref={headRef}
          className="absolute left-0.5 top-1 size-3 rounded-full"
          style={{ background: "#6CC0EE", boxShadow: "0 0 0 5px rgba(23,131,193,.22),0 0 22px 4px rgba(108,192,238,.7)", willChange: "transform" }}
        />
        <div className="flex flex-col gap-3.5">
          {jobs.map((j, i) => {
            const o = openJob === i;
            return (
              <Reveal key={j.company} kind="slide" delay={i * 120} className="relative">
                <span
                  data-tldot="1"
                  className="absolute -left-8 top-[26px] box-border size-4 rounded-full border-2 border-line2 bg-bg"
                  style={{ transform: "scale(.6)", transition: "background .3s,border-color .3s,box-shadow .4s,transform .5s cubic-bezier(.34,1.56,.64,1)" }}
                />
                <div
                  data-spot="1"
                  className="spot-bg overflow-hidden rounded-[22px] border hover:border-brand! hover:[transform:translateX(6px)]"
                  style={{ ["--spot-r" as string]: "380px", borderColor: o ? "#1783C1" : "var(--line)", boxShadow: o ? "var(--shadow)" : "none", transition: "border-color .3s,box-shadow .4s,transform .4s cubic-bezier(.2,.8,.2,1)" }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenJob(o ? -1 : i)}
                    aria-expanded={o}
                    className="grid w-full cursor-pointer gap-x-4 gap-y-1 border-0 bg-transparent py-[22px] pl-6 pr-[22px] text-left leading-[1.6] text-inherit"
                    style={{ gridTemplateColumns: "minmax(0,1fr) auto" }}
                  >
                    <span className="mono text-[12.5px] text-muted">{j.period}</span>
                    <span
                      className="row-span-3 grid size-[38px] place-items-center self-center rounded-full bg-chip text-chip-text"
                      style={{ transition: "transform .35s cubic-bezier(.2,.8,.2,1)", transform: o ? "rotate(180deg)" : "none" }}
                    >
                      <ChevronDownIcon size={18} sw={2.2} />
                    </span>
                    <span className="stretch-120 text-[24px] font-bold leading-[1.2] text-head">{j.company}</span>
                    <span className="text-[16px] font-medium">{j.role}</span>
                  </button>
                  <div className="grid" style={{ gridTemplateRows: o ? "1fr" : "0fr", transition: "grid-template-rows .45s cubic-bezier(.2,.8,.2,1)" }}>
                    <div className="min-h-0 overflow-hidden" inert={!o}>
                      <div className="flex flex-col gap-3.5 px-6 pb-6">
                        <p className="text-[16px] text-muted" style={{ opacity: o ? 1 : 0, transform: o ? "none" : "translateY(8px)", transition: "opacity .4s ease .1s,transform .5s cubic-bezier(.2,.8,.2,1) .1s" }}>
                          {j.context}
                        </p>
                        <ul className="m-0 flex list-none flex-col gap-2 p-0">
                          {j.items.map((t, k) => (
                            <li
                              key={t}
                              className="flex gap-3 text-[16px] leading-normal"
                              style={{ opacity: o ? 1 : 0, transform: o ? "none" : "translateX(-14px)", transition: `opacity .4s ease ${o ? 160 + k * 90 : 0}ms,transform .55s cubic-bezier(.2,.8,.2,1) ${o ? 160 + k * 90 : 0}ms` }}
                            >
                              <Bullet />
                              {t}
                            </li>
                          ))}
                        </ul>
                        <div className="flex flex-wrap gap-1.5">
                          {j.tech.map((t, k) => (
                            <span
                              key={t}
                              className="mono rounded-full bg-chip px-2.5 py-[5px] text-[12.5px] font-medium text-chip-text leading-normal"
                              style={{ opacity: o ? 1 : 0, transform: o ? "none" : "scale(.6)", transition: `opacity .35s ease ${o ? 380 + k * 60 : 0}ms,transform .5s cubic-bezier(.34,1.56,.64,1) ${o ? 380 + k * 60 : 0}ms` }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                        {j.caseIndex !== undefined && (
                          <button
                            type="button"
                            onClick={() => openCase(j.caseIndex!)}
                            className="flex cursor-pointer items-center gap-2 self-start rounded-full border border-line2 bg-transparent px-3.5 py-2 text-[14px] font-semibold text-head hover:border-brand"
                          >
                            <span className="mono whitespace-nowrap text-[12px] text-muted">case relacionado</span>
                            {j.case} →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function Experience() {
  const { vp } = usePortfolio();
  const pinned = vp.w >= 1024 && vp.vh >= 640;
  return (
    <section id="experiencia" className="section-pad relative">
      {pinned ? <PinnedExperience /> : <ListExperience />}
    </section>
  );
}
