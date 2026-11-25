---
aliases: [Campos Dinâmicos, Campos Customizados, EAV, Campos Personalizados]
tags: [regz, produto, frontend, arquitetura, eav]
---

# 🧩 Campos Dinâmicos Customizados (EAV)

**Arquivo principal:** `frontend/src/pages/Campos.tsx` • **Rota:** `/campos`

Motor de extensibilidade **Entity-Attribute-Value (EAV)** que permite a cada empresa criar novos atributos de colaborador em tempo de execução sem alterar o schema SQL.

---

## 🛠️ Tipos de Campo & Layout
Organizado em grid simétrico estrito **2×2** (2 cards por linha mesmo com a sidebar recolhida):
1. **Numérico (`numero`):** limites opcionais `min_caracteres` e `max_caracteres` + obrigatoriedade.
2. **Texto (`texto`):** limites opcionais de comprimento mínimo/máximo + obrigatoriedade.
3. **Seleção Dropdown (`selecao`):** lista de opções separadas por vírgula armazenada em `opcoes TEXT`.
4. **Alternativa Booleana (`booleano` / `alternativa`):** opções estruturadas *Sim / Não*.

### Campos Padrão Semeados no Boot
`Setor / Departamento`, `Nome da Mãe`, `Nome do Pai`, `Estado Civil` e `PIS / PASEP`.

---

## 🛡️ Soft Delete & Preservação de Histórico
- **Inativar (`PUT /api/campos-customizados/:id/inativar`) / Reativar (`PUT /api/campos-customizados/:id/reativar`):** protegidos por `checkPermission('campos')` e gravados em `logs_auditoria`.
- Campos inativos são **totalmente omitidos** nos formulários de cadastro/edição de colaboradores e nas novas validações, mas seus valores na tabela `colaboradores_valores_customizados` continuam íntegros para auditoria e relatórios.
- **Modal Expandida de Campos Cadastrados:** ocupa `95vw` (máx. `1450px`) com rolagem horizontal fluida e larguras de coluna redimensionáveis persistidas por usuário (`regz_campos_column_widths_<usuarioId>`).

---

## 🔗 Conexões no Grafo
- [[01 - Módulos do Portal (Produto)/Portal de Colaboradores (CRUD & Geolocation)|🧑‍💼 Portal de Colaboradores]]
- [[01 - Módulos do Portal (Produto)/Central de Relatórios, PDF Vetorial & Excel|📄 Central de Relatórios]]
- [[02 - Arquitetura & Engenharia/Modelagem do Banco de Dados (PostgreSQL)|🗄️ Modelagem PostgreSQL]]
- [[01 - Módulos do Portal (Produto)/Logs de Auditoria & Rastreabilidade|📜 Logs de Auditoria]]
