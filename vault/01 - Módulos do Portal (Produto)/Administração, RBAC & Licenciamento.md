---
aliases: [Administração, RBAC, Perfis de Acesso, Licenças]
tags: [regz, produto, seguranca, rbac]
---

# 🛡️ Administração, RBAC & Licenciamento

**Arquivo principal:** `frontend/src/pages/Administracao.tsx` • **Rota:** `/administracao`

Módulo de governança de acessos por empresa, matriz granular de permissões (RBAC) e acompanhamento de validade de senhas e licenças.

---

## 🔐 Matriz de Permissões (RBAC)
Armazenada em `perfis_acesso.permissoes` (`JSONB`) controlando 3 níveis por aba (**`escrita`**, **`leitura`**, **`sem_acesso`**):
- Módulos sincronizados (`SYSTEM_MODULES`): `home`, `colaboradores`, `campos`, `administracao`, `relatorios`, `configuracoes`.
- **4 Perfis Padrão (semeados automaticamente para toda nova empresa):**
  1. **Administrador** (`is_admin: true`, acesso irrestrito, trava contra desativação).
  2. **Gestor de RH** (colaboradores e campos com escrita).
  3. **Operador** (leitura/escrita em colaboradores).
  4. **Consulta** (somente leitura em dados e relatórios).
- **Aplicação Dupla:** validada tanto no Frontend (`AuthContext.temPermissao()`) quanto no Backend (`checkPermission(aba)`).

---

## 🔑 Licenciamento & Expiração de Senha (30 Dias)
- **Validade de Senha:** calculada dinamicamente via `30 - (CURRENT_DATE - senha_atualizada_em::date)` com renovação via `POST /api/usuarios/:id/renovar-senha`.
- **Chaves de Licença (`chaves_licenca`):** sincronizadas bidirecionalmente com `usuarios.chave_licenca` pela rotina `syncDatabaseLicenses()`.
- **Badges Compactas de Validade:** `🟢 (30d)`, `🟡 (5d)`, `🔴 (-2d)`. Ao expirar, o status no banco passa automaticamente para `Expirada` e a plataforma restringe o usuário ao **Modo Somente Leitura**.
- **Separação de Poderes:** a criação de contas de usuários e emissão de chaves Master pertence exclusivamente ao [[01 - Módulos do Portal (Produto)/Portal Super Admin Multi-Tenant|Portal Super Admin]], mantendo o Admin da empresa focado em perfis RBAC e auditoria.

---

## 🔗 Conexões no Grafo
- [[01 - Módulos do Portal (Produto)/Portal Super Admin Multi-Tenant|👑 Portal Super Admin]]
- [[01 - Módulos do Portal (Produto)/Logs de Auditoria & Rastreabilidade|📜 Logs de Auditoria]]
- [[02 - Arquitetura & Engenharia/Segurança, Autenticação JWT & Rate Limiting|🔐 Segurança & JWT]]
- [[00 - Meta & Visão Geral/Regras de Negócio Gerais|📋 Regras de Negócio]]
