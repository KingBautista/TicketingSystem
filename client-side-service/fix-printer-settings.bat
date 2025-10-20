@echo off
echo ========================================
echo   Fix Printer Settings
echo ========================================
echo.

echo This will help you configure your printer
echo for proper 80mm width and QR code printing.
echo.

echo Step 1: Check current printer settings
echo ======================================
echo.

echo Checking printer properties...
wmic printer get name,printerstatus,workoffline

echo.
echo Step 2: Open printer properties
echo ================================
echo.

echo Please follow these steps:
echo 1. Go to Control Panel ^> Devices and Printers
echo 2. Right-click on "Star BSC10" printer
echo 3. Select "Printer Properties"
echo 4. Click "Preferences" or "Printing Preferences"
echo 5. Look for these settings:
echo    - Paper Size: 80mm x 50mm (or similar)
echo    - Orientation: Portrait
echo    - Quality: High
echo    - Paper Type: Thermal
echo.

echo Step 3: Check printer driver settings
echo =====================================
echo.

echo If you see advanced settings, look for:
echo - Paper Width: 80mm
echo - Paper Length: Auto or 50mm
echo - Print Quality: High
echo - Thermal Settings: Enabled
echo.

echo Step 4: Test with a simple print
echo =================================
echo.

echo Testing with a simple print to verify settings...
echo "PRINTER SETTINGS TEST" > test_settings.txt
powershell -Command "Get-Content 'test_settings.txt' -Raw | Out-Printer -Name 'Star BSC10'"

echo.
echo Check your printer for the test print.
echo If the width looks correct, the settings are good.
echo.

pause
