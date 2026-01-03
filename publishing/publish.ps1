# ASDF dApp Store Publication Script
# Usage: .\publish.ps1 -Step <step_name>
# Steps: setup, validate, publisher, app, release, submit, all

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("setup", "validate", "publisher", "app", "release", "submit", "status", "all")]
    [string]$Step,

    [string]$KeypairPath,
    [string]$ApkPath,
    [string]$RpcUrl = "https://api.mainnet-beta.solana.com"
)

$ErrorActionPreference = "Stop"

# Colors
function Write-Color($text, $color) {
    Write-Host $text -ForegroundColor $color
}

function Write-Header($text) {
    Write-Host ""
    Write-Color "========================================" Cyan
    Write-Color "  $text" Cyan
    Write-Color "========================================" Cyan
    Write-Host ""
}

function Write-Success($text) {
    Write-Color "[OK] $text" Green
}

function Write-Warning($text) {
    Write-Color "[!] $text" Yellow
}

function Write-Error($text) {
    Write-Color "[X] $text" Red
}

# Load .env if exists
$envFile = Join-Path $PSScriptRoot ".env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.*)$") {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            Set-Item -Path "env:$name" -Value $value
        }
    }
    Write-Success "Loaded .env configuration"
}

# Get values from env or params
if (-not $KeypairPath) { $KeypairPath = $env:KEYPAIR_PATH }
if (-not $ApkPath) { $ApkPath = $env:APK_PATH }
$AndroidToolsDir = $env:ANDROID_TOOLS_DIR

# Validation
function Test-Prerequisites {
    Write-Header "Checking Prerequisites"

    $errors = @()

    # Node version
    $nodeVersion = (node -v) -replace 'v', ''
    $nodeMajor = [int]($nodeVersion.Split('.')[0])
    if ($nodeMajor -lt 18 -or $nodeMajor -gt 21) {
        $errors += "Node.js must be v18-21 (current: v$nodeVersion)"
    } else {
        Write-Success "Node.js v$nodeVersion"
    }

    # pnpm
    if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
        Write-Warning "pnpm not found, installing via corepack..."
        corepack enable
        corepack prepare pnpm@latest --activate
    }
    Write-Success "pnpm available"

    # Keypair
    if (-not $KeypairPath) {
        $errors += "KEYPAIR_PATH not set"
    } elseif (-not (Test-Path $KeypairPath)) {
        $errors += "Keypair not found: $KeypairPath"
    } else {
        Write-Success "Keypair: $KeypairPath"
    }

    # Android tools
    if (-not $AndroidToolsDir) {
        $errors += "ANDROID_TOOLS_DIR not set"
    } elseif (-not (Test-Path $AndroidToolsDir)) {
        $errors += "Android tools not found: $AndroidToolsDir"
    } else {
        Write-Success "Android tools: $AndroidToolsDir"
    }

    # APK (only for release step)
    if ($Step -eq "release" -or $Step -eq "all") {
        if (-not $ApkPath) {
            $errors += "APK_PATH not set for release"
        } elseif (-not (Test-Path $ApkPath)) {
            $errors += "APK not found: $ApkPath"
        } else {
            Write-Success "APK: $ApkPath"
        }
    }

    if ($errors.Count -gt 0) {
        Write-Host ""
        Write-Error "Prerequisites check failed:"
        $errors | ForEach-Object { Write-Error "  - $_" }
        Write-Host ""
        Write-Warning "Please configure .env file with required paths"
        exit 1
    }

    Write-Host ""
    Write-Success "All prerequisites met!"
}

# Setup
function Invoke-Setup {
    Write-Header "Setup dApp Store CLI"

    Push-Location $PSScriptRoot

    if (-not (Test-Path "node_modules")) {
        Write-Host "Installing dependencies..."
        pnpm install
    }

    if (-not (Test-Path "config.yaml")) {
        Write-Host "Initializing dapp-store..."
        npx dapp-store init
        Write-Warning "Please edit config.yaml with your app details"
    } else {
        Write-Success "config.yaml already exists"
    }

    Pop-Location
    Write-Success "Setup complete!"
}

# Validate
function Invoke-Validate {
    Write-Header "Validating Configuration"

    Push-Location $PSScriptRoot
    npx dapp-store validate
    Pop-Location

    Write-Success "Validation passed!"
}

# Create Publisher NFT
function Invoke-CreatePublisher {
    Write-Header "Creating Publisher NFT"

    Write-Warning "This will create a Publisher NFT on mainnet (~0.01 SOL)"
    $confirm = Read-Host "Continue? (y/N)"
    if ($confirm -ne "y") {
        Write-Host "Cancelled"
        return
    }

    Push-Location $PSScriptRoot
    npx dapp-store create publisher -k $KeypairPath -u $RpcUrl
    Pop-Location

    Write-Success "Publisher NFT created!"
}

# Create App NFT
function Invoke-CreateApp {
    Write-Header "Creating App NFT"

    Write-Warning "This will create an App NFT on mainnet"
    $confirm = Read-Host "Continue? (y/N)"
    if ($confirm -ne "y") {
        Write-Host "Cancelled"
        return
    }

    Push-Location $PSScriptRoot
    npx dapp-store create app -k $KeypairPath -u $RpcUrl
    Pop-Location

    Write-Success "App NFT created!"
}

# Create Release NFT
function Invoke-CreateRelease {
    Write-Header "Creating Release NFT"

    if (-not $ApkPath -or -not (Test-Path $ApkPath)) {
        Write-Error "APK not found: $ApkPath"
        Write-Host "Build APK first: eas build --platform android --profile dapp-store"
        exit 1
    }

    Write-Warning "This will create a Release NFT with your APK"
    Write-Host "APK: $ApkPath"
    $confirm = Read-Host "Continue? (y/N)"
    if ($confirm -ne "y") {
        Write-Host "Cancelled"
        return
    }

    Push-Location $PSScriptRoot
    npx dapp-store create release -k $KeypairPath -b $AndroidToolsDir -u $RpcUrl
    Pop-Location

    Write-Success "Release NFT created!"
}

# Submit for review
function Invoke-Submit {
    Write-Header "Submitting to dApp Store"

    Write-Warning "This will submit your app for review"
    Write-Host ""
    Write-Host "By submitting, you confirm:"
    Write-Host "  - You are authorized to publish this app"
    Write-Host "  - Your app complies with Solana dApp Store policies"
    Write-Host ""
    $confirm = Read-Host "Continue? (y/N)"
    if ($confirm -ne "y") {
        Write-Host "Cancelled"
        return
    }

    Push-Location $PSScriptRoot
    npx dapp-store publish submit `
        -k $KeypairPath `
        -u $RpcUrl `
        --requestor-is-authorized `
        --complies-with-solana-dapp-store-policies
    Pop-Location

    Write-Success "Submission complete!"
    Write-Host ""
    Write-Header "Next Steps"
    Write-Host "1. Join Solana Mobile Discord: https://discord.gg/solanamobile"
    Write-Host "2. Get developer role in #developer channel"
    Write-Host "3. Announce your submission in #dapp-store"
    Write-Host "4. Wait for review team contact"
}

# Check status
function Invoke-Status {
    Write-Header "Publication Status"

    $configPath = Join-Path $PSScriptRoot "config.yaml"

    Write-Host "Configuration:"
    if (Test-Path $configPath) {
        Write-Success "  config.yaml exists"
    } else {
        Write-Warning "  config.yaml missing - run: .\publish.ps1 -Step setup"
    }

    Write-Host ""
    Write-Host "Environment:"
    Write-Host "  KEYPAIR_PATH: $(if($KeypairPath) { $KeypairPath } else { '(not set)' })"
    Write-Host "  ANDROID_TOOLS_DIR: $(if($AndroidToolsDir) { $AndroidToolsDir } else { '(not set)' })"
    Write-Host "  APK_PATH: $(if($ApkPath) { $ApkPath } else { '(not set)' })"
    Write-Host "  RPC_URL: $RpcUrl"

    Write-Host ""
    Write-Host "Assets (check manually):"
    Write-Host "  ../assets/store/icon-512.png (512x512)"
    Write-Host "  ../assets/store/banner.png (1200x600)"
    Write-Host "  ../assets/screenshots/*.png (4+ required)"
}

# Main execution
switch ($Step) {
    "setup" {
        Test-Prerequisites
        Invoke-Setup
    }
    "validate" {
        Invoke-Validate
    }
    "publisher" {
        Test-Prerequisites
        Invoke-CreatePublisher
    }
    "app" {
        Test-Prerequisites
        Invoke-CreateApp
    }
    "release" {
        Test-Prerequisites
        Invoke-CreateRelease
    }
    "submit" {
        Test-Prerequisites
        Invoke-Submit
    }
    "status" {
        Invoke-Status
    }
    "all" {
        Test-Prerequisites
        Invoke-Setup
        Invoke-Validate
        Invoke-CreatePublisher
        Invoke-CreateApp
        Invoke-CreateRelease
        Invoke-Submit
    }
}
