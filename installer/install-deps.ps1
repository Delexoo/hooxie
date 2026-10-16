$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$log = Join-Path $root "install-deps.log"
function Write-Log([string]$message) {
  Add-Content -Path $log -Value "$(Get-Date -Format o) $message"
}

function Find-Node {
  foreach ($candidate in @(
    "$env:ProgramFiles\nodejs\node.exe",
    "$env:LOCALAPPDATA\Programs\nodejs\node.exe"
  )) {
    if (Test-Path $candidate) { return $candidate }
  }
  $command = Get-Command node -ErrorAction SilentlyContinue
  if ($command) { return $command.Source }
  return $null
}

function Test-NodeVersion([string]$exe) {
  $raw = & $exe -p "process.versions.node"
  $parts = "$raw".Split(".")
  if ($parts.Count -lt 2) { return $false }
  $major = [int]$parts[0]
  $minor = [int]$parts[1]
  return ($major -gt 22) -or ($major -eq 22 -and $minor -ge 13)
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
  $node = Find-Node
  if (-not $node -or -not (Test-NodeVersion $node)) {
    Write-Log "Downloading Node.js 22"
    $index = Invoke-RestMethod "https://nodejs.org/dist/index.json"
    $release = $index | Where-Object { $_.version -like "v22.*" } | Select-Object -First 1
    if (-not $release) { throw "Could not find a Node.js 22 release." }
    $file = "node-$($release.version)-x64.msi"
    $msi = Join-Path $env:TEMP $file
    Invoke-WebRequest "https://nodejs.org/dist/$($release.version)/$file" -OutFile $msi
    $install = Start-Process msiexec.exe -ArgumentList "/i `"$msi`" /qn /norestart" -Wait -PassThru
    if ($install.ExitCode -ne 0 -and $install.ExitCode -ne 3010) {
      throw "Node.js install failed ($($install.ExitCode))."
    }
    $node = "$env:ProgramFiles\nodejs\node.exe"
    if (-not (Test-Path $node)) { throw "Node.js did not install." }
    Write-Log "Installed $($release.version)"
  }

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

  $npm = Join-Path (Split-Path $node) "npm.cmd"
  if (-not (Test-Path $npm)) { throw "npm was not found next to Node.js." }
  Write-Log "Installing Hooxie packages"
  Push-Location $root
  try {
    & $npm install --omit=dev
    if ($LASTEXITCODE -ne 0) { throw "npm install failed ($LASTEXITCODE)." }
  } finally {
    Pop-Location
  }
  Write-Log "Ready"
} catch {
  Write-Log $_.Exception.Message
  throw
}
