<<<<<<< HEAD
@echo off
echo Starting AI Student Assistant with Admin Panel...
echo.

echo Starting Backend Server (Port 5002)...
start "Backend Server" cmd /k "cd backend && npm start"

timeout /t 3 /nobreak > nul

echo Starting Frontend Server (Port 3001)...
start "Frontend Server" cmd /k "cd frontend && npm start"

echo.
echo Servers are starting...
echo Backend: http://localhost:5002
echo Frontend: http://localhost:3001
echo Admin Panel: http://localhost:3001/admin
echo.
echo Admin Credentials:
echo Email: admin@example.com
echo Password: admin123
echo.
=======
@echo off
echo Starting AI Student Assistant with Admin Panel...
echo.

echo Starting Backend Server (Port 5002)...
start "Backend Server" cmd /k "cd backend && npm start"

timeout /t 3 /nobreak > nul

echo Starting Frontend Server (Port 3001)...
start "Frontend Server" cmd /k "cd frontend && npm start"

echo.
echo Servers are starting...
echo Backend: http://localhost:5002
echo Frontend: http://localhost:3001
echo Admin Panel: http://localhost:3001/admin
echo.
echo Admin Credentials:
echo Email: admin@example.com
echo Password: admin123
echo.
>>>>>>> 3a8404a015d22246949d5219a5cad637a56db561
pause