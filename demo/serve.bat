@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Jewelry OS demo: http://localhost:8080
python -m http.server 8080
