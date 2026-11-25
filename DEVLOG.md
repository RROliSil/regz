# 🏢 Regz App — Diário de Desenvolvimento (DevLog)

Este diário registra os principais marcos de engenharia, decisões de arquitetura e evoluções de infraestrutura da plataforma **Regz**.

## [2026-08] Fundação Full-Stack, RBAC & Portal de Colaboradores
- Estruturação da aplicação unificada em **React 18 + Vite + TypeScript** (Frontend) e **Node.js + Express + PostgreSQL 15** (Backend).
- Implementação de autenticação **JWT + bcryptjs**, matriz de permissões **RBAC** (`perfis_acesso` com `JSONB`), validação de CPF, preenchimento automático **ViaCEP**, geocodificação via **OpenStreetMap Nominatim** e Crachá Digital com **QR Code 2D**.
- Criação do motor de **Campos Customizados Dinâmicos (EAV)** e trilha de **Logs de Auditoria**.

## [2026-09] Relatórios Vetoriais, Acessibilidade Visual & Multi-Banco
- Implementação do Construtor Visual Livre de Relatórios com geração de **PDF vetorial nativo (`jsPDF` + `jspdf-autotable`)**, modal integrado com alternância Retrato/Paisagem, exportação **Excel CSV UTF-8 BOM** e persistência de modelos (*Meus Relatórios*).
- Lançamento da **Central de Acessibilidade Visual (`Alt + A`)** com escala de fonte (100%–145%), realce de foco, simulador ao vivo e **Síntese de Voz (TTS `pt-BR`)**.
- Padronização arquitetural universal de scrollbars (8px verticais / 4px horizontais) nos 3 temas (Padrão, Claro e Escuro).
- Inclusão da validação estrita **CBO (MTE / eSocial)** com busca por sinônimos e exibição do código CBO nos relatórios.
- Expansão do Portal **Super Admin (`/superadmrgz`)** com suporte a conectividade Multi-Banco (**PostgreSQL, MySQL/MariaDB, MongoDB e Microsoft SQL Server**).

## [2026-11-25] Migração 100% Cloud 24/7, Apresentação Bilíngue & Segundo Cérebro Obsidian
- **Arquitetura Cloud 24/7**: refatoração do pool central para `DATABASE_URL` + SSL/TLS automático (`normalizePgConnectionString` + `pool.on('error')`), correção da ordem de criação das tabelas no `initDbWithRetry()` para bancos zerados, carga do catálogo CBO em lote único (`UNNEST`) e invalidação de cache no `tenantPoolsMap`.
- **Produção Live**: provisionamento do PostgreSQL central gerenciado no **Supabase (`sa-east-1` São Paulo)** via Session Pooler IPv4 e deploy contínuo na **Render** via Blueprint `render.yaml` (`https://regz-app.onrender.com/Regz`), eliminando a dependência de computador local e Ngrok.
- **Segurança**: remoção do `NGROK_AUTHTOKEN` hardcoded do `docker-compose.yml`, rotação do token no painel do Ngrok e atualização da senha do Super Admin em produção.
- **Vitrine & Documentação**: criação de `README.md` (PT-BR) e `README.en.md` (EN) com diagrama Mermaid, reformulação do perfil GitHub `RROliSil` com cards clicáveis e implantação do **Segundo Cérebro Obsidian (`vault/`)**.
- **Layout 100% Fluido & Responsivo**: remoção do limite rígido `max-width: 1200px` em `.page-content` e do padding duplicado em `App.tsx`, expansão total de tabelas em monitores Full HD/Ultrawide (sem cortes na coluna Ações), grids anti-overflow (`minmax(min(100%, ...))`) e Sidebar em modo Drawer Off-Canvas para tablets e celulares (`<= 960px`).
