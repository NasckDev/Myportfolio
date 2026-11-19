import { useEffect, useRef } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { cases, GITHUB_URL, interfaceStates } from "@/data/portfolio";
import { copyText } from "@/lib/clipboard";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { BlueprintCover } from "@/components/ui/BlueprintCover";
import { DemoFrame, ShotGallery } from "@/components/overlays/ProjectDemo";
import { CloseIcon, LinkIcon } from "@/components/ui/icons";

export function CaseDrawer() {
  const { vp, caseOpen, lastCase, openCase, closeCase, showToast } = usePortfolio();
  const asideRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = caseOpen >= 0;
  const cur = cases[lastCase];
  const next = (lastCase + 1) % cases.length;
  const big = vp.w >= 700;
  useFocusTrap(asideRef, open);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => closeRef.current?.focus(), 60);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (open) asideRef.current?.scrollTo({ top: 0 });
  }, [open, lastCase]);

  const copyLink = async () => {
    const u = location.href.split("#")[0] + "#case-" + cur.id;
    const ok = await copyText(u);
    showToast(ok ? "Link do case copiado" : u);
  };

  return (
    <>
      <div
        aria-hidden="true"
        onClick={closeCase}
        className="fixed inset-0 z-[90]"
        style={{ background: "rgba(4,14,28,.5)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none", transition: "opacity .35s" }}
      />
      <aside
        ref={asideRef}
        role="dialog"
        aria-modal="true"
        aria-label={cur.name}
        aria-hidden={!open}
        inert={!open}
        className="fixed z-[91] box-border overflow-y-auto overflow-x-hidden border border-line bg-surface"
        style={{
          top: big ? 10 : 0,
          right: big ? 10 : 0,
          bottom: big ? 10 : 0,
          width: big ? "min(640px,calc(100% - 20px))" : "100%",
          borderRadius: big ? 28 : 0,
          boxShadow: "0 40px 80px -30px rgba(0,0,0,.5)",
          transform: `translateX(${open ? "0" : "calc(100% + 24px)"})`,
          transition: "transform .5s cubic-bezier(.2,.8,.2,1)",
          visibility: open ? "visible" : "hidden",
        }}
      >
        <div className="glass-blur sticky top-0 z-[2] flex items-center justify-between gap-3 border-b border-line bg-glass py-3.5 pl-6 pr-4">
          <span className="mono text-[12.5px] text-muted">
            case {cur.num} / {String(cases.length).padStart(2, "0")} · {cur.eta ? "em construção" : cur.read}
          </span>
          <div className="flex items-center gap-2">
            <button type="button" onClick={copyLink} aria-label="Copiar link do case" className="flex h-[42px] cursor-pointer items-center gap-2 rounded-full border border-line bg-bg2 px-3.5 text-[13.5px] font-semibold text-head hover:border-brand">
              <LinkIcon size={16} />
              {vp.w >= 420 && "Copiar link"}
            </button>
            <button ref={closeRef} type="button" onClick={closeCase} aria-label="Fechar case" className="grid size-[42px] cursor-pointer place-items-center rounded-full border border-line bg-bg2 text-head">
              <CloseIcon size={18} sw={2.2} />
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-7 px-7 pb-8 pt-6">
          <div className="flex flex-col gap-2.5">
            <span className="mono text-[13px] text-accent-text">
              {cur.name} · {cur.tagline}
            </span>
            <h2 className="stretch-118 font-bold text-head" style={{ fontSize: "clamp(26px,3vw,34px)", lineHeight: 1.15, letterSpacing: "-.02em" }}>
              {cur.title}
            </h2>
            <p className="text-[17px] text-muted">{cur.summary}</p>
          </div>
          {cur.eta ? (
            <div className="flex items-start gap-3 rounded-2xl px-4 py-3.5" style={{ background: "rgba(245,184,46,.14)", boxShadow: "inset 0 0 0 1px rgba(245,184,46,.5)" }}>
              <span className="mt-1.5 size-2.5 shrink-0 rounded-full" style={{ background: "#F5B82E" }} aria-hidden="true" />
              <p className="text-[15.5px]">
                <strong className="text-head">Em construção.</strong> Agora: {cur.stage?.toLowerCase()}.{" "}
                {cur.demoUrl ? "A primeira versão já roda aqui embaixo. A versão 1.0, com estudo de caso completo, está prevista para " : "Código, demo e estudo completo previstos para "}
                <strong className="text-head">{cur.eta}</strong>.
              </p>
            </div>
          ) : null}
          {cur.demoUrl ? (
            // key: ao trocar de case, a demo volta ao estado "parada" e não carrega o app anterior.
            <DemoFrame key={cur.id} c={{ ...cur, demoUrl: cur.demoUrl }} />
          ) : (
            <div className="aspect-video overflow-hidden rounded-[20px] bg-bg2">
              {cur.eta ? <BlueprintCover name={cur.name} eta={cur.eta} /> : <ImageSlot src={cur.image} alt={`Tela do ${cur.name}`} placeholder={`Tela do ${cur.name}`} objectPosition="top" />}
            </div>
          )}
          {cur.shots?.length ? <ShotGallery name={cur.name} shots={cur.shots} /> : null}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-2xl bg-bg2 p-4">
              <div className="mono text-[12px] text-muted">Meu papel</div>
              <div className="mt-1 text-[15.5px] font-semibold">{cur.role}</div>
            </div>
            <div className="rounded-2xl bg-bg2 p-4">
              <div className="mono text-[12px] text-muted">Contexto</div>
              <div className="mt-1 text-[15.5px] font-semibold">{cur.eta ? "Dados fictícios · nada de empregadores" : "Projeto público e aberto"}</div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="stretch-112 text-[19px] font-bold text-head">Problema</h3>
            <p className="text-[16px]">{cur.problem}</p>
          </div>
          <div className="flex flex-col gap-2.5">
            <h3 className="stretch-112 text-[19px] font-bold text-head">{cur.eta && !cur.demoUrl ? "Decisões planejadas" : "Decisões"}</h3>
            {cur.decisions.map((t, i) => (
              <div key={t} className="flex gap-3.5 rounded-2xl border border-line px-4 py-3.5">
                <span className="mono pt-0.5 text-[12.5px] text-accent-text">0{i + 1}</span>
                <span className="text-[16px]">{t}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2.5">
            <h3 className="stretch-112 text-[19px] font-bold text-head">Estados da interface</h3>
            <div className="flex flex-wrap gap-1.5">
              {interfaceStates.map((st) => (
                <span key={st} className="mono rounded-full bg-chip px-3 py-1.5 text-[12.5px] font-medium text-chip-text leading-normal">
                  {st}
                </span>
              ))}
            </div>
          </div>
          <div className="grid gap-2.5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
            <div className="flex flex-col gap-1.5 rounded-2xl border border-line p-4">
              <span className="mono text-[12px] text-muted">Acessibilidade</span>
              <span className="text-[15.5px]">{cur.a11y}</span>
            </div>
            <div className="flex flex-col gap-1.5 rounded-2xl border border-line p-4">
              <span className="mono text-[12px] text-muted">Testes e qualidade</span>
              <span className="text-[15.5px]">{cur.tests}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5 border-t border-line pt-2">
            {cur.liveUrl && !cur.demoUrl ? (
              <a href={cur.liveUrl} target="_blank" rel="noopener noreferrer" className="flex h-12 items-center gap-2 rounded-full bg-btn px-5 font-semibold text-btn-text no-underline hover:bg-brand hover:text-white">
                Ver ao vivo ↗<span className="sr-only"> (abre em nova aba)</span>
              </a>
            ) : null}
            {cur.repoUrl ? (
              <a href={cur.repoUrl} target="_blank" rel="noopener noreferrer" className="flex h-12 items-center rounded-full border border-line2 px-5 font-semibold text-head no-underline hover:text-head">
                Código no GitHub ↗<span className="sr-only"> (abre em nova aba)</span>
              </a>
            ) : (
              <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="flex h-12 items-center rounded-full border border-line2 px-5 font-semibold text-head no-underline hover:text-head">
                Acompanhar no GitHub ↗<span className="sr-only"> (abre em nova aba)</span>
              </a>
            )}
            <button type="button" onClick={() => openCase(next)} className="ml-auto flex h-12 cursor-pointer items-center gap-2 rounded-full border-0 bg-transparent px-4 text-[15px] font-bold text-accent-text">
              Próximo: {cases[next].name} →
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
