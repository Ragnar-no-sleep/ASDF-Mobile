# ASDF Mobile - Screenshot Capture Script for dApp Store
# Requirements: Android SDK with adb in PATH, running emulator/device

param(
    [string]$OutputDir = "..\assets\screenshots",
    [switch]$Help
)

if ($Help) {
    Write-Host @"
ASDF Screenshot Capture Script
==============================

Usage: .\capture-screenshots.ps1 [-OutputDir <path>]

This script captures screenshots from a connected Android device/emulator
for submission to the Solana dApp Store.

Requirements:
- Android SDK with adb in PATH
- Running Android emulator or connected device
- ASDF app installed and running

Screenshots will be saved as:
- screen-01.png (Home screen)
- screen-02.png (Connect Wallet)
- screen-03.png (Balance view)
- screen-04.png (Explore/Features)

Press any key when ready to capture each screen.
"@
    exit 0
}

# Check if adb is available
try {
    $adbVersion = adb version 2>&1
    Write-Host "ADB found: $($adbVersion[0])" -ForegroundColor Green
} catch {
    Write-Host "ERROR: adb not found in PATH. Please install Android SDK." -ForegroundColor Red
    exit 1
}

# Check for connected devices
$devices = adb devices | Select-String "device$"
if (-not $devices) {
    Write-Host "ERROR: No Android device/emulator connected." -ForegroundColor Red
    Write-Host "Start an emulator or connect a device first." -ForegroundColor Yellow
    exit 1
}

Write-Host "Device found: $($devices -replace '\s+device', '')" -ForegroundColor Green

# Create output directory
$fullOutputDir = Join-Path $PSScriptRoot $OutputDir
if (-not (Test-Path $fullOutputDir)) {
    New-Item -ItemType Directory -Path $fullOutputDir -Force | Out-Null
}

Write-Host ""
Write-Host "=== ASDF Screenshot Capture ===" -ForegroundColor Cyan
Write-Host "Output directory: $fullOutputDir"
Write-Host ""
Write-Host "Instructions:" -ForegroundColor Yellow
Write-Host "1. Open ASDF app on your device"
Write-Host "2. Navigate to the screen you want to capture"
Write-Host "3. Press ENTER to capture"
Write-Host ""

$screenshots = @(
    @{ Name = "screen-01.png"; Description = "Home Screen" },
    @{ Name = "screen-02.png"; Description = "Connect Wallet / Wallet Selection" },
    @{ Name = "screen-03.png"; Description = "Connected - Balance View" },
    @{ Name = "screen-04.png"; Description = "Explore / Features" }
)

foreach ($shot in $screenshots) {
    Write-Host "[$($screenshots.IndexOf($shot) + 1)/4] Ready to capture: $($shot.Description)" -ForegroundColor Cyan
    Write-Host "Navigate to this screen and press ENTER..." -ForegroundColor Yellow
    Read-Host

    $outputPath = Join-Path $fullOutputDir $shot.Name

    # Capture screenshot
    Write-Host "Capturing..." -NoNewline
    adb exec-out screencap -p > $outputPath 2>&1

    if (Test-Path $outputPath) {
        $fileSize = (Get-Item $outputPath).Length
        if ($fileSize -gt 0) {
            Write-Host " Done! ($([math]::Round($fileSize/1KB, 1)) KB)" -ForegroundColor Green
        } else {
            Write-Host " Failed (empty file)" -ForegroundColor Red
        }
    } else {
        Write-Host " Failed" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "=== Capture Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Screenshots saved to: $fullOutputDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Review screenshots for quality"
Write-Host "2. Ensure all are at least 1080px wide"
Write-Host "3. Create banner.png (1200x600) and icon-512.png (512x512) in assets/store/"
Write-Host ""

# List captured files
Write-Host "Captured files:" -ForegroundColor Cyan
Get-ChildItem $fullOutputDir -Filter "*.png" | ForEach-Object {
    Write-Host "  - $($_.Name) ($([math]::Round($_.Length/1KB, 1)) KB)"
}
