@echo off
setlocal
cd /d "%~dp0"
title Hooxie
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
