$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

function Write-Step($message) {
    Write-Host "`n==> $message" -ForegroundColor Cyan
}

$Project = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Project

Write-Step "Checking Node.js and npm"
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    if (Get-Command winget -ErrorAction SilentlyContinue) {
        Write-Host "Node.js not found. Installing Node.js LTS via winget..." -ForegroundColor Yellow
        winget install -e --id OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
    }
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    throw "Node.js is required. Install LTS from https://nodejs.org/ and run setup.ps1 again."
}

Write-Host ("Node: " + (node --version))
Write-Host ("npm:  " + (npm --version))

$Runtime = Join-Path $Project "runtime"
$ThroneDir = Join-Path $Runtime "throne"
$CliDir = Join-Path $Runtime "bin"
$TempDir = Join-Path $env:TEMP ("throneui-setup-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Force -Path $ThroneDir, $CliDir, $TempDir | Out-Null

function Get-GitHubReleaseAsset([string]$Repo, [string]$Tag, [string]$Pattern, [string]$Destination) {
    $api = if ($Tag) {
        "https://api.github.com/repos/$Repo/releases/tags/$Tag"
    } else {
        "https://api.github.com/repos/$Repo/releases/latest"
    }
    $headers = @{
        "Accept"     = "application/vnd.github+json"
        "User-Agent" = "ThroneUI-Setup"
    }
    $release = Invoke-RestMethod -Uri $api -Headers $headers
    $asset = $release.assets | Where-Object { $_.name -match $Pattern } | Select-Object -First 1
    if (-not $asset) {
        $names = ($release.assets | ForEach-Object { $_.name }) -join "`n - "
        throw "No matching ZIP asset for pattern '$Pattern' in $Repo ($($release.tag_name)). Available assets:`n - $names"
    }
    Write-Host ("Downloading " + $asset.name + " (" + [math]::Round($asset.size / 1MB, 1) + " MB)...")
    Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $Destination -Headers @{ "User-Agent" = "ThroneUI-Setup" }
    return $asset.name
}

function Expand-ExeFromZip([string]$ZipPath, [string]$TargetDir, [string]$ExeName) {
    $extract = Join-Path $TempDir ([guid]::NewGuid().ToString("N"))
    New-Item -ItemType Directory -Force -Path $extract | Out-Null
    Expand-Archive -LiteralPath $ZipPath -DestinationPath $extract -Force
    $found = Get-ChildItem -Path $extract -Filter $ExeName -File -Recurse | Select-Object -First 1
    if (-not $found) {
        throw "$ExeName was not found inside $ZipPath"
    }
    Copy-Item -Path (Join-Path $found.DirectoryName "*") -Destination $TargetDir -Recurse -Force
}

try {
    if (-not (Test-Path (Join-Path $ThroneDir "Throne.exe"))) {
        Write-Step "Downloading official Throne 1.4.1 Windows x64"
        $throneZip = Join-Path $TempDir "throne.zip"
        $null = Get-GitHubReleaseAsset "throneproj/Throne" "1.4.1" '(?i)windows(?!.*legacy)(?!.*arm64).*(amd64|x64|64)\.zip$' $throneZip
        Expand-ExeFromZip $throneZip $ThroneDir "Throne.exe"
    } else {
        Write-Step "Throne.exe already exists in runtime\throne, skipping download"
    }

    if (-not (Test-Path (Join-Path $CliDir "thronectl.exe"))) {
        Write-Step "Downloading latest official thronectl (Windows amd64)"
        $cliZip = Join-Path $TempDir "thronectl.zip"
        $null = Get-GitHubReleaseAsset "throneproj/Throne-api" "" '(?i)windows(?!.*arm64).*(amd64|x64)\.zip$' $cliZip
        Expand-ExeFromZip $cliZip $CliDir "thronectl.exe"
    } else {
        Write-Step "thronectl.exe already exists in runtime\bin, skipping download"
    }

    Write-Step "Installing npm dependencies"
    npm install
    if ($LASTEXITCODE -ne 0) {
        throw "npm install failed with exit code $LASTEXITCODE"
    }

    Write-Step "Starting Throne UI"
    npm start
}
finally {
    Remove-Item -LiteralPath $TempDir -Recurse -Force -ErrorAction SilentlyContinue
}