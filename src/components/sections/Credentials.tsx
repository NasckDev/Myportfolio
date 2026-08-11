import { motion } from "framer-motion";
import { ArrowUpRight, Award, BadgeCheck, GraduationCap, Linkedin, Quote } from "lucide-react";
import { SpotlightCard } from "@/components/effects/SpotlightCard";
import { BlurFade } from "@/components/magic/BlurFade";

const education = [
  {
    period: "2020 — 2022",
    institution: "São Paulo Tech School · SPTech",
    course: "Análise e Desenvolvimento de Sistemas",
  },
  {
    period: "2018 — 2019",
    institution: "Etec Jaraguá",
    course: "Técnico em Informática",
  },
];

const certifications = [
  {
    year: "2025",
    issuer: "EY",
    title: "Artificial Intelligence · AI Engineering · Bronze Learning",
  },
  {
    year: "2025",
    issuer: "Lund University",
    title: "IA, negócios e o futuro do trabalho",
  },
  {
    year: "2021",
    issuer: "EY",
    title: "SAP · Foundation · Learning",
  },
];

const recommendations = [
  {
    name: "Janderson Franco",
    role: "Desenvolvedor Front-end",
    initials: "JF",
    quote: "Tive o prazer de trabalhar com o Alexandre e tenho mais ainda em recomendá-lo. Durante o período em que trabalhamos juntos, pude acompanhar de perto sua evolução profissional em desenvolvimento front-end e microsserviços, expandindo seus conhecimentos através de muitos desafios.",
  },
  {
    name: "Taiza Marques",
    role: "Software Engineer Front-End Pleno",
    initials: "TM",
    quote: "Conheci Alexandre durante o período de trainee na EY e tive a oportunidade de acompanhar seu trabalho de perto, tanto no estágio quanto na faculdade. O que mais chama atenção é a mentalidade orientada à solução: se há um problema, ele resolve.",
  },
  {
    name: "Leonardo Vidote Anunciato",
    role: "SAP HANA Consultant · Arbit",
    initials: "LV",
    quote: "Aprendizado rápido, esforço e trabalho em equipe são alguns dos pontos fortes do Alexandre. É um profissional que se esforça para resolver problemas, pesquisa, pede ajuda e usa os recursos necessários para adquirir conhecimento.",
  },
];

export function Credentials() {
  return (
    <section id="credentials" className="section-auto relative overflow-hidden bg-[#f7f9fd] px-5 py-20 md:px-8 md:py-28">
      <div aria-hidden="true" className="absolute top-1/2 -right-48 size-[34rem] -translate-y-1/2 rounded-full bg-blue-200/30 blur-3xl" />
      <div className="relative mx-auto max-w-[1240px]">
        <BlurFade>
          <div className="grid gap-7 lg:grid-cols-[1fr_0.7fr] lg:items-end">
            <div>
              <span className="section-kicker">Credenciais</span>
              <h2 className="mt-5 max-w-4xl font-display text-4xl leading-[1] font-semibold tracking-[-0.065em] text-primary md:text-7xl">Formação e certificações.</h2>
            </div>
            <p className="max-w-md text-sm leading-7 text-muted-foreground lg:justify-self-end">Formação acadêmica e estudos que complementam minha experiência em engenharia frontend, produto e tecnologia.</p>
          </div>
        </BlurFade>

        <div className="mt-12 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            {education.map((item, index) => (
              <BlurFade key={item.institution} delay={index * 0.08}>
                <SpotlightCard tilt className="rounded-[2rem] border border-blue-100 bg-white p-6 shadow-[0_18px_55px_rgba(6,20,60,.07)] md:p-8">
                  <div className="relative z-10 flex items-start gap-5">
                    <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-600"><GraduationCap className="size-5" /></span>
                    <div>
                      <p className="font-mono text-[10px] tracking-[0.15em] text-blue-600 uppercase">{item.period}</p>
                      <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-primary">{item.course}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{item.institution}</p>
                    </div>
                  </div>
                </SpotlightCard>
              </BlurFade>
            ))}
          </div>

          <BlurFade delay={0.12}>
            <div className="h-full rounded-[2.4rem] bg-[#06143c] p-6 text-white shadow-[0_30px_80px_rgba(6,20,60,.16)] md:p-8">
              <div className="flex items-center justify-between gap-5 border-b border-white/10 pb-6">
                <div><p className="font-mono text-[10px] tracking-[0.16em] text-blue-300 uppercase">Aprendizado contínuo</p><h3 className="mt-2 text-2xl font-semibold tracking-[-0.035em]">Certificações recentes</h3></div>
                <Award className="size-7 text-cyan-300" />
              </div>
              <div className="mt-4 divide-y divide-white/10">
                {certifications.map((certificate, index) => (
                  <motion.article key={certificate.title} initial={{ opacity: 0, x: 18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 + index * 0.08 }} className="group flex gap-4 py-5">
                    <span className="mt-0.5 text-sm font-semibold text-cyan-300">{certificate.year}</span>
                    <div className="flex-1"><p className="font-semibold leading-6 text-white">{certificate.title}</p><p className="mt-1 text-xs text-blue-100/50">{certificate.issuer}</p></div>
                    <BadgeCheck className="size-5 shrink-0 text-blue-300/60 transition group-hover:text-cyan-300" />
                  </motion.article>
                ))}
              </div>
              <a href="https://linkedin.com/in/alexandre-diogo-nascimento" target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 transition hover:text-white">Conferir perfil profissional <ArrowUpRight className="size-4" /></a>
            </div>
          </BlurFade>
        </div>

        <div className="mt-24">
          <BlurFade>
            <div className="flex flex-col gap-5 border-t border-blue-100 pt-12 md:flex-row md:items-end md:justify-between">
              <div><span className="section-kicker">Recomendações</span><h3 className="mt-5 max-w-3xl font-display text-3xl leading-[1.05] font-semibold tracking-[-0.055em] text-primary md:text-5xl">Opiniões de quem trabalhou comigo.</h3></div>
              <p className="max-w-sm text-sm leading-7 text-muted-foreground">Trechos de recomendações profissionais recebidas no LinkedIn.</p>
            </div>
          </BlurFade>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {recommendations.map((recommendation, index) => (
              <BlurFade key={recommendation.name} delay={index * 0.08}>
                <SpotlightCard className="flex min-h-[360px] flex-col rounded-[2rem] border border-blue-100 bg-white p-6 shadow-[0_18px_55px_rgba(6,20,60,.06)] md:p-7">
                  <Quote className="relative z-10 size-7 text-blue-200" />
                  <blockquote className="relative z-10 mt-6 text-sm leading-7 text-primary/75">“{recommendation.quote}”</blockquote>
                  <div className="relative z-10 mt-auto flex items-center gap-3 pt-8">
                    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-blue-600 text-xs font-semibold text-white">{recommendation.initials}</span>
                    <div className="min-w-0 flex-1"><strong className="block truncate text-sm text-primary">{recommendation.name}</strong><span className="mt-1 block truncate text-xs text-muted-foreground">{recommendation.role}</span></div>
                    <Linkedin className="size-4 text-blue-600" />
                  </div>
                </SpotlightCard>
              </BlurFade>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
