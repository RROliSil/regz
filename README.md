<div align="center">
  <p>
    <strong>🇧🇷 Português</strong> &nbsp;|&nbsp; <a href="./README.en.md">🇺🇸 English</a>
  </p>

  <img src="./frontend/public/logo.png" alt="Regz Gestão de Pessoas" width="110" />
  <h1>Regz — Plataforma SaaS de Gestão de Pessoas & Portal de Colaboradores</h1>
  <p>
    <strong>Aplicação Full-Stack Multi-Tenant, Cloud-Native 24/7 e Multi-Banco</strong> desenvolvida em React, TypeScript, Node.js, Express e PostgreSQL — com controle granular RBAC, validação oficial CBO (eSocial), geocodificação GPS, crachá digital com QR Code, gerador de PDF vetorial nativo, campos dinâmicos sem alteração de schema, trilha de auditoria e central de acessibilidade visual com síntese de voz (TTS).
  </p>

  <p>
    <a href="https://regz-app.onrender.com/Regz" target="_blank">
      <img src="https://img.shields.io/badge/Live_Demo-Online_24%2F7-10b981?style=for-the-badge&logo=render&logoColor=white" alt="Live Demo Online 24/7" />
    </a>
    <img src="https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 18" />
    <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Node.js-20_LTS-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js 20" />
    <img src="https://img.shields.io/badge/Express-4.19-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
    <img src="https://img.shields.io/badge/PostgreSQL-Cloud_SSL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Docker-Multi--Stage-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  </p>

  <p>
    <a href="#-visão-geral">Visão Geral</a> •
    <a href="#-arquitetura-do-sistema">Arquitetura</a> •
    <a href="#-stack-tecnológica">Stack Tecnológica</a> •
    <a href="#-funcionalidades-do-frontend-portal-de-colaboradores">Frontend</a> •
    <a href="#-engenharia-do-backend--api-rest">Backend & API</a> •
    <a href="#-modelagem-de-dados">Banco de Dados</a> •
    <a href="#-como-executar">Como Executar</a>
  </p>
</div>

---

## 🎯 Visão Geral

O **Regz** é uma plataforma corporativa **SaaS Multi-Tenant** projetada de ponta a ponta para gerenciamento completo do ciclo de vida de colaboradores, governança de acessos e inteligência de relatórios em empresas de pequeno a grande porte.

Mais do que um CRUD tradicional, o projeto foi construído com foco em **engenharia de produção real**, reunindo desafios avançados de **Frontend, Backend, Segurança, UX/Acessibilidade e Cloud/DevOps**:

- **Multi-Tenancy Estrito & Multi-Banco Online**: isolamento de dados por `empresa_id` e roteamento dinâmico de pool de conexões por cliente (`getPoolForEmpresa`), com suporte a bancos dedicados em **PostgreSQL, MySQL/MariaDB, MongoDB Atlas e Microsoft SQL Server** via Connection String (URI) e SSL/TLS automático.
- **Container Unificado Cloud 24/7**: build Docker multi-stage (`Dockerfile`) que compila Frontend (Vite/React) e Backend (TypeScript/Express) em uma única imagem enxuta rodando 24/7 na nuvem (**Render + Supabase PostgreSQL SSL**), com deploy contínuo a cada `git push` na branch `main`.
- **Experiência Corporativa Completa**: validação oficial de cargos **CBO (MTE/eSocial)** com sinônimos, preenchimento de endereço via **ViaCEP**, geocodificação de alta precisão via **OpenStreetMap Nominatim**, **Crachá Digital com QR Code 2D**, **construtor visual de campos dinâmicos (EAV)**, **PDF vetorial nativo (`jsPDF`)** com pré-visualização em modal e **Central de Acessibilidade Visual com síntese de voz (TTS `pt-BR`)**.

> 🌐 **Ambiente em Produção (HTTPS):** [`https://regz-app.onrender.com/Regz`](https://regz-app.onrender.com/Regz)  
> *(Nota: hospedado no plano gratuito da Render — o primeiro acesso após inatividade pode levar ~30s para acordar o container.)*

---

## 🏗 Arquitetura do Sistema

```mermaid
flowchart LR
    subgraph Client["Navegador / PWA (React 18 + Vite + TypeScript)"]
        UI["Portal Regz (SPA + Service Worker + 3 Temas + Acessibilidade TTS)"]
        PDF["jsPDF Vetorial & QR Code 2D (Client-Side)"]
    end

    subgraph CloudApp["Servidor Unificado 24/7 (Docker Multi-Stage — Render / Railway)"]
        EXP["Express REST API (50+ Endpoints + Static SPA + Open Graph Dinâmico)"]
        AUTH["JWT Auth + RBAC + Rate Limiting (Força Bruta)"]
        ROUTER["Multi-Tenant Pool Manager (tenantPoolsMap + SSL/TLS)"]
    end

    subgraph CloudDB["Camada de Bancos Online (Cloud DBaaS)"]
        PG["PostgreSQL Central — Supabase (SSL/TLS + Session Pooler IPv4)"]
        T_PG["PostgreSQL Dedicado (Neon / Supabase / RDS)"]
        T_MY["MySQL / MariaDB Cloud (Aiven / TiDB)"]
        T_MG["MongoDB Atlas (mongodb+srv://)"]
        T_MS["Microsoft SQL Server (Azure SQL / RDS)"]
    end

    subgraph ExtAPIs["APIs Públicas Integradas"]
        CEP["ViaCEP (Endereços)"]
        GEO["OpenStreetMap Nominatim (Lat/Lon)"]
        MAPS["Google Maps (Visualização GPS)"]
    end

    UI -->|"HTTPS / JSON + Bearer JWT + x-empresa-id"| EXP
    UI --> CEP
    UI --> MAPS
    EXP --> AUTH
    EXP --> GEO
    AUTH --> PG
    EXP --> ROUTER
    ROUTER --> PG
    ROUTER -.->|"Multi-Banco Dedicado"| T_PG
    ROUTER -.->|"Testador & Provisionador"| T_MY
    ROUTER -.->|"Testador & Provisionador"| T_MG
    ROUTER -.->|"Testador & Provisionador"| T_MS
```

---

## 🧰 Stack Tecnológica

| Camada | Tecnologias & Bibliotecas | Papel na Arquitetura |
| :--- | :--- | :--- |
| **Frontend** | **React 18.2**, **TypeScript 5.2**, **Vite 5.2**, **React Router DOM 7** | SPA modular, tipagem estrita, roteamento protegido por RBAC e títulos dinâmicos por rota |
| **UI, Design & Gráficos** | **CSS Custom Design System** (CSS Variables + Glassmorphism), **Lucide React** | 3 temas completos (Padrão Deep Indigo, Claro e Escuro), scrollbars padronizadas e layout responsivo |
| **Documentos & Identificação** | **jsPDF 4**, **jsPDF-AutoTable 5**, **qrcode.react 4**, **Canvas API** | Geração de PDF vetorial nativo com pré-visualização, exportação CSV UTF-8 (BOM), crachás QR Code 2D e compressão de fotos no navegador |
| **Acessibilidade & PWA** | **Web Speech API (TTS `pt-BR`)**, **Service Worker (`sw.js`)**, **Web App Manifest** | Central de acessibilidade visual (`Alt + A`), leitura em voz alta, instalabilidade PWA e cache de assets |
| **Backend** | **Node.js 20 LTS**, **Express 4.19**, **TypeScript 5.4**, **dotenv**, **cors** | API RESTful com 50+ endpoints, proxy reverso HTTPS (`trust proxy`), injeção dinâmica de Open Graph e entrega unificada do SPA |
| **Segurança** | **jsonwebtoken (JWT)**, **bcryptjs (cost 10)**, Rate Limiting em memória | Autenticação stateless (7 dias), hash seguro de senhas, matriz RBAC no servidor e proteção contra força bruta (HTTP 429) |
| **Bancos & Drivers** | **PostgreSQL (`pg`)**, **MySQL/MariaDB (`mysql2`)**, **MongoDB (`mongodb`)**, **SQL Server (`mssql`)** | Banco central PostgreSQL 17 (com `JSONB` e índices) + conectividade multi-banco online com SSL/TLS automático |
| **DevOps & Cloud 24/7** | **Docker (Multi-Stage Alpine)**, **Docker Compose**, **Render (`render.yaml`)**, **Railway (`railway.json`)**, **Supabase** | Deploy contínuo direto do GitHub, healthcheck `/api/health`, banco gerenciado na nuvem (São Paulo `sa-east-1`) |
| **Integrações Externas** | **ViaCEP**, **OpenStreetMap Nominatim**, **Google Maps** | Autocompletar de endereços brasileiros, geocodificação de coordenadas GPS em 3 níveis de fallback e rotas no mapa |

---

## 💻 Funcionalidades do Frontend (Portal de Colaboradores)

### 1. Autenticação & Experiência de Login (`/Regz`)
- **Identidade Animada**: abertura com vídeo vetorial da marca (`/videos/RegzICO.mp4`) e congelamento suave no frame final.
- **Usabilidade & Segurança**: botão de alternância de visibilidade de senha (`Eye`/`EyeOff`), **detector dinâmico de Caps Lock ativado**, opção *"Lembrar meu e-mail"*, proteção visual contra autofill do navegador (`:-webkit-autofill`) preservando as cores do tema ativo e redirecionamento automático de rotas legadas (`/login`, `/regz/login`).
- **Seletor Multi-Tema Integrado**: alternância instantânea entre **Modo Padrão (Deep Indigo Glassmorphism)**, **Modo Claro** e **Modo Escuro** com persistência em `localStorage`.

### 2. Dashboard Executivo & Indicadores (`/home`)
- **Métricas em Tempo Real**: total de colaboradores, ativos e inativos clicáveis (que já abrem o portal pré-filtrado).
- **Distribuição de Cargos & Geografia**: ranking dos principais cargos e gráfico interativo de distribuição por **Cidades** ou **Estados (UF)** com expansão sob demanda e persistência da preferência em `localStorage`.
- **Acesso Rápido**: atalho direto para cadastro de novo colaborador e botão dedicado para a **Central de Acessibilidade Visual** (`PersonStanding` / `Alt + A`).

### 3. Portal Completo de Colaboradores (`/colaboradores`)
- **CRUD Completo com Soft Delete**: sub-abas dedicadas para **Colaboradores Ativos** e **Inativados**, permitindo inativação segura e reativação com 1 clique sem perda de histórico.
- **Validação Estrita de Cargos CBO (MTE / eSocial)**:
  - Busca inteligente no catálogo oficial da Classificação Brasileira de Ocupações por **nome**, **código numérico CBO** ou **sinônimos de mercado** (ex.: *"Dev React"*, *"Tech Lead"*, *"DBA"*, *"Carreteiro"*, *"Business Partner"*).
  - Bloqueio de cargos inválidos e conversão automática de sinônimos para o título canônico oficial CBO (tanto no Frontend quanto no Backend).
- **Endereço Inteligente & Geolocalização GPS**:
  - Validação e máscara de **CPF** (com checagem de duplicidade) e **CEP** com preenchimento automático via **ViaCEP**.
  - Geocodificação de alta precisão (`latitude`/`longitude`) via **OpenStreetMap Nominatim** com abertura direta da localização no **Google Maps**.
- **Fotos Otimizadas & Lightbox**: compressão automática de imagens no cliente via Canvas para **Base64 ultraleve (~25KB)** + visualizador **Lightbox** ampliado ao clicar na foto.
- **Crachá Digital & QR Code 2D**: geração vetorial via `qrcode.react` com modal em primeiro plano, download direto em **PNG** e impressão formatada do crachá.
- **Tabela Corporativa Customizável**: busca normalizada sem acentos (por nome, CPF, cargo, cidade ou nome completo do estado), seletor de colunas visíveis, **redimensionamento manual de largura de colunas via alças arrastáveis (`.resizer`) persistidas no `localStorage`** e paginação configurável.
- **Gerador de Dados de Teste**: integração com `/api/gerar-pessoa` para preenchimento rápido de demonstrações com CPF brasileiro matematicamente válido.

### 4. Construtor de Campos Personalizados Dinâmicos (`/campos`)
- **Arquitetura Extensível Sem Alteração de Schema (EAV)**: permite que o RH crie novos atributos cadastrais sem deploy nem migration manual, em layout simétrico 2×2:
  - **Numérico** (com limites mínimo e máximo de caracteres/valor)
  - **Texto Livre** (com regras de tamanho mínimo/máximo)
  - **Seleção Dropdown** (opções customizadas separadas por vírgula)
  - **Alternativa Booleana** (*Sim / Não*)
- **Soft Delete Inteligente**: campos inativados são imediatamente ocultados em novos cadastros e validações, enquanto todos os valores preenchidos anteriormente permanecem íntegros para consultas históricas e relatórios.

### 5. Central de Relatórios, PDF Vetorial & Exportação Excel (`/relatorios`)
- **3 Modos Analíticos**:
  1. **Construtor Visual Livre**: seleção de colunas por chips interativos combinando dados cadastrais, **código CBO resolvido automaticamente via `LEFT JOIN`** e todos os campos dinâmicos criados pela empresa.
  2. **Distribuição Geográfica**: consolidado por Estado/Cidade com contagem de ativos, inativos, total e percentual.
  3. **Usuários & Perfis (RBAC)**: quadro executivo de acessos, perfis e status.
- **Meus Relatórios (Modelos Salvos)**: salvamento e carregamento com 1 clique de combinações completas de colunas e filtros persistidas no PostgreSQL, além de 4 modelos executivos padrão.
- **Geração de PDF Vetorial Nativo (`jsPDF` + `jspdf-autotable`)**:
  - Modal interno em tela cheia (`94vw × 92vh`) para pré-visualização em tempo real sem pop-ups.
  - Alternância dinâmica entre **Retrato (Portrait)** e **Paisagem (Landscape)** persistida em `localStorage`.
  - Logotipo oficial 3D em alta resolução, cabeçalho corporativo, tabela zebrada nítida, paginação no rodapé e tags coloridas (`✓ Sim / Ativo` e `✗ Não / Inativo`) com `print-color-adjust: exact`.
- **Exportação Excel (CSV UTF-8 BOM)**: arquivo `.csv` com BOM `\uFEFF` garantindo acentuação perfeita no Microsoft Excel, exportando estritamente as colunas e filtros ativos.

### 6. Administração, RBAC, Licenças & Logs de Auditoria (`/administracao`)
- **Matriz Granular de Permissões (RBAC)**: criação e edição de perfis de acesso controlando nível **Leitura**, **Escrita** ou **Sem Acesso** por módulo (`Home`, `Colaboradores`, `Campos`, `Administração`, `Relatórios`, `Configurações`).
- **Controle de Validade de Senha e Licenças**: contagem regressiva de expiração de senha (30 dias) e licenças (*Enterprise* / *Trial*) com badges visuais de alerta e rebaixamento automático para **Modo Somente Leitura** quando uma licença expira.
- **Trilha de Auditoria Completa**: métricas rápidas (Logins, Colaboradores, Segurança), filtros por busca textual, ação, entidade e intervalo de datas, modal de inspeção do payload `JSONB` e exportação CSV.

### 7. Portal Isolado Super Admin Multi-Tenant (`/superadmrgz`)
- **Gestão de Empresas Clientes (Tenants)**: interface executiva dedicada em Grid de Cards com identidade visual própria por empresa, exclusão protegida por confirmação explícita (`"SIM"`), emissão/renovação/desvínculo de chaves de licença Master e criação de usuários vinculados a licenças avulsas.
- **Gerenciador & Testador Multi-Banco Online**: seletor de motor (**PostgreSQL**, **MySQL/MariaDB**, **MongoDB**, **SQL Server**) com campo de **URI / Connection String Online (Cloud com SSL automático)** e botão de teste + provisionamento em tempo real (`POST /api/empresas/test-db`).

### 8. Acessibilidade Visual, Diagnóstico, PWA & SEO
- **Central de Acessibilidade Visual (`Alt + A`)**: escala tipográfica em tempo real (`100%` a `145%`), realce de foco luminoso (`3.5px`), ampliação de áreas de clique/ícones sem distorção, simulador ao vivo e **teste de síntese de voz (TTS `pt-BR`)**.
- **Diagnóstico de Infraestrutura (`/configuracoes`)**: monitoramento em tempo real do Frontend, Backend (`/api/health`) e Banco de Dados (`/api/db-status` exibindo modo `Cloud 24/7 • SSL/TLS` e versão do PostgreSQL sem expor credenciais).
- **PWA & Open Graph Dinâmico**: `manifest.json` + Service Worker (`/sw.js`) + injeção server-side de URLs absolutas nas meta tags `og:image`, `og:url` e Twitter Cards para prévias ricas em WhatsApp, LinkedIn, Slack e Discord.

---

## ⚙️ Engenharia do Backend & API REST

Todo o backend está estruturado em [`backend/src/index.ts`](./backend/src/index.ts) (Node.js + Express + TypeScript) com foco em resiliência em nuvem, segurança e compatibilidade multi-banco:

### Destaques Arquiteturais do Servidor
- **Resiliência Cloud 24/7**:
  - Prioriza `DATABASE_URL` com normalização inteligente de `sslmode` (`normalizePgConnectionString`) evitando conflitos de certificado em poolers gerenciados (Supabase, Neon, Render, Railway, Aiven).
  - `pool.on('error')` + `keepAlive: true` para impedir encerramento do processo Node.js quando proxies cloud fecham conexões ociosas.
  - `initDbWithRetry()` com backoff progressivo, respeitando rigorosamente a ordem de chaves estrangeiras para subida limpa em bancos 100% zerados.
  - Upsert em lote único do catálogo oficial CBO via `UNNEST($1::text[], $2::text[], $3::text[])` (1 round-trip de rede em vez de ~90 queries sequenciais).
  - `app.set('trust proxy', 1)` e bind explícito em `0.0.0.0` para operação correta atrás de balanceadores HTTPS na nuvem.
- **Roteamento Multi-Tenant & Multi-Banco**:
  - Isolamento estrito via `empresa_id` extraído do JWT e do header `x-empresa-id`.
  - Cache dinâmico de pools por cliente (`tenantPoolsMap`), inicialização automática do schema dedicado (`initTenantDb`) e invalidação imediata do cache ao atualizar/excluir credenciais da empresa (`closeTenantPool`).
  - Testador unificado `POST /api/empresas/test-db` suportando URI Cloud + SSL/TLS nos 4 drivers oficiais (`pg`, `mysql2`, `mongodb`, `mssql` com `ConnectionPool` isolado).
- **Segurança & Governança**:
  - Autenticação **JWT** (validade de 7 dias) e senhas com **bcrypt (`cost factor 10`)**.
  - **Proteção contra Força Bruta (Rate Limiting)**: rastreamento por `IP + E-mail`; 5 tentativas incorretas bloqueiam o acesso por 15 minutos retornando `HTTP 429` com tempo restante.
  - Middleware `checkPermission(modulo)` bloqueando escrita não autorizada no servidor (`HTTP 401`/`403`).
  - Sincronização bidirecional e auto-invalidação de licenças expiradas (`syncDatabaseLicenses`) e registro automático de eventos em `logs_auditoria`.

### Mapa de Endpoints da API REST (50+ Rotas)

| Domínio | Endpoints Principais | Descrição |
| :--- | :--- | :--- |
| **Saúde & Diagnóstico** | `GET /api/health` • `GET /api/db-status` | Uptime, status de inicialização do schema e metadados seguros (Cloud/SSL/versão PG) |
| **Autenticação** | `POST /api/auth/login` • `GET /api/auth/me` | Login com rate limiting, emissão JWT, checagem de licença e validação de sessão |
| **Colaboradores** | `GET/POST /api/colaboradores` • `GET/PUT/DELETE /api/colaboradores/:id` • `PUT .../inativar` • `PUT .../reativar` | CRUD completo com `LEFT JOIN cargos` (CBO), validação de CPF/CBO, soft delete e multi-tenancy |
| **Campos Dinâmicos** | `GET/POST /api/campos-customizados` • `PUT .../inativar` • `PUT .../reativar` • `DELETE .../:id` • `GET/PUT /api/colaboradores/:id/valores-customizados` | Definição de atributos dinâmicos (EAV) e persistência de valores por colaborador |
| **CBO & Utilidades** | `GET /api/cbo/search` • `GET /api/cargos` • `GET /api/geocode` • `GET /api/gerar-pessoa` | Busca CBO/sinônimos, geocodificação OpenStreetMap Nominatim em cascata e gerador de dados BR |
| **Relatórios Salvos** | `GET/POST /api/relatorios-salvos` • `DELETE /api/relatorios-salvos/:id` | Persistência de modelos de relatórios personalizados em `JSONB` por empresa |
| **RBAC & Usuários** | `GET/POST/PUT/DELETE /api/perfis-acesso` • `GET/POST/PUT/DELETE /api/usuarios` • `PUT .../status` • `PUT .../atribuir-licenca` • `POST .../renovar-senha` | Gestão de perfis de permissão (`JSONB`), contas de acesso e validade de senhas |
| **Empresas & Multi-DB** | `GET/POST/PUT/DELETE /api/empresas` • `POST /api/empresas/test-db` • `GET /api/empresas/:id/usuarios` • `GET /api/empresas/:id/licencas` | Gestão multi-tenant, teste/provisionamento online de PostgreSQL/MySQL/MongoDB/SQL Server |
| **Licenças & Auditoria** | `GET/POST/DELETE /api/licencas` • `PUT .../renovar` • `PUT .../status` • `POST .../desvincular` • `GET /api/auditoria` | Ciclo de vida de chaves Master e consulta paginada/filtrada de logs de auditoria |

---

## 🗄 Modelagem de Dados

O banco central PostgreSQL é composto por **10 tabelas relacionais** criadas e migradas automaticamente no boot (`initDbWithRetry`), combinando integridade referencial com flexibilidade `JSONB`:

| Tabela | Finalidade & Destaques Técnicos |
| :--- | :--- |
| `empresas` | Cadastro multi-tenant, customização visual e credenciais/URI de banco próprio (`db_tipo`, `db_uri`, `db_host`, `db_port`, etc.) |
| `perfis_acesso` | Perfis RBAC por empresa com matriz de permissões armazenada em coluna `permissoes JSONB` |
| `usuarios` | Contas autenticáveis com `senha_hash` (bcrypt), `senha_atualizada_em`, vínculo de `empresa_id`, `chave_licenca` e flag `is_super_admin` |
| `chaves_licenca` | Chaves Master (*Enterprise* / *Trial*) com data de ativação, expiração e invalidação automática |
| `cargos` | Catálogo oficial **CBO (MTE/Brasil)** com `codigo_cbo` e coluna `sinonimos` para normalização eSocial |
| `colaboradores` | Cadastro principal com CPF único, endereço completo, coordenadas `NUMERIC(10,8)`/`NUMERIC(11,8)`, foto otimizada e Soft Delete (`ativo`) |
| `campos_customizados` | Definição dinâmica de campos extras (`tipo`, `opcoes`, `obrigatorio`, `min_caracteres`, `max_caracteres`, `ativo`) |
| `colaboradores_valores_customizados` | Tabela associativa EAV com restrição `UNIQUE (colaborador_id, campo_id)` e `ON DELETE CASCADE` |
| `relatorios_salvos` | Modelos de relatórios (*Meus Relatórios*) persistindo `colunas JSONB` e `filtros JSONB` |
| `logs_auditoria` | Trilha imutável de auditoria (`acao`, `entidade`, `detalhes JSONB`, `ip`) com índices dedicados em `empresa_id` e `criado_em DESC` |

---

## 📁 Estrutura do Repositório

```text
regz/
├── Dockerfile                        # Build multi-stage unificado (Frontend Vite + Backend Express)
├── docker-compose.yml                # Stack containerizada Cloud-first (+ profile opcional local-db)
├── render.yaml                       # Blueprint de deploy contínuo 24/7 na Render
├── railway.json                      # Configuração de deploy contínuo 24/7 na Railway
├── ESTRUTURA_E_REGRAS_DO_SISTEMA.txt # Documentação viva de arquitetura e regras de negócio
├── backend/
│   ├── .env.example                  # Modelo de variáveis de ambiente (DATABASE_URL, DB_SSL, JWT_SECRET)
│   ├── package.json                  # Express, pg, mysql2, mongodb, mssql, jwt, bcryptjs, TypeScript
│   └── src/
│       └── index.ts                  # API REST completa, initDb, RBAC, Multi-Tenancy e Multi-Banco
└── frontend/
    ├── package.json                  # React 18, Vite, React Router 7, jsPDF, qrcode.react, Lucide
    ├── public/                       # Logo 3D, ícones, vídeo de abertura, manifest.json e sw.js (PWA)
    └── src/
        ├── App.tsx                   # Roteamento protegido, validação de licença e títulos dinâmicos
        ├── components/               # Sidebar responsiva e AccessibilityModal (TTS + Zoom)
        ├── context/                  # AuthContext, ThemeContext, AccessibilityContext, SnackbarContext
        ├── pages/                    # Login, Home, Colaboradores, Campos, Relatorios, Administracao, SuperAdmin, Configuracoes
        └── types/                    # Tipagens TypeScript estritas (auth, colaborador, estados BR)
```

---

## 🚀 Como Executar

### 1. Deploy 24/7 na Nuvem (Render ou Railway + PostgreSQL Online)
1. Provisione um banco **PostgreSQL Online** (ex.: **Supabase**, **Neon** ou **Railway Postgres**) e copie a `DATABASE_URL` (no Supabase com Render, utilize a URI do **Session Pooler IPv4**).
2. Conecte este repositório na **Render** (via Blueprint [`render.yaml`](./render.yaml)) ou na **Railway** (via [`railway.json`](./railway.json)).
3. Defina as variáveis de ambiente:
   ```env
   NODE_ENV=production
   PORT=4000
   DB_SSL=true
   DATABASE_URL=postgresql://usuario:senha@host-online:5432/postgres?sslmode=require
   JWT_SECRET=sua_chave_secreta_forte_de_64_caracteres
   APP_URL=https://seu-dominio-online.onrender.com
   ```
4. No primeiro boot, o `initDbWithRetry()` cria automaticamente todas as tabelas, semeia a base CBO, a Empresa Matriz e os modelos de relatório.

### 2. Execução com Docker Compose
```bash
# Modo conectado a banco PostgreSQL Online (configure .env com DATABASE_URL)
docker compose up -d --build

# Ou modo 100% local (sobe também um PostgreSQL 15 em container)
docker compose --profile local-db up -d --build
```
Acesse em `http://localhost:8280/Regz`.

### 3. Desenvolvimento Local (Node.js 20+)
```bash
# 1. Backend
cd backend
cp .env.example .env   # Configure sua DATABASE_URL ou banco local
npm ci
npm run dev            # API em http://localhost:4000

# 2. Frontend (em outro terminal)
cd frontend
npm ci
npm run dev            # Vite em http://localhost:5173 (com proxy /api -> :4000)
```

---

## 👨‍💻 Autor

Desenvolvido por **RROliSil** — projeto autoral de ponta a ponta cobrindo concepção, design system, engenharia Full-Stack, modelagem de dados, segurança, acessibilidade e implantação 24/7 em nuvem.

- **GitHub:** [@RROliSil](https://github.com/RROliSil)
- **Aplicação Online:** [https://regz-app.onrender.com/Regz](https://regz-app.onrender.com/Regz)
