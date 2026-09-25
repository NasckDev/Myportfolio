import { useState, type CSSProperties } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { caseFilters, cases, GITHUB_REPOS_URL, type CaseFilter, type CaseStudy } from "@/data/portfolio";
import { Reveal } from "@/components/motion/Reveal";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ArrowRightIcon, ChevronDownIcon } from "@/components/ui/icons";

function CaseCard({ c, index, match }: { c: CaseStudy; index: number; match: boolean }) {
  const { openCase } = usePortfolio();
  const open = () => openCase(index);
  return (
    <div
      data-spot="1"
      data-tilt="1"
      onClick={open}
      className="spot-bg flex h-full cursor-pointer flex-col overflow-hidden rounded-[26px] border border-line hover:border-brand hover:shadow-card"
      style={{
        "--spot-r": "420px",
        opacity: match ? 1 : 0.35,
        filter: match ? "none" : "grayscale(1) blur(1px)",
        transition: "transform .4s cubic-bezier(.2,.8,.2,1),opacity .35s,filter .35s,border-color .25s,box-shadow .3s",
      } as CSSProperties}
    >
      <div className="relative mx-2.5 mt-2.5 aspect-[16/10] overflow-hidden rounded-[18px] bg-bg2">
        <ImageSlot src={c.image} alt={`Tela do ${c.name}`} placeholder={`Tela do ${c.name}`} />
        <span className="mono pointer-events-none absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-glass px-2.5 py-1.5 text-[12px] font-medium text-head leading-normal" style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}>
          {c.num} · {c.kind}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 px-6 pb-6 pt-[22px]">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="stretch-120 text-[26px] font-bold leading-[1.15] text-head">{c.name}</h3>
          <span className="mono whitespace-nowrap text-[12px] text-muted">{c.read}</span>
        </div>
        <p className="text-[16px] leading-[1.55] text-ink">{c.summary}</p>
        <div className="mt-auto flex flex-wrap gap-1.5 pt-1.5">
          {c.skills.map((s) => (
            <span key={s} className="mono rounded-full bg-chip px-2.5 py-[5px] text-[12.5px] font-medium text-chip-text leading-normal">
              {s}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            open();
          }}
          className="mt-1.5 flex cursor-pointer items-center gap-2 self-start border-0 bg-transparent p-0 text-[15px] font-bold text-accent-text"
        >
          Ver detalhes
          <ArrowRightIcon size={16} sw={2.2} />
        </button>
      </div>
    </div>
  );
}

export function Cases() {
  const { scrollToId } = usePortfolio();
  const [filter, setFilter] = useState<CaseFilter>("Todos");
  const [more, setMore] = useState(false);
  const matches = (c: CaseStudy) => filter === "Todos" || c.tags.includes(filter);
  const extraN = cases.length - 3;
  const gridStyle: CSSProperties = { gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,330px),1fr))" };

  return (
    <section id="cases" className="container-x section-pad">
      <div className="mb-9 flex flex-wrap items-end justify-between gap-x-12 gap-y-6">
        <div className="flex max-w-[640px] flex-col gap-3.5">
          <SectionLabel>02 — PROJETOS</SectionLabel>
          <Reveal as="h2" className="stretch-115 font-bold text-head" style={{ fontSize: "clamp(26px,3vw,36px)", lineHeight: 1.15, letterSpacing: "-.02em" }}>
            Projetos que mostram como eu penso e entrego.
          </Reveal>
          <Reveal as="p" delay={80} className="max-w-[56ch] text-[17px] text-muted">
            Cada projeto mostra o problema, as decisões técnicas, os testes e o resultado. Os dados são fictícios para não expor informações de empregadores.
          </Reveal>
        </div>
        <Reveal
          delay={120}
          role="group"
          aria-label="Filtrar cases"
          className="no-scrollbar box-border flex max-w-full flex-nowrap gap-1.5 overflow-x-auto rounded-full border border-line bg-bg2 p-[5px]"
        >
          {caseFilters.map((f) => {
            const on = filter === f;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                aria-pressed={on}
                className="shrink-0 cursor-pointer whitespace-nowrap rounded-full border-0 px-3.5 py-2 text-[14px] font-medium"
                style={{
                  background: on ? "var(--surface)" : "transparent",
                  color: on ? "var(--head)" : "var(--muted)",
                  boxShadow: on ? "0 2px 8px -2px rgba(10,60,110,.25)" : "none",
                  transition: "background .25s,color .25s",
                }}
              >
                {f}
              </button>
            );
          })}
        </Reveal>
      </div>
      <div className="grid gap-[18px]" style={gridStyle}>
        {cases.slice(0, 3).map((c, i) => (
          <Reveal as="article" key={c.id} delay={i * 90}>
            <CaseCard c={c} index={i} match={matches(c)} />
          </Reveal>
        ))}
      </div>
      <div className="grid" style={{ gridTemplateRows: more ? "1fr" : "0fr", transition: "grid-template-rows .7s cubic-bezier(.2,.8,.2,1)" }}>
        <div aria-hidden={!more} inert={!more} className="min-h-0 overflow-hidden" style={{ visibility: more ? "visible" : "hidden", transition: `visibility 0s linear ${more ? "0s" : ".7s"}` }}>
          <div className="grid gap-[18px] pt-[18px]" style={gridStyle}>
            {cases.slice(3).map((c, k) => (
              <article
                key={c.id}
                style={{
                  opacity: more ? 1 : 0,
                  transform: more ? "none" : "translateY(40px) scale(.97)",
                  transition: `opacity .5s cubic-bezier(.2,.8,.2,1) ${more ? 150 + k * 120 : 0}ms,transform .7s cubic-bezier(.2,.8,.2,1) ${more ? 150 + k * 120 : 0}ms`,
                }}
              >
                <CaseCard c={c} index={k + 3} match={matches(c)} />
              </article>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
        <button
          type="button"
          onClick={() => {
            setMore(!more);
            if (more) scrollToId("cases");
          }}
          aria-expanded={more}
          className="flex h-[54px] cursor-pointer items-center gap-3.5 rounded-full border border-line2 bg-surface pl-6 pr-2.5 text-[15.5px] font-semibold text-head transition-[border-color,background-color,color] duration-[250ms] hover:border-brand hover:bg-bg2 hover:text-brand"
        >
          {more ? "Mostrar menos" : "Ver mais projetos"}
          <span className="mono flex h-9 items-center gap-1.5 rounded-full bg-chip pl-3 pr-2.5 text-[13px] font-medium text-chip-text leading-normal">
            {more ? String(cases.length) : "+" + extraN}
            <ChevronDownIcon size={16} sw={2.2} style={{ transition: "transform .45s cubic-bezier(.2,.8,.2,1)", transform: more ? "rotate(180deg)" : "none" }} />
          </span>
        </button>
        <a href={GITHUB_REPOS_URL} target="_blank" rel="noopener" className="text-[15px] font-semibold">
          Arquivo de estudos anteriores ↗
        </a>
      </div>
    </section>
  );
}
