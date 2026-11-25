---
aliases: [Backlog, Ideias, Futuro]
tags: [regz, meta, roadmap, backlog]
---

# 💡 Backlog de Ideias — Regz App

Banco vivo de ideias para futuras versões da plataforma **Regz**.

---

## 🧩 Novos Módulos de Produto
- **Módulo Departamentos & Organograma:** gestão hierárquica de setores, centros de custo e gestores diretos (já previsto na lista `SYSTEM_MODULES` da matriz RBAC).
- **Importação em Massa (CSV / XLSX):** wizard com validação de CPF e mapeamento automático de cargos CBO para onboarding rápido de novas empresas clientes.
- **Mapa Interativo de Colaboradores (Leaflet / Mapbox):** visualizar todos os pins georreferenciados da empresa em um mapa clicável diretamente no Dashboard `/home`.
- **Histórico de Alterações por Colaborador (Timeline):** linha do tempo de promoções de cargo CBO, mudanças de endereço e inativações/reativações.

---

## ☁️ Evoluções de Arquitetura & Escalabilidade
- **Object Storage Externo (Cloudflare R2 / Supabase Storage):** migrar fotos de colaboradores e logos de empresas de Base64 no PostgreSQL para URLs assinadas/CDN, economizando cota de banco e acelerando queries.
- **Execução Operacional Nativa em MySQL / MongoDB / SQL Server:** expandir o `getPoolForEmpresa()` (hoje operacional em PostgreSQL e com testador/provisionador para os 4 motores) através de uma camada de repositórios agnóstica (*Adapter Pattern*).
- **Backups Automatizados Diários:** job agendado no GitHub Actions ou nativo cloud gerando dumps `pg_dump` criptografados.
- **Skills Dedicadas do Agente (`.agents/skills/`):** criar skills especializadas em `d:\regz\.agents\skills\` (ex.: `zero-hallucination-coder`, `postgres-multitenant-guard`, `saas-security-audit`), seguindo o ecossistema do Rogue Frog.

---

## 🔗 Conexões no Grafo
- [[05 - Roadmap & DevLog/Roadmap & Próximas Features|🚀 Roadmap Atual]]
- [[00 - Meta & Visão Geral/Visão do Produto (Regz)|🏢 Visão do Produto]]
- [[02 - Arquitetura & Engenharia/Multi-Tenancy & Roteamento Multi-Banco|🌐 Multi-Tenancy & Multi-Banco]]
