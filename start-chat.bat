<<<<<<< HEAD
@echo off
echo Starting AI Student Assistant Chat Application...
echo.

echo Starting Backend Server (Port 5001)...
start "Backend Server" cmd /k "cd backend && npm start"

timeout /t 3 /nobreak > nul

echo Starting Frontend Server (Port 3001)...
start "Frontend Server" cmd /k "cd frontend && npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5001
echo Frontend: http://localhost:3001/chat
echo.
echo Press any key to exit...
=======
@echo off
echo Starting AI Student Assistant Chat Application...
echo.

echo Starting Backend Server (Port 5001)...
start "Backend Server" cmd /k "cd backend && npm start"

timeout /t 3 /nobreak > nul

echo Starting Frontend Server (Port 3001)...
start "Frontend Server" cmd /k "cd frontend && npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5001
echo Frontend: http://localhost:3001/chat
echo.
echo Press any key to exit...
>>>>>>> 3a8404a015d22246949d5219a5cad637a56db561
pause > nul