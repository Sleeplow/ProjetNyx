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
# Ce script installe AUSSI une mise à jour AUTOMATIQUE (pull-based) : un minuteur
# systemd vérifie la branche suivie toutes les quelques minutes et redéploie le
# bundle s'il a changé (avec rollback si /health ne répond pas). Plus de SSH pour
# les mises à jour — sûr sur un repo public (la VM ne fait que TÉLÉCHARGER un
# fichier, jamais exécuter du code de PR).
#
# Variables optionnelles :
#   DOMAIN=game.sleeplow.ca   sous-domaine qui pointe vers cette machine
#   BRANCH=main               branche d'où provient (et se met à jour) le bundle
#   PORT=2567                 port interne du serveur (derrière Caddy)
#   HEALTH_PORT=2568          port interne de la sonde /health (rollback auto)
#   AUTO_UPDATE_MINUTES=2     fréquence de vérification des mises à jour (0 = off)
set -euo pipefail

DOMAIN="${DOMAIN:-gamenyxt.sleeplow.ca}"
BRANCH="${BRANCH:-main}"
PORT="${PORT:-2567}"
HEALTH_PORT="${HEALTH_PORT:-2568}"
AUTO_UPDATE_MINUTES="${AUTO_UPDATE_MINUTES:-2}"
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

# 4b) Mises à jour de SÉCURITÉ automatiques de la MACHINE (OS / kernel / OpenSSL /
#     OpenSSH…). Empêche de « prendre du retard » sur les correctifs sans SSH.
#     Reboot auto la nuit (4 h) si un correctif kernel l'exige — le service de jeu
#     redémarre au boot, et la reconnexion couvre le bref creux.
apt-get install -y unattended-upgrades
cat > /etc/apt/apt.conf.d/20auto-upgrades <<'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
EOF
cat > /etc/apt/apt.conf.d/52nyxt-unattended <<'EOF'
Unattended-Upgrade::Automatic-Reboot "true";
Unattended-Upgrade::Automatic-Reboot-Time "04:00";
EOF
systemctl enable --now unattended-upgrades >/dev/null 2>&1 || true
echo "==> Mises à jour de sécurité OS automatiques activées (reboot auto à 4 h si requis)."

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

# Durcissement (défense en profondeur) : le serveur ne fait qu'exécuter du JS et
# écouter un port ; il n'écrit rien sur le disque et n'a besoin d'aucun privilège.
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
PrivateTmp=true
PrivateDevices=true
ProtectKernelTunables=true
ProtectControlGroups=true
RestrictAddressFamilies=AF_UNIX AF_INET AF_INET6
# Borne la mémoire (petite VM) : en cas de fuite, systemd redémarre le service.
MemoryMax=512M

[Install]
WantedBy=multi-user.target
EOF

# 6b) Mise à jour AUTOMATIQUE (pull-based) : script + timer systemd.
#     Le script (lancé en root par le timer) TÉLÉCHARGE le bundle depuis la
#     branche suivie ; s'il a changé, il le déploie et redémarre — puis vérifie
#     /health et fait un ROLLBACK si le serveur ne répond pas. Aucun code de PR
#     n'est jamais exécuté : c'est un simple `curl` d'un fichier + comparaison.
cat > "${APP_DIR}/nyxt-update.sh" <<'UPDATER'
#!/usr/bin/env bash
set -euo pipefail
BRANCH="${NYXT_BRANCH:-main}"
APP_DIR=/opt/nyxt
HEALTH_PORT="${HEALTH_PORT:-2568}"
URL="https://raw.githubusercontent.com/Sleeplow/ProjetNyx/${BRANCH}/server/nyxt-server.cjs"
TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT

# Téléchargement (échec réseau → on retentera au prochain tick, sans rien casser).
curl -fsSL "$URL" -o "$TMP" || { logger -t nyxt-update "téléchargement échoué"; exit 0; }
[[ -s "$TMP" ]] || { logger -t nyxt-update "bundle vide → ignoré"; exit 0; }
# Déjà à jour ? (comparaison octet à octet) → rien à faire.
cmp -s "$TMP" "${APP_DIR}/nyxt-server.cjs" && exit 0

logger -t nyxt-update "nouveau bundle sur ${BRANCH} → déploiement"
cp -f "${APP_DIR}/nyxt-server.cjs" "${APP_DIR}/nyxt-server.prev.cjs" 2>/dev/null || true
install -m 0644 "$TMP" "${APP_DIR}/nyxt-server.cjs"
systemctl restart nyxt-server

# Vérifie la santé ; rollback si le nouveau bundle ne répond pas.
ok=0
for _ in $(seq 1 12); do
  if curl -fsS "http://127.0.0.1:${HEALTH_PORT}/health" >/dev/null 2>&1; then ok=1; break; fi
  sleep 1
done
if [[ "$ok" != "1" ]]; then
  logger -t nyxt-update "ÉCHEC /health → ROLLBACK vers la version précédente"
  if [[ -f "${APP_DIR}/nyxt-server.prev.cjs" ]]; then
    install -m 0644 "${APP_DIR}/nyxt-server.prev.cjs" "${APP_DIR}/nyxt-server.cjs"
    systemctl restart nyxt-server
  fi
  exit 1
fi
logger -t nyxt-update "serveur mis à jour ✅"
UPDATER
chmod 0755 "${APP_DIR}/nyxt-update.sh"

cat > /etc/systemd/system/nyxt-update.service <<EOF
[Unit]
Description=Mise à jour auto du serveur Nyxt (pull-based)
After=network-online.target nyxt-server.service
Wants=network-online.target

[Service]
Type=oneshot
Environment=NYXT_BRANCH=${BRANCH}
Environment=HEALTH_PORT=${HEALTH_PORT}
ExecStart=/bin/bash ${APP_DIR}/nyxt-update.sh
EOF

cat > /etc/systemd/system/nyxt-update.timer <<EOF
[Unit]
Description=Vérifie régulièrement les mises à jour du serveur Nyxt

[Timer]
OnBootSec=2min
OnUnitActiveSec=${AUTO_UPDATE_MINUTES}min
Unit=nyxt-update.service

[Install]
WantedBy=timers.target
EOF

# 7) Caddy : reverse-proxy + certificat HTTPS/WSS automatique pour le domaine
cat > /etc/caddy/Caddyfile <<EOF
${DOMAIN} {
	reverse_proxy localhost:${PORT}
}
EOF

# 8) (Re)démarrage des services + activation de la mise à jour auto
systemctl daemon-reload
systemctl enable nyxt-server >/dev/null 2>&1 || true
systemctl restart nyxt-server
systemctl reload caddy 2>/dev/null || systemctl restart caddy
if [[ "${AUTO_UPDATE_MINUTES}" != "0" ]]; then
  systemctl enable --now nyxt-update.timer >/dev/null 2>&1 || systemctl restart nyxt-update.timer
  echo "==> Mise à jour auto ACTIVE : suit « ${BRANCH} », vérif toutes les ${AUTO_UPDATE_MINUTES} min."
else
  systemctl disable --now nyxt-update.timer >/dev/null 2>&1 || true
  echo "==> Mise à jour auto désactivée (AUTO_UPDATE_MINUTES=0)."
fi

echo
echo "===================================================================="
echo " Serveur installé et démarré."
echo "   • État jeu    : systemctl status nyxt-server"
echo "   • Logs jeu    : journalctl -u nyxt-server -f"
echo "   • État HTTPS  : systemctl status caddy"
echo "   • Logs HTTPS  : journalctl -u caddy -f"
echo "   • Màj jeu     : systemctl list-timers nyxt-update.timer"
echo "   • Logs màj    : journalctl -t nyxt-update -f"
echo "   • Màj OS      : apt list --upgradable  |  reboot requis ? test -f /var/run/reboot-required"
echo "   • Logs màj OS : cat /var/log/unattended-upgrades/unattended-upgrades.log"
echo
echo " Le jeu doit se connecter à :  wss://${DOMAIN}"
echo
echo " Si la connexion échoue, vérifie :"
echo "   1. ${DOMAIN} pointe vers l'IP publique de CETTE machine (enregistrement A)."
echo "   2. 80 et 443 sont ouverts dans la Security List Oracle (console web)."
echo "   3. journalctl -u caddy -f  → le certificat s'obtient une fois le DNS propagé."
echo "===================================================================="
