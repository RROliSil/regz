---
aliases: [Checklist Deploy, Variáveis de Ambiente, Manutenção, Configuracoes]
tags: [regz, cloud, deploy, manutencao]
---

# 📦 Checklist de Deploy, Variáveis & Manutenção

Guia operacional para manter o **Regz** saudável em produção, com builds limpos e zero exposição de segredos.

---

## 🔐 Variáveis de Ambiente em Produção (Render / Railway)
Configuradas **exclusivamente no painel da nuvem** (nunca commitadas no Git):

| Variável | Valor Esperado | Finalidade |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Modo otimizado de produção |
| `PORT` | `4000` | Porta HTTP interna do Express |
| `DB_SSL` | `true` | Ativa SSL/TLS automático no pool PostgreSQL |
| `DATABASE_URL` | `postgresql://postgres.<ref>:<senha>@aws-0-sa-east-1.pooler.supabase.com:5432/postgres` | String de conexão IPv4 Session Pooler (Supabase) ou Neon/Railway |
| `JWT_SECRET` | Chave aleatória forte (64+ caracteres) | Assinatura dos tokens JWT |
| `APP_URL` | `https://regz-app.onrender.com` | URL base canônica para Open Graph e links |

---

## ✅ Checklist Antes de Qualquer `git push origin main`
1. **Validar builds localmente (0 erros):**
   ```powershell
   npm run build --prefix d:\regz\backend
   npm run build --prefix d:\regz\frontend
   ```
2. **Revisar segredos no diff:** confirmar que nenhum `.env`, senha de banco, `DATABASE_URL` real ou token entrou no `git status` / `git diff`.
3. **Atualizar documentação viva:** sincronizar a nota correspondente neste `vault/`, `ESTRUTURA_E_REGRAS_DO_SISTEMA.txt` e `DEVLOG.md`.
4. **Commit & Push (Conventional Commits):**
   ```powershell
   git add <arquivos>
   git commit -m "feat(modulo): descricao objetiva"
   git push origin main
   ```
5. **Validar pós-deploy na Render:**
   - Conferir `https://regz-app.onrender.com/api/health` (`status: "ok"`, `dbInitialized: true`).
   - Conferir `https://regz-app.onrender.com/api/db-status` (`connected: true`, `mode: "cloud"`, `ssl: true`).
   - Abrir `/configuracoes` para validar os 3 cards de diagnóstico dinâmicos.

---

## 🔗 Conexões no Grafo
- [[04 - Infraestrutura, Cloud 24-7 & Deploy/Arquitetura Cloud 24-7 (Render + Supabase)|☁️ Arquitetura Cloud 24/7]]
- [[02 - Arquitetura & Engenharia/Segurança, Autenticação JWT & Rate Limiting|🔐 Segurança & JWT]]
- [[02 - Arquitetura & Engenharia/Template de Novo Módulo ou Rota|📝 Template de Novo Módulo]]
