@echo off
echo Testing Client Service Connection
echo =================================

echo.
echo 1. Testing if client service is running on localhost:3001...
curl -s http://localhost:3001/health
if %errorlevel% neq 0 (
    echo ❌ Client service is not running on localhost:3001
    echo    Please start the service with: start-service.bat
    pause
    exit /b 1
) else (
    echo ✅ Client service is running
)

echo.
echo 2. Testing printer status...
curl -s http://localhost:3001/printer/status

echo.
echo 3. Testing simple print...
curl -X POST http://localhost:3001/print -H "Content-Type: application/json" -d "{\"content\":\"Connection Test - %date% %time%\",\"type\":\"test\"}"

echo.
echo 4. Running printer debug script...
node debug-printer-remote.js

echo.
echo Test completed. Check the output above for any errors.
pause
