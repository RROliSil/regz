<div align="center">
  <p>
    <a href="./README.md">🇧🇷 Português</a> &nbsp;|&nbsp; <strong>🇺🇸 English</strong>
  </p>

  <img src="./frontend/public/logo.png" alt="Regz People Management" width="110" />
  <h1>Regz — Multi-Tenant SaaS People Management & Employee Portal</h1>
  <p>
    <strong>Cloud-Native 24/7, Multi-Tenant & Multi-Database Full-Stack Platform</strong> built with React, TypeScript, Node.js, Express, and PostgreSQL — featuring granular RBAC permissions, official Brazilian CBO occupation validation (eSocial), GPS geocoding, digital QR Code badges, native client-side vector PDF generation, schema-less dynamic fields (EAV), full audit trails, and a Visual Accessibility Hub with Text-to-Speech (TTS).
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
    <a href="#-overview">Overview</a> •
    <a href="#-system-architecture">Architecture</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-frontend-features-employee-portal">Frontend</a> •
    <a href="#-backend-engineering--rest-api">Backend & API</a> •
    <a href="#-database-design">Database</a> •
    <a href="#-getting-started">Getting Started</a>
  </p>
</div>

---

## 🎯 Overview

**Regz** is an end-to-end **Multi-Tenant SaaS** workforce management platform engineered to handle the complete employee lifecycle, access governance, dynamic reporting, and enterprise licensing.

Beyond standard CRUD operations, the platform was architected around **real-world production engineering challenges** spanning **Frontend, Backend, Security, UX/Accessibility, and Cloud/DevOps**:

- **Strict Multi-Tenancy & Multi-Database Routing**: tenant data isolation via `empresa_id` combined with dynamic per-company database connection routing (`getPoolForEmpresa`), supporting dedicated cloud databases across **PostgreSQL, MySQL/MariaDB, MongoDB Atlas, and Microsoft SQL Server** with Connection String (URI) parsing and automatic SSL/TLS negotiation.
- **Unified Cloud-Native 24/7 Container**: multi-stage Alpine Docker build (`Dockerfile`) bundling the compiled React/Vite SPA and Express TypeScript API into a single lightweight container running continuously in the cloud (**Render + Supabase PostgreSQL SSL**), with automated GitOps deploys on every push to `main`.
- **Enterprise-Grade Employee Portal**: official **CBO (Brazilian Classification of Occupations / eSocial)** synonym validation, automatic address lookup via **ViaCEP**, 3-tier cascading GPS geocoding via **OpenStreetMap Nominatim**, **Digital Employee Badges with 2D QR Codes**, **schema-less dynamic fields (EAV)**, **native vector PDF reports (`jsPDF`)** with in-app preview, and a **Visual Accessibility Hub with Text-to-Speech (TTS)**.

> 🌐 **Live Production Environment (HTTPS):** [`https://regz-app.onrender.com/Regz`](https://regz-app.onrender.com/Regz)  
> *(Note: hosted on Render's free tier — the first request after idle periods may take ~30 seconds for container cold start.)*

---

## 🏗 System Architecture

```mermaid
flowchart LR
    subgraph Client["Browser / PWA (React 18 + Vite + TypeScript)"]
        UI["Regz Portal (SPA + Service Worker + 3 Themes + Accessibility TTS)"]
        PDF["Vector jsPDF & 2D QR Code Generator (Client-Side)"]
    end

    subgraph CloudApp["Unified 24/7 Server (Multi-Stage Docker — Render / Railway)"]
        EXP["Express REST API (50+ Endpoints + Static SPA + Dynamic Open Graph)"]
        AUTH["JWT Auth + RBAC + Brute-Force Rate Limiting"]
        ROUTER["Multi-Tenant Pool Manager (tenantPoolsMap + Auto SSL/TLS)"]
    end

    subgraph CloudDB["Online Database Layer (Cloud DBaaS)"]
        PG["Central PostgreSQL — Supabase (SSL/TLS + IPv4 Session Pooler)"]
        T_PG["Dedicated PostgreSQL (Neon / Supabase / RDS)"]
        T_MY["Cloud MySQL / MariaDB (Aiven / TiDB)"]
        T_MG["MongoDB Atlas (mongodb+srv://)"]
        T_MS["Microsoft SQL Server (Azure SQL / RDS)"]
    end

    subgraph ExtAPIs["External Public APIs"]
        CEP["ViaCEP (Postal Lookup)"]
        GEO["OpenStreetMap Nominatim (Lat/Lon)"]
        MAPS["Google Maps (GPS View)"]
    end

    UI -->|"HTTPS / JSON + Bearer JWT + x-empresa-id"| EXP
    UI --> CEP
    UI --> MAPS
    EXP --> AUTH
    EXP --> GEO
    AUTH --> PG
    EXP --> ROUTER
    ROUTER --> PG
    ROUTER -.->|"Dedicated Tenant DB"| T_PG
    ROUTER -.->|"Connection Tester & Provisioner"| T_MY
    ROUTER -.->|"Connection Tester & Provisioner"| T_MG
    ROUTER -.->|"Connection Tester & Provisioner"| T_MS
```

---

## 🧰 Tech Stack

| Layer | Technologies & Libraries | Architectural Role |
| :--- | :--- | :--- |
| **Frontend** | **React 18.2**, **TypeScript 5.2**, **Vite 5.2**, **React Router DOM 7** | Modular SPA, strict typing, RBAC-protected routing, and dynamic route document titles |
| **UI & Design System** | **Custom CSS Design System** (CSS Variables + Glassmorphism), **Lucide React** | 3 synchronized themes (Default Deep Indigo, Light, Dark), standardized scrollbars, and responsive layouts |
| **Documents & Badges** | **jsPDF 4**, **jsPDF-AutoTable 5**, **qrcode.react 4**, **HTML5 Canvas API** | Native vector PDF generation with preview modal, UTF-8 BOM CSV exports, 2D QR badges, and client-side image compression |
| **Accessibility & PWA** | **Web Speech API (TTS)**, **Service Worker (`sw.js`)**, **Web App Manifest** | Visual Accessibility Hub (`Alt + A`), speech synthesis demo, installable PWA, and static asset caching |
| **Backend** | **Node.js 20 LTS**, **Express 4.19**, **TypeScript 5.4**, **dotenv**, **cors** | RESTful API with 50+ endpoints, reverse-proxy HTTPS awareness (`trust proxy`), dynamic Open Graph injection, and unified SPA serving |
| **Security** | **jsonwebtoken (JWT)**, **bcryptjs (cost 10)**, In-Memory Rate Limiting | Stateless 7-day JWT auth, salted password hashing, server-side RBAC enforcement, and brute-force protection (HTTP 429) |
| **Databases & Drivers** | **PostgreSQL (`pg`)**, **MySQL/MariaDB (`mysql2`)**, **MongoDB (`mongodb`)**, **SQL Server (`mssql`)** | Central PostgreSQL 17 database (`JSONB` + indexes) plus multi-database cloud connectivity with automatic SSL/TLS |
| **DevOps & Cloud 24/7** | **Docker (Multi-Stage Alpine)**, **Docker Compose**, **Render (`render.yaml`)**, **Railway (`railway.json`)**, **Supabase** | Zero-touch GitHub continuous deployment, `/api/health` readiness probes, and managed South America (`sa-east-1`) PostgreSQL |
| **External Integrations** | **ViaCEP**, **OpenStreetMap Nominatim**, **Google Maps** | Brazilian ZIP code autofill, 3-level fallback GPS geocoding, and direct map navigation |

---

## 💻 Frontend Features (Employee Portal)

### 1. Authentication & Login Experience (`/Regz`)
- **Animated Brand Entry**: intro video playback (`/videos/RegzICO.mp4`) freezing cleanly on the final frame.
- **UX & Security Polish**: password visibility toggle (`Eye`/`EyeOff`), **real-time Caps Lock warning**, *"Remember my email"*, browser autofill CSS neutralization (`:-webkit-autofill`) preserving theme colors, and legacy route redirects (`/login`, `/regz/login`).
- **Synchronized Multi-Theme Switcher**: instant cycling across **Default (Deep Indigo Glassmorphism)**, **Light**, and **Dark** modes persisted in `localStorage`.

### 2. Executive Dashboard & KPIs (`/home`)
- **Real-Time Workforce Metrics**: total, active, and inactive employee counters with clickable drill-down filters into the employee table.
- **Role & Geographic Analytics**: top occupation rankings and toggleable **Cities vs. States** distribution charts with `localStorage` persistence and expandable views.
- **Quick Actions**: direct shortcut to onboard a new employee and quick trigger for the **Visual Accessibility Hub** (`Alt + A`).

### 3. Employee Management Portal (`/colaboradores`)
- **Full CRUD with Soft Delete**: dedicated **Active** and **Inactive** sub-tabs enabling safe deactivation and one-click reactivation without data loss.
- **Strict CBO Occupation Validation (Brazilian Labor / eSocial Standard)**:
  - Instant search across official CBO titles, numeric CBO codes, and **market synonyms/aliases** (e.g., *"Dev React"*, *"Tech Lead"*, *"DBA"*, *"Copywriter"*, *"Business Partner"*).
  - Automatic normalization of synonyms to the canonical official CBO title and strict validation blocking arbitrary/unrecognized roles on both client and server.
- **Smart Addressing & GPS Geocoding**:
  - Brazilian **CPF** masking and uniqueness validation, plus automatic **ViaCEP** address completion.
  - High-precision `latitude`/`longitude` geocoding via **OpenStreetMap Nominatim** with one-click **Google Maps** inspection.
- **Photo Compression & Lightbox**: client-side Canvas compression converting uploads into lightweight **~25KB Base64 Data URLs** plus an expanded **Lightbox** viewer.
- **Digital Badge & 2D QR Code**: vector QR rendering via `qrcode.react` inside a centered modal supporting direct **PNG download** and badge printing.
- **Enterprise Data Table**: accent-insensitive unified search (name, CPF, role, city, or full state name), customizable visible columns, **drag-to-resize column widths persisted in `localStorage`**, and configurable pagination.
- **Synthetic Test Data Generator**: integrated with `/api/gerar-pessoa` to generate realistic Brazilian test profiles with mathematically valid CPFs.

### 4. Schema-Less Dynamic Custom Fields (`/campos`)
- **Extensible EAV Builder**: enables HR teams to define custom employee fields at runtime without schema migrations, organized in a 2×2 builder grid:
  - **Numeric** (with min/max validation rules)
  - **Text** (with min/max character limits)
  - **Dropdown Select** (comma-separated custom options)
  - **Boolean Toggle** (*Yes / No*)
- **History-Preserving Soft Delete**: deactivating a field hides it immediately from onboarding/edit forms while keeping all historical values intact in reports and exports.

### 5. Report Builder, Native Vector PDF & Excel Exports (`/relatorios`)
- **3 Analytical Modes**:
  1. **Free-Form Column Builder**: interactive chip selector combining core employee fields, **automatically joined CBO codes**, and all custom dynamic fields.
  2. **Geographic Distribution**: aggregated headcount breakdown by State and City (active, inactive, total, and percentage share).
  3. **Users & RBAC Audit**: complete access control overview by user, role, and license status.
- **Saved Report Templates ("My Reports")**: save and reload full column/filter presets persisted as `JSONB` in PostgreSQL, pre-seeded with 4 executive templates.
- **Native Vector PDF Engine (`jsPDF` + `jspdf-autotable`)**:
  - Full-screen integrated preview modal (`94vw × 92vh`) with zero pop-ups.
  - Real-time **Portrait / Landscape** orientation switching persisted in `localStorage`.
  - High-resolution official 3D logo, executive header, zebra-striped tables, footer pagination, and color-accurate status tags (`print-color-adjust: exact`).
- **Excel Export (UTF-8 BOM CSV)**: generates `.csv` files prefixed with `\uFEFF` for flawless accent rendering in Microsoft Excel, strictly mirroring selected columns and active filters.

### 6. Administration, RBAC, Licensing & Audit Trail (`/administracao`)
- **Granular RBAC Matrix**: create and manage custom access profiles defining **Read**, **Write**, or **No Access** permissions per application module (`Home`, `Employees`, `Custom Fields`, `Administration`, `Reports`, `Settings`).
- **Password Expiry & License Enforcement**: automatic 30-day password expiry tracking and *Enterprise* / *Trial* license countdowns with automatic downgrade to **Read-Only Mode** upon expiration.
- **User Action Audit Logs**: quick-metric cards (Total Events, Logins, Employees, Security), multi-criteria filters (keyword, action, entity, date range), `JSONB` payload inspection modal, and CSV export.

### 7. Isolated Super Admin Multi-Tenant Portal (`/superadmrgz`)
- **Tenant Lifecycle Management**: executive card-grid portal to onboard/manage client companies, enforce `"SIM"` deletion confirmation, issue/renew/unlink Master License keys, and create company users bound to available keys.
- **Online Multi-Database Provisioner & Tester**: engine switcher (**PostgreSQL**, **MySQL/MariaDB**, **MongoDB**, **SQL Server**) with **Cloud Connection String (URI)** input, automatic SSL/TLS, and real-time connection testing (`POST /api/empresas/test-db`).

### 8. Visual Accessibility Hub, Diagnostics, PWA & SEO
- **Visual Accessibility Center (`Alt + A`)**: real-time typography scaling (`100%`–`145%`), `3.5px` focus-ring highlighting, enlarged click targets and icons without clipping, live preview simulator, and **Web Speech API Text-to-Speech (TTS)** testing.
- **System Diagnostics (`/configuracoes`)**: live Frontend, Backend (`/api/health`), and Cloud Database (`/api/db-status` showing `Cloud 24/7 • SSL/TLS` and PostgreSQL version without exposing credentials) monitoring cards.
- **PWA & Dynamic Open Graph**: `manifest.json` + Service Worker (`/sw.js`) + server-side injection of absolute URLs into `og:image`, `og:url`, and Twitter Cards for rich link previews on LinkedIn, WhatsApp, Slack, and Discord.

---

## ⚙️ Backend Engineering & REST API

The backend resides in [`backend/src/index.ts`](./backend/src/index.ts) (Node.js + Express + TypeScript) and is designed for 24/7 cloud resilience, strict tenant security, and multi-database interoperability:

### Core Server Engineering Highlights
- **Cloud 24/7 Resilience**:
  - Prioritizes `DATABASE_URL` with smart `sslmode` normalization (`normalizePgConnectionString`) to prevent `SELF_SIGNED_CERT_IN_CHAIN` errors across managed cloud poolers (Supabase, Neon, Render, Railway, Aiven).
  - Attaches `pool.on('error')` + `keepAlive: true` so idle socket termination by cloud proxies never crashes the Node.js process.
  - Idempotent startup migrations with backoff retry (`initDbWithRetry`), executing table creation in strict foreign-key dependency order for clean zero-touch cloud deployments.
  - Single-round-trip bulk upsert of the official CBO occupation catalog using PostgreSQL `UNNEST($1::text[], $2::text[], $3::text[])`.
  - `app.set('trust proxy', 1)` and explicit `0.0.0.0` binding for reverse-proxied HTTPS cloud containers.
- **Dynamic Multi-Tenant & Multi-DB Layer**:
  - Strict request-level tenant scoping (`empresa_id`) extracted from signed JWT payloads and `x-empresa-id` headers.
  - Dynamic connection pool caching (`tenantPoolsMap`), automated tenant schema bootstrapping (`initTenantDb`), and immediate pool cache invalidation (`closeTenantPool`) whenever a company's database credentials are updated or deleted.
  - Unified 4-engine connectivity tester (`POST /api/empresas/test-db`) supporting cloud URIs and SSL/TLS across `pg`, `mysql2`, `mongodb`, and isolated `mssql.ConnectionPool` instances.
- **Security & Governance**:
  - **JWT** authentication (7-day expiry) and **bcryptjs** password hashing (`cost factor 10`).
  - **Brute-Force Protection (Rate Limiting)**: tracks failed login attempts by `IP + email`; 5 consecutive failures trigger a 15-minute lockout returning `HTTP 429`.
  - Server-side `checkPermission(module)` middleware enforcing RBAC write restrictions (`HTTP 401`/`403`).
  - Bidirectional license state synchronization & automatic expiration (`syncDatabaseLicenses`) plus structured audit logging (`logs_auditoria`).

### REST API Overview (50+ Endpoints)

| Domain | Key Endpoints | Capabilities |
| :--- | :--- | :--- |
| **Health & Status** | `GET /api/health` • `GET /api/db-status` | Container uptime, schema init status, and sanitized Cloud/SSL database diagnostics |
| **Authentication** | `POST /api/auth/login` • `GET /api/auth/me` | Rate-limited login, JWT issuance, license verification, and session hydration |
| **Employees** | `GET/POST /api/colaboradores` • `GET/PUT/DELETE /api/colaboradores/:id` • `PUT .../inativar` • `PUT .../reativar` | Full CRUD with `LEFT JOIN cargos` (CBO code), CPF/CBO validation, soft delete, and tenant isolation |
| **Dynamic Fields** | `GET/POST /api/campos-customizados` • `PUT .../inativar` • `PUT .../reativar` • `DELETE .../:id` • `GET/PUT /api/colaboradores/:id/valores-customizados` | Schema-less EAV field definitions and per-employee custom values |
| **CBO & Utilities** | `GET /api/cbo/search` • `GET /api/cargos` • `GET /api/geocode` • `GET /api/gerar-pessoa` | CBO/synonym lookup, cascading OpenStreetMap Nominatim geocoding, and Brazilian test data generator |
| **Saved Reports** | `GET/POST /api/relatorios-salvos` • `DELETE /api/relatorios-salvos/:id` | Per-company persisted `JSONB` column & filter report presets |
| **RBAC & Users** | `GET/POST/PUT/DELETE /api/perfis-acesso` • `GET/POST/PUT/DELETE /api/usuarios` • `PUT .../status` • `PUT .../atribuir-licenca` • `POST .../renovar-senha` | Granular `JSONB` permission profiles, user lifecycle, and password validity renewal |
| **Tenants & Multi-DB** | `GET/POST/PUT/DELETE /api/empresas` • `POST /api/empresas/test-db` • `GET /api/empresas/:id/usuarios` • `GET /api/empresas/:id/licencas` | Multi-tenant onboarding and online PostgreSQL/MySQL/MongoDB/SQL Server testing & provisioning |
| **Licensing & Audit** | `GET/POST/DELETE /api/licencas` • `PUT .../renovar` • `PUT .../status` • `POST .../desvincular` • `GET /api/auditoria` | Master license key management and paginated/filterable audit trail queries |

---

## 🗄 Database Design

The central PostgreSQL database consists of **10 relational tables** bootstrapped and migrated automatically at startup (`initDbWithRetry`), combining strict referential integrity with `JSONB` flexibility:

| Table | Responsibility & Technical Highlights |
| :--- | :--- |
| `empresas` | Multi-tenant organization records, branding colors, and dedicated DB config (`db_tipo`, `db_uri`, `db_host`, `db_port`, etc.) |
| `perfis_acesso` | Tenant-scoped RBAC roles storing granular per-module permissions in `permissoes JSONB` |
| `usuarios` | Authenticated accounts with bcrypt `senha_hash`, `senha_atualizada_em`, `empresa_id`, `chave_licenca`, and `is_super_admin` flag |
| `chaves_licenca` | Master license keys (*Enterprise* / *Trial*) with activation/expiration timestamps and automated invalidation |
| `cargos` | Official Brazilian **CBO** catalog with `codigo_cbo` and `sinonimos` for eSocial normalization |
| `colaboradores` | Core employee records with unique CPF, full address, `NUMERIC(10,8)`/`NUMERIC(11,8)` GPS coordinates, optimized photo, and `ativo` soft delete |
| `campos_customizados` | Dynamic EAV field metadata (`tipo`, `opcoes`, `obrigatorio`, `min_caracteres`, `max_caracteres`, `ativo`) |
| `colaboradores_valores_customizados` | EAV join table enforcing `UNIQUE (colaborador_id, campo_id)` with `ON DELETE CASCADE` |
| `relatorios_salvos` | Persisted user report templates storing `colunas JSONB` and `filtros JSONB` |
| `logs_auditoria` | Immutable audit trail (`acao`, `entidade`, `detalhes JSONB`, `ip`) backed by indexes on `empresa_id` and `criado_em DESC` |

---

## 📁 Repository Structure

```text
regz/
├── Dockerfile                        # Unified multi-stage build (Vite Frontend + Express Backend)
├── docker-compose.yml                # Cloud-first Docker stack (+ optional local-db profile)
├── render.yaml                       # Render 24/7 continuous deployment Blueprint
├── railway.json                      # Railway 24/7 deployment configuration
├── README.md                         # Portuguese documentation
├── README.en.md                      # English documentation
├── ESTRUTURA_E_REGRAS_DO_SISTEMA.txt # Living architecture & business rules specification
├── backend/
│   ├── .env.example                  # Environment variables template (DATABASE_URL, DB_SSL, JWT_SECRET)
│   ├── package.json                  # Express, pg, mysql2, mongodb, mssql, jwt, bcryptjs, TypeScript
│   └── src/
│       └── index.ts                  # Complete REST API, initDb, RBAC, Multi-Tenancy & Multi-DB routing
└── frontend/
    ├── package.json                  # React 18, Vite, React Router 7, jsPDF, qrcode.react, Lucide
    ├── public/                       # 3D brand logo, icons, intro video, manifest.json & sw.js (PWA)
    └── src/
        ├── App.tsx                   # Protected routing, license gating & dynamic page titles
        ├── components/               # Responsive Sidebar & AccessibilityModal (TTS + Zoom)
        ├── context/                  # AuthContext, ThemeContext, AccessibilityContext, SnackbarContext
        ├── pages/                    # Login, Home, Colaboradores, Campos, Relatorios, Administracao, SuperAdmin, Configuracoes
        └── types/                    # Strict TypeScript domain definitions
```

---

## 🚀 Getting Started

### 1. 24/7 Cloud Deployment (Render or Railway + Managed PostgreSQL)
1. Provision an online **PostgreSQL** instance (e.g., **Supabase**, **Neon**, or **Railway Postgres**) and copy its `DATABASE_URL` *(when pairing Supabase with Render, use the **IPv4 Session Pooler** URI)*.
2. Connect this repository on **Render** (Blueprint via [`render.yaml`](./render.yaml)) or **Railway** (via [`railway.json`](./railway.json)).
3. Configure the environment variables:
   ```env
   NODE_ENV=production
   PORT=4000
   DB_SSL=true
   DATABASE_URL=postgresql://user:password@cloud-host:5432/postgres?sslmode=require
   JWT_SECRET=your_strong_64_char_random_secret
   APP_URL=https://your-production-domain.onrender.com
   ```
4. On first boot, `initDbWithRetry()` automatically provisions all 10 tables, seeds the CBO catalog, creates the root tenant, and initializes default report templates.

### 2. Running with Docker Compose
```bash
# Cloud DB mode (configure DATABASE_URL in .env)
docker compose up -d --build

# Or fully local mode (also starts a PostgreSQL 15 container)
docker compose --profile local-db up -d --build
```
Open `http://localhost:8280/Regz`.

### 3. Local Development (Node.js 20+)
```bash
# 1. Backend
cd backend
cp .env.example .env   # Configure DATABASE_URL or local DB credentials
npm ci
npm run dev            # API running at http://localhost:4000

# 2. Frontend (in a second terminal)
cd frontend
npm ci
npm run dev            # Vite dev server at http://localhost:5173 (proxies /api -> :4000)
```

---

## 👨‍💻 Author

Built end-to-end by **RROliSil** — covering product design, custom design system, Full-Stack TypeScript engineering, relational/JSONB data modeling, security hardening, accessibility, and 24/7 cloud infrastructure.

- **GitHub:** [@RROliSil](https://github.com/RROliSil)
- **Live Application:** [https://regz-app.onrender.com/Regz](https://regz-app.onrender.com/Regz)
