import { usePortfolio } from "@/context/PortfolioContext";
import "./BlueprintCover.css";

interface BlueprintCoverProps {
  name: string;
  eta: string;
}

/** Capa de projeto em construção: planta técnica animada da interface, com previsão de entrega. */
export function BlueprintCover({ name, eta }: BlueprintCoverProps) {
  const { motion } = usePortfolio();
  return (
    <div className={`bp-cover size-full${motion ? "" : " no-motion"}`} role="img" aria-label={`${name}: em construção, previsto para ${eta}`}>
      <svg viewBox="0 0 320 200" className="bp-draw absolute inset-0 size-full" fill="none" stroke="#6CC0EE" strokeWidth="1.4" aria-hidden="true">
        <rect x="24" y="22" width="272" height="156" rx="10" opacity=".9" />
        <rect x="24" y="22" width="62" height="156" rx="10" opacity=".55" />
        <rect x="100" y="36" width="120" height="12" rx="6" opacity=".7" />
        <rect x="100" y="60" width="86" height="40" rx="7" opacity=".7" />
        <rect x="196" y="60" width="86" height="40" rx="7" opacity=".7" />
        <path d="M104 160 C 130 150, 150 156, 170 138 S 214 126, 236 116 S 266 112, 280 100" opacity=".95" />
        <circle cx="54" cy="46" r="10" opacity=".7" />
      </svg>
      <div className="bp-scan" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 px-3.5 pb-3 pt-6" style={{ background: "linear-gradient(0deg,rgba(7,26,46,.92),transparent)" }}>
        <span className="mono flex items-center gap-2 whitespace-nowrap text-[12.5px] font-semibold text-white">
          <span className="bp-tape h-3 w-7 rounded-[3px]" aria-hidden="true" />
          Em construção
        </span>
        <span className="mono whitespace-nowrap rounded-full px-2.5 py-1 text-[12.5px] font-semibold" style={{ background: "#F5B82E", color: "#0a2742" }}>
          Previsto · {eta}
        </span>
      </div>
    </div>
  );
}
