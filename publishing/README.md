# ASDF - Solana dApp Store Publication

## Quick Start

```powershell
cd publishing
cp .env.example .env
# Edit .env with your paths
.\publish.ps1 -Step status   # Check configuration
.\publish.ps1 -Step setup    # Install CLI
```

## Prerequisites

| Requirement | Details |
|-------------|---------|
| Node.js | v18-21 |
| pnpm | Via corepack |
| Android SDK | build-tools/35.0.0 |
| Solana Keypair | ~0.1 SOL on mainnet |
| APK | Built with `eas build --profile dapp-store` |

## Assets Required

| Asset | Size | Path |
|-------|------|------|
| Icon | 512x512 PNG | `../assets/store/icon-512.png` |
| Banner | 1200x600 PNG | `../assets/store/banner.png` |
| Screenshots | 1080p min, 4+ | `../assets/screenshots/*.png` |

## Publication Flow

### Step 1: Setup
```powershell
.\publish.ps1 -Step setup
```
Installs dapp-store CLI and initializes config.yaml.

### Step 2: Validate
```powershell
.\publish.ps1 -Step validate
```
Checks config.yaml and assets are correct.

### Step 3: Create Publisher NFT (one time)
```powershell
.\publish.ps1 -Step publisher
```
Creates your Publisher identity on-chain (~0.01 SOL).

### Step 4: Create App NFT (one time)
```powershell
.\publish.ps1 -Step app
```
Creates the App entry on-chain.

### Step 5: Build APK
```powershell
# From project root
eas build --platform android --profile dapp-store
# Download APK and set APK_PATH in .env
```

### Step 6: Create Release NFT
```powershell
.\publish.ps1 -Step release
```
Uploads APK and creates Release NFT.

### Step 7: Submit
```powershell
.\publish.ps1 -Step submit
```
Submits for dApp Store review.

## .env Configuration

```env
ANDROID_TOOLS_DIR=C:\Users\...\Android\Sdk\build-tools\35.0.0
KEYPAIR_PATH=C:\Users\...\.config\solana\id.json
APK_PATH=C:\Users\...\Downloads\asdf-dapp-store.apk
RPC_URL=https://api.mainnet-beta.solana.com
```

## After Submission

1. **Join Discord**: https://discord.gg/solanamobile
2. **Get Developer Role**: Post in #developer
3. **Announce**: Share in #dapp-store channel
4. **Wait**: Review team will contact you

## Costs

| NFT | Approximate Cost |
|-----|------------------|
| Publisher | ~0.01 SOL |
| App | ~0.01 SOL |
| Release | ~0.02 SOL |
| **Total** | **~0.05 SOL** |

## Troubleshooting

### "Keypair not found"
Set KEYPAIR_PATH in .env to your Solana wallet keypair.

### "Android tools not found"
Install Android SDK and set ANDROID_TOOLS_DIR to build-tools path.

### "Transaction failed"
- Check SOL balance (need ~0.1 SOL)
- Try increasing PRIORITY_FEE in .env
- Use a private RPC endpoint

## Resources

- [dApp Store Overview](https://docs.solanamobile.com/dapp-publishing/overview)
- [Publisher Policy](https://docs.solanamobile.com/dapp-publishing/publisher-policy)
- [CLI Reference](https://github.com/solana-mobile/dapp-publishing)
