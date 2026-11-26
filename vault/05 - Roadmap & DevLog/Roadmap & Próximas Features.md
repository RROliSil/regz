---
aliases: [Roadmap, Próximas Features, Planejamento]
tags: [regz, meta, roadmap, produto, seguranca]
---

# 🚀 Roadmap & Próximas Features — Regz App

Evoluções priorizadas para fortalecer segurança em produção, estabilidade 24/7 e impacto de portfólio.

---

## 🔥 Prioridade Alta (Segurança & Estabilidade 24/7)
- [x] **Middleware `requireSuperAdmin` & Cobertura 100% da API:** todas as rotas globais (`/api/empresas*`, `/api/licencas*`, `/api/empresas/test-db`) e operacionais protegidas com JWT, RBAC, validação de licença no servidor e isolamento estrito por `empresa_id`.
- [x] **Criptografia AES-256-GCM para Credenciais Multi-Banco:** `empresas.db_pass` e `empresas.db_uri` criptografadas em repouso e mascaradas nas respostas da API.
- [x] **Endpoint `PUT /api/auth/alterar-senha` & `ADMIN_INITIAL_PASSWORD`:** rota autenticada pronta no backend com validação `bcrypt.compare` e bootstrap sem logs de senha.
- [ ] **Modal "Alterar Minha Senha" na Interface Web (`Sidebar.tsx`):** expor atalho visual no card do usuário para acionar `PUT /api/auth/alterar-senha`.
- [ ] **Keep-Alive & Monitoramento Externo:** configurar UptimeRobot / Cron-job.org chamando `https://regz-app.onrender.com/api/health` a cada 10–14 min para reduzir hibernação da Render Free e manter conexão ativa com o Supabase Free.

---

## 🎯 Prioridade Média (Engenharia & Portfólio)
- [ ] **Pipeline CI no GitHub Actions (`.github/workflows/ci.yml`):** build automático de `backend/` e `frontend/` a cada push/PR + badge *Build Passing* no `README.md` e `README.en.md`.
- [ ] **Galeria de Screenshots em `docs/screenshots/`:** incorporar capturas reais do Login, Colaboradores + QR Code, PDF Vetorial, Acessibilidade e Super Admin nos dois READMEs.
- [ ] **Conta Demo Read-Only para Recrutadores:** criar empresa de demonstração com colaboradores fictícios e usuário `Consulta (Somente Leitura)` divulgado no README.
- [ ] **Modularização do Backend (`backend/src/`):** dividir o monolito `index.ts` em `routes/`, `services/`, `middlewares/` e `db/` mantendo 100% da compatibilidade atual.

---

## 🔗 Conexões no Grafo
- [[05 - Roadmap & DevLog/Backlog de Ideias|💡 Backlog de Ideias]]
- [[02 - Arquitetura & Engenharia/Segurança, Autenticação JWT & Rate Limiting|🔐 Segurança & JWT]]
- [[04 - Infraestrutura, Cloud 24-7 & Deploy/Arquitetura Cloud 24-7 (Render + Supabase)|☁️ Arquitetura Cloud 24/7]]
- [[00 - Meta & Visão Geral/Evolução do Projeto (Local Docker para Cloud 24-7)|🔄 Evolução do Projeto]]
