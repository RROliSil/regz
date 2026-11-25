---
aliases: [Arquitetura, Stack, Tech Stack, Arquitetura Geral]
tags: [regz, arquitetura, frontend, backend, stack]
---

# 🧱 Arquitetura Geral & Stack Tecnológica

O **Regz** adota uma arquitetura **Full-Stack TypeScript Unificada** empacotada em um único container Docker multi-stage (`Dockerfile`), onde o **Express** serve simultaneamente a API REST (`/api/*`) e os arquivos estáticos compilados do **React/Vite** (`./public`), eliminando problemas de CORS em produção e simplificando o deploy 24/7.

---

## 🛠️ Stack por Camada

| Camada | Tecnologias | Versão / Papel |
| :--- | :--- | :--- |
| **Frontend** | React, TypeScript, Vite, React Router DOM | `React 18.2`, `Vite 5.2`, `Router 7` — SPA modular com rotas protegidas |
| **UI & Documentos** | CSS Custom Design System, Lucide Icons, `jsPDF`, `jspdf-autotable`, `qrcode.react` | 3 temas, PDF vetorial nativo e crachás QR Code 2D |
| **Contextos React** | `AuthContext`, `ThemeContext`, `AccessibilityContext`, `SnackbarContext` | Estado global de sessão/RBAC, temas, acessibilidade/TTS e notificações |
| **Backend** | Node.js 20 LTS, Express 4.19, TypeScript 5.4, `cors`, `dotenv` | API REST (50+ endpoints), `trust proxy`, Open Graph dinâmico |
| **Segurança** | `jsonwebtoken`, `bcryptjs`, Rate Limiting em memória | JWT (`7d`), hash cost `10`, `checkPermission` e proteção contra força bruta |
| **Bancos & Drivers** | `pg` (PostgreSQL), `mysql2`, `mongodb`, `mssql` | Banco central PostgreSQL 17 + conectividade multi-banco online com SSL/TLS |
| **Infra Cloud 24/7** | Docker Multi-Stage Alpine, Render (`render.yaml`), Railway (`railway.json`), Supabase | Deploy contínuo via GitHub + PostgreSQL gerenciado (`sa-east-1`) |

---

## 📂 Organização do Código-Fonte
- `frontend/src/pages/`: `Login`, `Home`, `Colaboradores`, `Campos`, `Relatorios`, `Administracao`, `SuperAdmin`, `Configuracoes`.
- `frontend/src/components/`: `Sidebar`, `AccessibilityModal`.
- `backend/src/index.ts`: núcleo do servidor Express, migrations idempotentes (`initDbWithRetry`), roteamento multi-banco (`getPoolForEmpresa`) e todas as rotas REST.

---

## 🔗 Conexões no Grafo
- [[02 - Arquitetura & Engenharia/API REST & Catálogo de Endpoints|🔌 API REST & Endpoints]]
- [[02 - Arquitetura & Engenharia/Modelagem do Banco de Dados (PostgreSQL)|🗄️ Modelagem PostgreSQL]]
- [[02 - Arquitetura & Engenharia/Multi-Tenancy & Roteamento Multi-Banco|🌐 Multi-Tenancy & Multi-Banco]]
- [[04 - Infraestrutura, Cloud 24-7 & Deploy/Arquitetura Cloud 24-7 (Render + Supabase)|☁️ Arquitetura Cloud 24/7]]
- [[00 - Meta & Visão Geral/Visão do Produto (Regz)|🏢 Visão do Produto]]
