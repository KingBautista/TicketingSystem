@echo off
echo 🖨️ Starting Client Printer Service...
echo 💻 Computer: %COMPUTERNAME%
echo 📍 This service runs on the cashier computer
echo 🌐 Service will be available at: http://localhost:3001
echo 🔗 Server can access via: http://%COMPUTERNAME%:3001
echo.

cd /d "%~dp0"

echo 📁 Current directory: %CD%
echo 📦 Installing dependencies...
call npm install

echo 🚀 Starting printer service...
echo ⚠️  Keep this window open while using the printer service
echo.
call npm start
