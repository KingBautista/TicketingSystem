@echo off
title Client-Side Service (TEST MODE - No Physical Printer Required)
color 0E

echo ========================================
echo   Client-Side Service Starting...
echo   🧪 TEST MODE ENABLED 🧪
echo ========================================
echo.
echo Computer: %COMPUTERNAME%
echo Service: Printer + Display + PD300 (TEST MODE)
echo Port: 4000
echo.
echo ⚠️  WARNING: Running in TEST MODE
echo    - No physical printer required
echo    - Print operations will be simulated
echo    - Print content saved to test-output folder
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

echo Starting Client-Side Service in TEST MODE...
echo.

REM Generate frontend configuration
echo Generating frontend configuration...
node generate-frontend-config.js
if %errorlevel% neq 0 (
    echo WARNING: Failed to generate frontend config, continuing anyway...
)

echo.
echo Service will be available at:
echo   http://localhost:4000
echo   http://%COMPUTERNAME%:4000
echo   http://192.168.0.176:4000
echo   (Network IP will be detected automatically)
echo.
echo 🧪 TEST MODE FEATURES:
echo   - Print operations simulated (no physical printer needed)
echo   - Print content saved to: test-output/
echo   - Test logs saved to: test-prints.log
echo   - Check /test-mode/status endpoint for statistics
echo.
echo Press Ctrl+C to stop the service
echo ========================================
echo.

REM Start the service with test mode enabled
echo Starting Node.js service in TEST MODE...
set PRINTER_TEST_MODE=true
node server.js --test-mode
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Service failed to start!
    echo Check the error messages above.
    echo.
    pause
    exit /b 1
)

REM If the service stops, show this message
echo.
echo ========================================
echo   Service stopped
echo ========================================
pause
