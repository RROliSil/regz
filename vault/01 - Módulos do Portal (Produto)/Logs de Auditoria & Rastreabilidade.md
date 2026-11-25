---
aliases: [Auditoria, Logs, Rastreabilidade, logs_auditoria]
tags: [regz, produto, seguranca, auditoria]
---

# 📜 Logs de Auditoria & Rastreabilidade

**Backend:** helper `registrarAuditoria()` + `GET /api/auditoria` • **Frontend:** sub-aba **Logs de Auditoria** em `Administracao.tsx`

Trilha imutável de rastreabilidade das operações sensíveis executadas pelos usuários da plataforma.

---

## 🔍 Estrutura & Eventos Monitorados
Gravados na tabela `logs_auditoria` com índices dedicados em `empresa_id` e `criado_em DESC`:
- **Ações registradas:** `LOGIN`, `CRIAR`, `EDITAR`, `INATIVAR`, `REATIVAR`, `EXCLUIR`, `CRIAR_CAMPO`, `INATIVAR_CAMPO`, `REATIVAR_CAMPO`, `EXCLUIR_CAMPO`, `CRIAR_RELATORIO_SALVO`, `EXCLUIR_RELATORIO_SALVO`, `CRIAR_PERFIL`, `EDITAR_PERFIL`, entre outras.
- **Entidades:** `auth`, `colaboradores`, `campos_customizados`, `relatorios_salvos`, `perfis_acesso`, `usuarios`, `licencas`.
- **Contexto capturado:** `empresa_id`, `usuario_id`, `usuario_nome`, `usuario_email`, `registro_id`, `detalhes JSONB` e `ip` real do cliente (respeitando `app.set('trust proxy', 1)` atrás do proxy HTTPS da nuvem).

---

## 🎛️ Recursos no Painel Web
- **Cards de Métricas:** Total de Eventos, Logins, Colaboradores e Segurança.
- **Filtros Combinados:** busca textual (inclusive dentro de `detalhes::text`), filtro por ação, por entidade e por intervalo de datas (`data_inicio` / `data_fim`).
- **Inspeção JSON & Exportação:** modal para visualizar o payload `JSONB` completo do evento e botão **Exportar CSV** em UTF-8.

---

## 🔗 Conexões no Grafo
- [[01 - Módulos do Portal (Produto)/Administração, RBAC & Licenciamento|🛡️ Administração & RBAC]]
- [[02 - Arquitetura & Engenharia/Modelagem do Banco de Dados (PostgreSQL)|🗄️ Modelagem PostgreSQL]]
- [[02 - Arquitetura & Engenharia/Segurança, Autenticação JWT & Rate Limiting|🔐 Segurança & JWT]]
