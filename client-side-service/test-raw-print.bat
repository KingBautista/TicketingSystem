@echo off
echo Testing Raw Print Methods
echo =========================

echo.
echo 1. Testing direct USB port (USB001)...
echo Test Print - %date% %time% > test_print.txt
copy /B test_print.txt "USB001"
if %errorlevel% equ 0 (
    echo ✅ Direct USB print successful
) else (
    echo ❌ Direct USB print failed
)

echo.
echo 2. Testing printer share...
copy /B test_print.txt "\\localhost\Star BSC10"
if %errorlevel% equ 0 (
    echo ✅ Printer share print successful
) else (
    echo ❌ Printer share print failed
)

echo.
echo 3. Testing PowerShell print...
powershell -Command "Get-Content 'test_print.txt' -Raw | Out-Printer -Name 'Star BSC10'"
if %errorlevel% equ 0 (
    echo ✅ PowerShell print successful
) else (
    echo ❌ PowerShell print failed
)

echo.
echo 4. Testing with star-final-printer.js...
node star-final-printer.js test

echo.
echo Test completed. Check if paper came out of the printer.
del test_print.txt
pause
