---
aliases: [LocalStorage, PWA, Service Worker, Open Graph]
tags: [regz, arquitetura, frontend, pwa, localstorage]
---

# 💾 Armazenamento Local (LocalStorage) & PWA

Mapeamento das preferências persistidas no navegador do usuário e dos recursos de Progressive Web App (PWA) e SEO social do **Regz**.

---

## 🗄️ Dicionário Completo de Chaves (`localStorage`)

| Chave | Módulo | Conteúdo / Finalidade |
| :--- | :--- | :--- |
| `regz_token` | `AuthContext.tsx` | Token Bearer JWT da sessão autenticada |
| `regz_theme` | `ThemeContext.tsx` | Tema ativo (`'padrao'`, `'light'` ou `'dark'`) |
| `regz_remember_email_enabled` | `Login.tsx` | Flag booleana da opção *"Lembrar meu e-mail"* |
| `regz_remembered_email` | `Login.tsx` | Último e-mail salvo na tela de login |
| `regz_sidebar_collapsed` | `App.tsx` | Estado recolhido/expandido da barra lateral |
| `regz_home_geo_mode` | `Home.tsx` | Modo do gráfico geográfico (`'cidades'` ou `'estados'`) |
| `regz_page_size` | `Colaboradores.tsx` | Quantidade de itens por página (`5`, `10`, `25`, `'todos'`) |
| `regz_visible_columns` | `Colaboradores.tsx` | Mapa JSON de colunas visíveis na tabela de colaboradores |
| `regz_column_widths` | `Colaboradores.tsx` | Larguras personalizadas (px) das colunas redimensionáveis |
| `regz_campos_column_widths_<id>` | `Campos.tsx` | Larguras das colunas do modal de campos customizados por usuário |
| `regz_relatorios_column_widths` | `Relatorios.tsx` | Larguras das colunas redimensionáveis nos relatórios e impressão A4 |
| `regz_relatorio_pdf_orientation` | `Relatorios.tsx` | Orientação salva do PDF (`'portrait'` ou `'landscape'`) |
| `regz_licenca_column_widths` | `Administracao.tsx` | Larguras das colunas da tabela de chaves de licença |

---

## 📱 PWA & Open Graph Dinâmico
- **Manifest (`frontend/public/manifest.json`):** `name: "Regz - Gestão de Pessoas"`, `display: "standalone"`, `theme_color: "#6366f1"`, `background_color: "#020617"`, ícones `32x32`, `192x192` e `512x512` (`maskable`).
- **Service Worker (`frontend/public/sw.js`):** registrado automaticamente em `frontend/src/main.tsx` para cache de assets estáticos.
- **Open Graph & Twitter Cards Dinâmicos:** o Express (`app.get('*')`) lê `index.html` e injeta dinamicamente URLs absolutas (`APP_URL` ou `proto://host`) em `og:image` (`/logo.png`) e `og:url`, garantindo miniatura perfeita no WhatsApp, LinkedIn, Slack e Discord.

---

## 🔗 Conexões no Grafo
- [[03 - Design System, UX & Acessibilidade/Temas Visuais & Padrão de Interface|🎨 Temas & Interface]]
- [[01 - Módulos do Portal (Produto)/Dashboard Executivo (Home)|📊 Dashboard Home]]
- [[01 - Módulos do Portal (Produto)/Portal de Colaboradores (CRUD & Geolocation)|🧑‍💼 Portal de Colaboradores]]
- [[01 - Módulos do Portal (Produto)/Central de Relatórios, PDF Vetorial & Excel|📄 Central de Relatórios]]
