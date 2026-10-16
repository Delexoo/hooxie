$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$log = Join-Path $root "install-deps.log"
function Write-Log([string]$message) {
  Add-Content -Path $log -Value "$(Get-Date -Format o) $message"
}

function Test-WebView2 {
  $keys = @(
    "HKLM:\SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}",
    "HKLM:\SOFTWARE\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}"
  )
  foreach ($key in $keys) {
    $version = (Get-ItemProperty -Path $key -ErrorAction SilentlyContinue).pv
    if ($version -and $version -ne "0.0.0.0") { return $true }
  }
  return $false
}

try {
  $node = Join-Path $root "node\node.exe"
  if (-not (Test-Path $node)) { throw "Hooxie's Node.js is missing. Run the Hooxie setup again." }
  Write-Log "Using bundled Node.js"

  if (-not (Test-WebView2)) {
    Write-Log "Downloading WebView2"
    $setup = Join-Path $env:TEMP "MicrosoftEdgeWebview2Setup.exe"
    Invoke-WebRequest "https://go.microsoft.com/fwlink/p/?LinkId=2124703" -OutFile $setup
    $install = Start-Process $setup -ArgumentList "/silent /install" -Wait -PassThru
    if ($install.ExitCode -ne 0 -and $install.ExitCode -ne 3010) {
      throw "WebView2 install failed ($($install.ExitCode))."
    }
    Write-Log "Installed WebView2"
  }

  if (-not (Test-Path (Join-Path $root "node_modules"))) {
    Write-Log "Installing Hooxie packages with the bundled Node.js"
    $npm = Join-Path $root "node\npm.cmd"
    Push-Location $root
    try {
      & $npm install --omit=dev --no-fund --no-audit
      if ($LASTEXITCODE -ne 0) { throw "npm install failed ($LASTEXITCODE)." }
    } finally {
      Pop-Location
    }
  }
  Write-Log "Ready"
} catch {
  Write-Log $_.Exception.Message
  throw
}
