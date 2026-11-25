---
aliases: [Temas, Design System, Scrollbars, Interface, UX]
tags: [regz, frontend, design-system, ux]
---

# 🎨 Temas Visuais & Padrão de Interface

**Arquivos principais:** `frontend/src/context/ThemeContext.tsx`, `frontend/src/context/SnackbarContext.tsx`, `frontend/src/index.css`

O Design System do **Regz** é construído em CSS customizado com tokens semânticos (`var(--bg-gradient)`, `var(--card-bg)`, `var(--text-main)`, `var(--card-border)`), garantindo identidade visual consistente em todos os módulos.

---

## 🌓 Os 3 Temas Oficiais
1. **Modo Padrão (`data-theme="padrao"`):** Deep Indigo Glassmorphism (`#1e1b4b` / `#0f172a` / `#020617`), acento índigo `#6366f1`, ícone `Palette`. Tema obrigatório e travado no [[01 - Módulos do Portal (Produto)/Portal Super Admin Multi-Tenant|Portal Super Admin]].
2. **Modo Claro (`data-theme="light"`):** fundo `#f8fafc` / `#e2e8f0`, cartões brancos `#ffffff`, bordas `#cbd5e1`/`#868a93`, texto `#0f172a`, ícone `Sun`.
3. **Modo Escuro (`data-theme="dark"`):** monocromático neutro `#121214` / `#141416` / `#1b1b1f`, textos `#f4f4f5`, sem tons azulados nos relatórios, ícone `Moon`.

---

## 📐 Regras Visuais Perpétuas
- **Padrão Universal de Barras de Rolagem:** `color-scheme` na raiz `<html>`, remoção total de setas nativas (`::-webkit-scrollbar-button`), `scrollbar-width: thin`, barras verticais **8px** e horizontais **4px**:
  - Padrão: thumb `#334155`, track `#020617`
  - Dark: thumb `#3f3f46`, track `#09090b`
  - Claro: thumb `#cbd5e1`, track `#f8fafc`
- **Checkboxes Padronizados:** rigorosamente quadrados (`17px × 17px`, `padding: 0`) com preenchimento roxo `#6366f1` e checkmark branco em todo o webapp.
- **Blindagem contra Autofill do Navegador:** neutraliza `:-webkit-autofill` e `:-internal-autofill-previewed` preservando cores do tema, além de `autoComplete="off"` e `data-lpignore="true"` em formulários corporativos.
- **Feedback Global (`SnackbarContext`):** notificações flutuantes Glassmorphism no canto inferior direito (`2,5s`, ocultas na impressão `@media print`).
- **Botão Fechar Modais (`.btn-close`):** circular vermelho translúcido (`#fb7185`) com rotação de 90° no hover + suporte à tecla `ESC`.
- **Layout 100% Fluido & Responsivo (360px → 2560px+):** `.page-content` sem limite rígido de `1200px` (`width: 100%; max-width: 100%` com paddings e tipografia `clamp()`), `.custom-table` expandindo em toda a largura disponível em monitores largos (evitando cortes na coluna `Ações`) e Sidebar convertida automaticamente em Drawer Off-Canvas (`<= 960px`) com `.mobile-topbar` e backdrop.

---

## 🔗 Conexões no Grafo
- [[03 - Design System, UX & Acessibilidade/Central de Acessibilidade Visual & TTS|♿ Central de Acessibilidade & TTS]]
- [[00 - Meta & Visão Geral/Regras de Negócio Gerais|📋 Regras de Negócio]]
- [[02 - Arquitetura & Engenharia/Armazenamento Local (LocalStorage) & PWA|💾 LocalStorage & PWA]]
- [[01 - Módulos do Portal (Produto)/Central de Relatórios, PDF Vetorial & Excel|📄 Central de Relatórios]]
