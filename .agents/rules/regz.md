---
trigger: always_on
---

- Ao final, sempre dê 2 sugestões para o projeto.
- Sempre mostrar o implementation plan (como artefato `.md` com `RequestFeedback: true`) e perguntar se está aprovado para prosseguir.
- Sempre manter sincronizados o Segundo Cérebro Obsidian (`vault/`), `DEVLOG.md` e `ESTRUTURA_E_REGRAS_DO_SISTEMA.txt` ao implementar novas funcionalidades, tabelas, rotas ou mudanças arquiteturais.
- Nunca gravar senhas, tokens, chaves JWT ou `DATABASE_URL` com credenciais reais em nenhum arquivo do repositório (incluindo `vault/`, `README.md`, `docker-compose.yml` e `DEVLOG.md`).
- Antes de commitar alterações de código no backend ou frontend, sempre validar `npm run build` em ambos os pacotes garantindo 0 erros de TypeScript/Vite.
- Usar Conventional Commits com o autor oficial `RROliSil` (`rrolisilvag@gmail.com`) ao enviar alterações para `origin main` (o deploy na Render é automático a cada push em `main`).
