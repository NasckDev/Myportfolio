import { ArrowUpRight, Download, Github, Linkedin, Mail, MapPin } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { VisitorCounter } from "@/components/layout/VisitorCounter";

const atsPath = `${import.meta.env.BASE_URL}assets/Alexandre_Diogo_Nascimento_Frontend_React_Angular.pdf`;

const facts = [
  { value: "6 anos", label: "desenvolvendo produtos web" },
  { value: "2019", label: "início da trajetória em tecnologia" },
  { value: "2022", label: "formação em ADS · SPTech" },
  { value: "2025", label: "entrada na MindMiners" },
];

const socials = [
  { label: "GitHub", detail: "NasckDev", href: "https://github.com/NasckDev", icon: Github },
  { label: "LinkedIn", detail: "Perfil profissional", href: "https://linkedin.com/in/alexandre-diogo-nascimento", icon: Linkedin },
  { label: "E-mail", detail: "Contato direto", href: "mailto:aleh.dnascimento@gmail.com", icon: Mail },
];

export function Footer() {
  return (
    <footer id="site-footer" className="relative overflow-hidden bg-[#020817] px-5 pt-20 pb-8 text-white md:px-8 md:pt-24">
      <div aria-hidden="true" className="absolute -top-56 left-1/2 size-[38rem] -translate-x-1/2 rounded-full bg-blue-600/20 blur-3xl" />
      <div className="relative mx-auto max-w-[1240px]">
        <div className="grid gap-10 border-b border-white/10 pb-12 lg:grid-cols-[1fr_0.85fr] lg:items-end">
          <div>
            <a href="#home" aria-label="Voltar ao início"><Logo className="[&>span]:text-white" /></a>
            <h2 className="mt-7 max-w-3xl font-display text-4xl leading-[1] font-semibold tracking-[-0.06em] md:text-6xl">Informações profissionais e formas de contato.</h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-blue-100/55">Alexandre Diogo Nascimento · Frontend Software Engineer com experiência em React, Angular, TypeScript e interfaces orientadas a dados.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <a href="mailto:aleh.dnascimento@gmail.com" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-primary transition hover:-translate-y-1"><Mail className="size-4" /> Falar comigo</a>
            <a href={atsPath} download className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-1 hover:border-blue-300"><Download className="size-4" /> Baixar currículo</a>
          </div>
        </div>

        <div className="grid border-b border-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {facts.map((fact) => (
            <div key={fact.value} className="border-white/10 py-7 sm:odd:border-r sm:px-6 sm:first:pl-0 lg:border-r lg:odd:border-r lg:last:border-r-0">
              <strong className="block text-2xl tracking-[-0.04em]">{fact.value}</strong>
              <span className="mt-2 block text-xs leading-5 text-blue-100/45">{fact.label}</span>
            </div>
          ))}
        </div>

        <div className="grid gap-10 py-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="font-mono text-[10px] tracking-[0.16em] text-blue-300 uppercase">Base atual</p>
            <p className="mt-4 flex items-center gap-2 text-sm text-blue-100/60"><MapPin className="size-4 text-cyan-300" /> São Paulo, Brasil · BRT</p>
            <p className="mt-3 text-sm text-blue-100/45">Português nativo · Inglês intermediário · Espanhol intermediário</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {socials.map((social) => (
              <a key={social.label} href={social.href} target={social.href.startsWith("http") ? "_blank" : undefined} rel={social.href.startsWith("http") ? "noopener noreferrer" : undefined} className="group rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:-translate-y-1 hover:border-blue-400/40 hover:bg-white/[0.06]">
                <div className="flex items-center justify-between"><social.icon className="size-4 text-blue-300" /><ArrowUpRight className="size-4 text-blue-100/30 transition group-hover:rotate-45 group-hover:text-cyan-300" /></div>
                <strong className="mt-5 block text-sm">{social.label}</strong>
                <span className="mt-1 block text-xs text-blue-100/40">{social.detail}</span>
              </a>
            ))}
          </div>
        </div>

        <div aria-hidden="true" className="overflow-hidden border-y border-white/10 py-5 text-center font-display text-[clamp(4rem,12vw,10rem)] leading-none font-bold tracking-[-0.09em] text-white/[0.045]">ALENASCK</div>

        <div className="flex flex-col gap-6 pt-7 sm:flex-row sm:items-end sm:justify-between">
          <VisitorCounter />
          <div className="flex flex-col gap-2 text-xs text-blue-100/35 sm:text-right">
            <p>© {new Date().getFullYear()} Alexandre Diogo Nascimento.</p>
            <p>Projetado e desenvolvido em React + TypeScript.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
