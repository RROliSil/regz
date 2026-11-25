---
aliases: [Roadmap, Próximas Features, Planejamento]
tags: [regz, meta, roadmap, produto, seguranca]
---

# 🚀 Roadmap & Próximas Features — Regz App

Evoluções priorizadas para fortalecer segurança em produção, estabilidade 24/7 e impacto de portfólio.

---

## 🔥 Prioridade Alta (Segurança & Estabilidade 24/7)
- [ ] **Middleware `requireSuperAdmin` no Backend:** proteger estritamente todas as rotas de gestão global (`/api/empresas`, `/api/empresas/:id`, `/api/empresas/test-db`, `/api/licencas`, `/api/auditoria`) exigindo token JWT válido com `is_super_admin === true`.
- [ ] **Criptografia AES-256-GCM para Credenciais Multi-Banco:** criptografar `empresas.db_pass` e `empresas.db_uri` em repouso usando variável `DB_ENCRYPTION_KEY`.
- [ ] **Modal "Alterar Minha Senha" na Interface Web:** endpoint autenticado `PUT /api/auth/alterar-senha` (validando senha atual via `bcrypt.compare`) acessível pelo Super Admin e usuários comuns + suporte a `ADMIN_INITIAL_PASSWORD` no bootstrap.
- [ ] **Keep-Alive & Monitoramento Externo:** configurar UptimeRobot / Cron-job.org chamando `https://regz-app.onrender.com/api/db-status` a cada 10–14 min para reduzir hibernação da Render Free e impedir pausa de 7 dias no Supabase Free.

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
