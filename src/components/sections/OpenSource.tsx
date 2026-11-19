import { usePortfolio } from "@/context/PortfolioContext";
import { GITHUB_URL, repos } from "@/data/portfolio";
import { Reveal, Scramble } from "@/components/motion/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ArrowUpRightIcon, GithubIcon } from "@/components/ui/icons";

export function OpenSource() {
  const { motion } = usePortfolio();

  return (
    <section id="engenharia" className="container-x section-pad">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-x-12 gap-y-5">
        <div className="flex max-w-[620px] flex-col gap-3.5">
          <SectionLabel>04 — CÓDIGO ABERTO</SectionLabel>
          <Reveal as="h2" className="stretch-115 font-bold text-head" style={{ fontSize: "clamp(26px,3vw,36px)", lineHeight: 1.15, letterSpacing: "-.02em" }}>
            Código aberto para você conferir.
          </Reveal>
        </div>
        <Reveal delay={80} className="flex max-w-[48ch] flex-col items-start gap-[18px]">
          <p className="text-[17px] text-muted">Repositórios escolhidos pela qualidade (documentação, testes e acessibilidade), não apenas pela data da última atualização.</p>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-magnetic="1"
            className="flex h-12 items-center gap-2.5 rounded-full bg-btn px-5 font-semibold text-btn-text no-underline hover:bg-brand hover:text-white"
            style={{ transition: "transform .35s cubic-bezier(.2,.8,.2,1)" }}
          >
            <GithubIcon size={18} />
            Ver perfil no GitHub <span aria-hidden="true">↗</span>
            <span className="sr-only">(abre em nova aba)</span>
          </a>
        </Reveal>
      </div>
      <Reveal className="overflow-hidden rounded-[26px] border" style={{ background: "#061426", borderColor: "#15335A", boxShadow: "0 30px 60px -30px rgba(6,20,38,.6)" }}>
        <div className="mono flex items-center gap-3.5 border-b px-5 py-4 text-[13.5px]" style={{ borderColor: "#15335A", color: "#9FB3C8" }}>
          <span className="flex gap-[7px]">
            <span className="size-[11px] rounded-full" style={{ background: "#FF5F57" }} />
            <span className="size-[11px] rounded-full" style={{ background: "#FEBC2E" }} />
            <span className="size-[11px] rounded-full" style={{ background: "#28C840" }} />
          </span>
          <span style={{ color: "#6CC0EE" }}>~/nasckdev</span>
          <span className="text-white">$</span>
          <Scramble text="git log --curated --by=quality" mode="type" className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-white" />
          {/* Cursor piscando em CSS (compositor); parado e visível com animações desligadas. */}
          <span aria-hidden="true" className={"h-[17px] w-2" + (motion ? " caret-blink" : "")} style={{ background: "#6CC0EE" }} />
        </div>
        <div className="p-2">
          {repos.map((r, i) => (
            <RepoRow key={r.slug} r={r} delay={300 + i * 140} />
          ))}
        </div>
      </Reveal>
    </section>
  );
}

/** Repositório publicado vira link; o que ainda não existe aparece como linha informativa, sem destino falso. */
function RepoRow({ r, delay }: { r: (typeof repos)[number]; delay: number }) {
  const rowClass = "grid items-center gap-x-7 gap-y-2.5 rounded-2xl px-4 py-[18px] no-underline";
  const rowStyle = { gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,200px),1fr))", color: "#DCE6F0" };
  const body = <RepoRowBody r={r} />;
  return (
    <Reveal kind="line" delay={delay}>
      {r.href ? (
        <a href={r.href} target="_blank" rel="noopener noreferrer" className={`${rowClass} transition-[background] duration-200 hover:bg-[#0C223D]`} style={rowStyle}>
          {body}
        </a>
      ) : (
        <div className={rowClass} style={rowStyle}>
          {body}
        </div>
      )}
    </Reveal>
  );
}

function RepoRowBody({ r }: { r: (typeof repos)[number] }) {
  return (
    <>
        <span className="flex flex-col gap-1">
          <span className="mono text-[12.5px]" style={{ color: "#6CC0EE" }}>
            {r.slug}
          </span>
          <span className="stretch-118 text-[20px] font-bold text-white">{r.name}</span>
        </span>
        <span className="text-[15px] leading-[1.55]" style={{ color: "#C4D3E2" }}>
          {r.problem}
        </span>
        <span className="mono text-[12.5px]" style={{ color: "#9FB3C8" }}>
          {r.quality}
        </span>
        <span className="flex items-center justify-between gap-3">
          <span className="mono flex items-center gap-2 text-[12.5px] text-white">
            <span className="size-2 rounded-full" style={{ background: r.dot, boxShadow: `0 0 12px ${r.dot}` }} />
            {r.status}
          </span>
          {r.href ? (
            <>
              <ArrowUpRightIcon size={18} stroke="#6CC0EE" />
              <span className="sr-only">(abre em nova aba)</span>
            </>
          ) : null}
        </span>
    </>
  );
}
