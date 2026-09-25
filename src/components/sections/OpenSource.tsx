import { useEffect, useRef, type MouseEvent } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { GITHUB_URL, repos } from "@/data/portfolio";
import { live, onFrame } from "@/lib/live";
import { Reveal, Scramble } from "@/components/motion/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ArrowUpRightIcon, GithubIcon } from "@/components/ui/icons";

export function OpenSource() {
  const { showToast } = usePortfolio();
  const caretRef = useRef<HTMLSpanElement>(null);

  useEffect(
    () =>
      onFrame((t) => {
        if (caretRef.current) caretRef.current.style.opacity = !live.motion || Math.floor(t / 530) % 2 === 0 ? "1" : "0";
      }),
    [],
  );

  const onRepoClick = (href?: string) => (e: MouseEvent) => {
    if (href) return;
    e.preventDefault();
    showToast("Repositório em construção · veja o perfil no GitHub");
  };

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
            rel="noopener"
            data-magnetic="1"
            className="flex h-12 items-center gap-2.5 rounded-full bg-btn px-5 font-semibold text-btn-text no-underline hover:bg-brand hover:text-white"
            style={{ transition: "transform .35s cubic-bezier(.2,.8,.2,1)" }}
          >
            <GithubIcon size={18} />
            Ver perfil no GitHub ↗
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
          <span ref={caretRef} className="h-[17px] w-2" style={{ background: "#6CC0EE" }} />
        </div>
        <div className="p-2">
          {repos.map((r, i) => (
            <RepoRow key={r.slug} r={r} delay={300 + i * 140} onClick={onRepoClick(r.href)} />
          ))}
        </div>
      </Reveal>
    </section>
  );
}

function RepoRow({ r, delay, onClick }: { r: (typeof repos)[number]; delay: number; onClick: (e: MouseEvent) => void }) {
  return (
    <Reveal kind="line" delay={delay}>
      <a
        href={r.href || "#"}
        target={r.href ? "_blank" : undefined}
        rel={r.href ? "noopener" : undefined}
        onClick={onClick}
        className="grid items-center gap-x-7 gap-y-2.5 rounded-2xl px-4 py-[18px] no-underline transition-[background] duration-200 hover:bg-[#0C223D]"
        style={{ gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,200px),1fr))", color: "#DCE6F0" }}
      >
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
          <ArrowUpRightIcon size={18} stroke="#6CC0EE" />
        </span>
      </a>
    </Reveal>
  );
}
