---
aliases: [Dashboard, Início, Home, Central, MOC]
tags: [regz, moc, second-brain, dashboard, meta]
---

# 🏢 Regz App — Segundo Cérebro (Central de Conhecimento)

> [!TIP] Bem-vindo ao Segundo Cérebro do **Regz App**!
> Este cofre (Vault) foi estruturado para o **Obsidian** com o objetivo de centralizar toda a arquitetura Full-Stack, regras de negócio, modelagem PostgreSQL, conectividade Multi-Banco, Design System, acessibilidade, infraestrutura Cloud 24/7 (Render + Supabase) e o roadmap de evolução contínua da plataforma.

---

## 🗺️ Mapa de Conteúdo (MOC)

### 📌 00. Meta & Visão Geral
- [[00 - Meta & Visão Geral/Visão do Produto (Regz)|🏢 Visão do Produto & Pilares]] — Proposta de valor SaaS, público-alvo, URL de produção e diferenciais técnicos.
- [[00 - Meta & Visão Geral/Regras de Negócio Gerais|📋 Regras de Negócio Gerais]] — Síntese das regras perpétuas de RBAC, CBO, Soft Delete, Multi-Tenancy, licenças e UI.
- [[00 - Meta & Visão Geral/Evolução do Projeto (Local Docker para Cloud 24-7)|🔄 Evolução: Docker Local → Cloud 24/7]] — A transição de Docker local + Ngrok para Render + Supabase PostgreSQL SSL + Multi-Banco Online.

### 👥 01. Módulos do Portal (Produto)
- [[01 - Módulos do Portal (Produto)/Dashboard Executivo (Home)|📊 Dashboard Executivo (Home)]] — KPIs em tempo real, ranking de cargos, distribuição Cidades vs Estados e atalho de acessibilidade.
- [[01 - Módulos do Portal (Produto)/Portal de Colaboradores (CRUD & Geolocation)|🧑‍💼 Portal de Colaboradores (CRUD & Geolocation)]] — Cadastro completo, CPF, ViaCEP, geocodificação GPS Nominatim, fotos Base64 (~25KB), Lightbox e tabela redimensionável.
- [[01 - Módulos do Portal (Produto)/Validação CBO & eSocial|🏷️ Validação CBO & eSocial]] — Catálogo oficial MTE/Brasil, busca por sinônimos de mercado, normalização canônica e carga em lote `UNNEST`.
- [[01 - Módulos do Portal (Produto)/Crachá Digital & QR Code 2D|🪪 Crachá Digital & QR Code 2D]] — Geração vetorial (`qrcode.react`), exportação PNG via Canvas e impressão direta.
- [[01 - Módulos do Portal (Produto)/Campos Dinâmicos Customizados (EAV)|🧩 Campos Dinâmicos Customizados (EAV)]] — Criação de atributos sem alterar schema (Numérico, Texto, Seleção, Sim/Não) e Soft Delete preservando histórico.
- [[01 - Módulos do Portal (Produto)/Central de Relatórios, PDF Vetorial & Excel|📄 Central de Relatórios, PDF Vetorial & Excel]] — Construtor livre por chips, 3 modos, Meus Relatórios (`JSONB`), `jsPDF` Retrato/Paisagem e CSV UTF-8 BOM.
- [[01 - Módulos do Portal (Produto)/Administração, RBAC & Licenciamento|🛡️ Administração, RBAC & Licenciamento]] — Matriz granular Leitura/Escrita/Sem Acesso, validade de senhas (30d) e licenças Enterprise/Trial.
- [[01 - Módulos do Portal (Produto)/Portal Super Admin Multi-Tenant|👑 Portal Super Admin Multi-Tenant]] — Rota `/superadmrgz`, gestão de empresas, chaves Master, criação de usuários e banco próprio por cliente.
- [[01 - Módulos do Portal (Produto)/Logs de Auditoria & Rastreabilidade|📜 Logs de Auditoria & Rastreabilidade]] — Trilha imutável de ações, filtros combinados, inspeção `JSONB` e exportação CSV.

### 🏗️ 02. Arquitetura & Engenharia
- [[02 - Arquitetura & Engenharia/Arquitetura Geral & Stack Tecnológica|🧱 Arquitetura Geral & Stack Tecnológica]] — Visão unificada React 18 + Vite + TypeScript + Express + Node 20 + PostgreSQL 17.
- [[02 - Arquitetura & Engenharia/API REST & Catálogo de Endpoints|🔌 API REST & Catálogo de Endpoints]] — Mapa completo das 50+ rotas REST, autenticação Bearer e header `x-empresa-id`.
- [[02 - Arquitetura & Engenharia/Modelagem do Banco de Dados (PostgreSQL)|🗄️ Modelagem do Banco de Dados (PostgreSQL)]] — As 10 tabelas relacionais, colunas `JSONB`, índices e ordem segura do `initDbWithRetry()`.
- [[02 - Arquitetura & Engenharia/Multi-Tenancy & Roteamento Multi-Banco|🌐 Multi-Tenancy & Roteamento Multi-Banco]] — `getPoolForEmpresa`, `tenantPoolsMap`, `initTenantDb` e testador 4 motores (PostgreSQL, MySQL, MongoDB, SQL Server) com SSL.
- [[02 - Arquitetura & Engenharia/Segurança, Autenticação JWT & Rate Limiting|🔐 Segurança, Autenticação JWT & Rate Limiting]] — `bcryptjs` cost 10, JWT 7d, `checkPermission`, proteção força bruta (HTTP 429) e hardening planejado.
- [[02 - Arquitetura & Engenharia/Armazenamento Local (LocalStorage) & PWA|💾 Armazenamento Local (LocalStorage) & PWA]] — Dicionário de chaves `regz_*`, Service Worker (`sw.js`), `manifest.json` e Open Graph dinâmico.
- [[02 - Arquitetura & Engenharia/Template de Novo Módulo ou Rota|📝 Template para Novos Módulos & Rotas]] — Modelo padrão para documentar futuras features mantendo o grafo conectado.

### 🎨 03. Design System, UX & Acessibilidade
- [[03 - Design System, UX & Acessibilidade/Temas Visuais & Padrão de Interface|🎨 Temas Visuais & Padrão de Interface]] — 3 temas (Deep Indigo Glassmorphism, Claro e Escuro), scrollbars universais (8px/4px), autofill e Snackbars.
- [[03 - Design System, UX & Acessibilidade/Central de Acessibilidade Visual & TTS|♿ Central de Acessibilidade Visual & TTS]] — Atalho `Alt + A`, escala tipográfica 100%–145%, realce de foco 3.5px e Web Speech API (`pt-BR`).

### ☁️ 04. Infraestrutura, Cloud 24-7 & Deploy
- [[04 - Infraestrutura, Cloud 24-7 & Deploy/Arquitetura Cloud 24-7 (Render + Supabase)|☁️ Arquitetura Cloud 24/7 (Render + Supabase)]] — Dockerfile multi-stage, Blueprint `render.yaml`, `railway.json`, Supabase Session Pooler IPv4 + SSL/TLS.
- [[04 - Infraestrutura, Cloud 24-7 & Deploy/Checklist de Deploy, Variáveis & Manutenção|📦 Checklist de Deploy, Variáveis & Manutenção]] — Validação local (`npm run build`), variáveis de ambiente, diagnóstico `/configuracoes` e higiene de segredos.

### 🧭 05. Roadmap & DevLog
- [[05 - Roadmap & DevLog/Roadmap & Próximas Features|🚀 Roadmap Atual]] — Próximas entregas de segurança, performance e portfólio.
- [[05 - Roadmap & DevLog/Backlog de Ideias|💡 Backlog de Ideias]] — Banco de ideias para módulos futuros (Departamentos, R2 Storage, CI/CD, Conta Demo).

---

## 🎨 Visão Visual
- Abra o arquivo interativo **[[🗺️ Regz Atlas.canvas]]** no menu lateral esquerdo para navegar visualmente pelas conexões entre todos os módulos do Regz.
- Use o atalho `Ctrl + G` (ou clique no ícone de Grafo na barra lateral do Obsidian) para explorar o **Graph View** colorido por domínio (`#meta`, `#produto`, `#frontend`, `#arquitetura`, `#seguranca`, `#cloud`).
