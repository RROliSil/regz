---
aliases: [CBO, eSocial, Cargos, Ocupações]
tags: [regz, produto, arquitetura, cbo]
---

# 🏷️ Validação CBO & eSocial

Sistema de padronização de cargos e ocupações baseado na **Classificação Brasileira de Ocupações (CBO — MTE/Brasil)** com suporte a sinônimos de mercado voltado para conformidade **eSocial**.

---

## 🔍 Como Funciona (Frontend + Backend)
1. **Dataset Oficial (`CBO_DATASET` em `backend/src/index.ts`):**
   - Catálogo estruturado com `codigo` (ex.: `2124-05`, `3171-20`), `titulo` oficial e `sinonimos` (ex.: *"Dev React, Front-end, Dev Next.js"*, *"Tech Lead, Dev Fullstack"*, *"DBA, Engenheiro de Dados"*, *"Carreteiro"*, *"Empilhadeirista"*).
   - Sincronizado na tabela `cargos` no boot do servidor e na inicialização de bancos dedicados (`initTenantDb`) em **1 única query `UNNEST`** otimizada para baixa latência em nuvem (`upsertCboDataset`).
2. **Busca Inteligente (`GET /api/cbo/search` e `Colaboradores.tsx`):**
   - O dropdown de cargos localiza ocupações por título, código numérico ou qualquer sinônimo cadastrado, destacando a tag do sinônimo encontrado.
   - Controle de foco via `useRef` + `handleClickOutside` permitindo selecionar/arrastar texto normalmente.
3. **Normalização & Bloqueio Estrito:**
   - Tanto no Frontend quanto nos endpoints `POST /api/colaboradores` e `PUT /api/colaboradores/:id`, se um sinônimo for informado, o sistema converte automaticamente para o **título canônico oficial CBO**.
   - Se o cargo não constar na tabela `cargos`, o envio é bloqueado com alerta visual e `HTTP 400`.
4. **Resolução Automática nos Relatórios:**
   - `GET /api/colaboradores` executa `LEFT JOIN cargos cg ON LOWER(cg.nome) = LOWER(c.cargo)` retornando `cbo_codigo` diretamente para a coluna **CBO** do construtor de relatórios, PDF e Excel.

---

## 🔗 Conexões no Grafo
- [[01 - Módulos do Portal (Produto)/Portal de Colaboradores (CRUD & Geolocation)|🧑‍💼 Portal de Colaboradores]]
- [[01 - Módulos do Portal (Produto)/Central de Relatórios, PDF Vetorial & Excel|📄 Central de Relatórios]]
- [[02 - Arquitetura & Engenharia/Modelagem do Banco de Dados (PostgreSQL)|🗄️ Modelagem PostgreSQL]]
- [[00 - Meta & Visão Geral/Regras de Negócio Gerais|📋 Regras de Negócio]]
