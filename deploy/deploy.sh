#!/usr/bin/env bash
# Despliegue en el servidor de producción (Ubuntu + Nginx + PM2).
# Ejecutar desde la raíz del repo en el servidor, con el MISMO usuario que corre PM2
# (los pasos de Nginx usan sudo):
#   WEB_ROOT=/var/www/keyvault bash deploy/deploy.sh
set -euo pipefail

WEB_ROOT=${WEB_ROOT:?Definí WEB_ROOT con la carpeta pública de Nginx (la directiva root del sitio)}
DOMAIN=${DOMAIN:-dwday-1252412.online}
REPO_DIR=$(cd "$(dirname "$0")/.." && pwd)

cd "$REPO_DIR"
git pull --ff-only

npm --prefix server ci --omit=dev
npm --prefix client ci
npm --prefix client run build

# Copia el build de Vite a la carpeta pública, borrando assets viejos con hash.
sudo rsync -a --delete "$REPO_DIR/client/dist/" "$WEB_ROOT/"

sudo nginx -t
sudo systemctl reload nginx
pm2 restart all

check() {
  curl -s -o /dev/null --resolve "$DOMAIN:443:127.0.0.1" -w "  $1 -> %{http_code} (esperado $2)\n" "https://$DOMAIN$1"
}
echo "Deploy listo. Verificación rápida:"
check /admin 200
check /api/admin/stats 200
check /api/products 200
