import { Activity, Eye, Radio } from "lucide-react";
import { motion } from "framer-motion";
import { useVisitorCount } from "@/hooks/useVisitorCount";

const numberFormatter = new Intl.NumberFormat("pt-BR");

export function VisitorCounter() {
  const state = useVisitorCount();

  if (state.status === "available") {
    return (
      <div className="flex items-center gap-3" aria-live="polite">
        <span className="relative grid size-10 place-items-center rounded-full border border-emerald-300/20 bg-emerald-300/10 text-emerald-300">
          <Eye className="size-4" />
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-full border border-emerald-300/35"
            animate={{ scale: [1, 1.45], opacity: [0.7, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
          />
        </span>
        <div>
          <strong className="block text-sm text-white">{numberFormatter.format(state.visitors)} visitantes</strong>
          <span className="mt-0.5 block text-[10px] text-blue-100/40">
            {numberFormatter.format(state.pageviews)} visualizações · Vercel Analytics
          </span>
        </div>
      </div>
    );
  }

  if (state.status === "loading") {
    return (
      <div className="flex items-center gap-3" aria-live="polite" aria-label="Carregando visitantes">
        <span className="grid size-10 place-items-center rounded-full border border-blue-300/15 bg-blue-400/10 text-blue-300">
          <Activity className="size-4 animate-pulse" />
        </span>
        <div>
          <span className="block h-3 w-24 animate-pulse rounded-full bg-white/10" />
          <span className="mt-2 block h-2 w-36 animate-pulse rounded-full bg-white/[0.06]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3" aria-label="Portfólio online">
      <span className="grid size-10 place-items-center rounded-full border border-blue-300/15 bg-blue-400/10 text-blue-300">
        <Radio className="size-4" />
      </span>
      <div>
        <strong className="block text-sm text-white">Portfólio online</strong>
        <span className="mt-0.5 block text-[10px] text-blue-100/40">Métricas disponíveis na versão de produção</span>
      </div>
    </div>
  );
}
