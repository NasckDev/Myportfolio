import type { Ref } from "react";
import type { Job } from "@/data/portfolio";
import { Reveal } from "@/components/motion/Reveal";
import { ChevronDownIcon } from "@/components/ui/icons";
import { CaseLink, JobItems } from "./shared";

interface JobCardProps {
  job: Job;
  i: number;
  open: boolean;
  onToggle: (i: number) => void;
  onOpenCase: (i: number) => void;
  /** Ponto da linha do tempo (o pai acende/apaga conforme o scroll). */
  dotRef: Ref<HTMLSpanElement>;
}

/** Card sanfona de uma experiência na linha do tempo (celular/tablet). */
export function JobCard({ job, i, open: o, onToggle, onOpenCase, dotRef }: JobCardProps) {
  const panelId = `job-panel-${i}`;
  return (
    <Reveal kind="slide" delay={i * 120} className="relative">
      <span
        ref={dotRef}
        className="absolute -left-8 top-[26px] box-border size-4 rounded-full border-2 border-line2 bg-bg"
        style={{ transform: "scale(.6)", transition: "background .3s,border-color .3s,box-shadow .4s,transform .5s cubic-bezier(.34,1.56,.64,1)" }}
      />
      <div
        data-spot="1"
        className="spot-bg overflow-hidden rounded-[22px] border hover:border-brand! hover:[transform:translateX(6px)]"
        style={{ ["--spot-r" as string]: "380px", borderColor: o ? "#1783C1" : "var(--line)", boxShadow: o ? "var(--shadow)" : "none", transition: "border-color .3s,box-shadow .4s,transform .4s cubic-bezier(.2,.8,.2,1)" }}
      >
        <button
          type="button"
          onClick={() => onToggle(i)}
          aria-expanded={o}
          aria-controls={panelId}
          className="grid w-full cursor-pointer gap-x-4 gap-y-1 border-0 bg-transparent py-[22px] pl-6 pr-[22px] text-left leading-[1.6] text-inherit"
          style={{ gridTemplateColumns: "minmax(0,1fr) auto" }}
        >
          <span className="mono text-[12.5px] text-muted">{job.period}</span>
          <span
            aria-hidden="true"
            className="row-span-3 grid size-[38px] place-items-center self-center rounded-full bg-chip text-chip-text"
            style={{ transition: "transform .35s cubic-bezier(.2,.8,.2,1)", transform: o ? "rotate(180deg)" : "none" }}
          >
            <ChevronDownIcon size={18} sw={2.2} />
          </span>
          <span className="stretch-120 text-[24px] font-bold leading-[1.2] text-head">{job.company}</span>
          <span className="text-[16px] font-medium">{job.role}</span>
        </button>
        <div id={panelId} className="grid" style={{ gridTemplateRows: o ? "1fr" : "0fr", transition: "grid-template-rows .45s cubic-bezier(.2,.8,.2,1)" }}>
          <div className="min-h-0 overflow-hidden" inert={!o}>
            <div className="flex flex-col gap-3.5 px-6 pb-6">
              <p className="text-[16px] text-muted" style={{ opacity: o ? 1 : 0, transform: o ? "none" : "translateY(8px)", transition: "opacity .4s ease .1s,transform .5s cubic-bezier(.2,.8,.2,1) .1s" }}>
                {job.context}
              </p>
              <JobItems items={job.items} on={o} hiddenTransform="translateX(-14px)" delay={160} step={90} fadeDur=".4s" moveDur=".55s" className="flex" />
              <div className="flex flex-wrap gap-1.5">
                {job.tech.map((t, k) => (
                  <span
                    key={t}
                    className="mono rounded-full bg-chip px-2.5 py-[5px] text-[12.5px] font-medium text-chip-text leading-normal"
                    style={{ opacity: o ? 1 : 0, transform: o ? "none" : "scale(.6)", transition: `opacity .35s ease ${o ? 380 + k * 60 : 0}ms,transform .5s cubic-bezier(.34,1.56,.64,1) ${o ? 380 + k * 60 : 0}ms` }}
                  >
                    {t}
                  </span>
                ))}
              </div>
              <CaseLink job={job} onOpen={onOpenCase} />
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
