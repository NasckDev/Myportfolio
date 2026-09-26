import { useEffect, useRef, useState } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { EMAIL, GITHUB_URL, LINKEDIN_URL, MAIL_HREF } from "@/data/portfolio";
import { live } from "@/lib/live";
import { loadThree, whenNear } from "@/three/loadThree";
import { createLogoScene } from "@/three/logoScene";
import { Reveal } from "@/components/motion/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ArrowRightIcon, ClockIcon, CopyIcon, FileDownIcon, GithubIcon, LinkedinIcon, PinIcon } from "@/components/ui/icons";

const clockFmt = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });

function useClock() {
  const [clock, setClock] = useState("");
  useEffect(() => {
    const tick = () => setClock(clockFmt.format(new Date()) + " em São Paulo");
    tick();
    const id = window.setInterval(tick, 30000);
    return () => window.clearInterval(id);
  }, []);
  return clock || "São Paulo · UTC−3";
}

const channelClass =
  "flex items-center gap-3.5 px-1 py-[15px] text-head no-underline transition-[background,padding] duration-[250ms,350ms] ease-[cubic-bezier(.2,.8,.2,1)] hover:bg-chip hover:pl-2.5 hover:text-head";

export function Contact() {
  const { motion, emailCopied, copyEmail, showToast, openModal } = usePortfolio();
  const clock = useClock();
  const logoRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    const mount = logoRef.current;
    if (!mount) return;
    let dead = false;
    let scene: { dispose: () => void } | null = null;
    const stopWatching = whenNear(mount, () => {
      loadThree()
        .then((THREE) => {
          if (dead) return;
          try {
            scene = createLogoScene(THREE, mount);
          } catch {
            /* WebGL indisponível: o ícone fica só com o gradiente */
          }
        })
        .catch(() => {});
    });
    return () => {
      dead = true;
      stopWatching();
      scene?.dispose();
    };
  }, []);

  const setMailHover = (v: boolean) => {
    live.mailHover = v;
    setHover(v);
  };

  return (
    <section id="contato" className="container-x section-pad pb-10">
      <Reveal data-spot="1" className="relative isolate overflow-hidden border border-line bg-surface text-head shadow-card" style={{ borderRadius: "clamp(24px,3vw,36px)" }}>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10" style={{ background: "radial-gradient(70% 90% at 0% 100%,rgba(23,131,193,.14),transparent 65%),radial-gradient(60% 80% at 100% 0%,rgba(108,192,238,.16),transparent 70%)" }} />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10" style={{ background: "radial-gradient(460px circle at var(--mx,75%) var(--my,25%),rgba(23,131,193,.10),transparent 65%)" }} />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            backgroundImage: "linear-gradient(rgba(23,131,193,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(23,131,193,.07) 1px,transparent 1px)",
            backgroundSize: "48px 48px",
            WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 70% 30%,#000 10%,transparent 75%)",
            maskImage: "radial-gradient(ellipse 80% 70% at 70% 30%,#000 10%,transparent 75%)",
          }}
        />
        <div aria-hidden="true" className="absolute left-[8%] right-[8%] top-0 -z-10 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(23,131,193,.45),transparent)" }} />
        <div
          className="relative grid items-stretch"
          style={{
            gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,380px),1fr))",
            gap: "clamp(28px,5vw,40px) clamp(32px,5vw,72px)",
            padding: "clamp(22px,5.5vw,72px) clamp(18px,5.5vw,72px)",
          }}
        >
          <div className="flex flex-col justify-between gap-7">
            <div className="flex flex-col gap-[18px]">
              <div className="size-[74px] shrink-0 overflow-hidden rounded-[20px]" style={{ background: "linear-gradient(160deg,#0A3C6E,#1783C1)", border: "1px solid rgba(23,131,193,.35)", boxShadow: "0 12px 24px -12px rgba(10,60,110,.5)" }}>
                <div ref={logoRef} aria-hidden="true" className="pointer-events-none size-full" />
              </div>
              <SectionLabel>06 — CONTATO</SectionLabel>
              <h2 className="stretch-115 font-bold" style={{ fontSize: "clamp(28px,3.4vw,42px)", lineHeight: 1.1, letterSpacing: "-.02em" }}>
                Vamos conversar sobre a sua vaga?
              </h2>
              <p className="max-w-[46ch] text-ink" style={{ fontSize: "clamp(16px,1.5vw,18px)", lineHeight: 1.6 }}>
                Conte um pouco sobre o time e o desafio. Respondo por e-mail ou LinkedIn, e o currículo está a um clique.
              </p>
            </div>
            <div className="flex flex-col gap-[18px]">
              <div className="flex items-start gap-3 text-ink">
                <span className="grid size-[36px] shrink-0 place-items-center rounded-[10px] border border-line bg-chip text-accent-text">
                  <PinIcon size={16} />
                </span>
                <div className="flex flex-col gap-2 pt-1.5">
                  <span className="text-[13px] text-muted">Modelos de trabalho</span>
                  <div className="flex flex-wrap gap-1.5">
                    {["Híbrido · SP", "Híbrido · Campinas/Jundiaí", "Remoto"].map((m) => (
                      <span key={m} className="flex items-center whitespace-nowrap rounded-full border border-line bg-chip px-2.5 py-[5px] text-[13px] text-head">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 text-ink">
                <span className="grid size-[36px] shrink-0 place-items-center rounded-[10px] border border-line bg-chip text-accent-text">
                  <ClockIcon size={16} />
                </span>
                <div className="flex flex-col gap-1 pt-1.5">
                  <span className="text-[13px] text-muted">Meu fuso horário</span>
                  <span className="text-[15px] font-semibold text-head">
                    {clock} <span className="font-normal text-muted">· UTC−3</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex min-w-0 flex-col gap-5 border border-line bg-bg2" style={{ padding: "clamp(16px,2.6vw,28px)", borderRadius: "clamp(20px,3vw,26px)", backdropFilter: "blur(10px)" }}>
            <div className="flex flex-col gap-2.5">
              <span className="mono text-[12.5px] text-muted">E-mail direto</span>
              <button
                type="button"
                onClick={copyEmail}
                aria-label={`Copiar e-mail ${EMAIL}`}
                className="flex min-w-0 cursor-pointer flex-wrap items-center justify-between gap-x-3 gap-y-2.5 border-0 bg-transparent p-0 text-left text-head hover:text-accent-text"
              >
                <span className="stretch-112 min-w-0 font-bold tracking-[-.01em] [overflow-wrap:anywhere]" style={{ fontSize: "clamp(17px,2.2vw,24px)" }}>
                  {EMAIL}
                </span>
                <span className="flex h-[34px] shrink-0 items-center gap-1.5 rounded-full bg-chip px-3 text-[13px] font-semibold text-head">
                  <CopyIcon size={14} />
                  {emailCopied ? "Copiado" : "Copiar"}
                </span>
              </button>
            </div>
            <a
              href={MAIL_HREF}
              onClick={() => {
                live.sendT = performance.now() / 1000;
                showToast("Abrindo seu aplicativo de e-mail…");
              }}
              onPointerEnter={() => setMailHover(true)}
              onPointerLeave={() => setMailHover(false)}
              onFocus={() => setMailHover(true)}
              onBlur={() => setMailHover(false)}
              className="relative isolate box-border flex h-14 w-full items-center justify-between gap-2.5 overflow-hidden rounded-full pl-[22px] pr-[9px] text-[16px] font-bold no-underline"
              style={{
                background: hover ? "#1783C1" : "var(--btnBg)",
                color: hover ? "#FFFFFF" : "var(--btnText)",
                transform: hover && motion ? "translateY(-2px)" : "none",
                boxShadow: hover ? "0 20px 40px -16px rgba(23,131,193,.75)" : "0 14px 30px -14px rgba(0,0,0,.5)",
                transition: `color .35s ease .05s,background-color .2s ease ${hover ? ".45s" : "0s"},transform .45s cubic-bezier(.2,.8,.2,1),box-shadow .45s`,
              }}
            >
              <span
                aria-hidden="true"
                className="absolute -inset-0.5 -z-10 rounded-full"
                style={{
                  background: "linear-gradient(90deg,#0A3C6E,#1783C1)",
                  clipPath: hover ? "circle(150% at calc(100% - 28px) 50%)" : "circle(0px at calc(100% - 28px) 50%)",
                  transition: "clip-path .6s cubic-bezier(.7,0,.2,1)",
                }}
              />
              <span className="flex items-center gap-2 whitespace-nowrap">Enviar e-mail</span>
              <span
                className="grid size-[38px] place-items-center overflow-hidden rounded-full"
                style={{ background: hover ? "#FFFFFF" : "rgba(255,255,255,.16)", color: hover ? "#0A3C6E" : "var(--btnText)", transition: "background .35s,color .35s" }}
              >
                <ArrowRightIcon size={16} sw={2.4} style={{ transform: hover ? "translateX(2px) rotate(-45deg)" : "none", transition: "transform .5s cubic-bezier(.34,1.56,.64,1)" }} />
              </span>
            </a>
            <div className="mt-auto flex flex-col gap-1.5">
              <span className="mono pb-1.5 text-[12.5px] text-muted">Outros canais</span>
              <nav aria-label="Outros canais" className="flex flex-col border-t border-line">
                <a href={LINKEDIN_URL} target="_blank" rel="noopener" className={channelClass}>
                  <LinkedinIcon size={20} stroke="var(--accentText)" className="shrink-0" />
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-[16px] font-bold">LinkedIn</span>
                    <span className="text-[13.5px] text-muted">perfil e recomendações</span>
                  </span>
                  <span className="text-[17px] text-accent-text">↗</span>
                </a>
                <a href={GITHUB_URL} target="_blank" rel="noopener" className={channelClass + " border-t border-line"}>
                  <GithubIcon size={20} stroke="var(--accentText)" className="shrink-0" />
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-[16px] font-bold">GitHub</span>
                    <span className="text-[13.5px] text-muted">@NasckDev</span>
                  </span>
                  <span className="text-[17px] text-accent-text">↗</span>
                </a>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    openModal("cv");
                  }}
                  className={channelClass + " border-t border-line"}
                >
                  <FileDownIcon size={20} stroke="var(--accentText)" className="shrink-0" />
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-[16px] font-bold">Currículo</span>
                    <span className="text-[13.5px] text-muted">PDF completo ou versão ATS</span>
                  </span>
                  <span className="text-[17px] text-accent-text">↓</span>
                </a>
              </nav>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
