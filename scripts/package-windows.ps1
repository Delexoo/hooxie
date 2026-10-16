$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$issc = "${env:ProgramFiles(x86)}\Inno Setup 6\ISCC.exe"
if (-not (Test-Path $issc)) { $issc = "${env:ProgramFiles}\Inno Setup 6\ISCC.exe" }
if (-not (Test-Path $issc)) { $issc = Join-Path $env:LOCALAPPDATA "Programs\Inno Setup 6\ISCC.exe" }
if (-not (Test-Path $issc)) { throw "Inno Setup 6 was not found. Install it from https://jrsoftware.org/isinfo.php" }

$stage = Join-Path $root "dist-setup\stage"
$dist = Join-Path $root "dist-setup"
New-Item -ItemType Directory -Force -Path $dist | Out-Null
if (Test-Path $stage) {
  cmd /c "rmdir /s /q `"$stage`""
}
if (Test-Path $stage) { throw "Could not clear the installer payload. Close anything using dist-setup and try again." }
New-Item -ItemType Directory -Force -Path $stage | Out-Null

Push-Location (Join-Path $root "src\widget-shell")
try {
  dotnet publish -c Release -r win-x64 --self-contained true -o (Join-Path $stage "shell")
} finally {
  Pop-Location
}

$copy = @(
  "package.json",
  "package-lock.json",
  "LICENSE",
  "NOTICE",
  "README.md",
  ".env.example"
)
foreach ($item in $copy) {
  Copy-Item (Join-Path $root $item) (Join-Path $stage $item) -Force
}

foreach ($dir in @("public", "site", "extensions")) {
  Copy-Item (Join-Path $root $dir) (Join-Path $stage $dir) -Recurse -Force
}
$srcDest = Join-Path $stage "src"
New-Item -ItemType Directory -Force -Path $srcDest | Out-Null
$PSNativeCommandUseErrorActionPreference = $false
& robocopy (Join-Path $root "src") $srcDest /E /NFL /NDL /NJH /NJS /XD bin obj /XF .env
if ($LASTEXITCODE -ge 8) { throw "Could not copy the Hooxie source." }
$global:LASTEXITCODE = 0

Remove-Item (Join-Path $stage "site\download\Hooxie-Setup.exe") -Force -ErrorAction SilentlyContinue
Copy-Item (Join-Path $root "installer\Hooxie.cmd") (Join-Path $stage "Hooxie.cmd") -Force
Copy-Item (Join-Path $root "installer\Hooxie.vbs") (Join-Path $stage "Hooxie.vbs") -Force
Copy-Item (Join-Path $root "installer\install-deps.ps1") (Join-Path $stage "install-deps.ps1") -Force

$index = Invoke-RestMethod "https://nodejs.org/dist/index.json"
$release = $index | Where-Object { $_.version -like "v22.*" } | Select-Object -First 1
if (-not $release) { throw "Could not find a Node.js 22 release." }
$parts = "$($release.version)".TrimStart("v").Split(".")
if ([int]$parts[0] -lt 22 -or ([int]$parts[0] -eq 22 -and [int]$parts[1] -lt 13)) {
  throw "Latest Node.js 22 is $($release.version), which is older than 22.13."
}
$cache = Join-Path $dist "cache"
New-Item -ItemType Directory -Force -Path $cache | Out-Null
$zipName = "node-$($release.version)-win-x64.zip"
$zip = Join-Path $cache $zipName
if (-not (Test-Path $zip)) {
  Write-Host "Downloading $zipName"
  & curl.exe -fsSL -o $zip "https://nodejs.org/dist/$($release.version)/$zipName"
  if ($LASTEXITCODE -ne 0) { throw "Could not download Node.js $($release.version)." }
}
$extract = Join-Path $cache "node-extract"
if (Test-Path $extract) { Remove-Item $extract -Recurse -Force }
Expand-Archive -Path $zip -DestinationPath $extract
$inner = Get-ChildItem $extract -Directory | Select-Object -First 1
if (-not $inner) { throw "The Node.js archive had no folder." }
$nodeDir = Join-Path $stage "node"
Move-Item $inner.FullName $nodeDir
Set-Content -Path (Join-Path $nodeDir "HOOXIE-NODE.txt") -Value $release.version
$bundled = & (Join-Path $nodeDir "node.exe") -p "process.versions.node"
if ("$bundled" -ne "$($release.version)".TrimStart("v")) { throw "Bundled Node.js reported $bundled." }
Write-Host "Bundled Node.js $bundled"
Push-Location $stage
try {
  & (Join-Path $nodeDir "npm.cmd") ci --omit=dev --no-fund --no-audit
  if ($LASTEXITCODE -ne 0) { throw "npm ci failed ($LASTEXITCODE)." }
} finally {
  Pop-Location
}
if (-not (Test-Path (Join-Path $stage "node_modules\@cursor\sdk"))) {
  throw "The Hooxie packages did not install."
}

& $issc (Join-Path $root "installer\hooxie.iss")
Write-Host "Installer written to $dist"
Get-ChildItem $dist -Filter "Hooxie-Setup-*.exe" | Select-Object Name, Length, FullName
