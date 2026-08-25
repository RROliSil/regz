# Plano de Implementação: Favicon / Título Dinâmico por Rota e Cache de Assets PWA (Service Worker)

Este plano descreve a implementação das 2 sugestões aprovadas:
1. **Título e Favicon Dinâmicos por Rota**: Atualização dinâmica do `<title>` da aba do navegador para cada módulo do sistema (ex: *"Regz - Gestão de Colaboradores"*, *"Regz - Modelos & Relatórios"*, *"Regz - Portal Super Admin Master"*).
2. **Cache de Assets com Service Worker (PWA)**: Criação do `sw.js` e `manifest.json` para cache inteligente de fontes, CSS, scripts e ícones, acelerando drasticamente o carregamento em redes móveis e permitindo instalação do app no celular/desktop.

---

## 1. O Que Será Feito (Walkthrough Explicativo)

1. **Rastreador de Títulos Dinâmicos (`frontend/src/App.tsx`)**:
   - Componente `RouteTitleTracker` integrado ao roteador `BrowserRouter`.
   - Mapeamento automático de rotas:
     - `/home` -> *"Regz - Home & Indicadores"*
     - `/colaboradores` -> *"Regz - Gestão de Colaboradores"*
     - `/campos` -> *"Regz - Campos Personalizados"*
     - `/relatorios` -> *"Regz - Modelos & Relatórios"*
     - `/administracao` -> *"Regz - Administração & Acessos"*
     - `/configuracoes` -> *"Regz - Configurações do Sistema"*
     - `/superadmrgz` -> *"Regz - Portal Super Admin Master"*
     - `/login`, `/regz`, `/regz/login` -> *"Regz - Acesso ao Sistema"*

2. **Criação do Service Worker PWA (`frontend/public/sw.js`)**:
   - Cache de arquivos estáticos (`.js`, `.css`, fontes do Google Fonts, ícones `.png`, `.svg`, `.ico`).
   - Estratégia Stale-While-Revalidate para UI rápida e Network-First para requisições de API (`/api/*`).

3. **Manifesto Web App (`frontend/public/manifest.json` & `frontend/index.html`)**:
   - Metadados PWA com nome oficial, ícones em alta resolução, cores de tema `#6366f1` e modo `standalone`.

4. **Registro do Service Worker (`frontend/src/main.tsx`)**:
   - Registro resiliente com tratamento de atualizações em segundo plano.

5. **Documentação, Build e Deploy**:
   - Atualização de `ESTRUTURA_E_REGRAS_DO_SISTEMA.txt`.
   - Build com `npm run build` (0 erros).
   - Commit e envio para o GitHub (`main`).

---

## 2. Arquivos Impactados

- [frontend/src/App.tsx](file:///C:/rafaelrafael/ProjetosDev/regz/frontend/src/App.tsx)
- [frontend/src/main.tsx](file:///C:/rafaelrafael/ProjetosDev/regz/frontend/src/main.tsx)
- [frontend/index.html](file:///C:/rafaelrafael/ProjetosDev/regz/frontend/index.html)
- [frontend/public/sw.js](file:///C:/rafaelrafael/ProjetosDev/regz/frontend/public/sw.js)
- [frontend/public/manifest.json](file:///C:/rafaelrafael/ProjetosDev/regz/frontend/public/manifest.json)
- [ESTRUTURA_E_REGRAS_DO_SISTEMA.txt](file:///C:/rafaelrafael/ProjetosDev/regz/ESTRUTURA_E_REGRAS_DO_SISTEMA.txt)

---

## 3. Plano de Verificação

### Testes Automatizados
- Executar `npm run build` no frontend para validar tipos TypeScript e bundling de assets.

### Testes Manuais
- Navegar pelas abas e verificar a alteração instantânea do título da aba no navegador.
- Inspecionar a aba Application > Service Workers / Manifest no Chrome DevTools e validar o cache ativo.
