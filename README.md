# Alexandre Diogo Nascimento — Portfólio

Portfólio profissional (v4) de Alexandre Diogo Nascimento, engenheiro de software. Casca de app com menu lateral (vira trilho em ≤1180 px e dock inferior em ≤900 px), rotas reais com transições de página, busca com Ctrl K / ⌘ K, painel "Aparência" (tema, cor de destaque, cantos e movimento, salvos no navegador), estudos de caso com galeria e lightbox, prévia em vídeo dos projetos no hover e uma página pré-renderizada por rota.

Stack: React 19, TypeScript (strict), Vite 6 e CSS com design tokens. Fontes Archivo (eixo de largura) e JetBrains Mono auto-hospedadas via @fontsource-variable. Contador de visitas em Vercel Functions com Redis (Upstash).

## Executar localmente

Requisitos: Node.js 22+ e npm.

```bash
npm install
npm run dev        # http://localhost:5180
npm run build      # tsc + vite build + pré-render
npm run preview    # http://localhost:5181 (serve o build)
```

Validação (é o buildCommand da Vercel, sem navegador):

```bash
npm run verify     # ESLint + Vitest + testes das Functions + build com pré-render
```

E2E com Playwright e axe (320 a 1920 px, temas claro e escuro), contra o `vite preview` do build:

```bash
npx playwright install chromium   # uma vez
npm run test:e2e
```

## Estrutura

- `src/data/`: fonte única de todo o texto. `projects.ts` (projetos), `newProjects.ts` (Coverlist e Garrafão, textos provisórios), `testCounts.ts` (contagens de testes, E2E e stories de cada app), `content.ts` (experiência, habilidades, design, repositórios), `snippets.ts` (trechos de código), `routes.ts` (rotas, títulos e descrições), `site.ts` (URL do site, e-mail, links).
- `src/router/`: roteador próprio sobre a History API (View Transitions, rolagem restaurada, foco no conteúdo, código dividido por rota).
- `src/shell/`: casca (menu, topo, dock, rodapé), busca, Aparência, lightbox, abertura e avisos.
- `src/pages/`: uma página por rota, carregada sob demanda.
- `src/styles/`: CSS por área (tokens, casca, componentes, capas e uma folha por página).
- `scripts/prerender.ts` + `scripts/seo.ts`: depois do build, geram `index.html` por rota (título, descrição, canonical, Open Graph/Twitter, JSON-LD e o conteúdo em texto), `404.html`, `robots.txt`, `sitemap.xml` e `llms.txt`.
- `scripts/projectMedia.ts` + `src/lib/media.ts`: leitor da convenção de mídia dos projetos (abaixo).
- `e2e/`: Playwright + @axe-core/playwright.
- `api/`: Vercel Functions (`visits.ts`, `votes.ts`; helpers em `_redis.ts`).
- `public/projetos/<slug>/`: demos dos apps, publicadas pelos próprios repositórios.

## Mídia dos projetos

`public/assets/projetos/<id>/`: `desktop-1..3.webp` (1440×900), `mobile.webp` (390×844), `preview.mp4` + `preview.webm` + `preview-poster.webp` (opcionais), `og.jpg` (1200×630, prévia de link do estudo de caso) e `meta.json`:

```json
{ "shots": [["desktop-1", "legenda"]], "mobile": "legenda", "video": false }
```

Só entram arquivos que existem. Sem `og.jpg`, o estudo de caso usa `/og-image.jpg`. A prévia em vídeo aparece apenas com mouse e sem pedido de menos movimento.

## Deploy na Vercel

O `vercel.json` instala com `npm ci`, roda `npm run verify` e publica `dist/`. O envio automático do Contato usa o FormSubmit, sem conta nem variável: o primeiro envio manda ao e-mail de `src/data/site.ts` um pedido de ativação, e as mensagens passam a chegar depois do clique em "Activate Form". Variáveis opcionais: `VITE_ENABLE_PROD_ANALYTICS=true` e as do Redis do contador (`KV_REST_API_URL`/`KV_REST_API_TOKEN`). Veja `.env.example`.

## Versões anteriores

- v1 (HTML, CSS e JavaScript): preservada em `v1/`.
- v2 e v3: disponíveis no histórico do Git.
