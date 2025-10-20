@echo off
echo ========================================
echo   VERIFY PRINTER IS FIRING
echo ========================================
echo.

echo This will test if your printer is actually printing
echo and identify what methods work.
echo.

echo Starting verification...
echo.

node verify-printer-firing.js

echo.
echo ========================================
echo   Verification Complete!
echo ========================================
echo.
echo Check your printer for any test pages that were printed.
echo.
pause
