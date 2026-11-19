import type { CSSProperties } from "react";
import type { Job } from "@/data/portfolio";

export const pad = (x: number) => String(x).padStart(2, "0");

const Bullet = () => <span className="mt-[9px] size-1.5 shrink-0 rounded-full" style={{ background: "#1783C1", boxShadow: "0 0 0 4px rgba(23,131,193,.15)" }} />;

interface JobItemsProps {
  items: string[];
  /** Itens visíveis (card ativo/aberto). */
  on: boolean;
  /** Transform dos itens escondidos (ex.: "translateY(10px)"). */
  hiddenTransform: string;
  /** Atraso do primeiro item e passo entre itens, em ms. */
  delay: number;
  step: number;
  /** Durações das transições de opacidade e de transform. */
  fadeDur: string;
  moveDur: string;
  className?: string;
  style?: CSSProperties;
}

/** Lista de responsabilidades de uma experiência, com entrada escalonada. */
export function JobItems({ items, on, hiddenTransform, delay, step, fadeDur, moveDur, className = "", style }: JobItemsProps) {
  return (
    <ul className={"m-0 list-none flex-col gap-2 p-0 " + className} style={style}>
      {items.map((t, k) => {
        const d = on ? delay + k * step : 0;
        return (
          <li
            key={t}
            className="flex gap-3 text-[16px] leading-normal"
            style={{
              opacity: on ? 1 : 0,
              transform: on ? "none" : hiddenTransform,
              transition: `opacity ${fadeDur} ease ${d}ms,transform ${moveDur} cubic-bezier(.2,.8,.2,1) ${d}ms`,
            }}
          >
            <Bullet />
            {t}
          </li>
        );
      })}
    </ul>
  );
}

interface CaseLinkProps {
  job: Job;
  onOpen: (i: number) => void;
  /** Fundo do botão: o card fixado usa superfície; a lista, transparente. */
  surface?: boolean;
}

/** Botão "case relacionado" (alvo de toque ≥ 44px). Não renderiza se a experiência não tem case. */
export function CaseLink({ job, onOpen, surface = false }: CaseLinkProps) {
  if (job.caseIndex === undefined) return null;
  const idx = job.caseIndex;
  return (
    <button
      type="button"
      onClick={() => onOpen(idx)}
      aria-haspopup="dialog"
      className={
        "flex min-h-11 cursor-pointer items-center gap-2 self-start rounded-full border border-line2 px-3.5 py-2 text-[14px] font-semibold text-head hover:border-brand " +
        (surface ? "bg-surface" : "bg-transparent")
      }
    >
      <span className="mono whitespace-nowrap text-[12px] text-muted">case relacionado</span>
      {job.case} →
    </button>
  );
}
