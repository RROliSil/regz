---
aliases: [Segurança, JWT, Bcrypt, Rate Limiting, Auth]
tags: [regz, seguranca, arquitetura, backend]
---

# 🔐 Segurança, Autenticação JWT & Rate Limiting

Camada de proteção responsável pela integridade das sessões, defesa contra invasões e isolamento entre empresas clientes.

---

## 🛡️ Controles Ativos em Produção
1. **Hash de Senhas (`bcryptjs`):** todas as senhas são armazenadas com salt e `cost factor 10` (`usuarios.senha_hash`). Nenhuma senha real ou credencial de banco é versionada no GitHub.
2. **Tokens Stateless (`jsonwebtoken`):** JWT assinado com `process.env.JWT_SECRET` (chave forte gerada pela Render) e validade de `7d`, carregando `id`, `email`, `perfil_id`, `empresa_id` e `is_super_admin`. A flag `is_super_admin` é derivada **exclusivamente** do banco de dados (nunca do nome do usuário).
3. **Proteção contra Força Bruta no Login (`POST /api/auth/login`):**
   - Mapa em memória `loginAttemptsMap` chaveado por `IP_real + email` (com `app.set('trust proxy', 1)` para capturar o IP real atrás do proxy HTTPS).
   - **5 tentativas consecutivas incorretas** travam o par por **15 minutos (`LOCKTIME_MS`)**, retornando `HTTP 429`. Login bem-sucedido zera imediatamente o contador, e um `setInterval` limpa tanto bloqueios expirados quanto tentativas isoladas ociosas (>30 min), evitando vazamento de memória.
4. **Cobertura Total de Middlewares (`requireAuth`, `requireSuperAdmin`, `requireModuleAccess`, `requireAnyModuleAccess`):**
   - **100% das rotas privadas** validam Bearer JWT, status ativo, permissão RBAC (`leitura`/`escrita`), **validade de licença no servidor** (impedindo bypass do Modo Somente Leitura) e escopo multi-tenant (`empresa_id` sempre extraído do JWT para usuários comuns, ignorando headers/query falsificáveis como `x-empresa-id` e `x-is-super-admin`).
   - Proteções anti-escalonamento: não-admins não podem criar/atribuir perfis `is_admin = true`; usuários não podem excluir/desativar o Super Admin nem a própria conta.
5. **Criptografia de Credenciais em Repouso (AES-256-GCM):**
   - `empresas.db_pass` e `empresas.db_uri` são criptografadas em repouso no PostgreSQL (`enc:v1:...` derivado via `scryptSync` de `DB_ENCRYPTION_KEY` ou `JWT_SECRET`, com compatibilidade retroativa para registros legados).
   - As respostas da API mascaram `db_uri` (`••••••`) e nunca retornam `db_pass` ou `resolvedPass`.
6. **Hardening HTTP, Anti-XSS, Anti-DDL & CSV Injection:**
   - `app.disable('x-powered-by')` + cabeçalhos `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy`, `Permissions-Policy` e `Strict-Transport-Security`.
   - CORS restrito a mesma origem, `APP_URL`, `CORS_ORIGINS` (e localhost em desenvolvimento).
   - Escape HTML (`escapeHtmlAttr`) nas tags Open Graph dinâmicas (`og:url`/`og:image`).
   - Whitelist estrita `/^[a-zA-Z0-9_-]{1,63}$/` para nomes de banco em `POST /api/empresas/test-db`, validação de MIME/esquema para uploads de foto/logo (bloqueando SVG/scripts), sanitização contra CSV Formula Injection e geração de licenças com `crypto.randomBytes()` (CSPRNG).
   - Endpoint `GET /api/db-status` retorna metadados detalhados apenas para Admin/Super Admin autenticado (público recebe somente `{ connected }`).
   - Container Docker executado com usuário não-root (`USER node`).
7. **Autoatendimento & Bootstrap Seguro:**
   - Endpoint autenticado `PUT /api/auth/alterar-senha` valida a senha atual com `bcrypt.compare` e atualiza `senha_atualizada_em`.
   - Suporte à variável `ADMIN_INITIAL_PASSWORD` no bootstrap inicial sem imprimir senhas em logs.
   - Interceptor global em `frontend/src/main.tsx` injeta `Authorization: Bearer <token>` automaticamente em `/api/*` e encerra sessões expiradas (`401` → evento `regz:unauthorized`).

---

## 🎯 Próximos Passos de Hardening (Ver Roadmap)
- [x] Aplicar middleware `requireSuperAdmin` estrito nas rotas `/api/empresas*`, `/api/licencas*` e `/api/auditoria`.
- [x] Criptografar `empresas.db_pass` e `empresas.db_uri` em repouso com **AES-256-GCM** (`DB_ENCRYPTION_KEY`).
- [x] Adicionar endpoint autenticado `PUT /api/auth/alterar-senha` e variável `ADMIN_INITIAL_PASSWORD`.
- [ ] Expor modal de troca da própria senha no card do usuário na barra lateral (`Sidebar.tsx`).
- [ ] Modularizar `backend/src/index.ts` e adicionar suíte de testes automatizados de segurança (Supertest).

---

## 🔗 Conexões no Grafo
- [[01 - Módulos do Portal (Produto)/Administração, RBAC & Licenciamento|🛡️ Administração & RBAC]]
- [[01 - Módulos do Portal (Produto)/Logs de Auditoria & Rastreabilidade|📜 Logs de Auditoria]]
- [[02 - Arquitetura & Engenharia/API REST & Catálogo de Endpoints|🔌 API REST]]
- [[05 - Roadmap & DevLog/Roadmap & Próximas Features|🚀 Roadmap Atual]]
