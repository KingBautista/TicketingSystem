@echo off
echo ========================================
echo   Printer Network Setup Script
echo ========================================
echo.

echo Step 1: Finding your laptop's IP address...
echo.
ipconfig | findstr "IPv4"
echo.

echo Step 2: Starting client-side service...
echo.
echo Starting service on port 3001...
echo Service will be accessible from: http://YOUR_IP:3001
echo.

echo Step 3: Testing printer detection...
echo.
node test-printer-detection.js

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Note your laptop's IP address above
echo 2. Update the server's deployment-config.js with your IP
echo 3. Test the connection from the server
echo 4. Try printing from the POS system
echo.
echo Service is now running on port 3001
echo Press Ctrl+C to stop the service
echo.

node server.js
