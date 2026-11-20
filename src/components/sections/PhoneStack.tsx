import { useEffect, useRef, type CSSProperties } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import "./PhoneStack.css";

/**
 * Topo no celular: um aparelho em CSS 3D que se monta sozinho, camada por camada
 * (API → State → Components → UI), e depois se separa de novo. Sem WebGL e sem JS por quadro:
 * o React só liga/desliga a animação conforme visibilidade e a preferência de movimento.
 */

const LAYERS = [
  ["01", "API", "dados chegando da API"],
  ["02", "State", "estado, cache e filtros"],
  ["03", "Components", "componentes reutilizáveis"],
  ["04", "UI", "a interface final"],
] as const;

const mono = "font-mono";

function ApiLayer() {
  return (
    <div className={`${mono} size-full px-4 pt-10 text-[10.5px] leading-[1.75]`} style={{ background: "#0B2440", color: "#D7E6F5" }}>
      <div className="mb-3 text-[11px] font-bold" style={{ color: "#6CC0EE" }}>01 API</div>
      <div><span style={{ color: "#6CC0EE" }}>GET</span> /api/insights</div>
      <div style={{ color: "#8FA6BD" }}>?segment=A&amp;period=30d</div>
      <div><span style={{ color: "#3DDC97" }}>200 OK</span> <span style={{ color: "#8FA6BD" }}>· 84 ms</span></div>
      <div className="mt-2" style={{ color: "#8FA6BD" }}>{"{"}</div>
      <div>&nbsp;&nbsp;<span style={{ color: "#6CC0EE" }}>"segment"</span>: "A",</div>
      <div>&nbsp;&nbsp;<span style={{ color: "#6CC0EE" }}>"nps"</span>: 42,</div>
      <div>&nbsp;&nbsp;<span style={{ color: "#6CC0EE" }}>"answers"</span>: 12400,</div>
      <div>&nbsp;&nbsp;<span style={{ color: "#6CC0EE" }}>"trend"</span>: [31,35,38,42]</div>
      <div style={{ color: "#8FA6BD" }}>{"}"}</div>
      <div className="mt-5 rounded-xl px-3 py-2" style={{ background: "rgba(108,192,238,.1)", boxShadow: "inset 0 0 0 1px rgba(108,192,238,.35)", color: "#8FA6BD" }}>
        cache: hit · stale 30s
        <br />
        retry: 3 · timeout 8s
      </div>
    </div>
  );
}

function StateLayer() {
  const nodes: [string, number, number][] = [["route", 91, 70], ["filters", 46, 140], ["query", 136, 140], ["cache", 91, 212], ["view", 91, 284], ["user", 91, 350]];
  const edges = [[0, 1], [0, 2], [1, 2], [2, 3], [3, 4], [1, 4], [4, 5]];
  return (
    <div className="size-full bg-surface">
      <div className={`${mono} px-4 pt-10 text-[11px] font-bold text-accent-text`}>02 State</div>
      <svg viewBox="0 0 182 390" className="absolute inset-0 size-full" aria-hidden="true">
        {edges.map(([a, b]) => (
          <line key={`${a}-${b}`} x1={nodes[a][1]} y1={nodes[a][2]} x2={nodes[b][1]} y2={nodes[b][2]} stroke="var(--line2)" strokeWidth="2" />
        ))}
        {nodes.map(([n, x, y], k) => (
          <g key={n}>
            <circle cx={x} cy={y} r="22" fill={k === 2 ? "#1783C1" : "var(--surface)"} stroke="#1783C1" strokeWidth="1.6" />
            <text x={x} y={y + 3.5} textAnchor="middle" fontSize="9.5" fontFamily="JetBrains Mono, monospace" fontWeight="600" fill={k === 2 ? "#fff" : "var(--head)"}>
              {n}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/** Regiões da interface final, repetidas na camada de componentes para as duas baterem. */
const BOXES: [string, string][] = [
  ["<Header />", "top-[34px] h-[30px]"],
  ["<SearchField />", "top-[72px] h-[24px]"],
  ["<KpiCard /> ×2", "top-[104px] h-[56px]"],
  ["<TrendChart />", "top-[168px] h-[104px]"],
  ["<List />", "top-[280px] h-[66px]"],
  ["<TabBar />", "bottom-[6px] h-[28px]"],
];

function ComponentsLayer() {
  return (
    <div className="relative size-full bg-surface">
      <div className={`${mono} px-4 pt-3 text-[10px] font-bold text-accent-text`}>03 Components</div>
      {BOXES.map(([n, pos]) => (
        <div key={n} className={`${mono} absolute inset-x-[10px] ${pos} rounded-lg border-[1.5px] border-dashed px-2 pt-1 text-[9.5px] font-semibold text-accent-text`} style={{ borderColor: "#1783C1", background: "var(--chip)" }}>
          {n}
        </div>
      ))}
    </div>
  );
}

function UiLayer() {
  return (
    <div className="relative size-full bg-surface px-[10px] text-head">
      <div className={`${mono} flex items-center justify-between px-1 pt-[10px] text-[9px] font-semibold`}>
        <span>9:41</span>
        <span className="h-[8px] w-[16px] rounded-[2px] border border-current p-[1px]">
          <span className="block h-full w-3/4 rounded-[1px] bg-current" />
        </span>
      </div>
      <div className="mt-[14px] flex h-[30px] items-center justify-between">
        <span className="text-[19px] font-extrabold tracking-tight">Insights</span>
        <span className="grid size-[24px] place-items-center rounded-full text-[9px] font-bold text-white" style={{ background: "#0F5F8F" }}>AN</span>
      </div>
      <div className="mt-[8px] flex h-[24px] items-center rounded-full bg-bg2 px-3 text-[9.5px] text-muted">Buscar segmento…</div>
      <div className="mt-[8px] grid h-[56px] grid-cols-2 gap-[6px]">
        <div className="rounded-xl px-2 py-1.5" style={{ background: "var(--chip)", boxShadow: "inset 0 0 0 1.2px #1783C1" }}>
          <div className="text-[8.5px] font-semibold text-muted">NPS</div>
          <div className="text-[18px] font-extrabold leading-tight">+42</div>
          <div className={`${mono} text-[7.5px] font-semibold`} style={{ color: "var(--ps-up)" }}>▲ 4 pts</div>
        </div>
        <div className="rounded-xl bg-bg2 px-2 py-1.5">
          <div className="text-[8.5px] font-semibold text-muted">Respostas</div>
          <div className="text-[18px] font-extrabold leading-tight">12,4k</div>
          <div className={`${mono} text-[7.5px] font-semibold`} style={{ color: "var(--ps-up)" }}>▲ 8%</div>
        </div>
      </div>
      <div className="relative mt-[8px] h-[104px] rounded-xl bg-bg2 px-2 pt-1.5">
        <div className="flex items-center justify-between text-[9px] font-bold">
          Tendência · 30 dias
          <span className={`${mono} flex items-center gap-1 text-[7.5px] font-semibold`} style={{ color: "var(--ps-up)" }}>
            <svg width="6" height="6" aria-hidden="true"><circle className="ps-pulse" cx="3" cy="3" r="2.5" fill="var(--ps-up)" /></svg>
            ao vivo
          </span>
        </div>
        <svg viewBox="0 0 150 70" className="absolute inset-x-2 bottom-1.5 h-[70px] w-[calc(100%-16px)]" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 58 C 18 52, 26 60, 40 46 S 66 40, 80 32 S 108 30, 120 18 S 140 12, 150 6 L150 70 L0 70 Z" fill="rgba(23,131,193,.14)" />
          <path d="M0 58 C 18 52, 26 60, 40 46 S 66 40, 80 32 S 108 30, 120 18 S 140 12, 150 6" fill="none" stroke="#1783C1" strokeWidth="2.6" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          <circle className="ps-pulse" cx="148" cy="7" r="3.2" fill="#1783C1" />
        </svg>
      </div>
      <div className="mt-[8px] flex flex-col gap-[5px]">
        {["Segmento A", "Segmento B", "Segmento C"].map((n, k) => (
          <div key={n} className="flex h-[18px] items-center gap-2">
            <span className="size-[14px] rounded-full" style={{ background: k === 0 ? "#1783C1" : "var(--line2)" }} />
            <span className="flex-1 text-[9px] font-bold">{n}</span>
            <span className={`${mono} text-[8.5px] font-semibold`}>{["0,82", "0,71", "0,64"][k]}</span>
          </div>
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-0 flex h-[34px] items-center justify-around border-t border-line bg-surface">
        {[0, 1, 2, 3].map((k) => (
          <span key={k} className="size-[13px] rounded-[4px]" style={{ background: k === 0 ? "#1783C1" : "var(--line2)" }} />
        ))}
      </div>
    </div>
  );
}

const LAYER_VIEWS = [ApiLayer, StateLayer, ComponentsLayer, UiLayer];

export function PhoneStack({ height }: { height: string }) {
  const { motion } = usePortfolio();
  const rootRef = useRef<HTMLDivElement>(null);

  // Pausa a animação fora da tela para não gastar GPU/bateria.
  useEffect(() => {
    const el = rootRef.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => el.classList.toggle("is-paused", !e.isIntersecting), { rootMargin: "80px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={rootRef} aria-hidden="true" className={`ps-root flex flex-col items-center gap-3${motion ? "" : " is-static"}`} style={{ height }}>
      <div className="ps-stage w-full flex-1">
        <div className="ps-sway">
          <div className="ps-phone">
            <div className="ps-plate ps-plate--back" />
            <div className="ps-plate ps-plate--mid" />
            <div className="ps-plate ps-plate--front" />
            <div className="ps-glass" />
            {LAYER_VIEWS.map((View, i) => (
              <div key={i} className="ps-layer" data-i={i}>
                <View />
              </div>
            ))}
            <div className="ps-packets">
              {[0, 1, 2].map((k) => (
                <span key={k} className="ps-packet" style={{ left: `${30 + k * 22}%`, top: `${36 + k * 14}%`, animationDelay: `${k * 0.6}s` }} />
              ))}
            </div>
            <div className="ps-island" />
          </div>
        </div>
      </div>
      <div
        className="ps-hint mono rounded-full border border-line bg-surface px-3.5 py-2 text-center text-[12.5px] font-medium text-head shadow-card"
        style={{ maxWidth: "calc(100% - 32px)" }}
      >
        {LAYERS.map(([n, t, d], i) => (
          <span key={n} style={{ "--ps-hk": `ps-h${i}` } as CSSProperties}>
            {n} · {t} — {d}
          </span>
        ))}
        <span style={{ "--ps-hk": "ps-h4" } as CSSProperties}>✓ Do dado à tela: interface pronta</span>
        <span data-static="">API → State → Components → UI</span>
      </div>
    </div>
  );
}
