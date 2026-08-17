# Regra Permanente de Deploy & Compilação na VPS Ubuntu

## 🏗️ Arquitetura Específica do Servidor do Usuário:

1. **Diretório Principal do Projeto na VPS:** `/home/deploy/whaticket`
2. **Processo Backend no PM2:** `whaticket-backend`
3. **Arquitetura Frontend:** O frontend **NÃO RODA NO PM2**. Ele é servido **estaticamente pelo Nginx** diretamente da pasta `frontend/build`.

---

## 🚀 Protocolo Padrão de Comandos de Atualização para o Usuário:

Sempre que for necessário fornecer os comandos de atualização/build para a VPS do usuário, utilize EXATAMENTE a sequência abaixo:

```bash
cd /home/deploy/whaticket

# 1. Resetar e puxar o código atualizado do GitHub
git fetch origin main
git reset --hard origin/main

# 2. Compilar o Backend e reiniciar no PM2
cd backend
npm run build
pm2 restart whaticket-backend

# 3. Compilar o Frontend (Gera os arquivos estáticos na pasta build)
cd ../frontend
npm run build

# 4. Recarregar o Nginx para atualizar os estáticos servidos no navegador
sudo systemctl reload nginx
```

---

## ⚠️ Regras Técnicas de Compilação:

1. **Evitar Erro de Memória no Build (`react-scripts build`):**
   O script de build no `frontend/package.json` DEVE obrigatoriamente manter `NODE_OPTIONS=--max-old-space-size=4096` para prevenir estouro de memória (Heap limit allocation failed) durante a compilação do Webpack no Ubuntu.

2. **Prevenção de Cache de HTML:**
   O arquivo `frontend/server.js` deve manter os cabeçalhos de resposta `Cache-Control: no-cache, no-store, must-revalidate` para garantir que o navegador recarregue o `index.html` compilado.
