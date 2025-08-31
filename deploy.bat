@echo off
setlocal enabledelayedexpansion

REM TicketingSystem Deployment Script for Windows
REM This script automates the deployment process for both development and production environments

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
if not exist "docker-compose.dev.yml" (
    echo [ERROR] Missing required file: docker-compose.dev.yml
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
    echo [WARNING] .env file already exists, skipping creation
)

REM Setup admin panel environment
echo [INFO] Setting up admin panel environment...
if not exist "admin-panel\.env" (
    echo VITE_API_BASE_URL=http://localhost:8080 > admin-panel\.env
    echo [SUCCESS] Created admin-panel .env file
) else (
    echo [WARNING] admin-panel .env file already exists, skipping creation
)

REM Build containers
echo [INFO] Building Docker containers...
if "%ENVIRONMENT%"=="production" (
    docker-compose -f docker-compose.prod.yml build
    if errorlevel 1 (
        echo [ERROR] Failed to build production containers
        exit /b 1
    )
    echo [SUCCESS] Production containers built successfully
) else (
    docker-compose -f docker-compose.dev.yml build
    if errorlevel 1 (
        echo [ERROR] Failed to build development containers
        exit /b 1
    )
    echo [SUCCESS] Development containers built successfully
)

REM Start services
echo [INFO] Starting services...
if "%ENVIRONMENT%"=="production" (
    docker-compose -f docker-compose.prod.yml up -d
    if errorlevel 1 (
        echo [ERROR] Failed to start production services
        exit /b 1
    )
    echo [SUCCESS] Production services started successfully
) else (
    docker-compose -f docker-compose.dev.yml up -d
    if errorlevel 1 (
        echo [ERROR] Failed to start development services
        exit /b 1
    )
    echo [SUCCESS] Development services started successfully
)

REM Wait for services to be ready and ensure Laravel setup is complete
echo [INFO] Waiting for services to be ready...
timeout /t 15 /nobreak >nul

REM Wait for Laravel container to be healthy
echo [INFO] Waiting for Laravel container to be healthy...
:wait_laravel
if "%ENVIRONMENT%"=="production" (
    docker-compose -f docker-compose.prod.yml ps laravel | findstr "healthy" >nul
) else (
    docker-compose -f docker-compose.dev.yml ps laravel | findstr "healthy" >nul
)
if errorlevel 1 (
    echo [INFO] Laravel container not ready yet, waiting...
    timeout /t 5 /nobreak >nul
    goto :wait_laravel
)
echo [SUCCESS] Laravel container is healthy

REM Ensure APP_KEY is generated
echo [INFO] Ensuring APP_KEY is generated...
if "%ENVIRONMENT%"=="production" (
    docker-compose -f docker-compose.prod.yml exec -T laravel php artisan key:generate --force
) else (
    docker-compose -f docker-compose.dev.yml exec -T laravel php artisan key:generate --force
)

if errorlevel 1 (
    echo [WARNING] APP_KEY generation failed, but continuing...
)

REM Run migrations
echo [INFO] Running database migrations...

if "%ENVIRONMENT%"=="production" (
    docker-compose -f docker-compose.prod.yml exec -T laravel php artisan migrate --force
    docker-compose -f docker-compose.prod.yml exec -T laravel php artisan db:seed --force
) else (
    docker-compose -f docker-compose.dev.yml exec -T laravel php artisan migrate
    docker-compose -f docker-compose.dev.yml exec -T laravel php artisan db:seed
)

if errorlevel 1 (
    echo [ERROR] Failed to run database migrations
    exit /b 1
)

echo [SUCCESS] Database migrations completed

REM Optimize for production
if "%ENVIRONMENT%"=="production" (
    echo [INFO] Optimizing for production...
    docker-compose -f docker-compose.prod.yml exec -T laravel php artisan config:cache
    docker-compose -f docker-compose.prod.yml exec -T laravel php artisan route:cache
    docker-compose -f docker-compose.prod.yml exec -T laravel php artisan view:cache
    echo [SUCCESS] Production optimization completed
)

REM Check service health
echo [INFO] Checking service health...
if "%ENVIRONMENT%"=="production" (
    docker-compose -f docker-compose.prod.yml ps | findstr "Exit" >nul
) else (
    docker-compose -f docker-compose.dev.yml ps | findstr "Exit" >nul
)

if not errorlevel 1 (
    echo [ERROR] Some containers are not running properly
    if "%ENVIRONMENT%"=="production" (
        docker-compose -f docker-compose.prod.yml ps
    ) else (
        docker-compose -f docker-compose.dev.yml ps
    )
    exit /b 1
)

echo [SUCCESS] All services are healthy

REM Display information
echo [SUCCESS] Deployment completed successfully!
echo.
echo Access Information:
echo ==================
if "%ENVIRONMENT%"=="production" (
    echo Main Application: http://your-domain.com
    echo API Documentation: http://your-domain.com/api/documentation
    echo Admin Panel: http://your-domain.com/admin
) else (
    echo Main Application: http://localhost:8080
    echo API Documentation: http://localhost:8080/api/documentation
    echo Admin Panel: http://localhost:4000
    echo Laravel API: http://localhost:8080
)

echo.
echo Useful Commands:
echo ================
if "%ENVIRONMENT%"=="production" (
    echo View logs: docker-compose -f docker-compose.prod.yml logs -f
    echo Stop services: docker-compose -f docker-compose.prod.yml down
    echo Restart services: docker-compose -f docker-compose.prod.yml restart
    echo Check status: docker-compose -f docker-compose.prod.yml ps
) else (
    echo View logs: docker-compose -f docker-compose.dev.yml logs -f
    echo Stop services: docker-compose -f docker-compose.dev.yml down
    echo Restart services: docker-compose -f docker-compose.dev.yml restart
    echo Check status: docker-compose -f docker-compose.dev.yml ps
)

pause
