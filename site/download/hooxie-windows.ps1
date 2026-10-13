# Hooxie for Windows
# Requires Node.js 22.13+ from https://nodejs.org
$ErrorActionPreference = "Stop"
Write-Host "Hooxie setup"
Write-Host "1. Install Node.js 22.13 or newer."
Write-Host "2. From the Hooxie folder run:"
Write-Host "     npm install"
Write-Host "     npm start"
Write-Host "The overlay opens at the top of the screen and needs the Cursor app signed in."
if (Get-Command npm -ErrorAction SilentlyContinue) {
  Write-Host "npm is available: $((Get-Command npm).Source)"
} else {
  Write-Host "npm was not found on PATH. Install Node.js first."
}
