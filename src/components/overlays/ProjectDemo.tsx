import { useState } from "react";
import type { CaseShot, CaseStudy } from "@/data/portfolio";
import { BlueprintCover } from "@/components/ui/BlueprintCover";
import { ArrowUpRightIcon } from "@/components/ui/icons";

/** Altura da demo aberta dentro da gaveta: grande o bastante para usar, sem esconder o resto do case. */
const DEMO_HEIGHT = "min(72vh,680px)";

interface DemoFrameProps {
  c: CaseStudy & { demoUrl: string };
}

/**
 * Demo executável do projeto dentro da gaveta. O iframe só é criado no clique,
 * para não baixar o app inteiro de quem só quer ler o case.
 */
export function DemoFrame({ c }: DemoFrameProps) {
  const [running, setRunning] = useState(false);
  const poster = c.shots?.find((s) => s.device === "desktop") ?? c.shots?.[0];

  return (
    <div className="flex flex-col gap-2.5">
      <div
        className="relative overflow-hidden rounded-[20px] border border-line bg-bg2"
        style={running ? { height: DEMO_HEIGHT } : { aspectRatio: "16 / 10" }}
      >
        {running ? (
          <iframe src={c.demoUrl} title={`Demo do ${c.name}`} className="absolute inset-0 size-full border-0 bg-white" />
        ) : (
          <>
            {poster ? (
              <img src={poster.src} alt={poster.alt} loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover object-top" />
            ) : (
              <BlueprintCover name={c.name} eta={c.eta ?? ""} />
            )}
            <div className="absolute inset-0 grid place-items-center" style={{ background: "linear-gradient(0deg,rgba(7,26,46,.62),rgba(7,26,46,.18))" }}>
              <button
                type="button"
                onClick={() => setRunning(true)}
                className="flex h-14 cursor-pointer items-center gap-3 rounded-full border-0 bg-btn px-6 text-[16px] font-bold text-btn-text hover:bg-brand hover:text-white"
                style={{ boxShadow: "0 16px 36px -12px rgba(0,0,0,.55)" }}
              >
                <span aria-hidden="true" className="grid size-7 place-items-center rounded-full bg-white/20 text-[12px]">
                  ▶
                </span>
                Rodar a demo aqui
              </button>
            </div>
          </>
        )}
      </div>
      <div className="mono flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[12.5px] text-muted">
        <span>Roda dentro do portfólio · dados fictícios</span>
        <a href={c.demoUrl} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center gap-1.5 font-semibold">
          Abrir em tela cheia
          <ArrowUpRightIcon size={14} />
          <span className="sr-only"> (abre em nova aba)</span>
        </a>
      </div>
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
