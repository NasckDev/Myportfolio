import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, BookOpen, Github, GitFork, LoaderCircle, Star, Users } from "lucide-react";
import { BlurFade } from "@/components/magic/BlurFade";

interface GitHubUser { avatar_url: string; login: string; html_url: string; public_repos: number; followers: number; bio: string | null; }
interface GitHubRepo { id: number; name: string; html_url: string; description: string | null; language: string | null; stargazers_count: number; forks_count: number; updated_at: string; fork: boolean; }

const headers = { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };

export function GitHubLab() {
  const [data, setData] = useState<{ user: GitHubUser; repos: GitHubRepo[] } | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      fetch("https://api.github.com/users/NasckDev", { headers, signal: controller.signal }),
      fetch("https://api.github.com/users/NasckDev/repos?sort=updated&per_page=12", { headers, signal: controller.signal }),
    ])
      .then(async ([userResponse, reposResponse]) => {
        if (!userResponse.ok || !reposResponse.ok) throw new Error("GitHub API indisponível");
        const [user, repos] = await Promise.all([userResponse.json() as Promise<GitHubUser>, reposResponse.json() as Promise<GitHubRepo[]>]);
        setData({ user, repos: repos.filter((repo) => !repo.fork).slice(0, 6) });
      })
      .catch((reason: unknown) => {
        if (!(reason instanceof DOMException && reason.name === "AbortError")) setError(true);
      });
    return () => controller.abort();
  }, []);

  return (
    <section id="lab" className="section-auto bg-blue-50/55 px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-[1240px]">
        <BlurFade>
          <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <span className="section-kicker">GitHub Lab</span>
              <h2 className="max-w-3xl font-display text-4xl leading-[1.03] font-semibold tracking-[-0.06em] text-primary md:text-6xl">Atividade recente no GitHub.</h2>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-2 text-[10px] font-semibold text-emerald-700"><span className="size-2 animate-pulse rounded-full bg-emerald-500" /> DADOS PÚBLICOS · LIVE</span>
          </div>
        </BlurFade>

        {!data && !error && <div className="grid min-h-80 place-items-center rounded-[2.5rem] border border-blue-100 bg-white"><LoaderCircle className="size-8 animate-spin text-accent" /><span className="sr-only">Carregando GitHub</span></div>}
        {error && (
          <div className="rounded-[2.5rem] border border-blue-100 bg-white p-10 text-center">
            <Github className="mx-auto size-9 text-accent" />
            <h3 className="mt-5 text-xl font-semibold text-primary">A API atingiu o limite temporário.</h3>
            <p className="mt-2 text-sm text-muted-foreground">O perfil continua disponível diretamente no GitHub.</p>
            <a href="https://github.com/NasckDev" target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white">Abrir GitHub <ArrowUpRight className="size-4" /></a>
          </div>
        )}

        {data && (
          <div className="grid gap-4 lg:grid-cols-[0.72fr_1.28fr]">
            <motion.a whileHover={{ y: -5 }} href={data.user.html_url} target="_blank" rel="noopener noreferrer" className="relative overflow-hidden rounded-[2.5rem] bg-[#06143c] p-7 text-white shadow-[0_25px_70px_rgba(6,20,60,.16)] md:p-9">
              <div className="absolute -top-20 -right-20 size-64 rounded-full bg-blue-500/25 blur-3xl" />
              <img src={data.user.avatar_url} alt="Avatar de Alexandre no GitHub" className="relative size-20 rounded-3xl border border-white/15" />
              <p className="relative mt-6 font-mono text-xs text-blue-300">github.com/{data.user.login}</p>
              <p className="relative mt-4 text-lg leading-7 text-blue-50/80">{data.user.bio ?? "Frontend Software Engineer · React · Angular · TypeScript"}</p>
              <div className="relative mt-8 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/[0.06] p-4"><BookOpen className="size-4 text-blue-300" /><strong className="mt-4 block text-2xl">{data.user.public_repos}</strong><span className="text-xs text-blue-100/45">repositórios</span></div>
                <div className="rounded-2xl bg-white/[0.06] p-4"><Users className="size-4 text-blue-300" /><strong className="mt-4 block text-2xl">{data.user.followers}</strong><span className="text-xs text-blue-100/45">seguidores</span></div>
              </div>
              <span className="relative mt-8 inline-flex items-center gap-2 text-sm font-semibold text-blue-300">Explorar perfil <ArrowUpRight className="size-4" /></span>
            </motion.a>

            <div className="grid gap-4 sm:grid-cols-2">
              {data.repos.map((repo, index) => (
                <motion.a key={repo.id} href={repo.html_url} target="_blank" rel="noopener noreferrer" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }} whileHover={{ y: -5 }} className="group flex min-h-52 flex-col rounded-[2rem] border border-blue-100 bg-white p-6 shadow-[0_12px_35px_rgba(6,20,60,.05)]">
                  <div className="flex items-start justify-between gap-4"><span className="flex size-10 items-center justify-center rounded-2xl bg-blue-50 text-accent"><Github className="size-4" /></span><ArrowUpRight className="size-4 text-muted-foreground transition group-hover:rotate-45 group-hover:text-accent" /></div>
                  <h3 className="mt-5 font-semibold text-primary">{repo.name}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{repo.description ?? "Repositório público no GitHub."}</p>
                  <div className="mt-auto flex items-center gap-4 pt-5 text-[10px] text-muted-foreground"><span>{repo.language ?? "Code"}</span><span className="inline-flex items-center gap-1"><Star className="size-3" />{repo.stargazers_count}</span><span className="inline-flex items-center gap-1"><GitFork className="size-3" />{repo.forks_count}</span></div>
                </motion.a>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
