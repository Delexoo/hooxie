$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$issc = "${env:ProgramFiles(x86)}\Inno Setup 6\ISCC.exe"
if (-not (Test-Path $issc)) { $issc = "${env:ProgramFiles}\Inno Setup 6\ISCC.exe" }
if (-not (Test-Path $issc)) { $issc = Join-Path $env:LOCALAPPDATA "Programs\Inno Setup 6\ISCC.exe" }
if (-not (Test-Path $issc)) { throw "Inno Setup 6 was not found. Install it from https://jrsoftware.org/isinfo.php" }

$stage = Join-Path $root "dist-setup\build"
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

& $issc (Join-Path $root "installer\hooxie.iss")
Write-Host "Installer written to $dist"
Get-ChildItem $dist -Filter "Hooxie-Setup-*.exe" | Select-Object Name, Length, FullName
