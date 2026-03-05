@echo off
echo ========================================
echo   AI Student Assistant - Quick Start
echo ========================================
echo.

echo Checking for existing processes on ports 5002 and 3001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5002') do (
    echo Killing process on port 5002 (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    echo Killing process on port 3001 (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo Starting Backend Server (Port 5002)...
start "Backend Server" cmd /k "cd backend && npm start"

timeout /t 3 /nobreak >nul

echo Starting Frontend Server (Port 3001)...
start "Frontend Server" cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo   Servers Starting...
echo ========================================
echo.
echo Backend:  http://localhost:5002
echo Frontend: http://localhost:3001
echo.
echo Press any key to open the application in browser...
pause >nul

start http://localhost:3001/login

echo.
echo Application opened in browser!
echo.
echo To stop servers, close the terminal windows.
echo.
pause
