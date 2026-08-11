import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Braces, CheckCircle2, CodeXml, Cpu, Radar } from "lucide-react";
import { SpotlightCard } from "@/components/effects/SpotlightCard";
import { BlurFade } from "@/components/magic/BlurFade";
import { NumberTicker } from "@/components/magic/NumberTicker";
import { techStack } from "@/data/stack";
import { cn } from "@/lib/utils";

const positions = [
  "left-1/2 top-[2%]",
  "right-[8%] top-[18%]",
  "right-[2%] top-1/2",
  "right-[9%] bottom-[13%]",
  "left-1/2 bottom-[1%]",
  "left-[8%] bottom-[14%]",
  "left-[1%] top-1/2",
  "left-[8%] top-[18%]",
];

const shortNames = ["RE", "TS", "JS", "NG", "VU", "ND", "QA", "DS"];

export function Stack() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = techStack[selectedIndex];

  return (
    <section id="stack" className="relative overflow-hidden bg-[#f3f7ff] px-5 py-20 text-primary md:px-8 md:py-28">
      <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(rgba(37,99,235,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,.07)_1px,transparent_1px)] bg-[size:46px_46px] [mask-image:linear-gradient(to_bottom,black,transparent_90%)]" />
      <div className="pointer-events-none absolute top-1/3 left-1/2 size-[42rem] -translate-x-1/2 rounded-full bg-cyan-300/20 blur-3xl" />
      <div className="relative mx-auto max-w-[1240px]">
        <BlurFade>
          <div className="mb-12 grid gap-7 lg:grid-cols-[1fr_0.75fr] lg:items-end">
            <div>
              <span className="section-kicker">Skills OS · mapa interativo</span>
              <h2 className="mt-5 max-w-4xl font-display text-4xl leading-[0.98] font-semibold tracking-[-0.065em] md:text-7xl">Tecnologias que uso no dia a dia.</h2>
            </div>
            <p className="max-w-md text-sm leading-7 text-muted-foreground lg:justify-self-end">Selecione uma tecnologia para ver senioridade, tempo de experiência e onde ela aparece na minha trajetória.</p>
          </div>
        </BlurFade>

        <div className="grid items-center gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <BlurFade>
            <div className="relative mx-auto hidden aspect-square w-full max-w-[590px] md:block">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 42, repeat: Infinity, ease: "linear" }} className="absolute inset-[8%] rounded-full border border-dashed border-blue-300/45" />
              <motion.div animate={{ rotate: -360 }} transition={{ duration: 31, repeat: Infinity, ease: "linear" }} className="absolute inset-[20%] rounded-full border border-blue-300/35 [background:conic-gradient(from_90deg,transparent,rgba(59,130,246,.12),transparent_45%)]" />
              <div className="absolute inset-[32%] grid place-items-center rounded-full border border-blue-200 bg-white/88 text-center shadow-[0_25px_70px_rgba(37,99,235,.13)] backdrop-blur-xl">
                <div className="px-4"><Radar className="mx-auto size-7 text-blue-600" /><p className="mt-4 font-mono text-[9px] tracking-[0.17em] text-blue-500 uppercase">Frontend core</p><strong className="mt-2 flex flex-col items-center text-lg leading-tight tracking-[-0.03em]"><span>Produto</span><span className="text-sm text-blue-500">+</span><span>Engenharia</span></strong></div>
              </div>

              {techStack.map((tech, index) => (
                <motion.button
                  key={tech.name}
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  onFocus={() => setSelectedIndex(index)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.96 }}
                  className={cn("absolute z-20 grid size-[86px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[1.65rem] border text-center shadow-lg backdrop-blur transition", positions[index], selectedIndex === index ? "border-blue-500 bg-blue-600 text-white shadow-[0_15px_38px_rgba(37,99,235,.25)]" : "border-blue-100 bg-white/90 text-blue-950/65 hover:border-blue-300 hover:text-blue-700")}
                  aria-label={`Selecionar ${tech.name}`}
                >
                  {selectedIndex === index ? <motion.span layoutId="skill-orbit-active" className="absolute inset-0 rounded-[1.65rem] ring-2 ring-blue-300/45" /> : null}
                  <span className="relative"><strong className="block font-mono text-sm">{shortNames[index]}</strong><span className="mt-1 block max-w-[70px] truncate text-[8px]">{tech.name}</span></span>
                </motion.button>
              ))}
            </div>
          </BlurFade>

          <div className="grid grid-cols-2 gap-3 md:hidden">
            {techStack.map((tech, index) => <button key={tech.name} type="button" onClick={() => setSelectedIndex(index)} className={cn("rounded-2xl border p-4 text-left transition", selectedIndex === index ? "border-blue-500 bg-blue-600 text-white" : "border-blue-100 bg-white text-primary")}><span className={cn("font-mono text-[9px]", selectedIndex === index ? "text-blue-100" : "text-blue-500")}>{shortNames[index]}</span><strong className="mt-2 block text-sm">{tech.name}</strong></button>)}
          </div>

          <BlurFade delay={0.08}>
            <SpotlightCard className="min-h-[520px] rounded-[2.6rem] border border-blue-100 bg-white/90 p-7 shadow-[0_30px_90px_rgba(37,99,235,.13)] backdrop-blur-xl md:p-10">
              <AnimatePresence mode="wait">
                <motion.div key={selected.name} initial={{ opacity: 0, y: 18, filter: "blur(7px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -14, filter: "blur(7px)" }} transition={{ duration: 0.35 }} className="relative z-10 flex min-h-[440px] flex-col">
                  <div className="flex items-start justify-between gap-5">
                    <span className="grid size-14 place-items-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600">{selected.category === "Front-end" ? <CodeXml className="size-6" /> : selected.category === "Qualidade" ? <CheckCircle2 className="size-6" /> : selected.category === "Produto" ? <Braces className="size-6" /> : <Cpu className="size-6" />}</span>
                    <div className="text-right"><span className="font-mono text-[9px] tracking-[0.16em] text-blue-500 uppercase">Experiência</span><strong className="mt-1 block text-4xl tracking-[-0.06em] text-primary"><span className="mr-0.5 text-2xl text-blue-600">+</span><NumberTicker value={selected.years} /> <span className="text-lg tracking-[-0.03em] text-blue-700">anos</span></strong><span className="mt-2 inline-flex rounded-full bg-blue-100 px-3 py-1 text-[10px] font-semibold text-blue-700">Nível {selected.levelLabel}</span></div>
                  </div>
                  <p className="mt-9 font-mono text-[10px] tracking-[0.16em] text-blue-600 uppercase">{selected.category}</p>
                  <h3 className="mt-3 text-4xl font-semibold tracking-[-0.055em] md:text-5xl">{selected.name}</h3>
                  <div className="mt-6 flex flex-wrap gap-2"><span className="rounded-full border border-blue-100 bg-white px-3 py-2 text-xs text-muted-foreground">{selected.experience}</span></div>
                  <div className="mt-8 flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-xs text-muted-foreground"><span className="size-2 rounded-full bg-blue-600" /> Tempo estimado a partir da trajetória descrita no currículo.</div>
                  <p className="mt-8 text-base leading-8 text-muted-foreground">{selected.evidence}</p>
                  <a href="#experience" className="mt-auto inline-flex items-center gap-2 pt-8 text-sm font-semibold text-blue-600 transition hover:text-primary">Ver aplicação na trajetória <ArrowUpRight className="size-4" /></a>
                </motion.div>
              </AnimatePresence>
            </SpotlightCard>
          </BlurFade>
        </div>

        <div className="mt-14 overflow-hidden border-y border-blue-200 py-5">
          <motion.div animate={{ x: ["0%", "-50%"] }} transition={{ duration: 26, repeat: Infinity, ease: "linear" }} className="flex w-max gap-12 whitespace-nowrap font-mono text-xs tracking-[0.15em] text-blue-950/40 uppercase">
            {[...techStack, ...techStack].map((tech, index) => <span key={`${tech.name}-${index}`}>{tech.name}<span className="ml-12 text-blue-500">✦</span></span>)}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
