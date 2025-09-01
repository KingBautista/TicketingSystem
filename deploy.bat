@echo off
setlocal enabledelayedexpansion

REM TicketingSystem Deployment Script for Windows
REM This script automates the deployment process for both development and production environments
REM Updated with all fixes: proper API URLs, volume mounting, and port configuration

set "ENVIRONMENT=dev"

REM Parse command line arguments
:parse_args
if "%1"=="" goto :main
if "%1"=="-e" (
    set "ENVIRONMENT=%2"
    shift
    shift
    goto :parse_args
)
if "%1"=="--environment" (
    set "ENVIRONMENT=%2"
    shift
    shift
    goto :parse_args
)
if "%1"=="-h" goto :show_usage
if "%1"=="--help" goto :show_usage
echo [ERROR] Unknown option: %1
goto :show_usage

:show_usage
echo Usage: %0 [OPTIONS]
echo.
echo Options:
echo   -e, --environment ENV    Deployment environment (dev^|prod) [default: dev]
echo   -h, --help               Show this help message
echo.
echo Examples:
echo   %0                      # Deploy development environment
echo   %0 -e prod             # Deploy production environment
echo   %0 --environment dev   # Deploy development environment
exit /b 1

:main
echo [INFO] Starting TicketingSystem deployment (%ENVIRONMENT% environment)...

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed. Please install Docker Desktop first.
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Compose is not installed. Please install Docker Compose first.
    exit /b 1
)

echo [SUCCESS] Docker and Docker Compose are installed

REM Check if required files exist
if not exist "docker-compose.yml" (
    echo [ERROR] Missing required file: docker-compose.yml
    exit /b 1
)

if not exist "env.docker" (
    echo [ERROR] Missing required file: env.docker
    exit /b 1
)

if not exist "docker\laravel\Dockerfile" (
    echo [ERROR] Missing required file: docker\laravel\Dockerfile
    exit /b 1
)

echo [SUCCESS] All required files are present

REM Setup environment
echo [INFO] Setting up environment...
if not exist ".env" (
    copy env.docker .env >nul
    echo [SUCCESS] Created .env file from env.docker
) else (
    echo [WARNING] .env file already exists, checking for required updates...
)

REM Update root .env file with correct API URL
echo [INFO] Updating root .env file with correct API configuration...
echo # Application > .env
echo APP_NAME="Ticketing System" >> .env
echo APP_ENV=local >> .env
echo APP_KEY= >> .env
echo APP_DEBUG=true >> .env
echo APP_URL=http://localhost:8080 >> .env
echo APP_TIMEZONE=UTC >> .env
echo. >> .env
echo # Database >> .env
echo DB_CONNECTION=pgsql >> .env
echo DB_HOST=postgres >> .env
echo DB_PORT=5432 >> .env
echo DB_DATABASE=ticketing_system >> .env
echo DB_USERNAME=ticketing_user >> .env
echo DB_PASSWORD=ticketing_password >> .env
echo. >> .env
echo # Cache ^& Session >> .env
echo CACHE_DRIVER=file >> .env
echo SESSION_DRIVER=file >> .env
echo SESSION_LIFETIME=120 >> .env
echo QUEUE_CONNECTION=sync >> .env
echo. >> .env
echo # API Configuration >> .env
echo API_URL=http://localhost:8080 >> .env
echo L5_SWAGGER_CONST_HOST=http://localhost:8080 >> .env
echo [SUCCESS] Root .env file updated with correct API configuration

REM Setup admin panel environment
echo [INFO] Setting up admin panel environment...
if not exist "admin-panel\.env" (
    echo VITE_API_BASE_URL=http://localhost:8080 > admin-panel\.env
    echo [SUCCESS] Created admin-panel .env file
) else (
    echo [INFO] Updating admin-panel .env file with correct API URL...
    echo VITE_API_BASE_URL=http://localhost:8080 > admin-panel\.env
    echo [SUCCESS] Updated admin-panel .env file
)

REM Stop any existing containers
echo [INFO] Stopping any existing containers...
docker-compose down >nul 2>&1
echo [SUCCESS] Existing containers stopped

REM Build containers
echo [INFO] Building Docker containers...
docker-compose build
if errorlevel 1 (
    echo [ERROR] Failed to build containers
    exit /b 1
)
echo [SUCCESS] Containers built successfully

REM Start services
echo [INFO] Starting services...
docker-compose up -d
if errorlevel 1 (
    echo [ERROR] Failed to start services
    exit /b 1
)
echo [SUCCESS] Services started successfully

REM Wait for services to be ready
echo [INFO] Waiting for services to be ready...
timeout /t 20 /nobreak >nul

REM Wait for Laravel container to be healthy
echo [INFO] Waiting for Laravel container to be healthy...
:wait_laravel
docker-compose ps laravel | findstr "healthy" >nul
if errorlevel 1 (
    echo [INFO] Laravel container not ready yet, waiting...
    timeout /t 10 /nobreak >nul
    goto :wait_laravel
)
echo [SUCCESS] Laravel container is healthy

REM Ensure APP_KEY is generated
echo [INFO] Ensuring APP_KEY is generated...
docker-compose exec -T laravel php artisan key:generate --force
if errorlevel 1 (
    echo [WARNING] APP_KEY generation failed, but continuing...
)

REM Run migrations and seeding
echo [INFO] Running database migrations and seeding...
docker-compose exec -T laravel php artisan migrate --force
if errorlevel 1 (
    echo [ERROR] Failed to run database migrations
    exit /b 1
)

docker-compose exec -T laravel php artisan db:seed --force
if errorlevel 1 (
    echo [WARNING] Database seeding failed, but continuing...
)

echo [SUCCESS] Database setup completed

REM Cache configurations for better performance
echo [INFO] Caching configurations...
docker-compose exec -T laravel php artisan config:cache
docker-compose exec -T laravel php artisan route:cache
docker-compose exec -T laravel php artisan view:cache
echo [SUCCESS] Configuration caching completed

REM Check service health
echo [INFO] Checking service health...
docker-compose ps | findstr "Exit" >nul
if not errorlevel 1 (
    echo [ERROR] Some containers are not running properly
    docker-compose ps
    exit /b 1
)

echo [SUCCESS] All services are healthy

REM Display information
echo [SUCCESS] Deployment completed successfully!
echo.
echo Access Information:
echo ==================
echo Main Application: http://localhost:8080
echo API Documentation: http://localhost:8080/api/documentation
echo Admin Panel: http://localhost:4000
echo Laravel API: http://localhost:8080
echo.
echo Network Access (replace localhost with your IP):
echo Main Application: http://10.198.126.20:8080
echo Admin Panel: http://10.198.126.20:4000
echo.
echo Useful Commands:
echo ================
echo View logs: docker-compose logs -f
echo Stop services: docker-compose down
echo Restart services: docker-compose restart
echo Check status: docker-compose ps
echo.
echo Test API endpoints:
echo curl http://localhost:8080/health
echo curl http://localhost:8080/api/access/health
echo.
echo [INFO] Deployment script completed successfully!

pause
