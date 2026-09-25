import type { MouseEvent } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { footerLinks, GITHUB_URL, LINKEDIN_URL } from "@/data/portfolio";
import { useVisits, useVotes } from "@/hooks/useCounters";
import { BrandMark } from "./BrandMark";
import { EyeIcon, ThumbDownIcon, ThumbUpIcon } from "@/components/ui/icons";

const fmt = (n: number) => n.toLocaleString("pt-BR");

export function Footer() {
  const { vp, motion, toggleMotion, openModal, showToast, scrollToId } = usePortfolio();
  const visits = useVisits();
  const { likes, dislikes, vote, setVote } = useVotes();
  const hasKeyboard = vp.fine && vp.w >= 860;

  const go = (id: string) => (e: MouseEvent) => {
    e.preventDefault();
    scrollToId(id);
  };

  const voteUp = () => {
    if (vote === "up") return setVote(null);
    setVote("up");
    showToast("Obrigado pelo feedback!");
  };
  const voteDown = () => {
    if (vote === "down") return setVote(null);
    setVote("down");
    openModal("feedback");
  };

  const voteBtn = (on: boolean) => ({
    background: on ? "#1783C1" : "var(--surface)",
    color: on ? "#FFFFFF" : "var(--head)",
    borderColor: on ? "#1783C1" : "var(--line2)",
    transform: on ? "scale(1.06)" : "none",
    transition: "background .25s,color .25s,border-color .25s,transform .35s cubic-bezier(.34,1.56,.64,1)",
  });

  return (
    <footer className="border-t border-line bg-bg2" style={{ marginTop: "clamp(40px,8vh,80px)" }}>
      <div className="container-x grid gap-x-10 gap-y-9 pb-7" style={{ paddingTop: "clamp(40px,6vh,64px)", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,230px),1fr))" }}>
        <div className="flex flex-col gap-3.5">
          <span className="flex items-center gap-3">
            <BrandMark size={8} />
            <span className="flex flex-col leading-[1.2]">
              <span className="stretch-118 text-[16px] font-bold text-head">Alexandre Diogo Nascimento</span>
              <span className="text-[13.5px] text-muted">Software Engineer</span>
            </span>
          </span>
          <p className="max-w-[34ch] text-[14.5px] leading-[1.6] text-muted">Interfaces pensadas para quem usa e código pensado para quem mantém. Obrigado pela visita.</p>
        </div>
        <nav aria-label="Rodapé" className="flex flex-col gap-2.5">
          <span className="mono text-[12px] text-muted">Navegar</span>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {footerLinks.map(([id, label]) => (
              <a key={id} href={"#" + id} onClick={go(id)} className="text-[14.5px] font-medium text-ink no-underline hover:text-brand">
                {label}
              </a>
            ))}
          </div>
        </nav>
        <div className="flex flex-col gap-3">
          <span className="mono text-[12px] text-muted">Gostou do site?</span>
          <div role="group" aria-label="Avaliar o site" className="flex gap-2">
            <button type="button" onClick={voteUp} aria-pressed={vote === "up"} aria-label="Gostei" className="flex h-11 cursor-pointer items-center gap-2 rounded-full border px-4 text-[14.5px] font-semibold" style={voteBtn(vote === "up")}>
              <ThumbUpIcon size={17} />
              <span className="tabular-nums">{fmt(likes)}</span>
            </button>
            <button type="button" onClick={voteDown} aria-pressed={vote === "down"} aria-label="Não gostei" className="flex h-11 cursor-pointer items-center gap-2 rounded-full border px-4 text-[14.5px] font-semibold" style={voteBtn(vote === "down")}>
              <ThumbDownIcon size={17} />
              <span className="tabular-nums">{fmt(dislikes)}</span>
            </button>
          </div>
          <span className="min-h-5 text-[13.5px] text-muted">{vote === "up" ? "Valeu! Que bom que curtiu." : vote === "down" ? "Obrigado pela sinceridade." : "Sua opinião é anônima."}</span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="mono text-[12px] text-muted">Visitas</span>
          <span className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-[14px] bg-chip text-chip-text">
              <EyeIcon size={20} />
            </span>
            <span className="flex flex-col leading-[1.15]">
              <span className="stretch-120 text-[30px] font-bold tabular-nums text-head" aria-live="polite">
                {visits === null ? "—" : fmt(visits)}
              </span>
              <span className="text-[13.5px] text-muted">pessoas passaram por aqui</span>
            </span>
          </span>
        </div>
      </div>
      <div className="container-x flex flex-wrap items-center gap-x-[22px] gap-y-3 border-t border-line pb-7 pt-[18px] text-[13.5px] text-muted">
        <span className="mr-auto">© 2026 Alexandre Diogo Nascimento</span>
        <a href={GITHUB_URL} target="_blank" rel="noopener" className="text-ink">
          GitHub
        </a>
        <a href={LINKEDIN_URL} target="_blank" rel="noopener" className="text-ink">
          LinkedIn
        </a>
        {hasKeyboard && (
          <button type="button" onClick={() => openModal("keys")} className="cursor-pointer border-0 bg-transparent p-0 text-[13.5px] font-medium text-ink">
            Atalhos <span className="mono rounded-[5px] border border-line2 px-1.5 py-0.5 text-[12px] font-medium leading-normal">?</span>
          </button>
        )}
        <button type="button" onClick={toggleMotion} aria-pressed={motion} className="mono flex cursor-pointer items-center gap-2 rounded-full border border-line bg-transparent px-3 py-1.5 text-[12.5px] font-medium text-ink leading-normal">
          <span className="size-2 rounded-full" style={{ background: motion ? "#22B573" : "#9AA6B2" }} />
          {motion ? "animações: on" : "animações: off"}
        </button>
        <a href="#topo" onClick={go("topo")} className="font-semibold text-head">
          Voltar ao topo ↑
        </a>
      </div>
    </footer>
  );
}
