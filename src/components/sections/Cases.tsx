import { useState, type CSSProperties } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { caseFilters, cases, GITHUB_REPOS_URL, roadmap, type CaseFilter, type CaseStudy } from "@/data/portfolio";
import { Reveal } from "@/components/motion/Reveal";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { BlueprintCover } from "@/components/ui/BlueprintCover";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ArrowRightIcon, ChevronDownIcon } from "@/components/ui/icons";
import { WebDesign } from "@/components/sections/WebDesign";

/** Capa do card: o primeiro print de desktop, quando o projeto já tem prints. */
const coverShot = (c: CaseStudy) => c.shots?.find((s) => s.device === "desktop");

/** Texto do botão do card: o que a pessoa vai encontrar ao abrir. */
const cardAction = (c: CaseStudy) => (c.demoUrl ? "Ver a demo" : c.eta ? "Ver o plano" : "Ver detalhes");

function CaseCard({ c, index, match }: { c: CaseStudy; index: number; match: boolean }) {
  const { openCase } = usePortfolio();
  const open = () => openCase(index);
  return (
    // O card inteiro é só um atalho de mouse; para teclado e leitor de tela o controle é o botão
    // do card ("Ver a demo", "Ver o plano" ou "Ver detalhes") abaixo. role="presentation" declara que o contêiner não é um controle.
    <div
      role="presentation"
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
        {c.eta ? <BlueprintCover name={c.name} eta={c.eta} shot={coverShot(c)} /> : <ImageSlot src={c.image} alt={`Tela do ${c.name}`} placeholder={`Tela do ${c.name}`} objectPosition="top" />}
        <span className="mono pointer-events-none absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-glass px-2.5 py-1.5 text-[12px] font-medium text-head leading-normal" style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}>
          {c.num} · {c.kind}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 px-6 pb-6 pt-[22px]">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="stretch-120 text-[26px] font-bold leading-[1.15] text-head">{c.name}</h3>
          {c.eta ? null : <span className="mono whitespace-nowrap text-[12px] text-muted">{c.read}</span>}
        </div>
        <p className="text-[16px] leading-[1.55] text-ink">{c.summary}</p>
        {c.eta ? (
          <p className="mono text-[13px] leading-[1.5] text-muted">
            <span className="mr-2 inline-block size-2 rounded-full align-middle" style={{ background: "#F5B82E" }} aria-hidden="true" />
            Agora: {c.stage} · entrega prevista para {c.eta}
          </p>
        ) : (
          <p className="mono flex items-center gap-2 text-[13px] text-muted">
            <span className="size-2 rounded-full" style={{ background: "#28C840" }} aria-hidden="true" />
            Publicado
          </p>
        )}
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
          aria-label={`${cardAction(c)} do ${c.name}`}
          className="mt-0.5 flex min-h-11 cursor-pointer items-center gap-2 self-start border-0 bg-transparent p-0 text-[15px] font-bold text-accent-text"
        >
          {cardAction(c)}
          <ArrowRightIcon size={16} sw={2.2} />
        </button>
      </div>
    </div>
  );
}

/** Linha do tempo pública: o que já está no ar e quando cada projeto em construção chega. */
function Roadmap() {
  return (
    <Reveal className="mb-8 rounded-[22px] border border-line bg-surface p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="mono flex items-center gap-2 text-[13px] font-semibold text-head">
          <span className="relative flex size-2.5" aria-hidden="true">
            <span className="absolute inset-0 animate-ping rounded-full motion-reduce:animate-none" style={{ background: "#F5B82E", opacity: 0.6 }} />
            <span className="relative size-2.5 rounded-full" style={{ background: "#F5B82E" }} />
          </span>
          Em construção · próximas entregas
        </h3>
        <span className="mono text-[12.5px] text-muted">atualizado em nov 2026</span>
      </div>
      <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {roadmap.map((r) => (
          <li key={r.when} className="flex items-start gap-3 rounded-2xl bg-bg2 px-3.5 py-3">
            <span
              className="mono mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[12px] font-semibold"
              style={r.done ? { background: "#28C840", color: "#04230b" } : { background: "#F5B82E", color: "#2e2000" }}
            >
              {r.when}
            </span>
            <span className="text-[14.5px] leading-[1.45] text-ink">{r.what}</span>
          </li>
        ))}
      </ol>
    </Reveal>
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
          <Reveal as="p" delay={80} className="max-w-[58ch] text-[17px] text-muted">
            Os projetos já têm código aberto e demos que rodam aqui dentro do portfólio: abra um card e clique em "Rodar a demo". A versão 1.0 de cada um, com estudo de caso completo, chega entre janeiro e março de 2027. Todos os dados são fictícios, para não expor informações de empregadores.
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
      <Roadmap />
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
        <a href={GITHUB_REPOS_URL} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center text-[15px] font-semibold">
          Acompanhar no GitHub ↗<span className="sr-only"> (abre em nova aba)</span>
        </a>
      </div>
      <WebDesign />
    </section>
  );
}
