@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Jewelry OS — презентация: http://localhost:8080
echo Веб-приложение: задайте URL в site-config.js после деплоя web на Vercel.
python -m http.server 8080
