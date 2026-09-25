import type { CSSProperties } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { interests, PORTRAIT_URL, principles } from "@/data/portfolio";
import { Reveal } from "@/components/motion/Reveal";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { SectionLabel } from "@/components/ui/SectionLabel";

export function About() {
  const { vp } = usePortfolio();
  return (
    <section id="sobre" className="container-x section-pad">
      <div className="grid items-start gap-y-10" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,340px),1fr))", columnGap: "clamp(32px,5vw,72px)" }}>
        <div className="top-[110px] flex w-full max-w-[460px] flex-col gap-3.5" style={{ position: vp.w >= 900 ? "sticky" : "static" }}>
          <Reveal kind="clip" className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-bg2">
            <ImageSlot src={PORTRAIT_URL} alt="Alexandre Diogo Nascimento" placeholder="Seu retrato" />
            <div className="glass-blur pointer-events-none absolute inset-x-3 bottom-3 flex items-center justify-between gap-2.5 rounded-[18px] border border-line bg-glass px-3.5 py-3">
              <span className="flex flex-col leading-[1.25]">
                <span className="text-[15px] font-bold text-head">Alexandre Diogo Nascimento</span>
                <span className="text-[13px] text-muted">São Paulo, SP · Brasil</span>
              </span>
            </div>
          </Reveal>
        </div>
        <div className="flex min-w-0 flex-col gap-9">
          <div className="flex flex-col gap-[18px]">
            <SectionLabel>05 — SOBRE MIM</SectionLabel>
            <Reveal as="h2" className="stretch-120 max-w-[22ch] font-bold text-head" style={{ fontSize: "clamp(28px,3.4vw,42px)", lineHeight: 1.12, letterSpacing: "-.025em" }}>
              Trabalho entre engenharia, produto e design.
            </Reveal>
            <Reveal as="p" delay={60} className="max-w-[60ch]" style={{ fontSize: "clamp(16px,1.4vw,18px)", lineHeight: 1.7 }}>
              Entendo a regra de negócio, modelo os estados da interface e entrego componentes que o time consegue manter. Gosto de trabalhar perto de Produto e Design, questionando requisitos e propondo caminhos mais simples.
            </Reveal>
            <Reveal as="p" delay={100} className="max-w-[60ch] text-muted" style={{ fontSize: "clamp(16px,1.4vw,18px)", lineHeight: 1.7 }}>
              Meu foco hoje são interfaces complexas: Design Systems, produtos orientados a dados, acessibilidade e integrações com estados assíncronos. Prefiro provar com código e decisões documentadas do que com níveis autodeclarados.
            </Reveal>
          </div>
          <div className="flex flex-col gap-3.5">
            <Reveal as="h3" className="stretch-112 text-[20px] font-bold text-head">
              Como trabalho
            </Reveal>
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,240px),1fr))" }}>
              {principles.map((p, k) => (
                <Reveal key={p.n} delay={k * 70} className="flex">
                  <div
                    data-spot="1"
                    className="spot-bg flex w-full flex-col gap-2.5 rounded-[20px] border border-line p-5 hover:border-brand hover:[transform:translateY(-3px)]"
                    style={{ "--spot-r": "320px", transition: "border-color .25s,transform .35s cubic-bezier(.2,.8,.2,1)" } as CSSProperties}
                  >
                    <span className="flex items-center justify-between">
                      <span className="mono grid size-[38px] place-items-center rounded-xl bg-chip text-[13px] font-semibold text-chip-text leading-normal">{p.n}</span>
                      <span className="mono text-[12px] text-muted">{p.tag}</span>
                    </span>
                    <span className="stretch-112 text-[18px] font-bold text-head">{p.t}</span>
                    <span className="text-[15px] leading-[1.55]">{p.d}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
          <Reveal className="flex flex-col gap-3">
            <h3 className="stretch-112 text-[20px] font-bold text-head">Interesses profissionais</h3>
            <div className="flex flex-wrap gap-2">
              {interests.map((i) => (
                <span key={i} className="rounded-full bg-chip px-3.5 py-2 text-[14.5px] font-medium text-chip-text">
                  {i}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
