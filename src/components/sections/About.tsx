import { useState } from "react";
import { motion } from "framer-motion";
import { Accessibility, ArrowUpRight, Blocks, Code2, GraduationCap, Layers3, Sparkles, Workflow } from "lucide-react";
import { SpotlightCard } from "@/components/effects/SpotlightCard";
import { BlurFade } from "@/components/magic/BlurFade";
import { cn } from "@/lib/utils";

const focusCards = [
  { icon: Blocks, index: "01", title: "Componentização", text: "Componentes reutilizáveis, contratos claros e padrões consistentes entre as telas." },
  { icon: Accessibility, index: "02", title: "Acessibilidade", text: "Navegação por teclado, foco, semântica, mensagens de erro e estados de interface." },
  { icon: Workflow, index: "03", title: "Trabalho em equipe", text: "Colaboração com Design, Produto, Dados e Backend durante refinamento, desenvolvimento e entrega." },
];

const orbitLabels = ["UI", "DX", "A11y", "API"];

function ProcessBeam() {
  return (
    <div className="relative grid gap-4 overflow-hidden rounded-[2rem] border border-blue-100 bg-white p-6 md:grid-cols-3 md:p-8">
      <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, ease: "easeInOut" }} className="absolute top-1/2 right-[16%] left-[16%] hidden h-px origin-left bg-gradient-to-r from-blue-200 via-blue-500 to-cyan-300 md:block" />
      {[
        [Layers3, "Descobrir", "Entender o problema"],
        [Code2, "Modelar", "Definir a arquitetura"],
        [Sparkles, "Entregar", "Medir e evoluir"],
      ].map(([Icon, label, text], index) => {
        const IconComponent = Icon as typeof Layers3;
        return (
          <motion.div key={label as string} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.18 + index * 0.14 }} className="relative z-10 flex items-center gap-4 rounded-2xl bg-blue-50/75 p-4 md:flex-col md:bg-transparent md:text-center">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-blue-100 bg-white text-accent shadow-[0_10px_28px_rgba(37,99,235,.12)]"><IconComponent className="size-5" /></span>
            <div><p className="font-semibold text-primary">{label as string}</p><p className="mt-1 text-xs text-muted-foreground">{text as string}</p></div>
          </motion.div>
        );
      })}
    </div>
  );
}

export function About() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section id="about" className="relative overflow-hidden px-5 py-20 md:px-8 md:py-28">
      <div aria-hidden="true" className="absolute top-20 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-blue-100/60 blur-3xl" />
      <div className="relative mx-auto max-w-[1240px]">
        <BlurFade>
          <div className="mb-12 grid gap-7 lg:grid-cols-[0.65fr_1.35fr] lg:items-end">
            <div>
              <span className="section-kicker">Sobre · abordagem</span>
              <p className="mt-5 max-w-xs font-mono text-xs leading-6 text-muted-foreground">São Paulo · Frontend Engineering · Produto digital</p>
            </div>
            <h2 className="font-display text-4xl leading-[0.98] font-semibold tracking-[-0.065em] text-primary md:text-7xl">Como trabalho no front-end.</h2>
          </div>
        </BlurFade>

        <div className="grid gap-4 lg:grid-cols-12">
          <BlurFade className="lg:col-span-5 lg:row-span-2">
            <SpotlightCard tilt className="group h-full min-h-[570px] rounded-[2.6rem] bg-[#06143c] shadow-[0_30px_90px_rgba(6,20,60,.18)]">
              <img src={`${import.meta.env.BASE_URL}assets/alexandre-workspace.png`} alt="Alexandre trabalhando em seu notebook" className="absolute inset-0 size-full object-cover object-[90%_center] opacity-85 transition duration-700 group-hover:scale-[1.04]" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020817] via-[#06143c]/12 to-transparent" />
              <div className="absolute inset-0">
                {orbitLabels.map((label, index) => (
                  <motion.span key={label} animate={{ y: [0, index % 2 === 0 ? -10 : 10, 0] }} transition={{ duration: 3.5 + index * 0.4, repeat: Infinity, ease: "easeInOut" }} className={cn("absolute grid size-12 place-items-center rounded-2xl border border-white/15 bg-white/10 font-mono text-[10px] font-bold text-white shadow-xl backdrop-blur", index === 0 && "top-[18%] left-[10%]", index === 1 && "top-[28%] right-[9%]", index === 2 && "top-[54%] left-[8%]", index === 3 && "top-[62%] right-[11%]")}>{label}</motion.span>
                ))}
              </div>
              <div className="absolute right-7 bottom-7 left-7 translate-z-10">
                <p className="font-mono text-[10px] tracking-[0.18em] text-blue-300 uppercase">Alexandre Diogo Nascimento</p>
                <p className="mt-4 max-w-md text-2xl leading-tight font-medium tracking-[-0.035em] text-white">Atuo com interfaces, integrações, acessibilidade e evolução de Design Systems.</p>
                <div className="mt-6 flex items-center gap-3 text-xs text-blue-100/55"><GraduationCap className="size-4 text-blue-300" /> ADS · SPTech</div>
              </div>
            </SpotlightCard>
          </BlurFade>

          <BlurFade delay={0.06} className="lg:col-span-7">
            <SpotlightCard className="min-h-[300px] rounded-[2.6rem] border border-blue-200/70 bg-gradient-to-br from-[#edf4ff] to-white p-7 md:p-10">
              <span className="relative z-10 font-mono text-[10px] tracking-[0.18em] text-accent uppercase">Princípio de trabalho</span>
              <p className="relative z-10 mt-6 max-w-3xl text-3xl leading-[1.12] font-medium tracking-[-0.045em] text-primary md:text-5xl">Busco manter requisitos, comportamento da interface e implementação técnica alinhados.</p>
              <div className="relative z-10 mt-8 flex flex-wrap gap-2">{["React", "TypeScript", "Acessibilidade", "Design Systems"].map((item) => <span key={item} className="rounded-full border border-blue-100 bg-white/70 px-3 py-2 text-[10px] font-semibold text-blue-900">{item}</span>)}</div>
            </SpotlightCard>
          </BlurFade>

          <div className="grid gap-4 sm:grid-cols-3 lg:col-span-7" onMouseLeave={() => setHovered(null)}>
            {focusCards.map((card, index) => (
              <BlurFade key={card.title} delay={0.1 + index * 0.04}>
                <SpotlightCard className={cn("h-full min-h-64 rounded-[2rem] border border-border bg-white p-6 shadow-[0_15px_45px_rgba(6,20,60,.07)] transition duration-500", hovered !== null && hovered !== index && "scale-[0.97] opacity-40 blur-[2px]")}>
                  <button type="button" onFocus={() => setHovered(index)} onMouseEnter={() => setHovered(index)} className="absolute inset-0 z-20" aria-label={card.title} />
                  <div className="relative z-10 flex items-start justify-between"><span className="grid size-11 place-items-center rounded-2xl bg-blue-50 text-accent"><card.icon className="size-5" /></span><span className="font-mono text-[10px] text-muted-foreground">{card.index}</span></div>
                  <h3 className="relative z-10 mt-7 text-lg font-semibold tracking-[-0.025em] text-primary">{card.title}</h3>
                  <p className="relative z-10 mt-3 text-sm leading-6 text-muted-foreground">{card.text}</p>
                </SpotlightCard>
              </BlurFade>
            ))}
          </div>

          <BlurFade delay={0.16} className="lg:col-span-12"><ProcessBeam /></BlurFade>
        </div>

        <a href="#experience" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-accent">Conhecer minha trajetória profissional <ArrowUpRight className="size-4" /></a>
      </div>
    </section>
  );
}
