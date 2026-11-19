import { useEffect, useRef } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { jobs } from "@/data/portfolio";
import { onScrollFrame, setStyle, wake } from "@/lib/live";
import { Reveal } from "@/components/motion/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { JobCard } from "./JobCard";

/** Duração da sanfona (grid-template-rows .45s) com folga: a linha acompanha a mudança de altura. */
const ACCORDION_MS = 550;
/** Linha de ativação: 60% da altura da tela. */
const LINE_AT = 0.6;

function paintDot(d: HTMLElement, on: boolean) {
  setStyle(d, "background", on ? "#1783C1" : "var(--bg)");
  setStyle(d, "border-color", on ? "#1783C1" : "var(--line2)");
  setStyle(d, "box-shadow", on ? "0 0 0 6px rgba(23,131,193,.18), 0 0 18px rgba(23,131,193,.5)" : "none");
  setStyle(d, "transform", on ? "scale(1)" : "scale(.6)");
}

/** Celular/tablet: linha do tempo com cards em sanfona. */
export function ListExperience() {
  const { vp, openJob, setOpenJob, openCase } = usePortfolio();
  const tlRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const headRef = useRef<HTMLSpanElement>(null);
  const dotsRef = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    wake(ACCORDION_MS);
  }, [openJob]);

  useEffect(
    () =>
      onScrollFrame(() => {
        const tl = tlRef.current, fill = fillRef.current;
        if (!tl || !fill) return;
        const dots = dotsRef.current;
        // Leituras primeiro.
        const r = tl.getBoundingClientRect(), line = innerHeight * LINE_AT;
        const p = Math.min(1, Math.max(0, (line - r.top) / r.height));
        // Fora da faixa ativa (p = 0 ou 1) o estado de todos os pontos é conhecido sem medir cada um.
        const dotOn = p <= 0 ? dots.map(() => false) : p >= 1 ? dots.map(() => true) : dots.map((d) => !!d && d.getBoundingClientRect().top < line);
        // Escritas depois, só quando o valor muda.
        setStyle(fill, "transform", `scaleY(${p.toFixed(4)})`);
        const head = headRef.current;
        if (head) {
          setStyle(head, "transform", `translateY(${(p * (r.height - 20)).toFixed(1)}px)`);
          setStyle(head, "opacity", p > 0.01 && p < 0.995 ? "1" : "0");
        }
        dots.forEach((d, k) => d && paintDot(d, dotOn[k]));
      }),
    [],
  );

  const toggle = (i: number) => setOpenJob(openJob === i ? -1 : i);

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
          {jobs.map((j, i) => (
            <JobCard
              key={j.company}
              job={j}
              i={i}
              open={openJob === i}
              onToggle={toggle}
              onOpenCase={openCase}
              dotRef={(el) => {
                dotsRef.current[i] = el;
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
