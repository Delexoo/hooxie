$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$issc = "${env:ProgramFiles(x86)}\Inno Setup 6\ISCC.exe"
if (-not (Test-Path $issc)) { $issc = "${env:ProgramFiles}\Inno Setup 6\ISCC.exe" }
if (-not (Test-Path $issc)) { throw "Inno Setup 6 was not found. Install it from https://jrsoftware.org/isinfo.php" }

$stage = Join-Path $root "dist\payload"
$dist = Join-Path $root "dist"
New-Item -ItemType Directory -Force -Path $dist | Out-Null
if (Test-Path $stage) {
  cmd /c "rmdir /s /q `"$stage`""
  if (Test-Path $stage) { Remove-Item $stage -Recurse -Force -ErrorAction SilentlyContinue }
}
New-Item -ItemType Directory -Force -Path $stage | Out-Null

Push-Location (Join-Path $root "src\widget-shell")
try {
  dotnet publish -c Release -r win-x64 --self-contained false -o (Join-Path $stage "shell")
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

foreach ($dir in @("src", "public", "site", "extensions")) {
  Copy-Item (Join-Path $root $dir) (Join-Path $stage $dir) -Recurse -Force
}

Remove-Item (Join-Path $stage "src\widget-shell\bin") -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item (Join-Path $stage "src\widget-shell\obj") -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item (Join-Path $root "installer\Hooxie.cmd") (Join-Path $stage "Hooxie.cmd") -Force

& $issc (Join-Path $root "installer\hooxie.iss")
Write-Host "Installer written to $dist"
Get-ChildItem $dist -Filter "Hooxie-Setup-*.exe" | Select-Object Name, Length, FullName
