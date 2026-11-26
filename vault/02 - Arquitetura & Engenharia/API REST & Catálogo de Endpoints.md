---
aliases: [API, Endpoints, Rotas REST, Backend API]
tags: [regz, arquitetura, backend, api]
---

# 🔌 API REST & Catálogo de Endpoints

**Arquivo:** `backend/src/index.ts` • **Payload máximo:** `10mb` (suporte a fotos/logos Base64)

Todas as chamadas autenticadas no frontend recebem `Authorization: Bearer <jwt>` automaticamente pelo interceptor global em `frontend/src/main.tsx` (que também encerra sessões em `HTTP 401`). O `empresa_id` de usuários comuns é sempre derivado exclusivamente do JWT verificado; apenas o Super Admin real pode direcionar outro tenant via `x-empresa-id` ou `?empresa_id`.

---

## 🗺️ Mapa de Rotas por Domínio

### 1. Saúde & Telemetria Cloud
- `GET /api/health` *(Pública)* — Retorna `status: "ok"`, `environment`, `port`, `dbInitialized`, `uptime` e `timestamp`.
- `GET /api/db-status` *(Pública mínima / Admin detalhada)* — Sem autenticação retorna apenas `{ connected, timestamp }`; para Admin/Super Admin autenticado inclui `mode`, `ssl`, `host`, `port`, `database` e `postgresVersion`.

### 2. Autenticação & Sessão
- `POST /api/auth/login` *(Pública, rate-limited)* — 5 falhas → bloqueio 15 min (`HTTP 429`), valida `bcrypt`, sincroniza licenças e emite JWT (`7d`).
- `GET /api/auth/me` *(Autenticada)* — Reidrata sessão do usuário, perfil RBAC e status de licença.
- `PUT /api/auth/alterar-senha` *(`requireAuth`)* — Permite ao usuário logado alterar a própria senha validando a senha atual via `bcrypt.compare`.

### 3. Colaboradores, CBO & Geolocation
- `GET /api/colaboradores` / `GET /api/colaboradores/:id` *(`leitura` em `home|colaboradores|relatorios`, escopo estrito `empresa_id`)* — Retorna colaboradores com `LEFT JOIN cargos` (`cbo_codigo`) e valores customizados.
- `POST /api/colaboradores` / `PUT /api/colaboradores/:id` *(`escrita` em `colaboradores` + licença ativa)* — Validação estrita de CPF, CBO, foto segura e isolamento por tenant.
- `PUT /api/colaboradores/:id/inativar` / `PUT /api/colaboradores/:id/reativar` / `DELETE /api/colaboradores/:id` *(`escrita` em `colaboradores` + `empresa_id`)*.
- `GET /api/cbo/search` / `GET /api/cargos` *(`requireAuth`)* — Busca de ocupações CBO por nome, código e sinônimos.
- `GET /api/geocode` *(`leitura` em `colaboradores|home`, timeout 6s)* — Geocodificação OpenStreetMap Nominatim em cascata de 3 níveis.
- `GET /api/gerar-pessoa` *(`escrita` em `colaboradores`, timeout 6s)* — Gerador brasileiro de dados sintéticos com CPF válido.

### 4. Campos Customizados (EAV) & Relatórios Salvos
- `GET /api/campos-customizados` *(`leitura` em `campos|colaboradores|relatorios`)* / `POST /api/campos-customizados` *(`escrita` em `campos`)*.
- `PUT /api/campos-customizados/:id/inativar` / `PUT .../reativar` / `DELETE .../:id` *(`escrita` em `campos` + `empresa_id`)*.
- `GET/PUT /api/colaboradores/:id/valores-customizados` *(autenticadas com verificação de posse do colaborador no tenant)*.
- `GET/POST/DELETE /api/relatorios-salvos` *(`leitura`/`escrita` em `relatorios`, validação de tenant e role real em exclusão de modelos padrão)*.

### 5. RBAC, Usuários, Licenças, Empresas & Auditoria
- `GET/POST/PUT/DELETE /api/perfis-acesso` *(`administracao`, escopo `empresa_id`, bloqueio anti-escalonamento de `is_admin`)*.
- `GET /api/usuarios` *(`leitura` em `administracao|relatorios`, sem header falsificável)* • `POST /api/usuarios` *(`requireSuperAdmin`)* • `PUT /api/usuarios/:id` / `PUT .../status` / `POST .../renovar-senha` / `DELETE /api/usuarios/:id` *(`escrita` em `administracao`, proteção ao Super Admin e autoexclusão)* • `PUT .../atribuir-licenca` *(`requireSuperAdmin`)*.
- `GET/POST/DELETE /api/licencas` • `PUT .../renovar` • `PUT .../status` • `POST .../desvincular` *(todas `requireSuperAdmin`, chaves CSPRNG)*.
- `GET/POST/PUT/DELETE /api/empresas` • `POST /api/empresas/test-db` • `GET /api/empresas/:id/usuarios` • `GET /api/empresas/:id/licencas` *(todas `requireSuperAdmin`, credenciais criptografadas em AES-256-GCM e mascaradas na resposta)*.
- `GET /api/auditoria` *(`leitura` em `administracao`, escopo estrito pelo JWT, `limit` limitado a `1..500`)*.

---

## 🔗 Conexões no Grafo
- [[02 - Arquitetura & Engenharia/Arquitetura Geral & Stack Tecnológica|🧱 Arquitetura & Stack]]
- [[02 - Arquitetura & Engenharia/Segurança, Autenticação JWT & Rate Limiting|🔐 Segurança & JWT]]
- [[02 - Arquitetura & Engenharia/Multi-Tenancy & Roteamento Multi-Banco|🌐 Multi-Tenancy & Multi-Banco]]
- [[02 - Arquitetura & Engenharia/Template de Novo Módulo ou Rota|📝 Template de Novo Módulo]]
