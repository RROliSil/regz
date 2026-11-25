---
aliases: [Regras de Negócio, Regras Gerais, Governança]
tags: [regz, meta, regras, governanca]
---

# 📋 Regras de Negócio Gerais — Regz App

Síntese das regras perpétuas que regem o comportamento da plataforma (documentadas em detalhe também em `ESTRUTURA_E_REGRAS_DO_SISTEMA.txt`).

---

## 🏛️ Regras Críticas de Domínio
1. **Sem Auto-Registro Público:** contas de usuário são criadas exclusivamente pelo **Super Admin** dentro do card da empresa cliente (`/superadmrgz`), sempre vinculadas a uma chave de licença Master avulsa disponível.
2. **Isolamento Multi-Tenant Estrito (`empresa_id`):** toda consulta e mutação em colaboradores, perfis RBAC, campos customizados e relatórios é filtrada pelo `empresa_id` autenticado (`Authorization: Bearer <token>` + `x-empresa-id`).
3. **Validação Estrita CBO (MTE/eSocial):** é proibido cadastrar colaboradores com cargos arbitrários fora da base oficial CBO. Sinônimos de mercado são resolvidos automaticamente para o título canônico oficial no Frontend e no Backend (`HTTP 400` se inválido).
4. **Soft Delete Preservando Histórico:**
   - **Colaboradores:** inativação/reativação via sub-abas Ativos e Inativados.
   - **Campos Personalizados:** campos inativados somem de novos cadastros e validações, mas preservam 100% dos valores históricos em relatórios e exportações.
5. **Licenciamento & Modo Somente Leitura:** usuários comuns e admins de empresas exigem licença ativa (`Enterprise` ou `Trial`). Quando a licença expira (`data_expiracao < CURRENT_TIMESTAMP`), o status muda automaticamente para `Expirada` (`syncDatabaseLicenses`) e o usuário entra em **Modo Somente Leitura**. Apenas a conta Super Admin é isenta de licença.
6. **Validade de Senha (30 Dias):** controlada por `usuarios.senha_atualizada_em`, com renovação disponível no painel administrativo.
7. **Proteção contra Exclusão Acidental:** exclusão de empresa no Super Admin exige digitar explicitamente `"SIM"`.

---

## 🎨 Regras Perpétuas de UI & Engenharia
- **Modificação Direta sem Remendos:** nunca criar scripts de patch temporários; corrigir sempre os arquivos originais e validar `npm run build` no backend e frontend antes do push.
- **Padrão Universal de Scrollbars:** `color-scheme` na raiz, remoção absoluta de setas nativas (`::-webkit-scrollbar-button`), barras verticais `8px` e horizontais `4px` nos 3 temas.
- **Portal Super Admin (`/superadmrgz`):** funciona permanentemente no **Modo Padrão (Deep Indigo Glassmorphism)** independente do tema escolhido na tela de login.
- **Fechamento Seguro de Modais:** suporte global à tecla `ESC`, botão `.btn-close` padronizado e proteção contra fechamento acidental fora do modal na matriz RBAC.

---

## 🔗 Conexões no Grafo
- [[00 - Meta & Visão Geral/Visão do Produto (Regz)|🏢 Visão do Produto]]
- [[01 - Módulos do Portal (Produto)/Validação CBO & eSocial|🏷️ Validação CBO & eSocial]]
- [[01 - Módulos do Portal (Produto)/Administração, RBAC & Licenciamento|🛡️ Administração, RBAC & Licenciamento]]
- [[01 - Módulos do Portal (Produto)/Portal Super Admin Multi-Tenant|👑 Portal Super Admin]]
- [[03 - Design System, UX & Acessibilidade/Temas Visuais & Padrão de Interface|🎨 Temas & Interface]]
