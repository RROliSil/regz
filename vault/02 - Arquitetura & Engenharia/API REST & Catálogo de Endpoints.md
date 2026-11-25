---
aliases: [API, Endpoints, Rotas REST, Backend API]
tags: [regz, arquitetura, backend, api]
---

# 🔌 API REST & Catálogo de Endpoints

**Arquivo:** `backend/src/index.ts` • **Payload máximo:** `10mb` (suporte a fotos/logos Base64)

Todas as chamadas autenticadas no frontend utilizam `Authorization: Bearer <jwt>` e o cabeçalho `x-empresa-id` para escopo multi-tenant estrito.

---

## 🗺️ Mapa de Rotas por Domínio

### 1. Saúde & Telemetria Cloud
- `GET /api/health` — Retorna `status: "ok"`, `environment`, `port`, `dbInitialized`, `uptime` e `timestamp`.
- `GET /api/db-status` — Testa `SELECT NOW(), version()` e retorna metadados sanitizados (`mode: "cloud" | "local"`, `ssl`, `host`, `database`, `postgresVersion`) sem expor credenciais.

### 2. Autenticação & Sessão
- `POST /api/auth/login` — Rate-limited (5 falhas → bloqueio 15 min, `HTTP 429`), valida `bcrypt`, sincroniza licenças e emite JWT (`7d`).
- `GET /api/auth/me` — Reidrata sessão do usuário, perfil RBAC e status de licença.

### 3. Colaboradores, CBO & Geolocation
- `GET /api/colaboradores` / `GET /api/colaboradores/:id` — Retorna colaboradores com `LEFT JOIN cargos` (`cbo_codigo`) e valores customizados.
- `POST /api/colaboradores` / `PUT /api/colaboradores/:id` — Protegidas por `checkPermission('colaboradores')`, validação estrita de CPF e CBO.
- `PUT /api/colaboradores/:id/inativar` / `PUT /api/colaboradores/:id/reativar` / `DELETE /api/colaboradores/:id`.
- `GET /api/cbo/search` / `GET /api/cargos` — Busca de ocupações CBO por nome, código e sinônimos.
- `GET /api/geocode` — Geocodificação OpenStreetMap Nominatim em cascata de 3 níveis.
- `GET /api/gerar-pessoa` — Gerador brasileiro de dados sintéticos com CPF válido.

### 4. Campos Customizados (EAV) & Relatórios Salvos
- `GET /api/campos-customizados` / `POST /api/campos-customizados` (`checkPermission('campos')`).
- `PUT /api/campos-customizados/:id/inativar` / `PUT .../reativar` / `DELETE .../:id`.
- `GET/PUT /api/colaboradores/:id/valores-customizados`.
- `GET/POST/DELETE /api/relatorios-salvos`.

### 5. RBAC, Usuários, Licenças, Empresas & Auditoria
- `GET/POST/PUT/DELETE /api/perfis-acesso` (`checkPermission('administracao')` em mutações).
- `GET/POST/PUT/DELETE /api/usuarios` • `PUT .../status` • `PUT .../atribuir-licenca` • `POST .../renovar-senha`.
- `GET/POST/DELETE /api/licencas` • `PUT .../renovar` • `PUT .../status` • `POST .../desvincular`.
- `GET/POST/PUT/DELETE /api/empresas` • `POST /api/empresas/test-db` • `GET /api/empresas/:id/usuarios` • `GET /api/empresas/:id/licencas`.
- `GET /api/auditoria` — Consulta paginada/filtrada de `logs_auditoria`.

---

## 🔗 Conexões no Grafo
- [[02 - Arquitetura & Engenharia/Arquitetura Geral & Stack Tecnológica|🧱 Arquitetura & Stack]]
- [[02 - Arquitetura & Engenharia/Segurança, Autenticação JWT & Rate Limiting|🔐 Segurança & JWT]]
- [[02 - Arquitetura & Engenharia/Multi-Tenancy & Roteamento Multi-Banco|🌐 Multi-Tenancy & Multi-Banco]]
- [[02 - Arquitetura & Engenharia/Template de Novo Módulo ou Rota|📝 Template de Novo Módulo]]
