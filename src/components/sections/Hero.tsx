import { useEffect, useRef, type MouseEvent } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { GITHUB_URL, LINKEDIN_URL } from "@/data/portfolio";
import { live, onFrame } from "@/lib/live";
import { loadThree } from "@/three/loadThree";
import { createHeroScene, HERO_HINT_DEFAULT, type HeroScene } from "@/three/heroScene";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowRightIcon, ChevronRightIcon, GithubIcon, LinkedinIcon } from "@/components/ui/icons";

const MAGNETIC_T = "transform .35s cubic-bezier(.2,.8,.2,1),background .2s,border-color .2s";

export function Hero() {
  const { vp, motion, heroReady, openModal, scrollToId } = usePortfolio();
  const mountRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLSpanElement>(null);
  const scrollDotRef = useRef<HTMLSpanElement>(null);
  const sceneRef = useRef<HeroScene | null>(null);
  const isWide = vp.w >= 980;
  const kbd = vp.mac ? "⌘K" : "Ctrl K";
  const hasKeyboard = vp.fine && vp.w >= 860;

  useEffect(() => {
    let dead = false;
    loadThree()
      .then((THREE) => {
        if (dead || !mountRef.current) return;
        sceneRef.current = createHeroScene(THREE, mountRef.current, () => hintRef.current);
        live.hero3dReady = true;
      })
      .catch(() => {
        live.hero3dReady = true;
      });
    return () => {
      dead = true;
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (heroReady) sceneRef.current?.restart();
  }, [heroReady]);

  useEffect(
    () =>
      onFrame((t) => {
        const y = live.scrollY, motionOn = live.motion;
        const hc = contentRef.current;
        if (hc && y < innerHeight * 1.2 && motionOn) hc.style.transform = `translate3d(0,${y * 0.12}px,0)`;
        else if (hc && !motionOn) hc.style.transform = "none";
        if (scrollDotRef.current) scrollDotRef.current.style.transform = motionOn ? `translateY(${(Math.sin(t / 380) * 0.5 + 0.5) * 10}px)` : "none";
        sceneRef.current?.tick(t / 1000);
      }),
    [],
  );

  const goCases = (e: MouseEvent) => {
    e.preventDefault();
    scrollToId("cases");
  };

  return (
    <section id="topo" className="relative overflow-hidden bg-bg">
      <div ref={mountRef} aria-hidden="true" className="absolute inset-x-0 bottom-0" style={{ top: isWide ? 0 : "auto", height: isWide ? "auto" : "min(92vw,440px)" }} />
      {!isWide && motion && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[18px] left-1/2 z-[2] flex max-w-[calc(100%-32px)] -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-line bg-glass px-3.5 py-2 shadow-card"
          style={{ backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}
        >
          <span className="size-2 shrink-0 rounded-full" style={{ background: "#1783C1", boxShadow: "0 0 0 4px rgba(23,131,193,.18)" }} />
          <span ref={hintRef} className="mono overflow-hidden text-ellipsis text-[12.5px] font-medium text-head">
            {HERO_HINT_DEFAULT}
          </span>
        </div>
      )}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ opacity: isWide ? 1 : 0, background: "linear-gradient(90deg,var(--bg) 0%,var(--bg) 28%,transparent 62%)" }} />
      <div
        aria-hidden="true"
        className="dot-grid pointer-events-none absolute inset-0"
        style={{ WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 30% 40%,#000 20%,transparent 75%)", maskImage: "radial-gradient(ellipse 70% 60% at 30% 40%,#000 20%,transparent 75%)" }}
      />
      <div
        ref={contentRef}
        className="pointer-events-none relative mx-auto box-border flex max-w-[1180px] flex-col justify-between gap-14"
        style={{
          padding: `clamp(116px,18vh,200px) clamp(20px,4vw,40px) ${isWide ? "64px" : "min(92vw,440px)"}`,
          minHeight: isWide ? "min(100vh,900px)" : 0,
        }}
      >
        <div className="flex max-w-[720px] flex-col gap-7">
          <Reveal kind="blur" hero className="pointer-events-auto self-start">
            <button
              type="button"
              onClick={() => openModal("avail")}
              aria-haspopup="dialog"
              className="flex max-w-full cursor-pointer items-center gap-2.5 whitespace-nowrap rounded-full border border-line bg-glass py-[7px] pl-3 pr-2 font-medium text-ink transition-[border-color] duration-[250ms] hover:border-[#E0A21B]"
              style={{ fontSize: "clamp(13px,3.4vw,14px)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
            >
              <span className="size-2.5 shrink-0 rounded-full" style={{ background: "#F5B82E", boxShadow: "0 0 0 4px rgba(245,184,46,.22)" }} />
              Avaliando novas oportunidades
              <span className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-chip px-[9px] py-[3px] text-[12.5px] font-semibold text-chip-text">
                Ver detalhes
                <ChevronRightIcon size={12} sw={2.5} />
              </span>
            </button>
          </Reveal>
          <h1 className="stretch-125 flex flex-wrap gap-x-[.25em] font-bold text-head" style={{ fontSize: "clamp(38px,7.6vw,92px)", lineHeight: 0.98, letterSpacing: "-.035em" }}>
            <Reveal as="span" kind="word" hero delay={80} className="inline-block">
              Alexandre
            </Reveal>
            <Reveal as="span" kind="word" hero delay={160} className="inline-block">
              Diogo
            </Reveal>
            <Reveal
              as="span"
              kind="word"
              hero
              delay={240}
              className="inline-block pb-[.06em] text-transparent"
              style={{ background: "linear-gradient(90deg,var(--head),#1783C1)", WebkitBackgroundClip: "text", backgroundClip: "text" }}
            >
              Nascimento
            </Reveal>
          </h1>
          <Reveal as="p" kind="blur" hero delay={340} className="mono flex flex-wrap items-center gap-2.5 font-medium text-muted" style={{ fontSize: "clamp(14px,1.3vw,16px)" }}>
            <span className="font-semibold text-head">Software Engineer · Frontend &amp; Fullstack</span>
          </Reveal>
          <Reveal as="p" kind="blur" hero delay={420} className="max-w-[58ch]" style={{ fontSize: "clamp(17px,1.5vw,19px)", lineHeight: 1.65 }}>
            Construo interfaces web rápidas, acessíveis e fáceis de manter. São 6 anos transformando regras de negócio complexas em produtos claros, na MindMiners, na EY e em projeto para a Vivo.
          </Reveal>
          <Reveal kind="blur" hero delay={500} className="pointer-events-auto flex flex-wrap items-center gap-3">
            <a
              href="#cases"
              onClick={goCases}
              data-magnetic="1"
              className="flex h-[54px] items-center gap-2.5 rounded-full bg-btn px-[26px] text-[16px] font-bold text-btn-text no-underline hover:bg-brand hover:text-white"
              style={{ transition: MAGNETIC_T, boxShadow: "0 12px 30px -12px rgba(23,131,193,.6)" }}
            >
              Ver projetos
              <ArrowRightIcon size={18} sw={2.2} />
            </a>
            <a
              href="#"
              data-magnetic="1"
              onClick={(e) => {
                e.preventDefault();
                openModal("cv");
              }}
              className="flex h-[54px] items-center gap-2.5 rounded-full border border-line2 bg-glass px-6 text-[16px] font-semibold text-head no-underline hover:border-brand hover:text-head"
              style={{ transition: MAGNETIC_T, backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
            >
              Baixar currículo
            </a>
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener"
              aria-label="LinkedIn (abre em nova aba)"
              data-magnetic="1"
              className="grid size-[54px] place-items-center rounded-full border border-line2 bg-glass text-head hover:border-brand hover:text-head"
              style={{ transition: MAGNETIC_T }}
            >
              <LinkedinIcon size={20} />
            </a>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener"
              aria-label="GitHub (abre em nova aba)"
              data-magnetic="1"
              className="grid size-[54px] place-items-center rounded-full border border-line2 bg-glass text-head hover:border-brand hover:text-head"
              style={{ transition: MAGNETIC_T }}
            >
              <GithubIcon size={20} />
            </a>
          </Reveal>
        </div>
        <Reveal kind="blur" hero delay={620} className="mono flex flex-wrap items-center justify-between gap-4 text-[12.5px] text-muted">
          <span className="flex items-center gap-2.5">
            <span className="box-border flex h-[34px] w-[22px] justify-center rounded-full border-[1.5px] border-line2 pt-1.5">
              <span ref={scrollDotRef} className="h-2 w-1 rounded" style={{ background: "#1783C1" }} />
            </span>
            Role para explorar
          </span>
          {hasKeyboard && (
            <span>
              Pressione <span className="rounded-[5px] border border-line2 px-1.5 py-0.5">{kbd}</span> para navegar por comandos
            </span>
          )}
        </Reveal>
      </div>
    </section>
  );
}
