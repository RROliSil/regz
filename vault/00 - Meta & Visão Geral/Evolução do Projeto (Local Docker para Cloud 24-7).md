---
aliases: [Evolução, Migração Cloud, Histórico, Antes e Depois]
tags: [regz, meta, cloud, historico]
---

# 🔄 Evolução do Projeto (Docker Local → Cloud 24/7)

Este registro documenta a transição arquitetural que tornou o **Regz** independente de computador local ligado.

---

## 📊 Comparativo Arquitetural

| Aspecto | Fase 1 — Ambiente Local / On-Premise | Fase 2 — Cloud-Native 24/7 (Atual) |
| :--- | :--- | :--- |
| **Hospedagem do App** | Docker local / VM (`192.168.2.72:8280`) + Portainer | **Render** via Blueprint `render.yaml` (`Dockerfile` unificado) |
| **Exposição HTTPS** | Container `regz-ngrok-tunnel` (`dining-product-giggle.ngrok-free.dev`) | **HTTPS nativo automático** em `https://regz-app.onrender.com/Regz` |
| **Banco Central** | Container `regz-postgres` local (porta `5434`) sem SSL | **Supabase PostgreSQL 17** (`sa-east-1` São Paulo) via Session Pooler IPv4 + **SSL/TLS** |
| **Bancos Multi-Tenant** | Foco em `localhost`/IP local sem `db_uri` para SQL | Suporte a **Connection String (`db_uri`) + SSL automático** nos 4 motores |
| **Bootstrap de Banco** | Falhava em banco zerado (`perfis_acesso` antes de `empresas`) | `initDbWithRetry()` reordenado + `UNNEST` em lote único para CBO |
| **Segurança de Repo** | `NGROK_AUTHTOKEN` hardcoded no `docker-compose.yml` | Token removido do código, rotacionado no Ngrok e segredos só via ENV |

---

## ✅ Marcos Concluídos na Migração (25/11/2026)
1. Normalização inteligente de `sslmode` (`normalizePgConnectionString`) evitando `SELF_SIGNED_CERT_IN_CHAIN` no driver `pg` v8.11+.
2. Handler `pool.on('error')` + `keepAlive: true` evitando crashes por fechamento de conexões ociosas em poolers cloud.
3. Invalidação imediata do cache `tenantPoolsMap` (`closeTenantPool`) ao editar ou excluir empresas.
4. Painel `/configuracoes` migrado de textos estáticos (`porta 5434`) para telemetria real de `/api/health` e `/api/db-status`.
5. Criação de vitrine bilíngue (`README.md` + `README.en.md`) e Segundo Cérebro Obsidian (`vault/`).

---

## 🔗 Conexões no Grafo
- [[00 - Meta & Visão Geral/Visão do Produto (Regz)|🏢 Visão do Produto]]
- [[04 - Infraestrutura, Cloud 24-7 & Deploy/Arquitetura Cloud 24-7 (Render + Supabase)|☁️ Arquitetura Cloud 24/7]]
- [[02 - Arquitetura & Engenharia/Multi-Tenancy & Roteamento Multi-Banco|🌐 Multi-Tenancy & Multi-Banco]]
- [[05 - Roadmap & DevLog/Roadmap & Próximas Features|🚀 Roadmap Atual]]
