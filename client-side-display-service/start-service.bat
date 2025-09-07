@echo off
echo 📺 Starting Client Display Service...
echo 💻 Computer: %COMPUTERNAME%
echo 📍 This service runs on the cashier computer
echo 🌐 Service will be available at: http://localhost:3002
echo 🔗 Server can access via: http://%COMPUTERNAME%:3002
echo.

cd /d "%~dp0"

echo 📁 Current directory: %CD%
echo 📦 Installing dependencies...
call npm install

echo 🚀 Starting display service...
echo ⚠️  Keep this window open while using the display service
echo.
call npm start
