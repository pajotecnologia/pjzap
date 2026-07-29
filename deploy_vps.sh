#!/bin/bash
# ==============================================================================
# Script de Instalação Automatizada do PJZap / Whaticket para VPS Ubuntu
# Com suporte a usuário dedicado ('deploy'), bibliotecas do Chromium/FFmpeg e Nginx otimizado
# ==============================================================================

set -e

# Cores para saída
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # Sem Cor

echo -e "${CYAN}"
echo "======================================================================"
echo "    🚀 INSTALADOR AUTOMATIZADO - PJZAP / WHATICKET (VPS UBUNTU)     "
echo "======================================================================"
echo -e "${NC}"

# 1. Verificar permissão de root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Erro: Por favor, execute este script como root (sudo ./deploy_vps.sh).${NC}"
  exit 1
fi

# 2. Coleta de Informações Críticas
echo -e "${YELLOW}Por favor, informe os dados necessários para a instalação:${NC}\n"

read -p "1. Domínio do FRONTEND (ex: painel.meudominio.com): " FRONTEND_DOMAIN
read -p "2. Domínio do BACKEND/API (ex: api.meudominio.com): " BACKEND_DOMAIN
read -p "3. E-mail para certificado SSL Let's Encrypt: " SSL_EMAIL
read -p "4. URL do repositório .git (ex: https://github.com/usuario/meurepo.git) [Pressione ENTER se já estiver dentro da pasta]: " GIT_REPO_URL
read -p "5. Nome da Empresa/Sistema [PJZap]: " COMPANY_INPUT
COMPANY_NAME=${COMPANY_INPUT:-PJZap}

# Gerar senhas e chaves JWT automaticamente
DB_PASS=$(openssl rand -hex 12)
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)

echo -e "\n${GREEN} Configurações capturadas com sucesso! Iniciando a instalação automatizada...${NC}\n"
sleep 2

# 3. Criar Usuário 'deploy' se não existir
echo -e "${CYAN}[1/9] Criando/verificando o usuário do sistema 'deploy'...${NC}"
if ! id -u deploy &>/dev/null; then
    useradd -m -s /bin/bash deploy
    usermod -aG sudo deploy
    echo "deploy ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers.d/deploy
    echo -e "${GREEN}Usuário 'deploy' criado com sucesso.${NC}"
fi

# 4. Atualizar pacotes do sistema e instalar dependências do Chromium & FFmpeg
echo -e "${CYAN}[2/9] Atualizando sistema e instalando dependências nativas (FFmpeg/Chromium)...${NC}"
apt update && apt upgrade -y
apt install -y curl git wget unzip build-essential software-properties-common openssl \
  ffmpeg libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 \
  libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2 libpango-1.0-0 \
  libcairo2 fonts-liberation libappindicator3-1 xdg-utils

# 5. Criar Swap se não existir (4GB)
if [ $(free -m | awk '/^Swap:/{print $2}') -eq 0 ]; then
    echo -e "${CYAN}Criando arquivo de Swap (4GB)...${NC}"
    fallocate -l 4G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# 6. Instalar Node.js 20 LTS, PM2, PostgreSQL, Redis, Nginx e Certbot
echo -e "${CYAN}[3/9] Instalando Node.js 20 LTS, PostgreSQL, Redis, PM2, Nginx e Certbot...${NC}"

# Node.js 20 LTS (Requerido pelo Baileys 7.x)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# PM2
npm install -g pm2

# PostgreSQL
apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql

# Redis
apt install -y redis-server
systemctl start redis-server
systemctl enable redis-server

# Nginx & Certbot
apt install -y nginx certbot python3-certbot-nginx

# 7. Configurar Banco de Dados PostgreSQL
echo -e "${CYAN}[4/9] Configurando banco de dados PostgreSQL...${NC}"
(cd /tmp && sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD '$DB_PASS';")
(cd /tmp && sudo -u postgres psql -c "DROP DATABASE IF EXISTS whaticket_afcode;") || true
(cd /tmp && sudo -u postgres psql -c "CREATE DATABASE whaticket_afcode OWNER postgres;")

# 8. Clonar ou Copiar o Repositório Git para o usuário 'deploy'
echo -e "${CYAN}[5/9] Preparando o diretório de instalação (/home/deploy/whaticket)...${NC}"
INSTALL_DIR="/home/deploy/whaticket"

if [ -n "$GIT_REPO_URL" ]; then
    echo -e "${CYAN}Clonando o repositório Git $GIT_REPO_URL...${NC}"
    rm -rf "$INSTALL_DIR"
    sudo -u deploy git clone "$GIT_REPO_URL" "$INSTALL_DIR"
else
    SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
    mkdir -p "$INSTALL_DIR"
    cp -r "$SCRIPT_DIR"/* "$INSTALL_DIR/" || true
    chown -R deploy:deploy "$INSTALL_DIR"
fi

# 9. Configurar e Compilar Backend (Executado pelo usuário deploy)
echo -e "${CYAN}[6/9] Configurando e compilando o Backend como usuário 'deploy'...${NC}"
cd "$INSTALL_DIR/backend"

cat <<EOF > .env
NODE_ENV=production
BACKEND_URL=https://$BACKEND_DOMAIN
FRONTEND_URL=https://$FRONTEND_DOMAIN
PROXY_PORT=443
PORT=8080

DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=$DB_PASS
DB_NAME=whaticket_afcode

JWT_SECRET=$JWT_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET

REDIS_URI=redis://127.0.0.1:6379
REDIS_OPT_LIMITER_MAX=1
REDIS_OPT_LIMITER_DURATION=3000

USER_LIMIT=10000
CONNECTIONS_LIMIT=100000
CLOSED_SEND_BY_ME=true
COMPANY_NAME=$COMPANY_NAME
EOF

chown deploy:deploy .env

sudo -u deploy npm install --legacy-peer-deps
sudo -u deploy npm run build
sudo -u deploy npx sequelize db:migrate
sudo -u deploy npx sequelize db:seed:all

# Iniciar backend no PM2 com o usuário deploy
sudo -u deploy pm2 delete whaticket-backend 2>/dev/null || true
sudo -u deploy pm2 start dist/server.js --name whaticket-backend
sudo -u deploy pm2 save
env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u deploy --hp /home/deploy || true

# 10. Configurar e Compilar Frontend (Executado pelo usuário deploy)
echo -e "${CYAN}[7/9] Configurando e compilando o Frontend como usuário 'deploy'...${NC}"
cd "$INSTALL_DIR/frontend"

cat <<EOF > .env
REACT_APP_BACKEND_URL=https://$BACKEND_DOMAIN
REACT_APP_HOURS_CLOSE_TICKETS_AUTO=24
EOF

chown deploy:deploy .env

sudo -u deploy npm install --legacy-peer-deps
sudo -u deploy GENERATE_SOURCEMAP=false NODE_OPTIONS="--max-old-space-size=4096" npm run build

# 11. Configurar Nginx Vhosts
echo -e "${CYAN}[8/9] Configurando Nginx...${NC}"

# Garantir permissão de leitura para o Nginx na pasta do deploy
chmod 755 /home/deploy

# Vhost Frontend
cat <<EOF > /etc/nginx/sites-available/whaticket-frontend
server {
  listen 80;
  server_name $FRONTEND_DOMAIN;

  location / {
    root $INSTALL_DIR/frontend/build;
    index index.html index.htm;
    try_files \$uri \$uri/ /index.html;
  }
}
EOF

# Vhost Backend (API + WebSockets + Uploads até 100MB)
cat <<EOF > /etc/nginx/sites-available/whaticket-backend
server {
  listen 80;
  server_name $BACKEND_DOMAIN;

  client_max_body_size 100M;

  location / {
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;

    proxy_read_timeout 86400s;
    proxy_send_timeout 86400s;
  }
}
EOF

ln -sf /etc/nginx/sites-available/whaticket-frontend /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/whaticket-backend /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default || true

nginx -t
systemctl reload nginx

# 12. Emissão de Certificados SSL
echo -e "${CYAN}[9/9] Gerando certificados SSL com Certbot...${NC}"
certbot --nginx --non-interactive --agree-tos -m "$SSL_EMAIL" -d "$FRONTEND_DOMAIN" -d "$BACKEND_DOMAIN" || {
    echo -e "${YELLOW}Aviso: O Certbot não conseguiu emitir os certificados SSL imediatamente.${NC}"
    echo -e "${YELLOW}Verifique se os domínios $FRONTEND_DOMAIN e $BACKEND_DOMAIN estão apontando para o IP desta VPS.${NC}"
}

# Conclusão
echo -e "${GREEN}"
echo "======================================================================"
echo "    🎉 INSTALAÇÃO CONCLUÍDA COM SUCESSO!                             "
echo "======================================================================"
echo -e "${NC}"
echo -e "📌 Usuário da VPS  : deploy (/home/deploy/whaticket)"
echo -e "📌 Painel Frontend : https://$FRONTEND_DOMAIN"
echo -e "📌 API Backend     : https://$BACKEND_DOMAIN"
echo -e "📌 Senha do Banco  : $DB_PASS"
echo -e "📌 Status Backend  : sudo -u deploy pm2 status"
echo -e "======================================================================\n"
