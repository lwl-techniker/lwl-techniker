@echo off
rem Lokale Entwicklungsvorschau LWL-Techniker V4 (Port 3104). Fenster offen lassen, Strg+C beendet.
cd /d "%~dp0"
title LWL-Techniker V4 Entwicklung (Port 3104)
if not exist node_modules call npm ci
start "" http://localhost:3104
call npm run dev
echo.
echo Server beendet. Fehlermeldung oben pruefen.
pause
