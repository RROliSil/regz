---
aliases: [Segurança, JWT, Bcrypt, Rate Limiting, Auth]
tags: [regz, seguranca, arquitetura, backend]
---

# 🔐 Segurança, Autenticação JWT & Rate Limiting

Camada de proteção responsável pela integridade das sessões, defesa contra invasões e isolamento entre empresas clientes.

---

## 🛡️ Controles Ativos em Produção
1. **Hash de Senhas (`bcryptjs`):** todas as senhas são armazenadas com salt e `cost factor 10` (`usuarios.senha_hash`). Nenhuma senha real ou credencial de banco é versionada no GitHub.
2. **Tokens Stateless (`jsonwebtoken`):** JWT assinado com `process.env.JWT_SECRET` (chave forte gerada pela Render) e validade de `7d`, carregando `id`, `email`, `perfil_id`, `empresa_id` e `is_super_admin`.
3. **Proteção contra Força Bruta no Login (`POST /api/auth/login`):**
   - Mapa em memória `loginAttemptsMap` chaveado por `IP_real + email` (com `app.set('trust proxy', 1)` para capturar o IP real atrás do proxy HTTPS).
   - **5 tentativas consecutivas incorretas** travam o par por **15 minutos (`LOCKTIME_MS`)**, retornando `HTTP 429`. Login bem-sucedido zera imediatamente o contador, e um `setInterval` limpa bloqueios expirados a cada 10 minutos.
4. **Enforcement de RBAC no Servidor (`checkPermission(aba)`):** valida Bearer JWT, status ativo do usuário e permissão `'escrita'` no módulo alvo (`HTTP 401`/`403`).
5. **Higiene de Segredos:**
   - Token antigo do Ngrok removido de `docker-compose.yml` e rotacionado no painel do Ngrok.
   - Senha padrão `admin123` substituída no banco de produção logo após o deploy.
   - Endpoint `/api/db-status` retorna apenas metadados sanitizados (nunca expõe `DATABASE_URL`, usuário ou senha).

---

## 🎯 Próximos Passos de Hardening (Ver Roadmap)
- [ ] Aplicar middleware `requireSuperAdmin` estrito nas rotas `/api/empresas*`, `/api/licencas*` e `/api/auditoria`.
- [ ] Criptografar `empresas.db_pass` e `empresas.db_uri` em repouso com **AES-256-GCM** (`DB_ENCRYPTION_KEY`).
- [ ] Adicionar endpoint autenticado `PUT /api/auth/alterar-senha` e variável `ADMIN_INITIAL_PASSWORD`.

---

## 🔗 Conexões no Grafo
- [[01 - Módulos do Portal (Produto)/Administração, RBAC & Licenciamento|🛡️ Administração & RBAC]]
- [[01 - Módulos do Portal (Produto)/Logs de Auditoria & Rastreabilidade|📜 Logs de Auditoria]]
- [[02 - Arquitetura & Engenharia/API REST & Catálogo de Endpoints|🔌 API REST]]
- [[05 - Roadmap & DevLog/Roadmap & Próximas Features|🚀 Roadmap Atual]]
