import { motion } from "framer-motion";
import { BlurFade } from "@/components/magic/BlurFade";
import { NumberTicker } from "@/components/magic/NumberTicker";
import { Sparkle } from "@/components/magic/Sparkle";
import { stats } from "@/data/stats";
import { Plus } from "lucide-react";

export function Stats() {
  return (
    <section aria-label="Números em destaque" className="relative px-5 pt-14 pb-10 md:px-8 md:pt-20">
      <Sparkle className="absolute right-[7%] bottom-7 size-4" delay={1.4} />
      <div className="mx-auto max-w-[1120px]">
        <BlurFade>
          <div className="grid gap-5 rounded-[2rem] border border-border/70 bg-white px-5 py-7 shadow-[0_20px_50px_rgba(10,27,74,0.06)] sm:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:px-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ delay: index * 0.08, duration: 0.48 }}
                className="relative flex items-center gap-4 px-2 lg:justify-center lg:px-6"
              >
                {index > 0 && (
                  <Plus className="absolute -left-2 hidden size-4 text-muted-foreground/40 lg:block" />
                )}
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                  <stat.icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-display text-2xl font-bold tracking-[-0.04em] text-primary md:text-3xl">
                    <NumberTicker value={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground md:text-sm">
                    {stat.label}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
