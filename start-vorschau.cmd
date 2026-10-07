@echo off
rem Stabile Vorschau wie auf Netlify: Produktionsbuild und Server (Port 3104). Fenster offen lassen, Strg+C beendet.
cd /d "%~dp0"
title LWL-Techniker V4 Vorschau (Port 3104)
if not exist node_modules call npm ci
call npm run build
if errorlevel 1 goto fehler
start "" http://localhost:3104
call npm start
:fehler
echo.
echo Server beendet oder Build fehlgeschlagen. Meldung oben pruefen.
pause
