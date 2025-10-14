@echo off
title Client-Side Service (Printer + Display + PD300)
color 0A

echo ========================================
echo   Client-Side Service Starting...
echo ========================================
echo.
echo Computer: %COMPUTERNAME%
echo Service: Printer + Display + PD300
echo Port: 3000
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if dependencies are installed
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
    echo Dependencies installed successfully!
    echo.
)

echo Starting Client-Side Service...
echo.

REM Generate frontend configuration
echo Generating frontend configuration...
node generate-frontend-config.js

echo.
echo Service will be available at:
echo   http://localhost:3000
echo   http://%COMPUTERNAME%:3000
echo   (Network IP will be detected automatically)
echo.
echo Press Ctrl+C to stop the service
echo ========================================
echo.

REM Start the service
npm start

REM If the service stops, show this message
echo.
echo ========================================
echo   Service stopped
echo ========================================
pause
