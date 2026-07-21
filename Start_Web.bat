@echo off
chcp 65001 >nul
echo ===================================================
echo        Starting Ginraide Project (Portable)
echo ===================================================
echo.

:: Set dynamic path to the portable Node.js 22
set "NODE_PATH=%~dp0node22\node-v22.14.0-win-x64"
set "PATH=%NODE_PATH%;%PATH%"

:: Start Backend in a new window
echo [1/2] Starting Backend Server (Port 5000)...
start "Ginraide - Backend API" cmd /k "cd backend && node src/server.js"

:: Wait 3 seconds to let backend initialize
timeout /t 3 /nobreak >nul

:: Start Frontend in a new window
echo [2/2] Starting Frontend Web (Port 5173)...
start "Ginraide - Frontend Web" cmd /k "cd frontend && npm run dev"

echo.
echo ===================================================
echo   All systems go! The website is now running.
echo   You can open your browser and go to:
echo   http://localhost:5173
echo ===================================================
echo.
echo PLEASE KEEP THE TWO NEW BLACK WINDOWS OPEN!
echo (Closing them will shut down the website)
echo.
pause
