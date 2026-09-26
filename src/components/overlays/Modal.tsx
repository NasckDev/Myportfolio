import { useEffect, useRef, useState } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { allSkills, cases, CV_ATS_URL, CV_FULL_URL, jobs, LINKEDIN_URL, workModes } from "@/data/portfolio";
import { writeStorage } from "@/lib/clipboard";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { CloseIcon, FileDownIcon, GlobeIcon, PinIcon } from "@/components/ui/icons";

const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY;

async function sendFeedback(message: string) {
  if (!WEB3FORMS_KEY) return false;
  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ access_key: WEB3FORMS_KEY, subject: "Feedback do portfólio", from_name: "Portfólio · feedback anônimo", message }),
    });
    const data = (await res.json()) as { success?: boolean };
    return res.ok && data.success === true;
  } catch {
    return false;
  }
}

export function Modal() {
  const { vp, modal, skillSel, closeModal, openModal, openCase, setOpenJob, scrollToId, copyEmail, showToast } = usePortfolio();
  const dlgRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [fbText, setFbText] = useState("");
  const [sending, setSending] = useState(false);
  const [last, setLast] = useState(modal);
  const open = !!modal;
  useFocusTrap(dlgRef, open);

  // Mantém o conteúdo durante a animação de saída.
  useEffect(() => {
    if (modal) setLast(modal);
  }, [modal]);
  const m = modal || last;

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => closeRef.current?.focus({ preventScroll: true }), 60);
    return () => window.clearTimeout(t);
  }, [open]);

  const sel = skillSel != null ? allSkills[skillSel] : null;
  const links = sel
    ? [
        ...sel.cases.map((ci) => ({
          kind: "projeto",
          label: `${cases[ci].name} · ${cases[ci].tagline}`,
          go: () => {
            closeModal();
            window.setTimeout(() => openCase(ci), 220);
          },
        })),
        ...sel.jobs.map((ji) => ({
          kind: "experiência",
          label: `${jobs[ji].company} · ${jobs[ji].role}`,
          go: () => {
            closeModal();
            setOpenJob(ji);
            window.setTimeout(() => scrollToId("experiencia"), 120);
          },
        })),
      ]
    : [];

  const kicker = m === "avail" ? "disponibilidade" : m === "feedback" ? "feedback" : m === "cv" ? "currículo" : m === "keys" ? "atalhos" : sel ? "habilidade" : "";
  const title = m === "avail" ? "Avaliando novas oportunidades" : m === "feedback" ? "O que posso melhorar?" : m === "cv" ? "Baixar currículo" : m === "keys" ? "Atalhos de teclado" : sel ? sel.name : "";
  const mod = vp.mac ? "⌘" : "Ctrl";
  const shortcuts = [
    { k: `${mod} K`, d: "Buscar e navegar" },
    { k: "/", d: "Abrir a busca" },
    { k: "T", d: "Alternar tema claro / escuro" },
    { k: "M", d: "Ligar ou desligar animações" },
    { k: "?", d: "Mostrar atalhos" },
    { k: "Esc", d: "Fechar janelas" },
  ];
  const cvOptions = [
    { t: "Currículo completo", d: "Layout do portfólio, com projetos e experiência", href: CV_FULL_URL, toast: "Download do currículo iniciado" },
    { t: "Versão ATS", d: "Texto simples, ideal para sistemas de recrutamento", href: CV_ATS_URL, toast: "Download da versão ATS iniciado" },
  ];

  const submitFeedback = async () => {
    const t = fbText.trim();
    if (!t) {
      showToast("Escreva uma sugestão antes de enviar");
      return;
    }
    writeStorage("adn4-feedback", t);
    setSending(true);
    const sent = await sendFeedback(t);
    setSending(false);
    if (WEB3FORMS_KEY && !sent) {
      showToast("Não foi possível enviar agora. Tente novamente.");
      return;
    }
    closeModal();
    setFbText("");
    showToast("Sugestão enviada. Obrigado!");
  };

  return (
    <>
      <div
        aria-hidden="true"
        onClick={closeModal}
        className="fixed inset-0 z-[140]"
        style={{ background: "rgba(4,14,28,.5)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none", transition: "opacity .25s" }}
      />
      <div
        ref={dlgRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        aria-hidden={!open}
        inert={!open}
        className="fixed left-1/2 top-1/2 z-[141] box-border max-h-[calc(100vh/var(--zoom,1)-40px)] w-[min(560px,calc(100%-24px))] overflow-y-auto rounded-[26px] border border-line bg-surface"
        style={{
          boxShadow: "0 40px 90px -30px rgba(0,0,0,.55)",
          opacity: open ? 1 : 0,
          transform: `translate(-50%,-50%) ${open ? "scale(1)" : "scale(.96)"}`,
          pointerEvents: open ? "auto" : "none",
          visibility: open ? "visible" : "hidden",
          transition: `opacity .22s,transform .35s cubic-bezier(.2,.8,.2,1),visibility 0s linear ${open ? "0s" : ".35s"}`,
        }}
      >
        <div className="flex items-center justify-between gap-3 pl-6 pr-[18px] pt-[18px]">
          <span className="mono text-[12.5px] text-accent-text">{kicker}</span>
          <button ref={closeRef} type="button" onClick={closeModal} aria-label="Fechar" className="grid size-10 cursor-pointer place-items-center rounded-full border border-line bg-bg2 text-head">
            <CloseIcon size={17} sw={2.2} />
          </button>
        </div>
        <div className="flex flex-col gap-4 px-6 pb-6 pt-1.5">
          <h2 className="stretch-118 font-bold text-head" style={{ fontSize: "clamp(22px,2.6vw,28px)", lineHeight: 1.2, letterSpacing: "-.015em" }}>
            {title}
          </h2>

          {m === "cv" && (
            <>
              <p className="text-[16px] text-muted">Escolha o formato. O conteúdo é o mesmo nos dois arquivos.</p>
              <div className="flex flex-col gap-2.5">
                {cvOptions.map((o) => (
                  <a
                    key={o.t}
                    href={o.href}
                    download=""
                    onClick={() => {
                      showToast(o.toast);
                      window.setTimeout(closeModal, 300);
                    }}
                    className="flex items-center gap-3.5 rounded-[18px] border border-line bg-bg2 p-4 text-ink no-underline transition-[border-color,transform] duration-[200ms,300ms] ease-[cubic-bezier(.2,.8,.2,1)] hover:[transform:translateY(-2px)] hover:border-brand hover:text-ink"
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-[14px] bg-btn text-btn-text">
                      <FileDownIcon size={20} />
                    </span>
                    <span className="flex flex-1 flex-col gap-0.5">
                      <span className="text-[16px] font-bold text-head">{o.t}</span>
                      <span className="text-[14px] text-muted">{o.d}</span>
                    </span>
                    <span className="mono rounded-lg bg-chip px-2 py-1 text-[12px] font-medium text-chip-text leading-normal">PDF</span>
                  </a>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[14px] text-muted">
                Prefere outro canal?
                <button type="button" onClick={copyEmail} className="cursor-pointer border-0 bg-transparent p-0 text-[14px] font-semibold text-accent-text">
                  Copiar e-mail
                </button>
                ·
                <a href={LINKEDIN_URL} target="_blank" rel="noopener" className="font-semibold">
                  LinkedIn ↗
                </a>
              </div>
            </>
          )}

          {m === "avail" && (
            <>
              <div className="flex items-center gap-3 rounded-2xl px-4 py-3.5" style={{ background: "rgba(245,184,46,.12)", border: "1px solid rgba(245,184,46,.45)" }}>
                <span className="size-2.5 shrink-0 rounded-full" style={{ background: "#F5B82E", boxShadow: "0 0 0 4px rgba(245,184,46,.22)" }} />
                <span className="text-[15px] leading-normal">Estou avaliando propostas com calma, sem urgência. Converso sobre vagas que façam sentido para o momento da minha carreira.</span>
              </div>
              <span className="mono text-[12.5px] text-muted">Modelos de trabalho</span>
              <div className="flex flex-col gap-2">
                {workModes.map((w) => (
                  <div key={w.t} className="flex items-center gap-3.5 rounded-2xl border border-line bg-bg2 px-4 py-3.5">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-chip text-chip-text">{w.remote ? <GlobeIcon size={18} /> : <PinIcon size={18} />}</span>
                    <span className="flex flex-1 flex-col gap-0.5">
                      <span className="text-[16px] font-bold text-head">{w.t}</span>
                      <span className="text-[14px] text-muted">{w.d}</span>
                    </span>
                    <span className="mono rounded-full border border-line bg-surface px-[9px] py-1 text-[12px] font-semibold text-accent-text leading-normal">{w.tag}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    closeModal();
                    window.setTimeout(() => scrollToId("contato"), 150);
                  }}
                  className="h-12 cursor-pointer rounded-full border-0 bg-btn px-5 text-[15px] font-bold text-btn-text hover:bg-brand hover:text-white"
                >
                  Falar sobre uma vaga →
                </button>
                <button type="button" onClick={() => openModal("cv")} className="h-12 cursor-pointer rounded-full border border-line2 bg-transparent px-5 text-[15px] font-semibold text-head">
                  Ver currículo
                </button>
              </div>
            </>
          )}

          {m === "feedback" && (
            <>
              <p className="text-[16px] text-muted">Sua opinião ajuda a deixar o portfólio melhor. É anônimo e leva poucos segundos.</p>
              <textarea
                value={fbText}
                onChange={(e) => setFbText(e.target.value)}
                rows={4}
                maxLength={2000}
                placeholder="Ex.: senti falta de mais detalhes nos projetos"
                aria-label="Sugestão"
                className="box-border w-full resize-y rounded-2xl border border-line2 bg-bg2 px-4 py-3.5 text-[15.5px] font-medium leading-normal text-head outline-0 placeholder:text-muted"
              />
              <div className="flex flex-wrap justify-end gap-2.5">
                <button type="button" onClick={closeModal} className="h-[46px] cursor-pointer rounded-full border border-line2 bg-transparent px-[18px] text-[14.5px] font-semibold text-head">
                  Agora não
                </button>
                <button
                  type="button"
                  onClick={submitFeedback}
                  disabled={sending}
                  className="h-[46px] cursor-pointer rounded-full border-0 bg-btn px-5 text-[14.5px] font-bold text-btn-text hover:bg-brand hover:text-white disabled:opacity-60"
                >
                  Enviar sugestão
                </button>
              </div>
            </>
          )}

          {m === "keys" && (
            <div className="flex flex-col overflow-hidden rounded-[18px] border border-line">
              {shortcuts.map((k) => (
                <div key={k.k} className="-mt-px flex items-center justify-between gap-4 border-t border-line px-4 py-3">
                  <span className="text-[15px]">{k.d}</span>
                  <span className="mono whitespace-nowrap rounded-lg border border-line2 bg-bg2 px-[9px] py-1 text-[12.5px] font-medium text-head leading-normal">{k.k}</span>
                </div>
              ))}
            </div>
          )}

          {m === "skill" && sel && (
            <>
              <div className="flex flex-wrap gap-2">
                <span className="mono rounded-full bg-chip px-3 py-1.5 text-[13px] font-medium text-chip-text leading-normal">{sel.cat}</span>
              </div>
              <p className="text-[16px] leading-[1.6]">
                {links.length ? `Veja abaixo os projetos e experiências em que ${sel.name} foi usado.` : `${sel.name} faz parte do meu dia a dia. Posso detalhar exemplos numa conversa.`}
              </p>
              {links.length > 0 && (
                <>
                  <span className="mono text-[12.5px] text-muted">Onde aparece</span>
                  <div className="flex flex-col gap-2">
                    {links.map((l) => (
                      <button
                        key={l.kind + l.label}
                        type="button"
                        onClick={l.go}
                        className="box-border flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-line bg-bg2 px-4 py-3.5 text-left text-ink transition-[border-color] duration-200 hover:border-brand"
                      >
                        <span className="mono rounded-lg bg-surface px-2 py-1 text-[12px] font-semibold text-accent-text leading-normal">{l.kind}</span>
                        <span className="flex-1 font-semibold text-head">{l.label}</span>
                        <span className="text-accent-text">→</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
