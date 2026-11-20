import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePortfolio } from "@/context/PortfolioContext";
import type { CaseShot, CaseStudy } from "@/data/portfolio";
import { BlueprintCover } from "@/components/ui/BlueprintCover";
import { ArrowUpRightIcon, CloseIcon } from "@/components/ui/icons";

/** Altura da barra fixa da demo; o app ocupa o resto da tela. */
const BAR_H = 60;
const FOCUSABLE = 'a[href],button:not([disabled]),iframe';

interface DemoProps {
  c: CaseStudy & { demoUrl: string };
}

/**
 * Demo em tela cheia, por cima da gaveta do case. Fica num portal no <body> porque a gaveta usa transform
 * (que prenderia o position: fixed nela) e para que a rolagem do app nunca dispute com a rolagem da gaveta.
 */
function DemoOverlay({ c, onClose }: DemoProps & { onClose: () => void }) {
  const { motion } = usePortfolio();
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const [loaded, setLoaded] = useState(false);
  const [shown, setShown] = useState(!motion);

  useEffect(() => {
    closeRef.current?.focus();
    const raf = requestAnimationFrame(() => setShown(true));
    // A gaveta fica inerte por baixo: leitor de tela e Tab não voltam para ela enquanto a demo estiver aberta.
    const drawer = document.querySelector<HTMLElement>("[data-case-drawer]");
    const drawerWasInert = drawer?.inert ?? false;
    if (drawer) drawer.inert = true;

    // Captura no window: roda antes dos atalhos globais (Esc fecharia a gaveta inteira) e do foco preso da gaveta.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !ref.current) return;
      e.stopPropagation();
      const items = [...ref.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (!ref.current.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey, true);
      if (drawer) drawer.inert = drawerWasInert;
    };
  }, []);

  return createPortal(
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={`Demo do ${c.name}`}
      className="fixed inset-0 z-[120] flex flex-col bg-bg"
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : "translateY(16px) scale(.985)",
        transition: motion ? "opacity .28s ease, transform .38s cubic-bezier(.2,.8,.2,1)" : "none",
      }}
    >
      <div className="glass-blur flex shrink-0 items-center gap-3 border-b border-line bg-glass px-3 sm:px-5" style={{ height: BAR_H, paddingTop: "env(safe-area-inset-top)" }}>
        <span className="flex min-w-0 flex-1 items-center gap-2.5">
          <span className="live-dot" aria-hidden="true" />
          <span className="min-w-0 truncate text-[15px] font-bold text-head">{c.name}</span>
          <span className="mono hidden truncate text-[12.5px] text-muted sm:inline">demo ao vivo · dados fictícios</span>
        </span>
        <a
          href={c.demoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-11 shrink-0 items-center gap-1.5 rounded-full border border-line px-3.5 text-[14px] font-semibold text-head no-underline hover:border-brand hover:text-head"
        >
          <span className="hidden sm:inline">Abrir em nova aba</span>
          <span className="sm:hidden">Nova aba</span>
          <ArrowUpRightIcon size={15} />
          <span className="sr-only"> (abre em nova aba)</span>
        </a>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="flex h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border-0 bg-btn px-4 text-[14px] font-semibold text-btn-text hover:bg-brand hover:text-white"
        >
          <CloseIcon size={16} sw={2.2} />
          Fechar demo
        </button>
      </div>
      <div className="relative min-h-0 flex-1">
        {!loaded && (
          <div className="absolute inset-0 grid place-items-center" role="status">
            <span className="flex flex-col items-center gap-3 text-[14.5px] text-muted">
              <span className="demo-spinner" aria-hidden="true" />
              Carregando o {c.name}…
            </span>
          </div>
        )}
        <iframe
          src={c.demoUrl}
          title={`Demo do ${c.name}`}
          onLoad={() => setLoaded(true)}
          className="absolute inset-0 size-full border-0"
          style={{ opacity: loaded ? 1 : 0, transition: motion ? "opacity .3s ease" : "none" }}
        />
      </div>
    </div>,
    document.body,
  );
}

/**
 * Capa da demo na gaveta: o print real com o botão "Rodar a demo". O app só é baixado no clique,
 * para não pesar para quem só quer ler o case.
 */
export function DemoFrame({ c }: DemoProps) {
  const [running, setRunning] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const poster = c.shots?.find((s) => s.device === "desktop") ?? c.shots?.[0];

  const close = () => {
    setRunning(false);
    // Devolve o foco a quem abriu, depois que a gaveta deixa de estar inerte.
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  return (
    <div className="flex flex-col gap-2.5">
      <div className="group relative overflow-hidden rounded-[20px] border border-line bg-bg2" style={{ aspectRatio: "16 / 10" }}>
        {poster ? (
          <img src={poster.src} alt={poster.alt} loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]" />
        ) : (
          <BlueprintCover name={c.name} eta={c.eta ?? ""} />
        )}
        <div className="absolute inset-0 grid place-items-center" style={{ background: "linear-gradient(0deg,rgba(7,26,46,.62),rgba(7,26,46,.12))" }}>
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setRunning(true)}
            aria-haspopup="dialog"
            className="flex h-14 cursor-pointer items-center gap-3 rounded-full border-0 bg-btn px-6 text-[16px] font-bold text-btn-text hover:bg-brand hover:text-white"
            style={{ boxShadow: "0 16px 36px -12px rgba(0,0,0,.55)" }}
          >
            <span aria-hidden="true" className="grid size-7 place-items-center rounded-full bg-white/20 text-[12px]">
              ▶
            </span>
            Rodar a demo
          </button>
        </div>
      </div>
      <div className="mono flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[12.5px] text-muted">
        <span>Abre em tela cheia · dados fictícios</span>
        <a href={c.demoUrl} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center gap-1.5 font-semibold">
          Abrir em nova aba
          <ArrowUpRightIcon size={14} />
          <span className="sr-only"> (abre em nova aba)</span>
        </a>
      </div>
      {running ? <DemoOverlay c={c} onClose={close} /> : null}
    </div>
  );
}

/** Altura dos prints na galeria; a largura sai da proporção de cada tela. */
const SHOT_H = 230;
const RATIO: Record<CaseShot["device"], string> = { desktop: "1440 / 900", mobile: "390 / 844" };

/** Galeria de prints reais, rolando na horizontal. Cada print abre em tamanho original. */
export function ShotGallery({ name, shots }: { name: string; shots: CaseShot[] }) {
  return (
    <div className="flex flex-col gap-2.5">
      <h3 className="stretch-112 text-[19px] font-bold text-head">Telas</h3>
      <ul aria-label={`Prints do ${name}`} className="no-scrollbar -mx-7 flex snap-x snap-mandatory list-none gap-3 overflow-x-auto scroll-px-7 px-7 pb-1">
        {shots.map((s) => (
          <li key={s.src} className="shrink-0 snap-start">
            <figure className="m-0 flex flex-col gap-1.5">
              <a href={s.src} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-2xl border border-line bg-bg2" style={{ height: SHOT_H, aspectRatio: RATIO[s.device] }}>
                <img src={s.src} alt={s.alt} loading="lazy" decoding="async" className="size-full object-cover object-top" />
                <span className="sr-only"> (abre o print em nova aba)</span>
              </a>
              <figcaption className="mono text-[12.5px] text-muted" style={{ maxWidth: s.device === "mobile" ? 160 : 368 }}>
                {s.caption}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </div>
  );
}
