# Hooxie for Windows
# The setup file already includes Node.js. These steps are for a source checkout.
$ErrorActionPreference = "Stop"
Write-Host "Hooxie setup"
Write-Host "The Hooxie setup file includes Node.js."
Write-Host "From a source checkout, install Node.js 22.13 or newer, then run:"
Write-Host "     npm install"
Write-Host "     npm start"
Write-Host "The overlay opens at the top of the screen and needs the Cursor app signed in."
if (Get-Command npm -ErrorAction SilentlyContinue) {
  Write-Host "npm is available: $((Get-Command npm).Source)"
} else {
  Write-Host "npm was not found on PATH. Install Node.js first."
}
