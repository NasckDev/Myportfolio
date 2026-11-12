import type { CSSProperties } from "react";
import { WEB_DESIGN_REPO_URL, webDesigns, type WebDesignPiece } from "@/data/portfolio";
import { Reveal } from "@/components/motion/Reveal";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { ArrowUpRightIcon, GithubIcon } from "@/components/ui/icons";

function WebDesignCard({ piece }: { piece: WebDesignPiece }) {
  return (
    <div
      data-spot="1"
      data-tilt="1"
      className="spot-bg relative flex h-full flex-col overflow-hidden rounded-[26px] border border-line hover:border-brand hover:shadow-card"
      style={{ "--spot-r": "420px", transition: "transform .4s cubic-bezier(.2,.8,.2,1),border-color .25s,box-shadow .3s" } as CSSProperties}
    >
      <div className="relative mx-2.5 mt-2.5 aspect-[16/10] overflow-hidden rounded-[18px] bg-bg2">
        <ImageSlot src={piece.image} alt={`Prévia do ${piece.name}`} placeholder={`Prévia do ${piece.name}`} objectPosition="top" />
        <span className="mono pointer-events-none absolute left-3 top-3 rounded-full bg-glass px-2.5 py-1.5 text-[12px] font-medium text-head leading-normal" style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}>
          {piece.kind}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 px-6 pb-6 pt-[22px]">
        <h4 className="stretch-120 text-[24px] font-bold leading-[1.15] text-head">
          {/* O link cobre o card inteiro (::after), mantendo um único alvo de foco. */}
          <a href={piece.url} target="_blank" rel="noopener noreferrer" className="text-head after:absolute after:inset-0 after:content-['']">
            {piece.name}
            <span className="sr-only"> (abre em nova aba)</span>
          </a>
        </h4>
        <p className="text-[16px] leading-[1.55] text-ink">{piece.summary}</p>
        <div className="mt-auto flex flex-wrap gap-1.5 pt-1.5">
          {piece.tools.map((t) => (
            <span key={t} className="mono rounded-full bg-chip px-2.5 py-[5px] text-[12.5px] font-medium text-chip-text leading-normal">
              {t}
            </span>
          ))}
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-5 gap-y-2">
          <span aria-hidden="true" className="flex items-center gap-2 text-[15px] font-bold text-accent-text">
            Ver ao vivo
            <ArrowUpRightIcon size={16} sw={2.2} />
          </span>
          {piece.repo ? (
            <a href={piece.repo} target="_blank" rel="noopener noreferrer" className="relative z-[1] flex items-center gap-2 text-[15px] font-semibold">
              <GithubIcon size={16} sw={2} />
              Código
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** Bloco "Web design" dentro de Projetos: páginas publicadas em public/web-design. */
export function WebDesign() {
  return (
    <div id="web-design" className="mt-20 scroll-mt-28">
      <div className="mb-8 flex max-w-[640px] flex-col gap-3">
        <Reveal as="h3" className="stretch-115 font-bold text-head" style={{ fontSize: "clamp(22px,2.4vw,30px)", lineHeight: 1.15, letterSpacing: "-.02em" }}>
          Web design
        </Reveal>
        <Reveal as="p" delay={80} className="max-w-[56ch] text-[17px] text-muted">
          Estudos visuais publicados como páginas reais: movimento, 3D e interfaces que dá para abrir e usar.{" "}
          <a href={WEB_DESIGN_REPO_URL} target="_blank" rel="noopener noreferrer" className="font-semibold">
            Código aberto no GitHub ↗
          </a>
        </Reveal>
      </div>
      <div className="grid gap-[18px]" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,330px),1fr))" }}>
        {webDesigns.map((piece, i) => (
          <Reveal as="article" key={piece.id} delay={i * 90}>
            <WebDesignCard piece={piece} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
