import { Scramble } from "@/components/motion/Reveal";

/** Rótulo mono das seções ("01 — HABILIDADES") com efeito scramble. */
export function SectionLabel({ children }: { children: string }) {
  return <Scramble text={children} className="mono text-[13px] font-semibold text-accent-text" />;
}
