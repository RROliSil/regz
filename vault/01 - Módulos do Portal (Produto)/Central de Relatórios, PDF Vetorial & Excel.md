---
aliases: [Relatórios, PDF Vetorial, Exportação Excel, Meus Relatórios]
tags: [regz, produto, frontend, relatorios, pdf]
---

# 📄 Central de Relatórios, PDF Vetorial & Excel

**Arquivo principal:** `frontend/src/pages/Relatorios.tsx` • **Rota:** `/relatorios` • **Libs:** `jspdf`, `jspdf-autotable`

Módulo analítico corporativo com construtor visual livre de colunas, modelos salvos, geração de PDF vetorial nativo e exportação Excel.

---

## 📊 Modos de Visualização
1. **Construtor Livre de Colunas (`construtor`):** chips interativos abertos na tela combinando colunas cadastrais (`ID`, `Foto`, `Nome`, `CPF`, `Cargo`, `E-mail`, `Telefone`, `CBO`, `Endereço`, `Cidade/UF`, `Data`, `Status`) e todos os campos dinâmicos ativos da empresa.
2. **Distribuição Geográfica (`geo`):** consolidado por Estado e Cidade (`ativos`, `inativos`, `total`, `percentual`).
3. **Usuários & Perfis RBAC (`rbac`):** quadro geral de acessos, perfis, tipo e status.

---

## ⭐ Meus Relatórios (Modelos Salvos em `JSONB`)
- Persistidos na tabela `relatorios_salvos` (`GET/POST/DELETE /api/relatorios-salvos`), salvando exatamente `modo`, `colunas JSONB` e `filtros JSONB`.
- **4 Modelos Padrão Semeados:** *Quadro Geral de Ativos*, *Relatório de Contatos & E-mails*, *Visão Geral por Estado e Cidade* e *Quadro Geral de Acessos & Perfis*.

---

## 🖨️ PDF Vetorial Nativo & Exportação Excel (CSV)
- **Modal Integrado de Pré-Visualização (`94vw × 92vh`):** renderiza o PDF vetorial real dentro da própria tela (sem abrir pop-ups ou novas abas), com alternância em tempo real entre **Retrato** e **Paisagem** (`regz_relatorio_pdf_orientation`), download `.pdf` sob demanda e impressão direta do frame.
- **Identidade Executiva na Folha:** logotipo oficial 3D (`/logo.png`), cabeçalho *"REGZ GESTÃO DE PESSOAS"*, tabela zebrada com texto preto `#000000`, tags coloridas (`✓ Sim / Ativo` em `#059669` e `✗ Não / Inativo` em `#dc2626` via `print-color-adjust: exact`) e paginação no rodapé.
- **Excel CSV UTF-8 com BOM (`\uFEFF`):** abre no Microsoft Excel preservando acentos brasileiros e respeitando rigorosamente as colunas e filtros selecionados.
- **Ergonomia de Tabela:** cabeçalho fixo (`.table-sticky-wrapper`), ordenação crescente/decrescente clicando na coluna e redimensionamento manual persistido em `regz_relatorios_column_widths`.

---

## 🔗 Conexões no Grafo
- [[01 - Módulos do Portal (Produto)/Portal de Colaboradores (CRUD & Geolocation)|🧑‍💼 Portal de Colaboradores]]
- [[01 - Módulos do Portal (Produto)/Validação CBO & eSocial|🏷️ Validação CBO & eSocial]]
- [[01 - Módulos do Portal (Produto)/Campos Dinâmicos Customizados (EAV)|🧩 Campos Dinâmicos (EAV)]]
- [[02 - Arquitetura & Engenharia/Modelagem do Banco de Dados (PostgreSQL)|🗄️ Modelagem PostgreSQL]]
- [[03 - Design System, UX & Acessibilidade/Temas Visuais & Padrão de Interface|🎨 Temas & Interface]]
