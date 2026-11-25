---
aliases: [Home, Dashboard Executivo, Indicadores, KPIs]
tags: [regz, produto, frontend, dashboard]
---

# 📊 Dashboard Executivo (Home)

**Arquivo principal:** `frontend/src/pages/Home.tsx` • **Rota:** `/home`

Painel executivo em tempo real que consolida indicadores de quadro de pessoal, distribuição de cargos e presença geográfica da empresa autenticada.

---

## 🧩 Componentes & Funcionalidades
- **Cabeçalho com Atalho de Acessibilidade:** título *"Painel de Gestão & Indicadores"* acompanhado na mesma linha pelo botão `PersonStanding` que abre a [[03 - Design System, UX & Acessibilidade/Central de Acessibilidade Visual & TTS|Central de Acessibilidade Visual]] (também acionável via `Alt + A`).
- **Card de Total de Colaboradores:**
  - Contadores em tempo real de **Total**, **Ativos** e **Inativos**.
  - Badges clicáveis que navegam para `/colaboradores` já com a sub-aba (`ativos` ou `inativos`) filtrada via `location.state`.
  - Botão de atalho `+ Novo Colaborador` que abre diretamente o modal de cadastro com retorno automático (`returnToHome: true`).
- **Ranking de Cargos (Apenas Ativos):** ordenação decrescente de ocupações CBO com expansão dinâmica (*Ver todos* vs top 5).
- **Distribuição Geográfica Interativa (Cidades vs Estados):**
  - Alternância instantânea entre agrupamento por **Cidade - UF** e por **Estado (UF)**.
  - Preferência persistida em `localStorage` (`regz_home_geo_mode`).
- **Últimos 5 Colaboradores Cadastrados:** acesso rápido para inspeção/edição direta.

---

## 🔗 Conexões no Grafo
- [[01 - Módulos do Portal (Produto)/Portal de Colaboradores (CRUD & Geolocation)|🧑‍💼 Portal de Colaboradores]]
- [[03 - Design System, UX & Acessibilidade/Central de Acessibilidade Visual & TTS|♿ Central de Acessibilidade & TTS]]
- [[02 - Arquitetura & Engenharia/Armazenamento Local (LocalStorage) & PWA|💾 LocalStorage & PWA]]
- [[01 - Módulos do Portal (Produto)/Central de Relatórios, PDF Vetorial & Excel|📄 Central de Relatórios]]
