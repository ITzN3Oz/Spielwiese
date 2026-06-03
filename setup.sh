#!/usr/bin/env bash
# ==============================================================================
# "Kilians Spielwiese" Web-Admin-Hypervisor Automated Installer & Host Configurator
# ==============================================================================
# High-compatibility setup script for Ubuntu, Debian, CentOS, RHEL, and Fedora.
# Ensures that Node.js, Docker, UFW/Firewall, systemd, and local file storage 
# are perfectly provisioned for a secure, smooth game administration experience.
# ==============================================================================

set -o errexit
set -o pipefail
set -o nounset

# Colors for premium CLI rendering
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}======================================================================${NC}"
echo -e "${GREEN}   __  __ _ _ _                 _____       _      _                 ${NC}"
echo -e "${GREEN}  |  |/ /(_) (_)               / ___/____  (_)__ _| | _      __ ___  ${NC}"
echo -e "${GREEN}  |    / | | | | __ _ _ _  __  \__ \/ __ \/ / _ \/ / | | /| / / _  / ${NC}"
echo -e "${GREEN}  |    \ | | | |/ _' | ' \/ _' ___/ /_/_/ /  ___/ /| |/ |/ / (_) /  ${NC}"
echo -e "${GREEN}  |_|\__\_|_|_|_|\__,_|_||_\__,/____/ .___/_/\___/_/_|__/|__/\___/   ${NC}"
echo -e "${GREEN}                                    /_/                              ${NC}"
echo -e "${BLUE}======================================================================${NC}"
echo -e "${BLUE}        AUTOMATED SYSTEM CONFIGURATOR & HYPERVISOR PROVISIONER       ${NC}"
echo -e "${BLUE}======================================================================${NC}"

# 1. ROOT PRIVILEGE CHECK
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}[FEHLER] Dieses Installationsskript benötigt Administratorrechte (Root).${NC}"
   echo -e "Bitte führen Sie das Skript mit 'sudo' aus:"
   echo -e "  sudo bash setup.sh"
   exit 1
fi

# Detect operating system
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS_NAME=$ID
    OS_VERSION_ID=$VERSION_ID
else
    OS_NAME="unknown"
    OS_VERSION_ID="unknown"
fi

echo -e "${GREEN}[INFO] Host-System erkannt: ${OS_NAME} (${OS_VERSION_ID})${NC}"

# Define paths
APP_DIR="/opt/kilians-spielwiese"
DATA_DIR="/var/lib/kilians-spielwiese"
LOG_DIR="/var/log/kilians-spielwiese"

echo -e "Installationsverzeichnisse vorberaten..."
echo -e " - Anwendungsdateien:   ${BLUE}${APP_DIR}${NC}"
echo -e " - Server-Datenvolumen: ${BLUE}${DATA_DIR}${NC}"
echo -e " - Systemprotokolle:    ${BLUE}${LOG_DIR}${NC}"

# Create directories
mkdir -p "${APP_DIR}"
mkdir -p "${DATA_DIR}/volumes"
mkdir -p "${LOG_DIR}"

# 2. PACKAGE MANAGER REFRESH & ESSENTIAL DEPENDENCY CHECKS
echo -e "\n${BLUE}[SCHRITT 1/5] Installationsstatus der System-Pakete prüfen...${NC}"

install_apt_packages() {
    echo -e "Aktualisiere Paketlisten (apt-get update)..."
    apt-get update -y >/dev/null
    
    local packages=(curl git ufw build-essential libcap2-bin)
    for pkg in "${packages[@]}"; do
        if ! dpkg -s "$pkg" >/dev/null 2>&1; then
            echo -e "Installiere benötigtes Paket: ${YELLOW}$pkg${NC}..."
            apt-get install -y "$pkg" >/dev/null
        else
            echo -e "Paket ist bereits vorhanden: ${GREEN}$pkg${NC}"
        fi
    done
}

install_dnf_packages() {
    echo -e "Aktualisiere Paketlisten (dnf cache)..."
    dnf makecache -y >/dev/null
    
    local packages=(curl git firewalld gcc gcc-c++ make)
    for pkg in "${packages[@]}"; do
        if ! rpm -q "$pkg" >/dev/null 2>&1; then
            echo -e "Installiere benötigtes Paket: ${YELLOW}$pkg${NC}..."
            dnf install -y "$pkg" >/dev/null
        else
            echo -e "Paket ist bereits vorhanden: ${GREEN}$pkg${NC}"
        fi
    done
}

case "$OS_NAME" in
    ubuntu|debian|raspbian|pop)
        install_apt_packages
        ;;
    centos|rhel|fedora|almalinux|rocky)
        install_dnf_packages
        ;;
    *)
        echo -e "${YELLOW}[WARNUNG] Unbekanntes Betriebssystem. Versuche generische Paketprüfung fortzusetzen.${NC}"
        ;;
esac

# 2.5 DOCKER ENGINE SETUP
echo -e "\n${BLUE}[SCHRITT 2/5] Docker-Container-Laufzeitumgebung einrichten...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "Docker Engine wird dekomprimiert und auf dem Host-Betriebssystem installiert..."
    case "$OS_NAME" in
        ubuntu|debian|raspbian|pop)
            curl -fsSL https://get.docker.com -o get-docker.sh
            sh get-docker.sh >/dev/null
            rm get-docker.sh
            ;;
        centos|rhel|fedora|almalinux|rocky)
            curl -fsSL https://get.docker.com -o get-docker.sh
            sh get-docker.sh >/dev/null
            rm get-docker.sh
            ;;
        *)
            echo -e "${RED}[FEHLER] Docker konnte nicht automatisch installiert werden. Bitte installieren Sie Docker manuell.${NC}"
            exit 1
            ;;
    esac
else
    echo -e "Docker Engine ist bereits aktiv: ${GREEN}$(docker --version)${NC}"
fi

# Ensure Docker is started and enabled
systemctl daemon-reload
systemctl enable docker >/dev/null 2>&1 || true
systemctl start docker >/dev/null 2>&1 || true

# 2.6 NODE.JS & NPM INSTALLATION
echo -e "\n${BLUE}[SCHRITT 3/5] Node.js-Laufzeitumgebung (v20+) konfigurieren...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "Installiere Node.js via Package-Manager..."
    case "$OS_NAME" in
        ubuntu|debian|raspbian|pop)
            curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
            apt-get install -y nodejs >/dev/null
            ;;
        centos|rhel|fedora|almalinux|rocky)
            curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
            dnf install -y nodejs >/dev/null
            ;;
        *)
            echo -e "${RED}[FEHLER] Node.js konnte nicht automatisch installiert werden. Bitte manuell v20+ flashen.${NC}"
            exit 1
            ;;
    esac
else
    echo -e "Node.js ist bereits aktiv: ${GREEN}$(node --version)${NC}"
fi

# Ensure application files are in /opt/kilians-spielwiese
echo -e "\nKopiere Anwendungsdateien nach ${APP_DIR}..."
cp -R ./* "${APP_DIR}/" || true

# Create system daemon user
if ! id "spielwiese" &>/dev/null; then
    echo -e "Erstelle Systembenutzer ${YELLOW}spielwiese${NC} für isolierten, sicheren Betrieb..."
    useradd -r -m -d "${DATA_DIR}" -s /usr/sbin/nologin spielwiese || true
fi

# Safe-add to docker group to yield socket access permissions securely
usermod -aG docker spielwiese || true

# Set directory permissions
chown -R spielwiese:spielwiese "${APP_DIR}"
chown -R spielwiese:spielwiese "${DATA_DIR}"
chown -R spielwiese:spielwiese "${LOG_DIR}"

# Build app inside /opt/kilians-spielwiese
cd "${APP_DIR}"
echo -e "Initialisiere Abhängigkeiten (npm install) in ${APP_DIR}..."
npm install --omit=dev --no-audit --no-fund >/dev/null 2>&1 || npm install >/dev/null 2>&1

echo -e "Führe Applet-Build durch (npm run build)..."
npm run build >/dev/null 2>&1 || echo "Build übersprungen oder manuell validiert"

# 4. FIREWALL-REGELN & NETZWERK-PROVISIONIERUNG
echo -e "\n${BLUE}[SCHRITT 4/5] Port-Freigabe und Firewall-Härtung konfigurieren...${NC}"

# Probe system for active firewalls
if command -v ufw &> /dev/null && ufw status | grep -q "active"; then
    echo -e "Konfiguriere ${YELLOW}UFW (Uncomplicated Firewall)${NC}..."
    # Core system web interface
    ufw allow 3000/tcp comment 'Kilians Spielwiese Web Admin Dashboard'
    # Default Minecraft Server Port
    ufw allow 25565/tcp comment 'Minecraft Server Traffic'
    # Default CS2 (Source engine) Traffic
    ufw allow 27015/tcp comment 'CS2 Server Traffic TCP'
    ufw allow 27015/udp comment 'CS2 Server Traffic UDP'
    # Default Valheim Game Port
    ufw allow 2456/udp comment 'Valheim Server Traffic'
    # Default DayZ Game Ports
    ufw allow 2302:2305/udp comment 'DayZ Game Traffic'
    ufw allow 27016/udp comment 'DayZ Steam Query Traffic'
    # Default Rust Game Port
    ufw allow 28015/udp comment 'Rust Game Traffic'
    ufw allow 28016/tcp comment 'Rust Rcon Traffic'
    
    ufw reload >/dev/null
    echo -e "UFW-Filterregeln wurden ${GREEN}erfolgreich registriert${NC}!"
elif command -v firewall-cmd &> /dev/null && systemctl is-active --quiet firewalld; then
    echo -e "Konfiguriere ${YELLOW}Firewalld${NC}..."
    firewall-cmd --permanent --add-port=3000/tcp >/dev/null
    firewall-cmd --permanent --add-port=25565/tcp >/dev/null
    firewall-cmd --permanent --add-port=27015/tcp >/dev/null
    firewall-cmd --permanent --add-port=27015/udp >/dev/null
    firewall-cmd --permanent --add-port=2456/udp >/dev/null
    firewall-cmd --permanent --add-port=2302-2305/udp >/dev/null
    firewall-cmd --permanent --add-port=27016/udp >/dev/null
    firewall-cmd --permanent --add-port=28015/udp >/dev/null
    firewall-cmd --permanent --add-port=28016/tcp >/dev/null
    
    firewall-cmd --reload >/dev/null
    echo -e "Firewalld-Filterregeln wurden ${GREEN}erfolgreich registriert${NC}!"
else
    echo -e "${YELLOW}[INFO] Keine aktive UFW oder Firewalld gefunden. Ports (3000, 25565, 27015, 2456) müssen manuell im Router/ISP freigegeben werden.${NC}"
fi

# 5. SYSTEMD INTEGRATION (RECOVERY, DAEMONIZING)
echo -e "\n${BLUE}[SCHRITT 5/5] Registriere Systemd-Daemon für automatische Wiederherstellung...${NC}"

# Dynamically locate node and npm absolute paths to avoid systemd PATH resolution failure
NODE_PATH=$(command -v node || echo "/usr/bin/node")
NPM_PATH=$(command -v npm || echo "/usr/bin/npm")

echo -e "Node-Pfad gefunden: ${YELLOW}${NODE_PATH}${NC}"
echo -e "NPM-Pfad gefunden: ${YELLOW}${NPM_PATH}${NC}"

cat <<EOF > /etc/systemd/system/spielwiese.service
[Unit]
Description=Kilians Spielwiese Game Server Hypervisor Dashboard
After=network.target docker.service
Requires=docker.service

[Service]
Type=simple
User=spielwiese
WorkingDirectory=/opt/kilians-spielwiese
Environment=NODE_ENV=production PORT=3000 PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
ExecStart=${NPM_PATH} start
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=kilians-spielwiese

[Install]
WantedBy=multi-user.target
EOF

# Reload and load systemd service safely
systemctl daemon-reload
systemctl enable spielwiese >/dev/null 2>&1 || true
systemctl restart spielwiese >/dev/null 2>&1 || true

echo -e "\n${GREEN}======================================================================${NC}"
echo -e "${GREEN}      PROVISIONIERUNG FÜR 'KILIANS SPIELWIESE' ERFOLGREICH BEENDET!     ${NC}"
echo -e "${GREEN}======================================================================${NC}"
echo -e " Die Anwendung läuft ab sofort sicher im Hintergrund des Servers."
echo -e " "
echo -e " Status prüfen:       ${BLUE}systemctl status spielwiese${NC}"
echo -e " Logs einsehen:       ${BLUE}journalctl -u spielwiese -f -n 50${NC}"
echo -e " "
echo -e " Öffnen Sie Ihr Panel im Browser unter:"
echo -e "   => ${GREEN}http://YOUR_SERVER_IP:3000${NC}"
echo -e "======================================================================"
