@echo off
echo ========================================
echo   Find Your Printer Port
echo ========================================
echo.

echo This will test all USB ports to find where your printer is connected.
echo Make sure your printer is turned on and connected!
echo.

echo Starting port detection...
echo.

node find-printer-port.js

echo.
echo ========================================
echo   Detection Complete!
echo ========================================
echo.
echo Check the results above to see which port your printer is on.
echo.
pause
