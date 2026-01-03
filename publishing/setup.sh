#!/bin/bash
# ASDF dApp Store Publishing Setup Script

set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  ASDF dApp Store Publishing Setup${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ] || [ "$NODE_VERSION" -gt 21 ]; then
    echo -e "${RED}Error: Node.js version must be 18-21${NC}"
    echo "Current version: $(node -v)"
    exit 1
fi
echo -e "${GREEN}✓ Node.js version OK: $(node -v)${NC}"

# Check if pnpm is available
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}pnpm not found. Installing via corepack...${NC}"
    corepack enable
    corepack prepare pnpm@latest --activate
fi
echo -e "${GREEN}✓ pnpm available${NC}"

# Install dependencies
echo ""
echo -e "${CYAN}Installing dapp-store-cli...${NC}"
pnpm install

# Check for .env file
if [ ! -f ".env" ]; then
    echo ""
    echo -e "${YELLOW}No .env file found. Creating from template...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}Please edit .env with your configuration:${NC}"
    echo "  - ANDROID_TOOLS_DIR: Path to Android SDK build-tools"
    echo "  - KEYPAIR_PATH: Path to your Solana keypair"
    echo ""
fi

# Initialize dapp-store if config.yaml doesn't exist
if [ ! -f "config.yaml" ]; then
    echo ""
    echo -e "${CYAN}Initializing dapp-store CLI...${NC}"
    npx dapp-store init
    echo ""
    echo -e "${GREEN}✓ config.yaml created${NC}"
    echo -e "${YELLOW}Please edit config.yaml with your app details${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${CYAN}Next steps:${NC}"
echo "1. Edit .env with your configuration"
echo "2. Edit config.yaml with your app metadata"
echo "3. Ensure you have:"
echo "   - APK built: yarn build:dapp (from parent directory)"
echo "   - Assets ready: icon-512.png, banner.png, 4 screenshots"
echo "   - Keypair with SOL on mainnet"
echo ""
echo -e "${CYAN}Publishing commands:${NC}"
echo "  pnpm run create:publisher  # One time only"
echo "  pnpm run create:app        # One time only"
echo "  pnpm run create:release    # For each version"
echo "  pnpm run submit            # Submit for review"
echo ""
