---
aliases: [Multi-Tenancy, Multi-Banco, tenantPoolsMap, getPoolForEmpresa]
tags: [regz, arquitetura, banco, cloud, multitenant]
---

# 🌐 Multi-Tenancy & Roteamento Multi-Banco

O **Regz** opera em modelo **híbrido multi-tenant**, combinando um banco central institucional com bancos dedicados opcionais por empresa cliente.

---

## 🧠 Como Funciona o Roteamento Dinâmico
1. **Banco Central (`pool`):** mantém sempre `empresas`, `usuarios`, `chaves_licenca`, `logs_auditoria`, `relatorios_salvos` e os dados operacionais das empresas sem banco dedicado.
2. **Gerenciador `getPoolForEmpresa(empresaId)`:**
   - Consulta `db_tipo`, `db_uri`, `db_host`, `db_port`, `db_user`, `db_pass` e `db_name` da empresa.
   - Se a empresa possuir PostgreSQL próprio (via `db_uri` cloud ou `db_host` remoto), cria um `pg.Pool` com SSL automático (`resolvePgSslConfig`), normaliza `sslmode` (`normalizePgConnectionString`), anexa `tenantPool.on('error')`, executa `initTenantDb()` (criando `perfis_acesso`, `cargos`, `colaboradores`, `campos_customizados` com `ativo` e `colaboradores_valores_customizados`) e armazena o pool em `tenantPoolsMap`.
3. **Invalidação de Cache (`closeTenantPool`):**
   - Ao editar (`PUT /api/empresas/:id`) ou excluir (`DELETE /api/empresas/:id`) uma empresa no Super Admin, o pool em cache é encerrado imediatamente para aplicar novas credenciais online sem reiniciar o servidor.

---

## 🔌 Testador & Provisionador Multi-Banco (`POST /api/empresas/test-db`)

| Motor | Driver | Suporte Cloud 24/7 Implementado |
| :--- | :---: | :--- |
| **PostgreSQL** | `pg` | `db_uri` (`postgresql://...`) ou host remoto com SSL automático + `normalizePgConnectionString` + fallback gracioso sem superuser `CREATE DATABASE` |
| **MySQL / MariaDB** | `mysql2` | `db_uri` (`mysql://...`) ou host/porta + `ssl: { rejectUnauthorized: false }` automático para Aiven / TiDB / RDS |
| **MongoDB** | `mongodb` | `mongodb+srv://...` (MongoDB Atlas) com extração automática do banco da URI, ping e coleção `usuarios` |
| **Microsoft SQL Server** | `mssql` | `db_uri` (`mssql://...`) ou host/porta + `new sql.ConnectionPool()` isolado + `encrypt: true` automático para Azure SQL / RDS |

---

## 🔗 Conexões no Grafo
- [[01 - Módulos do Portal (Produto)/Portal Super Admin Multi-Tenant|👑 Portal Super Admin]]
- [[02 - Arquitetura & Engenharia/Modelagem do Banco de Dados (PostgreSQL)|🗄️ Modelagem PostgreSQL]]
- [[04 - Infraestrutura, Cloud 24-7 & Deploy/Arquitetura Cloud 24-7 (Render + Supabase)|☁️ Arquitetura Cloud 24/7]]
- [[05 - Roadmap & DevLog/Roadmap & Próximas Features|🚀 Roadmap (Criptografia AES-256-GCM)]]
