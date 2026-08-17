# Regra de Versionamento Incremental com Horário (HH:mm - v7.0.X)

Sempre que realizar qualquer alteração, correção, refatoração ou melhoria no código deste projeto:

1. Registre o horário atual e incremente a versão no formato `HH:mm - v7.0.X` (ex: `18:27 - v7.0.2`).
2. Atualize o campo `"versionSystem"` no arquivo `frontend/package.json`.
3. Atualize a resposta do endpoint `/version` no backend (`backend/src/controllers/VersionController.ts`).
4. Inclua a tag de versão `[HH:mm - v7.0.X]` no título do commit do Git.
5. Exiba o horário e a versão no menu/layout do frontend para confirmação visual do usuário após atualização na VPS.
