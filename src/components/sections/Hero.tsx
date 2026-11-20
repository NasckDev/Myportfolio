import { useEffect, useRef, useState, type MouseEvent } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { GITHUB_URL, heroStats, LINKEDIN_URL, PORTRAIT_URL, profile } from "@/data/portfolio";
import { live, onFrame, onScrollFrame } from "@/lib/live";
import { loadThree } from "@/three/loadThree";
import { createHeroScene, type HeroScene } from "@/three/heroScene";
import { Reveal } from "@/components/motion/Reveal";
import { PhoneStack } from "@/components/sections/PhoneStack";
import { ArrowRightIcon, ChevronRightIcon, GithubIcon, LinkedinIcon, MailIcon } from "@/components/ui/icons";

/** Altura do celular 3D (CSS) no topo em telas estreitas. */
const MOBILE_STAGE = "min(132vw,540px)";
const MAGNETIC_T = "transform .35s cubic-bezier(.2,.8,.2,1),background .2s,border-color .2s";
/** Duração da contagem dos números do topo. */
const COUNT_MS = 1100;

/** Número que sobe de 0 até o valor quando o topo aparece. O leitor de tela recebe o valor final direto. */
function CountUp({ to }: { to: number }) {
  const { motion, heroReady } = usePortfolio();
  const [n, setN] = useState(motion ? 0 : to);
  useEffect(() => {
    if (!motion || !heroReady) return;
    let raf = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / COUNT_MS);
      setN(Math.round(to * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to, motion, heroReady]);
  return (
    <>
      <span aria-hidden="true">{motion ? n : to}</span>
      <span className="sr-only">{to}</span>
    </>
  );
}

export function Hero() {
  const { vp, motion, heroReady, openModal, scrollToId } = usePortfolio();
  const mountRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<HeroScene | null>(null);
  const isWide = vp.w >= 980;
  const kbd = vp.mac ? "⌘K" : "Ctrl K";
  const hasKeyboard = vp.fine && vp.w >= 860;

  // A cena WebGL só existe em telas largas e é baixada depois que a página fica ociosa,
  // para o three.js (≈170 KB gz) nunca competir com o primeiro conteúdo. No celular, o topo usa o PhoneStack em CSS 3D.
  useEffect(() => {
    if (!isWide) return;
    let dead = false;
    const start = () =>
      loadThree()
        .then((THREE) => {
          if (dead || !mountRef.current) return;
          sceneRef.current = createHeroScene(THREE, mountRef.current, () => null);
        })
        .catch(() => undefined);
    const idle = window.requestIdleCallback?.(start, { timeout: 1200 }) ?? window.setTimeout(start, 300);
    return () => {
      dead = true;
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, [isWide]);

  useEffect(() => {
    if (heroReady) sceneRef.current?.restart();
  }, [heroReady]);

  // Paralaxe do texto: só recalcula quando o scroll muda.
  useEffect(
    () =>
      onScrollFrame(() => {
        const hc = contentRef.current;
        if (!hc) return;
        const y = live.scrollY;
        if (!live.motion) hc.style.transform = "none";
        else if (y < innerHeight * 1.2) hc.style.transform = `translate3d(0,${y * 0.12}px,0)`;
      }),
    [],
  );

  // Cena 3D (só telas largas): animação contínua, mas apenas enquanto o topo está visível.
  useEffect(() => {
    if (!isWide) return;
    return onFrame((t) => sceneRef.current?.tick(t / 1000), sectionRef.current);
  }, [isWide]);

  const goCases = (e: MouseEvent) => {
    e.preventDefault();
    scrollToId("cases");
  };
  const goContact = (e: MouseEvent) => {
    e.preventDefault();
    scrollToId("contato");
  };

  return (
    <section ref={sectionRef} id="topo" className="relative overflow-hidden bg-bg">
      {isWide && <div ref={mountRef} aria-hidden="true" className="absolute inset-0" />}
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
          padding: `${isWide ? "clamp(116px,18vh,200px)" : "100px"} clamp(20px,4vw,40px) ${isWide ? "64px" : "28px"}`,
          minHeight: isWide ? "min(calc(100vh / var(--zoom, 1)),900px)" : 0,
        }}
      >
        <div className="flex max-w-[720px] flex-col gap-7">
          <Reveal kind="blur" hero className="pointer-events-auto flex items-center gap-3 self-start">
            {isWide ? null : (
              <img
                src={PORTRAIT_URL}
                alt=""
                width={52}
                height={52}
                decoding="async"
                className="size-[52px] shrink-0 rounded-full object-cover"
                style={{ boxShadow: "0 0 0 2px var(--bg), 0 0 0 4px #F5B82E" }}
              />
            )}
            <button
              type="button"
              onClick={() => openModal("avail")}
              aria-haspopup="dialog"
              className="flex min-h-11 max-w-full cursor-pointer items-center gap-2.5 whitespace-nowrap rounded-full border border-line bg-glass py-[7px] pl-3 pr-2 font-medium text-ink transition-[border-color] duration-[250ms] hover:border-[#E0A21B]"
              style={{ fontSize: "clamp(13px,3.4vw,14px)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
            >
              <span className="size-2.5 shrink-0 rounded-full" style={{ background: "#F5B82E", boxShadow: "0 0 0 4px rgba(245,184,46,.22)" }} />
              Avaliando novas oportunidades
              <span className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-chip px-[9px] py-[3px] text-[12.5px] font-semibold text-chip-text">
                {isWide ? "Ver detalhes" : <span className="sr-only">Ver detalhes</span>}
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
            <span className="font-semibold text-head">{profile.role}</span>
          </Reveal>
          <Reveal as="p" kind="blur" hero delay={420} className="max-w-[58ch]" style={{ fontSize: "clamp(17px,1.5vw,19px)", lineHeight: 1.65 }}>
            {profile.intro}
          </Reveal>
          <Reveal kind="blur" hero delay={500} className="pointer-events-auto flex flex-wrap items-center gap-3">
            <a
              href="#contato"
              onClick={goContact}
              data-magnetic="1"
              className="flex h-[54px] items-center gap-2.5 rounded-full bg-btn px-[26px] text-[16px] font-bold text-btn-text no-underline hover:bg-brand hover:text-white"
              style={{ transition: MAGNETIC_T, boxShadow: "0 12px 30px -12px rgba(23,131,193,.6)" }}
            >
              <MailIcon size={18} sw={2.2} />
              Falar comigo
            </a>
            <a
              href="#cases"
              onClick={goCases}
              data-magnetic="1"
              className="flex h-[54px] items-center gap-2.5 rounded-full border border-line2 bg-glass px-6 text-[16px] font-semibold text-head no-underline hover:border-brand hover:text-head"
              style={{ transition: MAGNETIC_T, backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
            >
              Ver projetos
              <ArrowRightIcon size={18} sw={2.2} />
            </a>
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener"
              aria-label="LinkedIn (abre em nova aba)"
              data-magnetic="1"
              className="grid size-[56px] place-items-center rounded-full border border-line2 bg-glass text-head hover:border-brand hover:text-head"
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
              className="grid size-[56px] place-items-center rounded-full border border-line2 bg-glass text-head hover:border-brand hover:text-head"
              style={{ transition: MAGNETIC_T }}
            >
              <GithubIcon size={20} />
            </a>
          </Reveal>
          <Reveal as="ul" kind="blur" hero delay={580} aria-label="Em números" className="grid max-w-[620px] list-none grid-cols-3 gap-2 p-0 sm:gap-3">
            {heroStats.map((st) => (
              <li key={st.label} className="flex flex-col gap-1 rounded-2xl border border-line bg-glass px-3 py-3 sm:px-4" style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}>
                <span className="stretch-118 font-bold leading-none text-head" style={{ fontSize: typeof st.value === "number" ? "clamp(24px,3vw,32px)" : "clamp(15px,1.8vw,20px)" }}>
                  {typeof st.value === "number" ? <CountUp to={st.value} /> : st.value}
                  {st.unit ? <span className="ml-1 text-[.5em] font-semibold text-muted">{st.unit}</span> : null}
                </span>
                <span className="text-[12.5px] leading-snug text-muted sm:text-[13.5px]">{st.label}</span>
              </li>
            ))}
          </Reveal>
        </div>
        {isWide && (
          <Reveal kind="blur" hero delay={620} className="mono flex flex-wrap items-center justify-between gap-4 text-[12.5px] text-muted">
            <span className="flex items-center gap-2.5">
              <span className="box-border flex h-[34px] w-[22px] justify-center rounded-full border-[1.5px] border-line2 pt-1.5">
                <span className={`${motion ? "scroll-dot " : ""}h-2 w-1 rounded`} style={{ background: "#1783C1" }} />
              </span>
              Role para explorar
            </span>
            {hasKeyboard && (
              <span>
                Pressione <span className="rounded-[5px] border border-line2 px-1.5 py-0.5">{kbd}</span> para navegar por comandos
              </span>
            )}
          </Reveal>
        )}
      </div>
      {!isWide && (
        <div className="relative pb-10">
          <PhoneStack height={MOBILE_STAGE} />
        </div>
      )}
    </section>
  );
}
