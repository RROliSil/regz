---
aliases: [Cloud 24-7, Render, Supabase, Dockerfile, Infraestrutura]
tags: [regz, cloud, arquitetura, deploy, infra]
---

# ☁️ Arquitetura Cloud 24/7 (Render + Supabase)

Infraestrutura 100% online em produção, sem dependência de computador local ligado ou túneis Ngrok.

---

## 🌐 Stack de Produção Ativa
- **Aplicação Web + API (Render):**
  - Serviço `regz-app` provisionado via Blueprint [`render.yaml`](../../render.yaml) (plano gratuito, deploy automático a cada `git push` na branch `main`).
  - **URL Pública HTTPS:** `https://regz-app.onrender.com/Regz`
  - **Health Check:** `/api/health` (`status: "ok"`, `dbInitialized: true`).
  - Compatível também com **Railway** via [`railway.json`](../../railway.json) (opção sem hibernação para operação 24/7 contínua).
- **Banco de Dados Central Online (Supabase):**
  - Projeto `regz-prod`, região **South America (São Paulo — `sa-east-1`)**, PostgreSQL `17.12`.
  - **Detalhe Crítico de Rede (IPv4):** utiliza a URI do **Session Pooler** (`aws-0-sa-east-1.pooler.supabase.com:5432`, usuário `postgres.<ref>`) porque containers da Render operam em IPv4 e a conexão direta do Supabase é IPv6-only.
  - **SSL/TLS:** `DB_SSL=true` + `normalizePgConnectionString()` garantindo conexão criptografada sem erros `SELF_SIGNED_CERT_IN_CHAIN`.

---

## 🐳 Build Docker Multi-Stage Unificado (`Dockerfile`)
1. **Stage 1 (`frontend-builder`):** `node:20-alpine` → `npm ci` + `npm run build` (Vite + TypeScript).
2. **Stage 2 (`backend-builder`):** `node:20-alpine` → `npm ci` + `npm run build` (`tsc`).
3. **Stage 3 (`runner`):** `node:20-alpine` → `npm ci --omit=dev`, copia `./dist` (backend) e `./public` (frontend buildado), expõe porta `4000` e inicia `node dist/index.js` em `0.0.0.0`.

> [!NOTE] Atenção aos Planos Gratuitos
> - **Render Free:** hiberna após 15 minutos sem tráfego (~30s de cold start no 1º acesso).
> - **Supabase Free:** pausa projetos após 7 dias sem consultas SQL.
> - **Solução sugerida:** monitor HTTP externo gratuito (UptimeRobot / Cron-job.org) chamando `/api/db-status` periodicamente (ver [[05 - Roadmap & DevLog/Roadmap & Próximas Features|Roadmap]]).

---

## 🔗 Conexões no Grafo
- [[04 - Infraestrutura, Cloud 24-7 & Deploy/Checklist de Deploy, Variáveis & Manutenção|📦 Checklist de Deploy]]
- [[00 - Meta & Visão Geral/Evolução do Projeto (Local Docker para Cloud 24-7)|🔄 Evolução para Cloud 24/7]]
- [[02 - Arquitetura & Engenharia/Modelagem do Banco de Dados (PostgreSQL)|🗄️ Modelagem PostgreSQL]]
- [[02 - Arquitetura & Engenharia/Multi-Tenancy & Roteamento Multi-Banco|🌐 Multi-Tenancy & Multi-Banco]]
