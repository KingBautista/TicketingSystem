@echo off
echo ========================================
echo    Printer Debug Tools
echo ========================================
echo.

echo 1. Checking if client service is running...
netstat -an | findstr :3001 >nul
if %errorlevel% equ 0 (
    echo ✅ Client service is running on port 3001
) else (
    echo ❌ Client service is NOT running on port 3001
    echo    Please start it first: cd client-side-service ^&^& node server.js
    echo.
    pause
    exit /b 1
)

echo.
echo 2. Testing printer availability with PowerShell...
echo.
powershell -Command "Get-Printer -Name 'Star BSC10' -ErrorAction SilentlyContinue"
if %errorlevel% equ 0 (
    echo ✅ Star BSC10 printer found
) else (
    echo ❌ Star BSC10 printer not found
)

echo.
echo 3. Listing all available printers...
echo.
powershell -Command "Get-Printer | Select-Object Name, PrinterStatus, DriverName, PortName"

echo.
echo 4. Testing simple printing...
echo.
powershell -Command "\"Test Print from Debug Script - %date% %time%\" | Out-Printer -Name 'Star BSC10'"
if %errorlevel% equ 0 (
    echo ✅ Test print command executed successfully
) else (
    echo ❌ Test print command failed
)

echo.
echo 5. Opening printer test web page...
echo    (This will open the web-based debug interface)
echo.
start http://localhost:3001/printer-test

echo.
echo ========================================
echo.
echo 6. Available API endpoints for testing:
echo    - Health check: http://localhost:3001/health
echo    - Printer status: http://localhost:3001/printer/status
echo    - List printers: http://localhost:3001/printer/list
echo    - Test printer: http://localhost:3001/printer-test
echo.
echo 7. Manual PowerShell commands for troubleshooting:
echo    - Get-Printer -Name "Star BSC10"
echo    - Get-Printer | Select-Object Name, PrinterStatus, DriverName
echo    - Get-Service -Name Spooler
echo    - "Test Print" | Out-Printer -Name "Star BSC10"
echo.
echo ========================================
echo Debug tools completed. Check the web interface for detailed results.
echo.
pause