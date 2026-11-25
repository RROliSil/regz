---
aliases: [Template Módulo, Novo Módulo, Template]
tags: [regz, arquitetura, template]
---

# 📝 Template — Novo Módulo ou Funcionalidade

Use este modelo sempre que planejar e implementar um novo módulo, rota ou tabela no **Regz App** para manter o Segundo Cérebro sincronizado.

---

## 🎯 Objetivo & Regras de Negócio
- **Módulo / Rota Frontend:** `/nova-rota` (`frontend/src/pages/...`)
- **Permissão RBAC necessária:** `leitura` / `escrita` no módulo `<nome>`
- **Escopo Multi-Tenant:** filtrado por `empresa_id`? (Sim/Não) — roteado via `getPoolForEmpresa()`? (Sim/Não)

---

## 🗄️ Alterações de Banco de Dados
- Tabelas/colunas adicionadas em `initDb()` (e `initTenantDb()` se operacional):
  ```sql
  -- Exemplo idempotente obrigatório (IF NOT EXISTS)
  ```

---

## 🔌 Endpoints REST Criados/Alterados
| Método | Rota | Middleware | Auditoria (`registrarAuditoria`) |
| :---: | :--- | :--- | :---: |
| `GET` | `/api/...` | JWT / `empresa_id` | Não |
| `POST` | `/api/...` | `checkPermission('...')` | Sim |

---

## ✅ Checklist de Entrega
- [ ] `npm run build` aprovado em `backend/` e `frontend/` (0 erros)
- [ ] Compatível com os 3 temas (Padrão, Claro, Escuro) e padrão de scrollbars (8px/4px)
- [ ] Nota atualizada no `vault/` + linkada no `🏠 Dashboard.md`
- [ ] `ESTRUTURA_E_REGRAS_DO_SISTEMA.txt` e `DEVLOG.md` atualizados
- [ ] Zero segredos/senhas no diff antes do `git push origin main`

---

## 🔗 Conexões no Grafo
- [[🏠 Dashboard|🏠 Dashboard Principal]]
- [[02 - Arquitetura & Engenharia/API REST & Catálogo de Endpoints|🔌 API REST]]
- [[02 - Arquitetura & Engenharia/Modelagem do Banco de Dados (PostgreSQL)|🗄️ Modelagem PostgreSQL]]
