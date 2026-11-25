---
aliases: [Colaboradores, Portal de Colaboradores, CRUD, Geolocation]
tags: [regz, produto, frontend, colaboradores]
---

# 🧑‍💼 Portal de Colaboradores (CRUD & Geolocation)

**Arquivo principal:** `frontend/src/pages/Colaboradores.tsx` • **Rota:** `/colaboradores`

Módulo central de operação de RH para cadastro, consulta, geolocalização, identificação digital e gestão de ciclo de vida dos colaboradores.

---

## ⚙️ Funcionalidades Principais
1. **Gestão de Ciclo de Vida (Soft Delete):**
   - Sub-abas **Colaboradores Ativos** e **Inativados**, com reativação imediata preservando histórico e valores customizados.
   - Ações padronizadas em ícones compactos (`195px` na coluna Ações, sem cortes): **QR Code**, **Google Maps**, **Inativar/Reativar** e edição.
2. **Cadastro Inteligente & Validações:**
   - **CPF:** máscara `000.000.000-00` e validação de unicidade no PostgreSQL.
   - **Cargo/Função:** integrado à [[01 - Módulos do Portal (Produto)/Validação CBO & eSocial|Validação Estrita CBO]] com busca por sinônimos.
   - **CEP & Endereço:** integração automática com **ViaCEP** (`https://viacep.com.br/ws/{cep}/json/`).
   - **Geocodificação GPS de Alta Precisão:** endpoint `/api/geocode` consulta **OpenStreetMap Nominatim** em cascata de 3 níveis (Logradouro+Número → Logradouro → CEP) salvando `latitude` e `longitude` (`NUMERIC(10,8)`/`NUMERIC(11,8)`) para abertura direta no **Google Maps**.
   - **Campos Customizados Dinâmicos:** renderização automática apenas dos campos ativos da empresa (campos inativos ficam 100% ocultos).
   - **Gerador de Dados de Teste:** botão conectado a `GET /api/gerar-pessoa` gerando nomes, endereços e CPFs matematicamente válidos.
3. **Fotos Ultraleves & Lightbox:**
   - Upload com compressão client-side via **HTML5 Canvas** para **Base64 (~25KB)** otimizando tráfego e banco.
   - Visualizador **Lightbox** ampliado (`até 850px / 86vh`) com botão `.btn-close` padronizado.
4. **Tabela Corporativa Customizável:**
   - Busca normalizada sem acentos (`normalizeText`) por Nome, CPF, Cargo, Cidade, UF ou **nome completo do Estado**.
   - Seletor de colunas visíveis (`regz_visible_columns`), **alças arrastáveis de redimensionamento** (`regz_column_widths`) e paginação configurável (`regz_page_size`).

---

## 🔗 Conexões no Grafo
- [[01 - Módulos do Portal (Produto)/Validação CBO & eSocial|🏷️ Validação CBO & eSocial]]
- [[01 - Módulos do Portal (Produto)/Crachá Digital & QR Code 2D|🪪 Crachá Digital & QR Code 2D]]
- [[01 - Módulos do Portal (Produto)/Campos Dinâmicos Customizados (EAV)|🧩 Campos Dinâmicos (EAV)]]
- [[01 - Módulos do Portal (Produto)/Central de Relatórios, PDF Vetorial & Excel|📄 Central de Relatórios]]
- [[02 - Arquitetura & Engenharia/API REST & Catálogo de Endpoints|🔌 API REST]]
