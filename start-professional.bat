<<<<<<< HEAD
@echo off
echo ========================================
echo   AI Student Assistant - Professional
echo ========================================
echo.
echo Starting professional development servers...
echo.

echo [1/3] Starting Backend Server (Port 5001)...
start "Backend Server" cmd /k "cd backend && npm start"

timeout /t 3 /nobreak > nul

echo [2/3] Starting Frontend Server (Port 3001)...
start "Frontend Server" cmd /k "cd frontend && npm start"

timeout /t 2 /nobreak > nul

echo [3/3] Opening Professional UI...
timeout /t 8 /nobreak > nul
start http://localhost:3001

echo.
echo ========================================
echo   Professional UI Available At:
echo   http://localhost:3001
echo.
echo   Backend API Available At:
echo   http://localhost:5001
echo ========================================
echo.
echo Press any key to exit...
=======
@echo off
echo ========================================
echo   AI Student Assistant - Professional
echo ========================================
echo.
echo Starting professional development servers...
echo.

echo [1/3] Starting Backend Server (Port 5001)...
start "Backend Server" cmd /k "cd backend && npm start"

timeout /t 3 /nobreak > nul

echo [2/3] Starting Frontend Server (Port 3001)...
start "Frontend Server" cmd /k "cd frontend && npm start"

timeout /t 2 /nobreak > nul

echo [3/3] Opening Professional UI...
timeout /t 8 /nobreak > nul
start http://localhost:3001

echo.
echo ========================================
echo   Professional UI Available At:
echo   http://localhost:3001
echo.
echo   Backend API Available At:
echo   http://localhost:5001
echo ========================================
echo.
echo Press any key to exit...
>>>>>>> 3a8404a015d22246949d5219a5cad637a56db561
pause > nul