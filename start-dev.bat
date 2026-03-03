<<<<<<< HEAD
@echo off
echo Starting AI Student Assistant Development Environment...

echo.
echo Starting Backend Server...
start "Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak > nul

echo.
echo Starting Frontend Server...
start "Frontend" cmd /k "cd frontend && npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5001
echo Frontend: http://localhost:3001
echo Chat Interface: http://localhost:3001/chat
echo.
=======
@echo off
echo Starting AI Student Assistant Development Environment...

echo.
echo Starting Backend Server...
start "Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak > nul

echo.
echo Starting Frontend Server...
start "Frontend" cmd /k "cd frontend && npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5001
echo Frontend: http://localhost:3001
echo Chat Interface: http://localhost:3001/chat
echo.
>>>>>>> 3a8404a015d22246949d5219a5cad637a56db561
pause