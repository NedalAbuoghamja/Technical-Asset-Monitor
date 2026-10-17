@echo off
chcp 65001 > nul
title منظومة إدارة الأصول والأجهزة - الوضع المحلي
echo ========================================================
echo         جاري تشغيل المنظومة محلياً بدون إنترنت...
echo ========================================================
echo.

cd /d "c:\Users\LITCADMIN\OneDrive - LITC\Antigravity\Technical-Asset-Monitor"

:: Start browser after 2 seconds
start "" cmd /c "timeout /t 2 /nobreak > nul & start http://localhost:3000"

:: Start local SQLite server
"C:\Program Files\Adobe\Adobe Creative Cloud Experience\libs\node.exe" server.js

pause
