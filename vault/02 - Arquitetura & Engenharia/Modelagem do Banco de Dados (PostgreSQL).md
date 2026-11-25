---
aliases: [Banco de Dados, PostgreSQL, Schema, Tabelas, Modelagem]
tags: [regz, arquitetura, banco, postgresql]
---

# 🗄️ Modelagem do Banco de Dados (PostgreSQL)

**Motor em Produção:** PostgreSQL 17 (Supabase `sa-east-1`, SSL/TLS via Session Pooler IPv4)  
**Bootstrap Automático:** `initDb()` + `initDbWithRetry(5)` em `backend/src/index.ts`

---

## 📐 Ordem Segura de Criação (Dependências de FK)
Para funcionar em bancos online **100% zerados**, o `initDb()` cria as **10 tabelas** nesta ordem exata de dependências:

| # | Tabela | Colunas & Recursos Principais |
| :-: | :--- | :--- |
| 1 | `empresas` | `id`, `razao_social`, `nome_fantasia`, `cnpj` (UNIQUE), cores, `status`, `db_tipo`, `db_uri`, `db_host`, `db_port`, `db_user`, `db_pass`, `db_name` |
| 2 | `perfis_acesso` | `id`, `nome`, `descricao`, `is_admin`, `permissoes JSONB`, `empresa_id` → `empresas(id)` |
| 3 | `usuarios` | `id`, `nome`, `email` (UNIQUE), `senha_hash`, `perfil_id` → `perfis_acesso(id)`, `empresa_id` → `empresas(id)`, `senha_atualizada_em`, `chave_licenca`, `is_super_admin`, `ativo` |
| 4 | `chaves_licenca` | `id`, `chave` (UNIQUE), `usuario_id` → `usuarios(id)`, `empresa_id` → `empresas(id)`, `tipo_licenca`, `data_ativacao`, `data_expiracao`, `status` |
| 5 | `cargos` | `id`, `nome` (UNIQUE), `codigo_cbo`, `sinonimos TEXT` — populada em 1 batch `UNNEST` |
| 6 | `colaboradores` | `id`, `nome`, `cpf` (UNIQUE), `cargo`, endereço completo, `latitude NUMERIC(10,8)`, `longitude NUMERIC(11,8)`, `foto_url TEXT`, `ativo`, `empresa_id` → `empresas(id)` |
| 7 | `campos_customizados` | `id`, `nome`, `tipo`, `opcoes`, `obrigatorio`, `min_caracteres`, `max_caracteres`, `ativo`, `empresa_id` → `empresas(id)` |
| 8 | `colaboradores_valores_customizados` | `id`, `colaborador_id` → `colaboradores(id)`, `campo_id` → `campos_customizados(id)`, `valor TEXT`, `UNIQUE (colaborador_id, campo_id)` |
| 9 | `relatorios_salvos` | `id`, `empresa_id`, `usuario_id`, `nome`, `modo`, `colunas JSONB`, `filtros JSONB`, `is_padrao` |
| 10 | `logs_auditoria` | `id`, `empresa_id`, `usuario_id`, `acao`, `entidade`, `registro_id`, `detalhes JSONB`, `ip`, `criado_em` + índices em `empresa_id` e `criado_em DESC` |

---

## ⚡ Otimizações para Bancos Online
- **Carga CBO em Lote Único (`upsertCboDataset`):** usa `INSERT INTO cargos ... SELECT * FROM UNNEST($1::text[], $2::text[], $3::text[]) ON CONFLICT (nome) DO UPDATE`, evitando dezenas de round-trips em rede cloud durante o boot.
- **Retry com Backoff (`initDbWithRetry`):** suporta cold wake-up de bancos serverless (Neon/Supabase) sem derrubar o container.
- **Proteção contra Idle Disconnect:** `pool.on('error')`, `keepAlive: true`, `idleTimeoutMillis: 20000`, `connectionTimeoutMillis: 10000`.

---

## 🔗 Conexões no Grafo
- [[02 - Arquitetura & Engenharia/Multi-Tenancy & Roteamento Multi-Banco|🌐 Multi-Tenancy & Multi-Banco]]
- [[04 - Infraestrutura, Cloud 24-7 & Deploy/Arquitetura Cloud 24-7 (Render + Supabase)|☁️ Arquitetura Cloud 24/7]]
- [[01 - Módulos do Portal (Produto)/Validação CBO & eSocial|🏷️ Validação CBO & eSocial]]
- [[01 - Módulos do Portal (Produto)/Campos Dinâmicos Customizados (EAV)|🧩 Campos Dinâmicos (EAV)]]
- [[01 - Módulos do Portal (Produto)/Logs de Auditoria & Rastreabilidade|📜 Logs de Auditoria]]
