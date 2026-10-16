@echo off
setlocal
cd /d "%~dp0"
if /I not "%~1"=="--run" (
  wscript //nologo "%~dp0Hooxie.vbs"
  exit /b 0
)
if exist "%~dp0node\node.exe" (
  set "PATH=%~dp0node;%PATH%"
  if not exist "node_modules\" (
    call "%~dp0node\npm.cmd" install --omit=dev --no-fund --no-audit
    if errorlevel 1 (
      echo Hooxie could not install its packages.
      pause
      exit /b 1
    )
  )
  "%~dp0node\node.exe" --experimental-strip-types src\server.ts
  if errorlevel 1 pause
  exit /b 0
)
where node >nul 2>nul
if errorlevel 1 (
  echo Hooxie needs Node.js 22.13 or newer.
  echo Install it from https://nodejs.org then start Hooxie again.
  start https://nodejs.org
  pause
  exit /b 1
)
if not exist "node_modules\" (
  echo Installing Hooxie packages...
  call npm install
  if errorlevel 1 (
    echo npm install failed.
    pause
    exit /b 1
  )
)
node --experimental-strip-types src\server.ts
if errorlevel 1 pause
