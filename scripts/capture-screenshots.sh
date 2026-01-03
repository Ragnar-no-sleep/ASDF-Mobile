#!/bin/bash
# Script de capture de screenshots pour Solana dApp Store & Play Store
# Usage: ./scripts/capture-screenshots.sh

SCREENSHOTS_DIR="./assets/screenshots"
STORE_DIR="./assets/store"
DEVICE_ID=$(adb devices | grep -v "List" | head -1 | awk '{print $1}')

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

if [ -z "$DEVICE_ID" ]; then
    echo -e "${RED}Erreur: Aucun appareil Android connecté${NC}"
    echo "Lancez un émulateur ou connectez un téléphone"
    exit 1
fi

echo -e "${GREEN}Appareil détecté: $DEVICE_ID${NC}"
echo ""

# Créer les dossiers si nécessaire
mkdir -p "$SCREENSHOTS_DIR"
mkdir -p "$STORE_DIR"

echo -e "${CYAN}=== Capture des Screenshots dApp Store ===${NC}"
echo ""
echo -e "${YELLOW}Prérequis:${NC}"
echo "- App ASDF ouverte sur l'appareil"
echo "- Wallet avec du SOL pour des captures réalistes"
echo ""
echo -e "${YELLOW}Assets requis pour dApp Store:${NC}"
echo "- 4 screenshots minimum (1080p)"
echo "- Icon 512x512"
echo "- Banner 1200x600"
echo ""

# Fonction pour capturer un screenshot
capture() {
    local num=$1
    local desc=$2
    local filename="${SCREENSHOTS_DIR}/screen-0${num}.png"

    echo -e "${CYAN}[${num}/4] $desc${NC}"
    echo -e "${YELLOW}  Naviguez vers cet écran puis appuyez sur Entrée...${NC}"
    read

    adb -s $DEVICE_ID exec-out screencap -p > "$filename"

    if [ -f "$filename" ] && [ -s "$filename" ]; then
        SIZE=$(du -h "$filename" | cut -f1)
        echo -e "  ${GREEN}✓ Sauvegardé: $filename ($SIZE)${NC}"
    else
        echo -e "  ${RED}✗ Échec de la capture${NC}"
    fi
    echo ""
}

echo "Prêt à commencer? (Entrée pour continuer)"
read

# Captures pour dApp Store
capture "1" "Écran d'accueil (Home)"
capture "2" "Connexion Wallet"
capture "3" "Balance / Portfolio"
capture "4" "Explore / Fonctionnalités"

echo -e "${GREEN}=== Captures terminées ===${NC}"
echo ""
echo -e "${CYAN}Fichiers générés:${NC}"
ls -lh "$SCREENSHOTS_DIR"/screen-*.png 2>/dev/null
echo ""

echo -e "${YELLOW}Prochaines étapes:${NC}"
echo "1. Vérifiez que chaque screenshot fait au moins 1080px de large"
echo "2. Créez les assets store manquants:"
echo "   - assets/store/icon-512.png (512x512)"
echo "   - assets/store/banner.png (1200x600)"
echo ""
echo "Pour redimensionner avec ImageMagick:"
echo "  convert assets/icon.png -resize 512x512 assets/store/icon-512.png"
echo ""
