---
aliases: [Acessibilidade, A11y, TTS, Baixa Visão, Síntese de Voz]
tags: [regz, frontend, ux, acessibilidade]
---

# ♿ Central de Acessibilidade Visual & TTS

**Arquivos principais:** `frontend/src/components/AccessibilityModal.tsx`, `frontend/src/context/AccessibilityContext.tsx`

Módulo dedicado de inclusão digital para usuários com baixa visão ou necessidade de leitura assistida, acessível em 1 clique ao lado do título da Home ou pelo atalho global **`Alt + A`**.

---

## 🛠️ Recursos Implementados
- **Escala Tipográfica Dinâmica:** 4 níveis em tempo real aplicados globalmente sem quebrar ícones ou layouts:
  - `Padrão` (`100%`) • `Médio` (`115%`) • `Grande` (`130%`) • `Extra` (`145%`)
- **Realce de Foco Luminoso:** anel de foco de `3.5px` para navegação por teclado.
- **Áreas de Clique & Ícones Ampliados:** preserva integralmente a visibilidade de todos os ícones SVG no zoom sem esmagamento.
- **Simulador de Pré-Visualização em Tempo Real:** permite testar o ajuste visual dentro do próprio modal (`95vw × 92vh`) antes de confirmar.
- **Síntese de Voz Nativa (TTS `pt-BR`):** usa a `window.speechSynthesis` (`SpeechSynthesisUtterance` em `pt-BR`) com demonstração interativa de leitura de ficha de colaborador.
- **Decisão Histórica:** o antigo modo "Alto Contraste Puro" foi removido no commit `b5897d6` em favor da harmonia entre os 3 temas oficiais + escala de zoom e foco realçado.

---

## 🔗 Conexões no Grafo
- [[01 - Módulos do Portal (Produto)/Dashboard Executivo (Home)|📊 Dashboard Home]]
- [[03 - Design System, UX & Acessibilidade/Temas Visuais & Padrão de Interface|🎨 Temas & Interface]]
- [[00 - Meta & Visão Geral/Visão do Produto (Regz)|🏢 Visão do Produto]]
