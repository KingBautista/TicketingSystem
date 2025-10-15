@echo off
echo ========================================
echo    Printer Debug Tools
echo ========================================
echo.

echo 1. Running Node.js printer debug script...
echo.
node test-printer-debug.js

echo.
echo ========================================
echo.
echo 2. Opening printer test web page...
echo    (Make sure the client service is running first!)
echo.
start http://localhost:3001/printer-test.html

echo.
echo ========================================
echo.
echo 3. Available debug commands:
echo    - Check printer status: curl http://localhost:3001/printer/status
echo    - List printers: curl http://localhost:3001/printer/list
echo    - Test printer: curl -X POST http://localhost:3001/printer/test -H "Content-Type: application/json" -d "{\"testType\":\"simple\"}"
echo.
echo 4. Manual PowerShell commands:
echo    - Get-Printer -Name "StarBSC10"
echo    - Get-Printer | Select-Object Name, PrinterStatus, DriverName
echo    - Get-Service -Name Spooler
echo.
pause
