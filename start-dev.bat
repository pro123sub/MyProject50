@echo off
echo Starting LoanInNeed Development Environment...
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd Backend && npm start"

echo Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd lin-frontend && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to run integration test...
pause > nul

echo Running integration test...
node test-integration.js

echo.
echo Development environment ready!
echo Visit http://localhost:3000/signup to test the signup flow
pause
