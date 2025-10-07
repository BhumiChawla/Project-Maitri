@echo off
echo ========================================
echo    MAITRI - Starting Backend and Frontend
echo ========================================

REM Set window title
title MAITRI - Full Stack Application

echo.
echo [1/3] Starting Spring Boot Backend...
echo.

REM Start backend in a new window
start "MAITRI Backend" /D "%~dp0MAITRI Backend" cmd /k "echo Starting Spring Boot... && mvn spring-boot:run"

echo Backend is starting in a separate window...
echo Waiting 15 seconds for backend to initialize...

REM Wait for backend to start
timeout /t 15 /nobreak > nul

echo.
echo [2/3] Starting React Frontend...
echo.

REM Start frontend in a new window
start "MAITRI Frontend" /D "%~dp0MAITRI React" cmd /k "echo Starting React Dev Server... && npm run dev"

echo Frontend is starting in a separate window...
echo Waiting 10 seconds for frontend to initialize...

REM Wait for frontend to start
timeout /t 10 /nobreak > nul

echo.
echo [3/3] Opening MAITRI in your browser...
echo.

REM Open the website in default browser (try both possible ports)
start "" "http://localhost:5173"
timeout /t 2 /nobreak > nul
start "" "http://localhost:5174"

echo.
echo ========================================
echo    MAITRI APPLICATION READY!
echo ========================================
echo.
echo Backend: http://localhost:8080
echo Frontend: http://localhost:5173 or http://localhost:5174
echo Browser: Opening automatically...
echo.
echo Both servers are running in separate windows.
echo Your browser should now open to the MAITRI website.
echo You can close this window now.
echo.
pause
