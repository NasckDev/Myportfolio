import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { game } from "@/data/portfolio";
import { Reveal, Scramble } from "@/components/motion/Reveal";
import { ArrowUpRightIcon, GithubIcon } from "@/components/ui/icons";

/** Paleta do próprio site do Véspera (noite roxa, lanterna âmbar, pergaminho). */
const NIGHT = "#0d0b1a";
const LANTERN = "#F2A541";
const PARCHMENT = "#F4E7C6";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(cb: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/** Preferência do sistema por menos movimento, atualizada se o visitante mudar com a página aberta. */
function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
}

type NavigatorWithConnection = Navigator & { connection?: { saveData?: boolean } };

/** "Economia de dados" ligada no navegador/sistema: fica só o pôster, sem baixar o vídeo. */
function prefersSaveData(): boolean {
  return typeof navigator !== "undefined" && (navigator as NavigatorWithConnection).connection?.saveData === true;
}

/** Toca o vídeo de fundo só enquanto `enabled` e a seção estiver visível. */
function useVisiblePlayback(enabled: boolean) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (!enabled) {
      video.pause();
      return;
    }
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => undefined);
        else video.pause();
      },
      { threshold: 0.25 },
    );
    io.observe(video);
    return () => io.disconnect();
  }, [enabled]);
  return ref;
}

function PauseGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  );
}

function PlayGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5Z" />
    </svg>
  );
}

/** Sol pixelado do selo do Véspera, o mesmo do carregamento do site do jogo. */
function LanternSeal() {
  return (
    <svg viewBox="0 0 64 64" width="72" height="72" shapeRendering="crispEdges" aria-hidden="true">
      <g stroke={LANTERN} strokeWidth="4">
        <line x1="53" y1="32" x2="62" y2="32" /><line x1="46.8" y1="46.8" x2="53.2" y2="53.2" />
        <line x1="32" y1="53" x2="32" y2="62" /><line x1="17.2" y1="46.8" x2="10.8" y2="53.2" />
        <line x1="11" y1="32" x2="2" y2="32" /><line x1="17.2" y1="17.2" x2="10.8" y2="10.8" />
        <line x1="32" y1="11" x2="32" y2="2" /><line x1="46.8" y1="17.2" x2="53.2" y2="10.8" />
      </g>
      <polygon
        points="50,32 48.6,38.9 44.7,44.7 38.9,48.6 32,50 25.1,48.6 19.3,44.7 15.4,38.9 14,32 15.4,25.1 19.3,19.3 25.1,15.4 32,14 38.9,15.4 44.7,19.3 48.6,25.1"
        fill={LANTERN}
        stroke={PARCHMENT}
        strokeWidth="2"
      />
    </svg>
  );
}

const ctaBase = "flex h-[52px] items-center gap-2.5 rounded-full px-6 text-[15.5px] font-semibold no-underline";
const newTab = <span className="sr-only"> (abre em nova aba)</span>;

/** "Jogue Véspera": convite para o site do jogo, publicado em public/vespera/. */
export function PlayVespera() {
  const { motion } = usePortfolio();
  const reduced = usePrefersReducedMotion();
  const [saveData] = useState(prefersSaveData);
  const [paused, setPaused] = useState(false);
  // O vídeo respeita o botão de animações do site, o pedido de menos movimento do sistema e a economia de dados.
  const canAnimate = motion && !reduced && !saveData;
  const videoRef = useVisiblePlayback(canAnimate && !paused);
  return (
    <section id="jogo" className="container-x section-pad scroll-mt-20">
      <Reveal
        className="relative isolate overflow-hidden rounded-[30px] border"
        style={{ background: NIGHT, borderColor: "#2a2140", boxShadow: "0 40px 80px -40px rgba(13,11,26,.75)" }}
      >
        <video
          ref={videoRef}
          className="absolute inset-0 -z-10 size-full object-cover"
          poster={game.video.poster}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          tabIndex={-1}
        >
          <source src={game.video.webm} type="video/webm" />
          <source src={game.video.mp4} type="video/mp4" />
        </video>
        {/* Escurece o lado do texto para manter o contraste em qualquer quadro do vídeo. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 hidden md:block"
          style={{ background: `linear-gradient(90deg, ${NIGHT} 0%, rgba(13,11,26,.88) 40%, rgba(13,11,26,.35) 74%, rgba(13,11,26,.12) 100%)` }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 md:hidden"
          style={{ background: `linear-gradient(0deg, ${NIGHT} 0%, rgba(13,11,26,.9) 58%, rgba(13,11,26,.25) 100%)` }}
        />

        <div className="flex min-h-[540px] flex-col justify-end gap-5 px-6 pb-8 pt-32 sm:px-10 sm:pb-10 md:max-w-[660px] md:justify-center md:py-16 lg:px-14">
          <Scramble text="JOGO AUTORAL · BETA" className="mono text-[13px] font-semibold" style={{ color: LANTERN }} />
          <h2 className="stretch-120 font-bold" style={{ color: PARCHMENT, fontSize: "clamp(38px,5.4vw,68px)", lineHeight: 1.02, letterSpacing: "-.025em" }}>
            Jogue {game.name}
          </h2>
          <p className="text-[19px] font-semibold italic" style={{ color: LANTERN }}>
            {game.tagline}
          </p>
          <p className="max-w-[52ch] text-[17px] leading-[1.6]" style={{ color: "rgba(244,231,198,.88)" }}>
            {game.summary}
          </p>
          <ul className="flex flex-wrap gap-1.5" aria-label="Feito com">
            {game.tools.map((t) => (
              <li
                key={t}
                className="mono rounded-full px-2.5 py-[5px] text-[12.5px] font-medium leading-normal"
                style={{ background: "rgba(244,231,198,.1)", color: PARCHMENT, boxShadow: "inset 0 0 0 1px rgba(244,231,198,.18)" }}
              >
                {t}
              </li>
            ))}
          </ul>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <a
              href={game.siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-magnetic="1"
              className={ctaBase}
              style={{ background: LANTERN, color: NIGHT, transition: "transform .35s cubic-bezier(.2,.8,.2,1)" }}
            >
              Abrir o site do jogo
              <ArrowUpRightIcon size={17} sw={2.4} />
              {newTab}
            </a>
            <a
              href={game.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={ctaBase}
              style={{ color: PARCHMENT, boxShadow: "inset 0 0 0 1.5px rgba(244,231,198,.45)" }}
            >
              Baixar beta grátis
              {newTab}
            </a>
            <a
              href={game.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-[52px] items-center gap-2 px-2 text-[15px] font-semibold no-underline"
              style={{ color: PARCHMENT }}
            >
              <GithubIcon size={17} sw={2} />
              Código
              {newTab}
            </a>
          </div>
        </div>

        <div className="pointer-events-none absolute right-6 top-6 sm:right-10 sm:top-10">
          <LanternSeal />
        </div>

        {canAnimate && (
          // Rótulo fixo + aria-pressed (padrão de botão de alternância): "pressionado" = vídeo pausado.
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-pressed={paused}
            aria-label="Pausar vídeo"
            className="absolute left-4 top-4 grid size-11 cursor-pointer place-items-center rounded-full border-0 md:bottom-6 md:left-auto md:right-6 md:top-auto"
            style={{ background: "rgba(13,11,26,.72)", color: PARCHMENT, boxShadow: "inset 0 0 0 1px rgba(244,231,198,.35)" }}
          >
            {paused ? <PlayGlyph /> : <PauseGlyph />}
          </button>
        )}
      </Reveal>
    </section>
  );
}
