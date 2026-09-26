import { useState } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { allSkills, skillGroups } from "@/data/portfolio";
import { normalize } from "@/lib/text";
import { Reveal } from "@/components/motion/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { CopyIcon, SearchIcon, skillGroupIcons } from "@/components/ui/icons";

const rgba = (hex: string, a: number) => `rgba(${parseInt(hex.slice(1, 3), 16)},${parseInt(hex.slice(3, 5), 16)},${parseInt(hex.slice(5, 7), 16)},${a})`;

export function Skills() {
  const { openModal, copySkills } = usePortfolio();
  const [query, setQuery] = useState("");
  const q = normalize(query.trim());
  let hits = 0;
  const groups = skillGroups.map((g, gi) => {
    const items = g.items.map((it) => {
      const m = !q || normalize(it.name).includes(q);
      if (q && m) hits++;
      return { ...it, match: m, hl: !!q && m };
    });
    return { ...g, gi, items, any: !q || items.some((i) => i.match) };
  });
  const count = q ? (hits ? hits + (hits === 1 ? " resultado" : " resultados") : "Nenhum resultado") : allSkills.length + " habilidades";

  return (
    <section id="habilidades" className="container-x section-pad">
      <div className="mb-7 flex max-w-[640px] flex-col gap-3.5">
        <SectionLabel>01 — HABILIDADES</SectionLabel>
        <Reveal as="h2" className="stretch-115 font-bold text-head" style={{ fontSize: "clamp(26px,3vw,36px)", lineHeight: 1.15, letterSpacing: "-.02em" }}>
          Tecnologias e práticas que uso no dia a dia.
        </Reveal>
        <Reveal as="p" delay={80} className="max-w-[56ch] text-[17px] text-muted">
          Um resumo rápido para quem está avaliando o perfil. Clique em uma habilidade para ver em quais projetos e empresas ela aparece.
        </Reveal>
      </div>
      <Reveal className="mb-[18px] flex flex-wrap items-center gap-2.5">
        <label className="box-border flex h-[50px] max-w-[460px] flex-[1_1_280px] items-center gap-2.5 rounded-full border border-line2 bg-surface px-4 text-muted">
          <SearchIcon size={17} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Procure uma tecnologia, ex.: Angular"
            aria-label="Procurar habilidade"
            className="min-w-0 flex-1 border-0 bg-transparent text-[15.5px] font-medium text-head outline-0 placeholder:text-muted"
          />
          {q && (
            <button type="button" onClick={() => setQuery("")} aria-label="Limpar busca" className="size-7 cursor-pointer rounded-full border-0 bg-chip text-[13px] text-chip-text">
              ✕
            </button>
          )}
        </label>
        <span role="status" aria-live="polite" className="mono text-[12.5px] text-muted">
          {count}
        </span>
        <button
          type="button"
          onClick={copySkills}
          className="ml-auto flex h-11 cursor-pointer items-center gap-2 rounded-full border border-line2 bg-transparent px-4 text-[14px] font-semibold text-head hover:border-brand"
        >
          <CopyIcon size={15} />
          Copiar lista
        </button>
      </Reveal>
      <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))" }}>
        {groups.map((g) => {
          const Icon = skillGroupIcons[g.gi];
          return (
            <Reveal key={g.title} delay={g.gi * 60} className="flex">
              <div
                data-spot="1"
                className="spot-bg relative flex w-full flex-col gap-3.5 overflow-hidden rounded-[22px] border border-line px-5 pb-5 pt-[22px] hover:[transform:translateY(-3px)]"
                style={{ opacity: g.any ? 1 : 0.45, transition: "opacity .3s,border-color .3s,transform .35s cubic-bezier(.2,.8,.2,1)" }}
              >
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5" style={{ opacity: 0.55, background: `linear-gradient(90deg,${g.color},transparent 70%)` }} />
                <div className="flex items-center justify-between gap-2.5">
                  <span className="flex items-center gap-2.5">
                    <span className="grid size-10 place-items-center rounded-xl" style={{ background: rgba(g.color, 0.08), color: g.color, boxShadow: `inset 0 0 0 1px ${rgba(g.color, 0.16)}` }}>
                      <Icon size={19} />
                    </span>
                    <span className="stretch-112 text-[17px] font-bold text-head">{g.title}</span>
                  </span>
                  <span className="mono whitespace-nowrap text-[12px] text-muted">{g.items.length} itens</span>
                </div>
                <div className="flex flex-wrap gap-[7px]">
                  {g.items.map((k) => (
                    <button
                      key={k.id}
                      type="button"
                      onClick={() => openModal("skill", k.id)}
                      className="flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-[7px] text-[14px] font-medium hover:border-brand!"
                      style={{
                        borderColor: k.hl ? g.color : "var(--line)",
                        background: k.hl ? g.color : "var(--bg2)",
                        color: k.hl ? "#FFFFFF" : "var(--text)",
                        opacity: k.match ? 1 : 0.35,
                        transform: k.hl ? "scale(1.05)" : "none",
                        transition: "background .2s,color .2s,opacity .25s,transform .25s cubic-bezier(.34,1.56,.64,1),border-color .2s",
                      }}
                    >
                      {k.name}
                    </button>
                  ))}
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
      <Reveal as="p" className="mt-3.5 flex items-center gap-2 text-[14px] text-muted">
        Toque em uma habilidade para ver onde ela foi aplicada.
      </Reveal>
    </section>
  );
}
