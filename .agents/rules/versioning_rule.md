# Regra de Versionamento Incremental com Horário & Menu Ajuda (HH:mm - v7.0.X)

Sempre que realizar qualquer alteração, correção, refatoração ou melhoria no código deste projeto:

1. Registre o horário atual e incremente a versão no formato `HH:mm - v7.0.X` (ex: `18:53 - v7.0.3`).
2. Atualize o campo `"versionSystem"` no arquivo `frontend/package.json`.
3. Atualize a resposta do endpoint `/version` no backend (`backend/src/controllers/VersionController.ts`).
4. **OBRIGATÓRIO:** Atualize o **Menu Ajuda** ([`frontend/src/pages/Helps/index.js`](file:///c:/Users/AdminUser/Documentos/PROJETOS_SISTEMAS/Whaticket_AFcode/frontend/src/pages/Helps/index.js)) adicionando a versão na lista `CHANGELOG_ITEMS` com o resumo de tudo o que foi alterado.
5. Inclua a tag de versão `[HH:mm - v7.0.X]` no título do commit do Git.
6. Exiba o horário e a versão no menu lateral e na Central de Ajuda do frontend para confirmação visual imediata do usuário após rodar a atualização na VPS.
