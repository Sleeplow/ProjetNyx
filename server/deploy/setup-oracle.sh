#!/usr/bin/env bash
# Installe le serveur de jeu Nyxt sur une machine Ubuntu (ex. Oracle Cloud
# Always Free, région Montréal) avec HTTPS/WSS automatique via Caddy.
#
# Idempotent : relancer ce script met simplement le serveur à jour (re-télécharge
# le bundle et redémarre). Aucun `npm install` — on n'exécute que le bundle Node.
#
#   curl -fsSL https://raw.githubusercontent.com/Sleeplow/ProjetNyx/qa/server/deploy/setup-oracle.sh -o setup.sh
#   sudo bash setup.sh
#
# Variables optionnelles :
#   DOMAIN=game.sleeplow.ca   sous-domaine qui pointe vers cette machine
#   BRANCH=qa                 branche d'où provient le bundle serveur
#   PORT=2567                 port interne du serveur (derrière Caddy)
set -euo pipefail

DOMAIN="${DOMAIN:-gamenyxt.sleeplow.ca}"
BRANCH="${BRANCH:-qa}"
PORT="${PORT:-2567}"
APP_DIR=/opt/nyxt
RUN_USER="${SUDO_USER:-ubuntu}"
BUNDLE_URL="https://raw.githubusercontent.com/Sleeplow/ProjetNyx/${BRANCH}/server/nyxt-server.cjs"

if [[ $EUID -ne 0 ]]; then
  echo "Ce script a besoin de sudo :  sudo bash setup.sh" >&2
  exit 1
fi

echo "==> Domaine : ${DOMAIN} | port interne : ${PORT} | utilisateur : ${RUN_USER}"
export DEBIAN_FRONTEND=noninteractive

# 1) Paquets de base
apt-get update -y
apt-get install -y curl ca-certificates gnupg debian-keyring debian-archive-keyring \
  apt-transport-https netfilter-persistent iptables-persistent

# 2) Node.js 20 (NodeSource) si absent
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
echo "==> Node $(node -v)"

# 3) Caddy (dépôt officiel) si absent — fournit le HTTPS/WSS automatique
if ! command -v caddy >/dev/null 2>&1; then
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
    | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
    > /etc/apt/sources.list.d/caddy-stable.list
  apt-get update -y
  apt-get install -y caddy
fi
echo "==> $(caddy version | head -n1)"

# 4) Pare-feu interne : les images Oracle Ubuntu bloquent tout sauf SSH.
#    On ouvre 80 (challenge Let's Encrypt) et 443 (WSS). NB : il faut AUSSI
#    ouvrir 80/443 dans la « Security List » Oracle (console web).
iptables -C INPUT -p tcp --dport 80 -j ACCEPT 2>/dev/null  || iptables -I INPUT -p tcp --dport 80 -j ACCEPT
iptables -C INPUT -p tcp --dport 443 -j ACCEPT 2>/dev/null || iptables -I INPUT -p tcp --dport 443 -j ACCEPT
netfilter-persistent save || true

# 5) Récupère le serveur (bundle autonome)
mkdir -p "${APP_DIR}"
echo "==> Téléchargement du serveur…"
curl -fsSL "${BUNDLE_URL}" -o "${APP_DIR}/nyxt-server.cjs"
chown -R "${RUN_USER}:${RUN_USER}" "${APP_DIR}"

# 6) Service systemd : démarre au boot, redémarre tout seul si ça plante
cat > /etc/systemd/system/nyxt-server.service <<EOF
[Unit]
Description=Serveur de jeu Nyxt (Colyseus)
After=network.target

[Service]
Type=simple
User=${RUN_USER}
WorkingDirectory=${APP_DIR}
Environment=PORT=${PORT}
ExecStart=/usr/bin/node ${APP_DIR}/nyxt-server.cjs
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

# 7) Caddy : reverse-proxy + certificat HTTPS/WSS automatique pour le domaine
cat > /etc/caddy/Caddyfile <<EOF
${DOMAIN} {
	reverse_proxy localhost:${PORT}
}
EOF

# 8) (Re)démarrage des deux services
systemctl daemon-reload
systemctl enable nyxt-server >/dev/null 2>&1 || true
systemctl restart nyxt-server
systemctl reload caddy 2>/dev/null || systemctl restart caddy

echo
echo "===================================================================="
echo " Serveur installé et démarré."
echo "   • État jeu    : systemctl status nyxt-server"
echo "   • Logs jeu    : journalctl -u nyxt-server -f"
echo "   • État HTTPS  : systemctl status caddy"
echo "   • Logs HTTPS  : journalctl -u caddy -f"
echo
echo " Le jeu doit se connecter à :  wss://${DOMAIN}"
echo
echo " Si la connexion échoue, vérifie :"
echo "   1. ${DOMAIN} pointe vers l'IP publique de CETTE machine (enregistrement A)."
echo "   2. 80 et 443 sont ouverts dans la Security List Oracle (console web)."
echo "   3. journalctl -u caddy -f  → le certificat s'obtient une fois le DNS propagé."
echo "===================================================================="
