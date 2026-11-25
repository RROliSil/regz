---
aliases: [Visão, Conceito, Identidade, Visão do Produto]
tags: [regz, meta, produto, visao]
---

# 🏢 Visão do Produto — Regz App

> **Nome Oficial:** Regz — Gestão de Pessoas & Portal de Colaboradores  
> **Modelo:** SaaS Multi-Tenant Corporativo (Web App + PWA)  
> **Ambiente de Produção (24/7):** `https://regz-app.onrender.com/Regz`  
> **Repositório:** `https://github.com/RROliSil/regz`  
> **Mantra:** *"Gestão de pessoas completa, extensível, acessível e 100% online — com isolamento por empresa e autonomia multi-banco."*

---

## 🎯 Conceito Central
O **Regz** foi concebido para eliminar planilhas dispersas e sistemas rígidos de RH, oferecendo em uma única plataforma web moderna:
1. **Cadastro Inteligente & Validado:** colaboradores com validação de CPF, preenchimento de endereço via ViaCEP, geolocalização GPS precisa (Nominatim + Google Maps), fotos ultraleves e conformidade estrita com a tabela oficial **CBO (MTE/eSocial)**.
2. **Extensibilidade Sem Alterar Schema:** cada empresa cria seus próprios campos dinâmicos (EAV) e monta relatórios sob medida com geração de PDF vetorial nativo e planilhas Excel CSV.
3. **Governança Multi-Tenant & Multi-Banco:** controle granular de permissões (RBAC), chaves de licença Master, trilha imutável de auditoria e suporte a bancos dedicados na nuvem (PostgreSQL, MySQL, MongoDB, SQL Server).

---

## 🌟 Pilares de Engenharia
- **1. Cloud-Native 24/7:** container Docker unificado (React + Express) conectado via SSL/TLS ao PostgreSQL gerenciado na nuvem (Supabase `sa-east-1`), operando sem depender de servidor local ou túneis manuais.
- **2. Acessibilidade & Design System:** 3 temas visuais completos (Padrão Deep Indigo Glassmorphism, Claro e Escuro), scrollbars padronizadas e Central de Acessibilidade Visual (`Alt + A`) com síntese de voz (`TTS pt-BR`).
- **3. Documentação Viva:** sincronia contínua entre código, `ESTRUTURA_E_REGRAS_DO_SISTEMA.txt`, `README.md`/`README.en.md`, `DEVLOG.md` e este Segundo Cérebro Obsidian (`vault/`).

---

## 🔗 Conexões no Grafo
- [[🏠 Dashboard|🏠 Dashboard Principal]]
- [[00 - Meta & Visão Geral/Regras de Negócio Gerais|📋 Regras de Negócio Gerais]]
- [[00 - Meta & Visão Geral/Evolução do Projeto (Local Docker para Cloud 24-7)|🔄 Evolução: Docker Local → Cloud 24/7]]
- [[02 - Arquitetura & Engenharia/Arquitetura Geral & Stack Tecnológica|🧱 Arquitetura Geral & Stack]]
- [[04 - Infraestrutura, Cloud 24-7 & Deploy/Arquitetura Cloud 24-7 (Render + Supabase)|☁️ Arquitetura Cloud 24/7]]
