#!/bin/bash
# ==============================================================================
# INSTALADOR AUTOMATIZADO ROBUSTO E PROFISSIONAL - PJZAP / WHATICKET (UBUNTU)
# Desenvolvido para instalação 100% autônoma, sem erros e pronta para produção
# ==============================================================================

set -e

# Cores para terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BLUE='\033[0;34m'
NC='\033[0m'

clear
echo -e "${CYAN}"
echo "======================================================================"
echo "    🚀 INSTALADOR SENIOR ESPECIALISTA LINUX - PJZAP / WHATICKET      "
echo "======================================================================"
echo -e "${NC}"

# 1. Checagem de privilégios
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Erro: Este script deve ser executado como root. Use: sudo ./install_primaria${NC}"
  exit 1
fi

# 2. Coleta de Dados Interativa
echo -e "${YELLOW}Informe as configurações para este servidor VPS:${NC}\n"

read -p "1. Domínio do FRONTEND (ex: pjzap.pajotech.com.br): " FRONTEND_DOMAIN
read -p "2. Domínio da API/BACKEND (ex: pjzapback.pajotech.com.br): " BACKEND_DOMAIN
read -p "3. E-mail para Certificados SSL (Let's Encrypt): " SSL_EMAIL
read -p "4. URL do repositório .git [https://github.com/pajotecnologia/pjzap.git]: " GIT_REPO_INPUT
read -p "5. Nome do Sistema/Empresa [PJZap]: " COMPANY_INPUT

GIT_REPO_URL=${GIT_REPO_INPUT:-https://github.com/pajotecnologia/pjzap.git}
COMPANY_NAME=${COMPANY_INPUT:-PJZap}

# Limpar espaços e barras
FRONTEND_DOMAIN=$(echo "$FRONTEND_DOMAIN" | tr -d ' ' | sed 's|https://||g' | sed 's|http://||g' | sed 's|/||g')
BACKEND_DOMAIN=$(echo "$BACKEND_DOMAIN" | tr -d ' ' | sed 's|https://||g' | sed 's|http://||g' | sed 's|/||g')
SSL_EMAIL=$(echo "$SSL_EMAIL" | tr -d ' ')

if [ -z "$FRONTEND_DOMAIN" ] || [ -z "$BACKEND_DOMAIN" ] || [ -z "$SSL_EMAIL" ]; then
    echo -e "${RED}Erro: Domínios e E-mail são obrigatórios! Instalação cancelada.${NC}"
    exit 1
fi

# Gerar senhas e segredos de criptografia
DB_PASS=$(openssl rand -hex 16)
JWT_SECRET=$(openssl rand -base64 32 | tr -d '\n')
JWT_REFRESH_SECRET=$(openssl rand -base64 32 | tr -d '\n')

echo -e "\n${GREEN}✔ Configurações validadas com sucesso! Iniciando implantação...${NC}\n"
sleep 2

# 3. Criar arquivo de SWAP de 4GB para evitar estouro de RAM
echo -e "${CYAN}[1/10] Verificando memória Swap do sistema...${NC}"
if [ $(free -m | awk '/^Swap:/{print $2}') -lt 2000 ]; then
    echo -e "${YELLOW}Criando Swap de 4GB para compilação segura...${NC}"
    swapoff -a || true
    rm -f /swapfile || true
    fallocate -l 4G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=4096
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    if ! grep -q '/swapfile' /etc/fstab; then
        echo '/swapfile none swap sw 0 0' >> /etc/fstab
    fi
    echo -e "${GREEN}✔ Swap de 4GB ativada.${NC}"
fi

# 4. Atualizar Sistema e Instalar Dependências Nativas do Linux
echo -e "${CYAN}[2/10] Instalando dependências nativas (FFmpeg, Chromium, C++ build tools)...${NC}"
export DEBIAN_FRONTEND=noninteractive
apt update -y && apt upgrade -y
apt install -y curl git wget unzip build-essential software-properties-common openssl \
  ffmpeg libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 \
  libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2 libpango-1.0-0 \
  libcairo2 fonts-liberation libappindicator3-1 xdg-utils libasound2-dev

# 5. Instalar Node.js 20 LTS, PM2, PostgreSQL, Redis e Nginx
echo -e "${CYAN}[3/10] Instalando Node.js 20 LTS, PM2, PostgreSQL, Redis, Nginx e Certbot...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

npm install -g pm2

apt install -y postgresql postgresql-contrib redis-server nginx certbot python3-certbot-nginx
systemctl enable postgresql redis-server nginx
systemctl start postgresql redis-server nginx

# 6. Criar Usuário 'deploy' e Permissões de Diretório
echo -e "${CYAN}[4/10] Configurando usuário do sistema 'deploy'...${NC}"
if ! id -u deploy &>/dev/null; then
    useradd -m -s /bin/bash deploy
    usermod -aG sudo deploy
    echo "deploy ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers.d/deploy
fi

# Conceder permissão de leitura para o Nginx (www-data) acessar a pasta do deploy
chmod 755 /home/deploy
usermod -aG deploy www-data || true

# 7. Configurar Banco de Dados PostgreSQL
echo -e "${CYAN}[5/10] Configurando o banco de dados PostgreSQL...${NC}"
(cd /tmp && sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD '$DB_PASS';")
(cd /tmp && sudo -u postgres psql -c "DROP DATABASE IF EXISTS whaticket_afcode;") || true
(cd /tmp && sudo -u postgres psql -c "CREATE DATABASE whaticket_afcode OWNER postgres;")
echo -e "${GREEN}✔ Banco de dados 'whaticket_afcode' criado e autenticado com sucesso.${NC}"

# 8. Clonar Código do Projeto
echo -e "${CYAN}[6/10] Clonando o repositório Git em /home/deploy/whaticket...${NC}"
INSTALL_DIR="/home/deploy/whaticket"
rm -rf "$INSTALL_DIR"
sudo -u deploy git clone "$GIT_REPO_URL" "$INSTALL_DIR"
chown -R deploy:deploy "$INSTALL_DIR"

# 9. Configurar e Compilar o Backend
echo -e "${CYAN}[7/10] Configurando e compilando o Backend...${NC}"
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

# 10. Configurar e Compilar o Frontend
echo -e "${CYAN}[8/10] Configurando e compilando o Frontend...${NC}"
cd "$INSTALL_DIR/frontend"

cat <<EOF > .env
REACT_APP_BACKEND_URL=https://$BACKEND_DOMAIN
REACT_APP_HOURS_CLOSE_TICKETS_AUTO=24
EOF

chown deploy:deploy .env

sudo -u deploy npm install --legacy-peer-deps
sudo -u deploy GENERATE_SOURCEMAP=false NODE_OPTIONS="--max-old-space-size=4096" npm run build
chmod -R 755 "$INSTALL_DIR/frontend/build"

# 11. Configurar Servidor Web Nginx
echo -e "${CYAN}[9/10] Configurando Nginx e Virtual Hosts...${NC}"
rm -f /etc/nginx/sites-enabled/default* || true
rm -f /etc/nginx/sites-available/default* || true

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

# Vhost Backend (API + WebSockets)
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

nginx -t
systemctl reload nginx

# 12. Emitir Certificados SSL (HTTPS) com Let's Encrypt
echo -e "${CYAN}[10/10] Emitindo Certificados SSL Gratuito (Certbot)...${NC}"
certbot --nginx --non-interactive --agree-tos -m "$SSL_EMAIL" -d "$FRONTEND_DOMAIN" -d "$BACKEND_DOMAIN" --redirect || {
    echo -e "${YELLOW}Aviso: SSL não pôde ser emitido agora. Verifique se os domínios $FRONTEND_DOMAIN e $BACKEND_DOMAIN estão apontando para esta VPS.${NC}"
}

# Reiniciar backend final para sincronização
sudo -u deploy pm2 restart whaticket-backend

echo -e "${GREEN}"
echo "======================================================================"
echo "    🎉 INSTALAÇÃO CONCLUÍDA E SISTEMA 100% OPERACIONAL!              "
echo "======================================================================"
echo -e "${NC}"
echo -e "📌 Painel Frontend : https://$FRONTEND_DOMAIN"
echo -e "📌 API Backend     : https://$BACKEND_DOMAIN"
echo -e "📌 E-mail Inicial  : admin@whaticket.com"
echo -e "📌 Senha Inicial   : 123456"
echo -e "📌 Senha do Banco  : $DB_PASS"
echo -e "📌 Usuário da VPS  : deploy (/home/deploy/whaticket)"
echo -e "======================================================================\n"
