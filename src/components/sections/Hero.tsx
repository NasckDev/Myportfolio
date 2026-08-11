import { motion } from "framer-motion";
import { ArrowDownRight, ArrowRight } from "lucide-react";
import { HeroScrollAnimation } from "@/components/effects/HeroScrollAnimation";
import { BlurFade } from "@/components/magic/BlurFade";
import { ShimmerButton } from "@/components/magic/ShimmerButton";

const techs = ["React", "TypeScript", "Angular", "Design Systems"];

export function Hero() {
  return (
    <section id="home" className="hero-grid relative min-h-[calc(100svh-84px)] overflow-hidden px-5 py-14 md:px-8 lg:py-20">
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
        <motion.div animate={{ x: [0, 55, 0], y: [0, -28, 0] }} transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[8%] right-[10%] size-72 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-24 left-[18%] size-80 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-[1240px] items-start gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-6 xl:grid-cols-[0.7fr_1.3fr] xl:gap-0 2xl:max-w-[1480px] 2xl:grid-cols-[0.68fr_1.32fr]">
        <div className="relative z-30 pt-4 lg:pt-12">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/85 px-3 py-2 text-[11px] font-semibold text-blue-950 shadow-sm backdrop-blur">
            <span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-70" /><span className="relative inline-flex size-2 rounded-full bg-emerald-500" /></span>
            Disponível para novas oportunidades
          </motion.div>

          <h1 className="relative z-[60] overflow-visible pb-5 font-display text-[clamp(4.2rem,7.25vw,7.2rem)] font-bold tracking-[-0.088em] text-primary xl:w-[calc(100%+10rem)]">
            {["Frontend", "Engineer"].map((word, index) => (
              <motion.span key={word} initial={{ opacity: 0, y: 38, filter: "blur(10px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.7, delay: 0.13 + index * 0.11, ease: [0.21, 0.47, 0.32, 0.98] }} className={index === 1 ? "relative z-[70] block overflow-visible pb-[0.13em] text-[0.88em] leading-[0.9] text-gradient" : "block leading-[0.86]"}>
                {word}
              </motion.span>
            ))}
          </h1>

          <BlurFade delay={0.36} inView={false}>
            <p className="mt-8 max-w-[17rem] text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
              Desenvolvedor front-end com 6 anos de experiência construindo produtos web acessíveis, escaláveis e orientados a dados.
            </p>
          </BlurFade>

          <BlurFade delay={0.48} inView={false}>
            <div className="mt-8">
              <ShimmerButton ariaLabel="Explorar projetos" className="rounded-full px-6 py-3.5 text-sm" onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}>
                Explorar projetos
                <span className="flex size-8 items-center justify-center rounded-full bg-white text-primary"><ArrowRight className="size-4" /></span>
              </ShimmerButton>
            </div>
          </BlurFade>

          <motion.a href="#projects" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="mt-10 inline-flex items-center gap-2 font-mono text-[9px] tracking-[0.18em] text-muted-foreground uppercase">
            Scroll para explorar <ArrowDownRight className="size-4 text-accent" />
          </motion.a>
        </div>

        <BlurFade delay={0.22} yOffset={35} inView={false} className="relative z-10">
          <HeroScrollAnimation className="lg:mt-10 xl:-ml-40 xl:w-[calc(100%+10rem)] 2xl:-ml-48 2xl:w-[calc(100%+12rem)]">
            <div className="relative">
              <svg aria-hidden="true" width="0" height="0" className="absolute">
                <defs>
                  <clipPath id="hero-media-concave-clip" clipPathUnits="objectBoundingBox">
                    <path d="M .17 0 H .94 Q 1 0 1 .09 V .91 Q 1 1 .94 1 H .06 Q 0 1 0 .91 V .50 H .02 C .075 .50 .11 .43 .11 .35 V .30 H .125 C .155 .30 .17 .25 .17 .18 Z" />
                  </clipPath>
                </defs>
              </svg>
              <div style={{ clipPath: "url(#hero-media-concave-clip)" }} className="hero-media-mask group relative min-h-[480px] overflow-hidden bg-primary shadow-[0_35px_90px_rgba(6,20,60,0.22)] lg:min-h-[540px] xl:min-h-[610px]">
                <motion.video
                  initial={{ clipPath: "inset(0 0 100% 0)", scale: 1.08 }}
                  animate={{ clipPath: "inset(0 0 0% 0)", scale: 1 }}
                  transition={{ duration: 1.05, delay: 0.3, ease: [0.76, 0, 0.24, 1] }}
                  src={`${import.meta.env.BASE_URL}assets/hero-workspace-motion.mp4`}
                  poster={`${import.meta.env.BASE_URL}assets/hero-workspace.png`}
                  aria-label="Estação de trabalho de desenvolvimento com monitor exibindo código e uma interface"
                  className="absolute inset-0 size-full object-cover transition-transform duration-1000 group-hover:scale-[1.025]"
                  autoPlay
                  playsInline
                  muted
                  preload="auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#06143c]/68 via-transparent to-blue-950/8" />

                <div className="absolute inset-x-6 bottom-6 flex flex-wrap items-center gap-2 xl:left-44">
                  {techs.map((item, index) => <motion.span key={item} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.82 + index * 0.08 }} className="rounded-full border border-white/15 bg-[#06143c]/35 px-3 py-2 text-[10px] font-semibold text-white backdrop-blur-md">{item}</motion.span>)}
                </div>
              </div>

            </div>
          </HeroScrollAnimation>
        </BlurFade>
      </div>
    </section>
  );
}
