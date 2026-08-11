# Alenasck Portfolio

Portfólio profissional de Alexandre Diogo Nascimento, desenvolvido com React, TypeScript, Vite, Tailwind CSS, Motion, GSAP e componentes acessíveis.

## Executar localmente

Requisitos: Node.js 22 e npm.

```bash
npm install
npm run dev
```

Validação completa:

```bash
npm run verify
```

O comando executa os testes da Vercel Function e gera o build de produção em `dist/`.

## Deploy na Vercel

O projeto usa `vercel.json` com:

- instalação reproduzível por `npm ci`;
- testes automatizados antes do build;
- build Vite em `dist/`;
- Vercel Function em `api/visitors.ts`.

Conecte o repositório à Vercel e mantenha `main` como Production Branch. Cada push em `main` gera um deploy de produção; outras branches geram previews.

### Web Analytics e contador de visitantes

1. Ative **Web Analytics** e **Speed Insights** no dashboard do projeto.
2. Crie um Access Token da Vercel com acesso de leitura ao projeto.
3. Em **Settings → Environment Variables**, configure somente para **Production**:

| Variável | Valor |
| --- | --- |
| `VITE_ENABLE_PROD_ANALYTICS` | `true` |
| `ANALYTICS_API_TOKEN` | Access Token da Vercel |
| `ANALYTICS_PROJECT_ID` | ID iniciado por `prj_` |
| `ANALYTICS_TEAM_ID` | ID iniciado por `team_`, somente se o projeto pertencer a um time |

4. Em **Settings → Environment Variables**, mantenha habilitada a exposição das System Environment Variables para que `VERCEL_ENV=production` esteja disponível na Function.
5. Faça um novo deploy após configurar as variáveis.

O token nunca é enviado ao navegador. O footer consulta apenas `/api/visitors`, que retorna os totais agregados da Web Analytics. Se Analytics estiver desabilitado, sem credenciais, fora de produção ou temporariamente indisponível, o footer exibe o estado seguro `Portfólio online`.

## GitHub Pages

O workflow `.github/workflows/static.yml` executa testes, gera o build com base `/Myportfolio/` e publica `dist/`. O contador fica automaticamente desabilitado no GitHub Pages porque as variáveis de produção da Vercel não existem nesse ambiente.

## Versão anterior

A implementação anterior em HTML, CSS e JavaScript foi preservada em `v1/`.
