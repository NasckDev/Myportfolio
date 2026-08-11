import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, BriefcaseBusiness, Building2, RadioTower, Rocket, Trophy, X, Zap } from "lucide-react";
import { BlurFade } from "@/components/magic/BlurFade";
import { experiences, type ExperienceItem } from "@/data/experience";

const milestones = [
  { value: "2019", label: "Início da trajetória em tecnologia", icon: Rocket },
  { value: "6 anos", label: "Experiência em produtos digitais", icon: Trophy },
  { value: "Big Four", label: "Carreira construída na EY", icon: Building2 },
  { value: "Vivo", label: "Atuação em projeto dentro da EY", icon: RadioTower },
  { value: "Startup", label: "Produto e dados na MindMiners", icon: Zap },
];

function ExperienceModal({ experience, onClose }: { experience: ExperienceItem; onClose: () => void }) {
  useEffect(() => {
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = oldOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] grid place-items-center bg-[#020817]/75 p-4 backdrop-blur-lg"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <motion.div
        role="dialog" aria-modal="true" aria-labelledby="experience-modal-title"
        initial={{ opacity: 0, y: 35, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 25, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        className="max-h-[88svh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-white/10 bg-[#07163d] p-6 text-white shadow-2xl md:p-9"
      >
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="font-mono text-[10px] tracking-[0.15em] text-blue-300 uppercase">{experience.period}</p>
            <h3 id="experience-modal-title" className="mt-3 text-3xl font-semibold tracking-[-0.045em] md:text-4xl">{experience.role}</h3>
            <p className="mt-2 text-blue-100/60">{experience.company}</p>
          </div>
          <button autoFocus onClick={onClose} aria-label="Fechar detalhes" className="flex size-11 shrink-0 items-center justify-center rounded-full border border-white/10 text-blue-100/60 transition hover:border-blue-300 hover:text-white"><X className="size-5" /></button>
        </div>

        <p className="mt-8 text-lg leading-8 text-blue-50/80">{experience.description}</p>
        <div className="mt-8 space-y-3">
          {experience.bullets.map((bullet, index) => (
            <motion.div key={bullet} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 + index * 0.06 }} className="flex gap-3 rounded-2xl bg-white/[0.055] p-4 text-sm leading-6 text-blue-100/70">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-blue-400" /> {bullet}
            </motion.div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-2">
          {experience.technologies.map((technology) => <span key={technology} className="rounded-full border border-blue-300/15 bg-blue-500/10 px-3 py-2 text-xs text-blue-200">{technology}</span>)}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function Experience() {
  const [selected, setSelected] = useState<ExperienceItem | null>(null);

  return (
    <section id="experience" className="section-auto px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto grid max-w-[1240px] gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
        <BlurFade>
          <div className="lg:sticky lg:top-32 lg:self-start">
            <span className="section-kicker">Trajetória</span>
            <h2 className="font-display text-4xl leading-[1.04] font-semibold tracking-[-0.06em] text-primary md:text-6xl">Trajetória profissional.</h2>
            <p className="mt-6 max-w-md leading-7 text-muted-foreground">Selecione uma etapa para conhecer responsabilidades, tecnologias e o contexto da minha evolução profissional.</p>
            <div className="mt-8 grid grid-cols-2 gap-3">
              {milestones.map((milestone, index) => (
                <motion.div key={milestone.value} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.07 }} className={`min-h-36 rounded-2xl border border-blue-100 bg-blue-50/55 p-4 ${index === milestones.length - 1 ? "col-span-2" : ""}`}>
                  <milestone.icon className="size-5 text-blue-600" />
                  <strong className="mt-6 block text-lg tracking-[-0.03em] text-primary">{milestone.value}</strong>
                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">{milestone.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </BlurFade>

        <div className="relative">
          <motion.div initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: 1.4 }} className="absolute top-4 bottom-4 left-[15px] w-px origin-top bg-gradient-to-b from-blue-500 via-blue-300 to-blue-100" />
          <div className="space-y-4">
            {experiences.map((experience, index) => (
              <BlurFade key={experience.id} delay={index * 0.07}>
                <motion.button onClick={() => setSelected(experience)} whileHover={{ x: 6 }} className="group relative w-full pl-12 text-left">
                  <span className="absolute top-8 left-2 size-4 rounded-full border-[3px] border-white bg-accent shadow-[0_0_0_5px_rgba(37,99,235,.12)]" />
                  <article className="rounded-[1.75rem] border border-border bg-white p-6 shadow-[0_15px_45px_rgba(6,20,60,.06)] transition group-hover:border-blue-200 group-hover:shadow-[0_25px_65px_rgba(6,20,60,.1)] md:p-8">
                    <div className="flex items-start justify-between gap-5">
                      <div>
                        <p className="font-mono text-[10px] tracking-[0.14em] text-accent uppercase">{experience.period}</p>
                        <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-primary md:text-2xl">{experience.role}</h3>
                        <p className="mt-1.5 text-sm font-medium text-muted-foreground">{experience.company}</p>
                      </div>
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-primary transition group-hover:rotate-45 group-hover:bg-primary group-hover:text-white"><ArrowUpRight className="size-4" /></span>
                    </div>
                    <p className="mt-5 text-sm leading-7 text-muted-foreground">{experience.description}</p>
                    <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-accent"><BriefcaseBusiness className="size-4" /> Ver detalhes</div>
                  </article>
                </motion.button>
              </BlurFade>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>{selected && <ExperienceModal experience={selected} onClose={() => setSelected(null)} />}</AnimatePresence>
    </section>
  );
}
