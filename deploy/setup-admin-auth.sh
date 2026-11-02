#!/usr/bin/env bash
# Crea /etc/nginx/.htpasswd con el usuario "admin" y una contraseña aleatoria fuerte.
# Ejecutar en el servidor: sudo bash deploy/setup-admin-auth.sh
# La contraseña se muestra UNA sola vez: guardala en tu gestor de contraseñas.
set -euo pipefail

HTPASSWD_FILE=/etc/nginx/.htpasswd
ADMIN_USER=${ADMIN_USER:-admin}

if [[ $EUID -ne 0 ]]; then
  echo "Ejecutalo con sudo." >&2
  exit 1
fi

if [[ -f "$HTPASSWD_FILE" && "${FORCE:-0}" != "1" ]]; then
  echo "$HTPASSWD_FILE ya existe. Para regenerar la contraseña: sudo FORCE=1 bash $0" >&2
  exit 1
fi

# 24 caracteres alfanuméricos (~143 bits de entropía).
PASSWORD=$(openssl rand -base64 48 | tr -dc 'A-Za-z0-9' | head -c 24)
HASH=$(openssl passwd -apr1 "$PASSWORD")

umask 027
printf '%s:%s\n' "$ADMIN_USER" "$HASH" > "$HTPASSWD_FILE"
chown root:www-data "$HTPASSWD_FILE"
chmod 640 "$HTPASSWD_FILE"

echo "Credenciales del panel /admin"
echo "  Usuario:    $ADMIN_USER"
echo "  Contraseña: $PASSWORD"
echo "Guardala ahora: no se vuelve a mostrar ni queda en ningún log."
