import { forwardRef } from "react";

/** Marca: 4 quadrados, o último é um círculo azul. */
export const BrandMark = forwardRef<HTMLSpanElement, { size?: number; gap?: number; className?: string; style?: React.CSSProperties }>(function BrandMark({ size = 7, gap = 3, className, style }, ref) {
  const sq = { width: size, height: size, borderRadius: 2 };
  return (
    <span ref={ref} className={className} style={{ display: "grid", gridTemplateColumns: `${size}px ${size}px`, gap, ...style }} aria-hidden="true">
      <span className="bg-head" style={sq} />
      <span className="bg-head" style={sq} />
      <span className="bg-head" style={sq} />
      <span style={{ ...sq, borderRadius: 999, background: "#1783C1" }} />
    </span>
  );
});
