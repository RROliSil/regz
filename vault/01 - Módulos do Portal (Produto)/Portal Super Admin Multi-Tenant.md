---
aliases: [Super Admin, superadmrgz, Empresas, Tenants]
tags: [regz, produto, seguranca, multitenant]
---

# 👑 Portal Super Admin Multi-Tenant

**Arquivo principal:** `frontend/src/pages/SuperAdmin.tsx` • **Rota canônica:** `/superadmrgz`

Portal executivo isolado do licenciador Master (`is_super_admin: true` / `admin@regz.app`), redirecionado automaticamente após o login.

---

## 🏢 Recursos do Portal Master
1. **Grid de Cards de Empresas Clientes:**
   - Exibe status (`Ativa`/`Inativa`), CNPJ, localização, total de usuários, licenças ativas/totais e indicador do banco de dados conectado (sanitizado sem exibir senhas).
   - Exclusão protegida por modal que exige a digitação literal da palavra **`"SIM"`**.
2. **Gestão de Licenças Master (`chaves_licenca`):**
   - Emissão de chaves *Enterprise* ou *Trial*, atalho **⚡ Emissão Rápida (1 Ano)**, renovação/upgrade (`+30d`, `+120d`, `+365d`) e ação **Desvincular Licença** (`POST /api/licencas/:id/desvincular`) para devolvê-la ao pool avulso da empresa.
3. **Cadastro de Usuários por Empresa:**
   - Filtra estritamente os perfis RBAC da empresa selecionada (`?empresa_id=...`) e exige seleção de uma chave Master avulsa disponível daquela empresa.
4. **Configurador & Testador Multi-Banco Online:**
   - Suporte aos 4 motores (**PostgreSQL**, **MySQL/MariaDB**, **MongoDB**, **SQL Server**).
   - Campo unificado **URI / Connection String Online (Cloud 24/7 com SSL automático)** para todos os motores + campos individuais opcionais.
   - Botão de teste em tempo real conectado a `POST /api/empresas/test-db`.
5. **Tema Exclusivo Travado:**
   - O ciclo de vida de `SuperAdmin.tsx` força `setTheme('padrao')` (Deep Indigo Glassmorphism `#020617` / `#0f172a`), garantindo consistência executiva independente do tema da tela de login.

---

## 🔗 Conexões no Grafo
- [[02 - Arquitetura & Engenharia/Multi-Tenancy & Roteamento Multi-Banco|🌐 Multi-Tenancy & Multi-Banco]]
- [[01 - Módulos do Portal (Produto)/Administração, RBAC & Licenciamento|🛡️ Administração & RBAC]]
- [[02 - Arquitetura & Engenharia/Segurança, Autenticação JWT & Rate Limiting|🔐 Segurança & JWT]]
- [[04 - Infraestrutura, Cloud 24-7 & Deploy/Arquitetura Cloud 24-7 (Render + Supabase)|☁️ Arquitetura Cloud 24/7]]
