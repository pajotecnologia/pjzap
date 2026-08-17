# Regra de Versionamento Incremental por Melhorias Reais (HH:mm - v7.0.X)

## 📌 Diretriz Estrita de Versionamento:
**Incremente a versão `HH:mm - v7.0.X` SOMENTE quando forem implementadas MELHORIAS REAIS, novos recursos ou evoluções significativas de código no projeto.** Não incremente para pequenas correções superficiais, ajustes de digitação ou testes intermediários.

---

## 🛠️ Procedimento Quando Houver Melhoria Real:

1. Registre o horário atual e incremente a versão no formato `HH:mm - v7.0.X` (ex: `20:57 - v7.0.11`).
2. Atualize o campo `"versionSystem"` no arquivo `frontend/package.json`.
3. Atualize a resposta do endpoint `/version` no backend (`backend/src/controllers/VersionController.ts`).
4. **OBRIGATÓRIO:** Atualize o **Menu Ajuda** ([`frontend/src/pages/Helps/index.js`](file:///c:/Users/AdminUser/Documentos/PROJETOS_SISTEMAS/Whaticket_AFcode/frontend/src/pages/Helps/index.js)) e o **LogLauncher** adicionando a nova versão na lista `CHANGELOG_ITEMS` com o resumo da melhoria.
5. Inclua a tag de versão `[HH:mm - v7.0.X]` no título do commit do Git.
6. Exiba o horário e a versão no menu lateral e na Central de Ajuda do frontend.
