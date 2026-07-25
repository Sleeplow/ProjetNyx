#!/usr/bin/env bash
# Installe un runner GitHub Actions AUTO-HÉBERGÉ sur la VM, pour déployer le
# serveur de jeu Nyxt automatiquement — plus besoin de SSH pour les mises à jour.
#
# Le runner « tire » les jobs depuis GitHub en sortie (aucun port entrant à
# ouvrir). Le workflow .github/workflows/deploy-server.yml tourne alors SUR la VM
# et se contente de copier le bundle + redémarrer le service.
#
# PRÉ-REQUIS : le serveur doit déjà être installé (server/deploy/setup-oracle.sh)
# — /opt/nyxt et le service systemd `nyxt-server` existent.
#
# UTILISATION (une seule fois) :
#   1. Sur GitHub : dépôt → Settings → Actions → Runners → « New self-hosted
#      runner » → Linux. Copie le TOKEN d'enregistrement affiché (valable ~1 h).
#   2. Sur la VM (en SSH, une dernière fois) :
#        export RUNNER_TOKEN=LE_TOKEN_COPIÉ
#        curl -fsSL https://raw.githubusercontent.com/Sleeplow/ProjetNyx/main/server/deploy/setup-runner.sh -o setup-runner.sh
#        sudo -E bash setup-runner.sh
#
# Ensuite : chaque promotion vers `main` (ou le bouton « Run workflow ») met le
# serveur à jour tout seul. Fini le SSH.
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/Sleeplow/ProjetNyx}"
RUNNER_VERSION="${RUNNER_VERSION:-2.321.0}"
RUNNER_LABEL="${RUNNER_LABEL:-nyxt}"
RUN_USER="${SUDO_USER:-ubuntu}"
RUNNER_DIR="${RUNNER_DIR:-/opt/actions-runner}"

if [[ $EUID -ne 0 ]]; then
  echo "Ce script a besoin de sudo :  sudo -E bash setup-runner.sh" >&2
  exit 1
fi
: "${RUNNER_TOKEN:?Définis RUNNER_TOKEN (token de runner GitHub — voir l’en-tête de ce script). Ex: sudo -E bash setup-runner.sh}"

# Un runner ne doit JAMAIS tourner en root.
if [[ "${RUN_USER}" == "root" ]]; then
  echo "Lance avec sudo depuis un utilisateur normal (ex. ubuntu), pas en root direct." >&2
  exit 1
fi

# Architecture (Oracle Always Free peut être ARM64 « A1.Flex » ou x64 « E2.Micro »).
case "$(uname -m)" in
  x86_64) ARCH=x64 ;;
  aarch64 | arm64) ARCH=arm64 ;;
  *) echo "Architecture non gérée : $(uname -m)" >&2; exit 1 ;;
esac
echo "==> Runner GitHub ${RUNNER_VERSION} (${ARCH}) pour ${REPO_URL}"

apt-get update -y >/dev/null 2>&1 || true
apt-get install -y curl tar jq >/dev/null 2>&1 || true

mkdir -p "$RUNNER_DIR"
chown "$RUN_USER:$RUN_USER" "$RUNNER_DIR"

# Téléchargement du runner (si absent).
if [[ ! -x "$RUNNER_DIR/config.sh" ]]; then
  TARBALL="actions-runner-linux-${ARCH}-${RUNNER_VERSION}.tar.gz"
  sudo -u "$RUN_USER" bash -c "cd '$RUNNER_DIR' && curl -fsSL -o '$TARBALL' 'https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/${TARBALL}' && tar xzf '$TARBALL' && rm -f '$TARBALL'"
fi

# (Ré)enregistrement, non interactif et idempotent.
sudo -u "$RUN_USER" bash -c "cd '$RUNNER_DIR' && ./config.sh remove --token '$RUNNER_TOKEN' >/dev/null 2>&1 || true"
sudo -u "$RUN_USER" bash -c "cd '$RUNNER_DIR' && ./config.sh --unattended --replace --url '$REPO_URL' --token '$RUNNER_TOKEN' --name 'nyxt-vm' --labels '$RUNNER_LABEL'"

# Service systemd du runner (démarre au boot, se relance seul).
( cd "$RUNNER_DIR" && ./svc.sh install "$RUN_USER" && ./svc.sh start )

# Autorise le runner à redémarrer UNIQUEMENT le service de jeu, sans mot de passe.
cat > /etc/sudoers.d/nyxt-runner <<EOF
${RUN_USER} ALL=(root) NOPASSWD: /usr/bin/systemctl restart nyxt-server, /bin/systemctl restart nyxt-server
EOF
chmod 0440 /etc/sudoers.d/nyxt-runner
visudo -cf /etc/sudoers.d/nyxt-runner >/dev/null

echo
echo "===================================================================="
echo " Runner installé ✅  — le déploiement du serveur est désormais une"
echo " Action GitHub. Plus besoin de SSH."
echo "   • État runner : systemctl status actions.runner.*"
echo "   • Déclenche à la demande : dépôt → Actions → « Déploie le serveur (VM) »"
echo "     → Run workflow."
echo "   • Automatique : chaque promotion qa → main met le serveur à jour."
echo "===================================================================="
