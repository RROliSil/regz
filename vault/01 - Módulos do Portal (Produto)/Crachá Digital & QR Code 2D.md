---
aliases: [Crachá, QR Code, Crachá Digital]
tags: [regz, produto, frontend, qrcode]
---

# 🪪 Crachá Digital & QR Code 2D

**Implementação:** `frontend/src/pages/Colaboradores.tsx` • **Biblioteca:** `qrcode.react` (`QRCodeSVG`)

Funcionalidade de emissão instantânea de identificação corporativa digital para cada colaborador ativo ou inativo.

---

## ⚙️ Características Técnicas
- **Vetorização 2D:** renderiza o QR Code em SVG nítido (`QRCodeSVG`) com dados cadastrais do colaborador (avatar/foto, nome, CPF, cargo, registro e status).
- **Modal em Primeiro Plano:** exibido como pop-up centralizado (`position: fixed`, `z-index: 999999`) com fundo desfocado (`.modal-backdrop`), botão circular `.btn-close` padronizado e fechamento nativo via tecla `ESC`.
- **Exportação para PNG (Client-Side):** serializa o elemento SVG (`XMLSerializer`), desenha em um `HTMLCanvasElement` com margem branca (`+40px`) e dispara download direto de `qrcode_regz_<nome>.png` sem depender do backend.
- **Impressão Direta:** ação *"Imprimir Crachá"* com estilo primário (`btn-primary`) compatível com os 3 temas visuais.

---

## 🔗 Conexões no Grafo
- [[01 - Módulos do Portal (Produto)/Portal de Colaboradores (CRUD & Geolocation)|🧑‍💼 Portal de Colaboradores]]
- [[03 - Design System, UX & Acessibilidade/Temas Visuais & Padrão de Interface|🎨 Temas & Interface]]
- [[02 - Arquitetura & Engenharia/Arquitetura Geral & Stack Tecnológica|🧱 Arquitetura & Stack]]
