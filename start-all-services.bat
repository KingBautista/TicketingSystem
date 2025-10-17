@echo off
echo Starting All Services
echo ====================

echo.
echo 1. Starting Client Service (port 3001)...
start "Client Service" cmd /k "cd /d C:\wamp64\www\TicketingSystem\client-side-service && node server.js"

echo.
echo 2. Starting Laravel API (port 8000)...
start "Laravel API" cmd /k "cd /d C:\wamp64\www\TicketingSystem && php artisan serve --host=0.0.0.0 --port=8000"

echo.
echo 3. Starting Admin Panel (port 4000)...
start "Admin Panel" cmd /k "cd /d C:\wamp64\www\TicketingSystem\admin-panel && npm run dev"

echo.
echo All services are starting in separate windows.
echo Wait 10-15 seconds for all services to fully start.
echo.
echo Then run: test-services.bat
echo.
pause
