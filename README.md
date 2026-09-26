# Alexandre Diogo Nascimento — Portfólio

Portfólio profissional (v3) de Alexandre Diogo Nascimento, Software Engineer · Frontend & Fullstack. Página única com topo 3D, habilidades pesquisáveis, projetos com gaveta de detalhes, trajetória em 3D, código aberto, sobre mim e contato. Tem tema claro/escuro, paleta de comandos (⌘K / Ctrl K), modais, toasts e respeita `prefers-reduced-motion`.

Stack: React 19, TypeScript, Vite, Tailwind CSS 4 e three.js (carregado sob demanda). Contador de visitas e avaliações em Vercel Functions com Redis (Upstash).

## Executar localmente

Requisitos: Node.js 22 e npm.

```bash
npm install
npm run dev
```

Validação completa (testes das Functions + typecheck + build de produção):

```bash
npm run verify
```

No `npm run dev` não existem Vercel Functions, então o rodapé usa o comportamento local (contagem e voto guardados só no navegador).

## Estrutura

- `src/data/portfolio.ts`: todo o conteúdo (projetos, experiências, habilidades, repositórios, links). Para trocar um projeto, edite este arquivo; para adicionar a tela de um case, preencha o campo `image` com um caminho em `public/`.
- `src/components/sections`: uma seção por arquivo (Hero, Skills, Cases, Experience, OpenSource, About, Contact).
- `src/components/overlays`: gaveta de case, paleta de comandos, modais, toast.
- `src/three`: cenas 3D (topo, trajetória, envelope do contato).
- `api/visits.ts` e `api/votes.ts`: contador de visitas e avaliações.
- `public/curriculo-alexandre-diogo-nascimento.pdf` (completo) e `public/curriculo-alexandre-diogo-nascimento-ats.pdf` (ATS).

## Deploy na Vercel

O `vercel.json` instala com `npm ci`, roda `npm run verify` e publica `dist/`. Conecte o repositório e mantenha `main` como Production Branch.

### Contador de visitas e avaliações (curtir / não curtir)

As contagens ficam em um Redis da Upstash, compartilhadas entre todos os visitantes:

- **Visitas**: cada visitante conta uma vez a cada 12 horas.
- **Avaliações**: cada visitante tem um voto, que pode trocar ou remover; o voto é lembrado pelo servidor.
- O visitante é identificado por um hash anônimo de IP + user-agent (nada é guardado em texto puro), com limite de 20 votos a cada 10 minutos.

Para ativar:

1. No projeto da Vercel, abra **Storage → Create Database → Upstash (Redis)** (plano gratuito) e conecte ao projeto. A integração cria `KV_REST_API_URL` e `KV_REST_API_TOKEN` automaticamente.
2. Faça um novo deploy.

Também funciona com as variáveis `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN` de um banco criado direto na Upstash. Sem Redis configurado (ou no GitHub Pages), o rodapé continua funcionando no modo local.

### Web Analytics e Speed Insights (opcional)

Ative no dashboard da Vercel e configure `VITE_ENABLE_PROD_ANALYTICS=true` no ambiente Production.

### Feedback por e-mail (opcional)

Com `VITE_WEB3FORMS_KEY` configurada, as sugestões do modal "O que posso melhorar?" chegam por e-mail via Web3Forms. Sem a chave, ficam salvas apenas no navegador do visitante.

## GitHub Pages

O workflow `.github/workflows/static.yml` executa os testes, gera o build com base `/Myportfolio/` e publica `dist/`. Como o GitHub Pages não executa Functions, o rodapé usa o modo local.

## Versões anteriores

- v1 (HTML, CSS e JavaScript): preservada em `v1/`.
- v2 (React com Motion/GSAP): disponível no histórico do Git.
