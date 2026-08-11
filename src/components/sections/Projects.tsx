import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ArrowLeft, ArrowRight, ArrowUpRight, MousePointer2 } from "lucide-react";
import { BlurFade } from "@/components/magic/BlurFade";
import { projects, type Project } from "@/data/projects";
import { cn } from "@/lib/utils";

function ProjectSlide({ project, index, active }: { project: Project; index: number; active: boolean }) {
  const [hovered, setHovered] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const cursorX = useSpring(mouseX, { stiffness: 420, damping: 32 });
  const cursorY = useSpring(mouseY, { stiffness: 420, damping: 32 });

  return (
    <motion.a
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        mouseX.set(event.clientX - rect.left);
        mouseY.set(event.clientY - rect.top);
      }}
      animate={{ scale: active ? 1 : 0.94, opacity: active ? 1 : 0.42 }}
      transition={{ type: "spring", stiffness: 210, damping: 28 }}
      className="group relative block overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.055] p-3 shadow-[0_28px_90px_rgba(0,0,0,.22)]"
    >
      <div className="relative aspect-[16/9] overflow-hidden rounded-[1.9rem] bg-blue-950">
        <motion.img src={project.image} alt={`Visual do projeto ${project.title}`} className="size-full object-cover" loading="lazy" animate={{ scale: hovered ? 1.055 : 1 }} transition={{ duration: 0.75, ease: [0.21, 0.47, 0.32, 0.98] }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020817]/90 via-[#020817]/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 md:p-9">
          <div className="flex items-end justify-between gap-5">
            <div>
              <motion.p layout className="font-mono text-[10px] tracking-[0.18em] text-cyan-300 uppercase">{project.subtitle}</motion.p>
              <h3 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.055em] text-white md:text-5xl">{project.title}</h3>
            </div>
            <span className="hidden font-mono text-5xl font-semibold tracking-[-0.08em] text-white/15 md:block">0{index + 1}</span>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {project.tags.map((tag) => <span key={tag} className="rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-[10px] text-blue-100/75 backdrop-blur">{tag}</span>)}
          </div>
        </div>
      </div>

      <motion.span style={{ x: cursorX, y: cursorY }} animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.6 }} className="pointer-events-none absolute top-0 left-0 z-20 -mt-12 -ml-12 hidden size-24 items-center justify-center rounded-full bg-white text-center text-[10px] font-bold text-primary shadow-2xl md:flex">
        Abrir case <ArrowUpRight className="ml-1 size-3" />
      </motion.span>
    </motion.a>
  );
}

export function Projects() {
  const autoplay = useRef(Autoplay({ delay: 5200, stopOnInteraction: true, stopOnMouseEnter: true }));
  const [viewportRef, emblaApi] = useEmblaCarousel({ loop: true, align: "center", skipSnaps: false }, [autoplay.current]);
  const [selected, setSelected] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const updateSelected = () => setSelected(emblaApi.selectedScrollSnap());
    const updateProgress = () => setProgress(Math.max(0, Math.min(1, emblaApi.scrollProgress())));
    updateSelected();
    updateProgress();
    emblaApi.on("select", updateSelected);
    emblaApi.on("reInit", updateSelected);
    emblaApi.on("scroll", updateProgress);
    return () => {
      emblaApi.off("select", updateSelected);
      emblaApi.off("reInit", updateSelected);
      emblaApi.off("scroll", updateProgress);
    };
  }, [emblaApi]);

  return (
    <section id="projects" className="relative overflow-hidden bg-[#020817] px-5 py-20 text-white md:px-8 md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_65%_0%,rgba(37,99,235,.28),transparent_38%),radial-gradient(circle_at_15%_80%,rgba(34,211,238,.09),transparent_28%)]" />
      <div className="relative mx-auto max-w-[1240px]">
        <BlurFade>
          <div className="mb-11 grid gap-7 lg:grid-cols-[1fr_0.6fr] lg:items-end">
            <div>
              <span className="dark-kicker">Projetos selecionados · 01—06</span>
              <h2 className="mt-5 max-w-4xl font-display text-4xl leading-[0.98] font-semibold tracking-[-0.065em] md:text-7xl">Uma seleção do que já coloquei em prática.</h2>
            </div>
            <div className="lg:justify-self-end">
              <p className="max-w-sm text-sm leading-7 text-blue-100/60">Navegue por interfaces, aplicações e estudos que mostram meu repertório em frontend, produto e experiência do usuário.</p>
              <div className="mt-6 flex items-center gap-3">
                <button type="button" onClick={() => emblaApi?.scrollPrev()} aria-label="Projeto anterior" className="carousel-button"><ArrowLeft className="size-4" /></button>
                <button type="button" onClick={() => emblaApi?.scrollNext()} aria-label="Próximo projeto" className="carousel-button"><ArrowRight className="size-4" /></button>
                <span className="ml-2 inline-flex items-center gap-2 font-mono text-[9px] tracking-[0.14em] text-blue-200/45 uppercase"><MousePointer2 className="size-3" /> Arraste</span>
              </div>
            </div>
          </div>
        </BlurFade>

        <div ref={viewportRef} className="overflow-hidden" aria-roledescription="carousel">
          <div className="-ml-5 flex touch-pan-y">
            {projects.map((project, index) => (
              <div key={project.id} className="min-w-0 flex-[0_0_90%] pl-5 md:flex-[0_0_78%]" role="group" aria-roledescription="slide" aria-label={`${index + 1} de ${projects.length}`}>
                <ProjectSlide project={project} index={index} active={selected === index} />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex items-center gap-5">
          <div className="h-px flex-1 overflow-hidden bg-white/10"><motion.div className="h-full origin-left bg-gradient-to-r from-blue-500 to-cyan-300" animate={{ scaleX: (selected + 1) / projects.length }} transition={{ type: "spring", stiffness: 180, damping: 26 }} /></div>
          <div className="flex gap-2">
            {projects.map((project, index) => <button key={project.id} type="button" onClick={() => emblaApi?.scrollTo(index)} aria-label={`Ir para ${project.title}`} className={cn("h-1.5 rounded-full transition-all", selected === index ? "w-8 bg-cyan-300" : "w-1.5 bg-white/20 hover:bg-white/50")} />)}
          </div>
          <span className="w-14 text-right font-mono text-[10px] text-blue-200/45">{String(selected + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}</span>
          <span className="sr-only">Progresso {Math.round(progress * 100)}%</span>
        </div>
      </div>
    </section>
  );
}
