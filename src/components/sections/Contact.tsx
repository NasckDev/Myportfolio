import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Check, Copy, Download, Github, Linkedin, Mail, Terminal } from "lucide-react";
import { BlurFade } from "@/components/magic/BlurFade";

const atsPath = `${import.meta.env.BASE_URL}assets/Alexandre_Diogo_Nascimento_Frontend_React_Angular.pdf`;
const channels = [
  { label: "LinkedIn", detail: "Carreira e networking", href: "https://linkedin.com/in/alexandre-diogo-nascimento", icon: Linkedin },
  { label: "GitHub", detail: "NasckDev · código e experimentos", href: "https://github.com/NasckDev", icon: Github },
  { label: "E-mail", detail: "aleh.dnascimento@gmail.com", href: "mailto:aleh.dnascimento@gmail.com", icon: Mail },
];

export function Contact() {
  const [copied, setCopied] = useState(false);
  const copyEmail = async () => {
    await navigator.clipboard.writeText("aleh.dnascimento@gmail.com");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section id="contact" className="section-auto px-5 pt-10 pb-20 md:px-8 md:pt-16 md:pb-28">
      <div className="relative mx-auto max-w-[1240px] overflow-hidden rounded-[3rem] bg-[#06143c] p-6 text-white shadow-[0_35px_100px_rgba(6,20,60,.22)] md:p-10 lg:p-14">
        <div className="pointer-events-none absolute -top-20 left-1/2 size-[30rem] rounded-full bg-blue-600/25 blur-3xl" />
        <div className="relative grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <BlurFade>
            <div>
              <span className="dark-kicker">Contato profissional</span>
              <h2 className="mt-5 max-w-3xl font-display text-4xl leading-[1.02] font-semibold tracking-[-0.06em] md:text-6xl">Quer conversar sobre uma oportunidade?</h2>
              <p className="mt-6 max-w-xl leading-7 text-blue-100/65">Estou em São Paulo e aberto a conversas sobre posições frontend, desafios de produto e times que valorizam qualidade, acessibilidade e colaboração.</p>

              <div className="mt-9 flex flex-wrap gap-3">
                <a href="mailto:aleh.dnascimento@gmail.com" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-primary transition hover:-translate-y-1 hover:shadow-xl"><Mail className="size-4" /> Enviar e-mail</a>
                <button onClick={copyEmail} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-blue-100/75 transition hover:border-blue-300 hover:text-white">
                  {copied ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />} {copied ? "Copiado" : "Copiar endereço"}
                </button>
              </div>

              <div className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-black/20 font-mono text-xs">
                <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3 text-blue-100/40"><span className="size-2 rounded-full bg-red-400" /><span className="size-2 rounded-full bg-amber-400" /><span className="size-2 rounded-full bg-emerald-400" /><Terminal className="ml-2 size-3" /> profile.json</div>
                <div className="p-5 leading-7 text-blue-100/60">&#123;<br /><span className="pl-5 text-blue-300">&quot;role&quot;:</span> <span className="text-emerald-300">&quot;Frontend Software Engineer&quot;</span>,<br /><span className="pl-5 text-blue-300">&quot;location&quot;:</span> <span className="text-amber-200">&quot;São Paulo, BR&quot;</span><br />&#125;</div>
              </div>
            </div>
          </BlurFade>

          <BlurFade delay={0.1}>
            <div className="space-y-3">
              {channels.map((channel, index) => (
                <motion.a key={channel.label} href={channel.href} target={channel.href.startsWith("http") ? "_blank" : undefined} rel={channel.href.startsWith("http") ? "noopener noreferrer" : undefined} whileHover={{ x: 7 }} className="group flex items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.055] p-5 backdrop-blur-sm transition hover:border-blue-400/40 hover:bg-white/[0.08]">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300"><channel.icon className="size-5" /></span>
                  <span className="min-w-0 flex-1"><strong className="block font-semibold">{channel.label}</strong><span className="mt-1 block truncate text-xs text-blue-100/45">{channel.detail}</span></span>
                  <ArrowUpRight className="size-4 text-blue-100/35 transition group-hover:rotate-45 group-hover:text-blue-300" />
                  <span className="sr-only">canal {index + 1}</span>
                </motion.a>
              ))}
              <motion.a href={atsPath} download whileHover={{ x: 7 }} className="group flex items-center gap-4 rounded-3xl border border-blue-400/25 bg-blue-500/15 p-5 transition hover:bg-blue-500/25">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-white text-primary"><Download className="size-5" /></span>
                <span className="flex-1"><strong className="block font-semibold">Currículo ATS</strong><span className="mt-1 block text-xs text-blue-100/50">PDF completo e atualizado</span></span>
                <ArrowUpRight className="size-4 text-blue-300" />
              </motion.a>
            </div>
          </BlurFade>
        </div>

        <AnimatePresence>{copied && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="status" className="fixed right-5 bottom-5 z-[90] rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-primary shadow-2xl">E-mail copiado para a área de transferência.</motion.div>}</AnimatePresence>
      </div>
    </section>
  );
}
