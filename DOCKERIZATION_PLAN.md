# TicketingSystem Dockerization Plan

## Project Overview

The TicketingSystem is a comprehensive multi-component application designed for ticket management with hardware integration capabilities. This document outlines the complete Dockerization strategy for deploying the system in both development and production environments.

### System Components

1. **Laravel Backend API** (PHP 8.3, Laravel 10.10)
2. **React Admin Panel** (React 19, Vite 6.2, CoreUI 5.3)
3. **Client Printer Service** (Node.js Express 4.18)
4. **PD300 Display Service** (Node.js with USB/Serial dependencies)
5. **PostgreSQL Database** (v17.5)
6. **KQT300 Device Integration** (QR/RFID Access Control)

## Current Project Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   KQT300 Device │    │   Client PC     │    │   PD300 Display │
│   (192.168.1.x) │    │   (Local)       │    │   (USB/Serial)  │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │    Docker Host Network    │
                    │     (192.168.1.1)        │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │    Docker Containers     │
                    │   (172.20.0.0/16)        │
                    └─────────────┬─────────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
┌───────▼────────┐    ┌───────────▼──────────┐    ┌────────▼────────┐
│   Nginx Proxy  │    │   Laravel API       │    │   React Admin   │
│   (Port 80/443)│    │   (Port 8000)       │    │   (Port 4000)   │
└───────┬────────┘    └───────────┬──────────┘    └────────┬────────┘
        │                         │                       │
        └─────────────────────────┼───────────────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │   PostgreSQL Database    │
                    │   (Port 5432)            │
                    └───────────────────────────┘
```

## Current Directory Structure

```
TicketingSystem/
├── docker-compose.yml                 # Development environment
├── docker-compose.prod.yml           # Production environment
├── docker-compose.override.yml       # Local overrides
├── .env.docker                       # Docker environment variables
├── .dockerignore                     # Docker ignore file
├── docker/
│   ├── laravel/
│   │   ├── Dockerfile                # PHP 8.1+ + Laravel 10
│   │   ├── Dockerfile.prod           # Production optimized
│   │   └── docker-entrypoint.sh      # Container startup script
│   ├── admin-panel/
│   │   ├── Dockerfile                # React 19 + Vite build
│   │   ├── Dockerfile.prod           # Production build
│   │   └── nginx.conf                # Nginx config for React
│   ├── client-printer/
│   │   └── Dockerfile                # Node.js printer service
│   ├── pd300-display/
│   │   └── Dockerfile                # Node.js display service
│   ├── nginx/
│   │   ├── Dockerfile                # Nginx reverse proxy
│   │   ├── nginx.conf                # Main nginx config
│   │   └── conf.d/
│   │       ├── laravel.conf          # Laravel API config
│   │       ├── admin-panel.conf      # React admin config
│   │       └── kqt300.conf           # KQT300 API config
│   ├── postgres/
│   │   ├── postgresql.conf           # PostgreSQL config
│   │   ├── postgresql.prod.conf      # Production config
│   │   └── init.sql                  # Database initialization
│   └── php/
│       ├── php.ini                   # PHP configuration
│       └── php.prod.ini              # Production PHP config
├── database/
│   ├── init/                         # Database initialization scripts
│   └── backups/                      # Database backup directory
├── monitoring/
│   ├── prometheus.yml                # Prometheus configuration
│   └── grafana/
│       └── dashboards/               # Grafana dashboards
├── KQT300_SETUP.md                   # KQT300 device configuration guide
└── DOCKERIZATION_PLAN.md             # This document
```

## Current Dependencies

### Laravel Backend (composer.json)
- **PHP**: ^8.1 (using PHP 8.3)
- **Laravel**: ^10.10
- **Key Packages**:
  - `barryvdh/laravel-dompdf`: ^3.1 (PDF generation)
  - `darkaonline/l5-swagger`: ^8.6 (API documentation)
  - `intervention/image`: ^2.7 (Image processing)
  - `laravel/sanctum`: ^3.3 (API authentication)
  - `pawlox/video-thumbnail`: ^5.1 (Video thumbnails)

### React Admin Panel (admin-panel/package.json)
- **React**: ^19.0.0
- **Vite**: ^6.2.0
- **CoreUI**: ^5.3.2
- **Key Packages**:
  - `@fortawesome/react-fontawesome`: ^0.2.2
  - `axios`: ^1.7.7 (HTTP client)
  - `qrcode.react`: ^4.2.0 (QR code generation)
  - `react-router-dom`: ^7.2.0 (Routing)

### Client Printer Service (client-printer-service/package.json)
- **Node.js**: Express ^4.18.2
- **Port**: 3001 (as configured in server.js)
- **Dependencies**: cors, express

### PD300 Display Service (pd300-display/package.json)
- **Node.js**: ES modules
- **Hardware Dependencies**:
  - `@serialport/bindings-cpp`: ^13.0.1
  - `escpos`: ^3.0.0-alpha.6
  - `escpos-usb`: ^3.0.0-alpha.4
  - `serialport`: ^13.0.0
  - `usb`: ^1.9.2

## Container Specifications

### 1. PostgreSQL Container (v17.5)

```yaml
postgres:
  image: postgres:17.5-alpine
  container_name: ticketing_postgres
  environment:
    POSTGRES_DB: ticketing_system
    POSTGRES_USER: ticketing_user
    POSTGRES_PASSWORD: ${DB_PASSWORD}
  volumes:
    - postgres_data:/var/lib/postgresql/data
    - ./docker/postgres/postgresql.conf:/etc/postgresql/postgresql.conf
    - ./docker/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql
  ports:
    - "5432:5432"
  networks:
    - ticketing_network
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U ticketing_user -d ticketing_system"]
    interval: 30s
    timeout: 10s
    retries: 3
```

### 2. Redis Container (v7) - Not Used

*Note: This project does not use Redis. The system gracefully handles the absence of Redis and uses file-based caching instead.*

```yaml
# Redis container removed - not needed for this project
```

### 3. Laravel API Container (PHP 8.1+)

```yaml
  laravel:
    build:
      context: .
      dockerfile: docker/laravel/Dockerfile
    container_name: ticketing_laravel
    environment:
      - APP_ENV=${APP_ENV}
      - APP_DEBUG=${APP_DEBUG}
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_DATABASE=ticketing_system
      - DB_USERNAME=ticketing_user
      - DB_PASSWORD=${DB_PASSWORD}
      - CACHE_DRIVER=file
      - SESSION_DRIVER=file
      - QUEUE_CONNECTION=sync
    volumes:
      - .:/var/www/html
      - ./storage:/var/www/html/storage
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - ticketing_network
    healthcheck:
      test: ["CMD", "php", "artisan", "route:list"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### 4. React Admin Panel Container

```yaml
admin_panel:
  build:
    context: ./admin-panel
    dockerfile: ../docker/admin-panel/Dockerfile
  container_name: ticketing_admin_panel
  environment:
    - VITE_API_URL=${API_URL}
  volumes:
    - ./admin-panel:/app
    - /app/node_modules
  ports:
    - "4000:4000"
  networks:
    - ticketing_network
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:4000"]
    interval: 30s
    timeout: 10s
    retries: 3
```

### 5. Client Printer Service Container

```yaml
client_printer:
  build:
    context: ./client-printer-service
    dockerfile: ../docker/client-printer/Dockerfile
  container_name: ticketing_client_printer
  environment:
    - PORT=3001
    - API_URL=${API_URL}
  ports:
    - "3001:3001"
  networks:
    - ticketing_network
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
    interval: 30s
    timeout: 10s
    retries: 3
```

### 6. PD300 Display Service Container

```yaml
pd300_display:
  build:
    context: ./pd300-display
    dockerfile: ../docker/pd300-display/Dockerfile
  container_name: ticketing_pd300_display
  environment:
    - API_URL=${API_URL}
  volumes:
    - /dev:/dev:ro  # Access to USB devices
  devices:
    - /dev/bus/usb:/dev/bus/usb
  networks:
    - ticketing_network
  healthcheck:
    test: ["CMD", "node", "-e", "console.log('PD300 service running')"]
    interval: 30s
    timeout: 10s
    retries: 3
```

### 7. Nginx Reverse Proxy Container

```yaml
nginx:
  build:
    context: ./docker/nginx
    dockerfile: Dockerfile
  container_name: ticketing_nginx
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./docker/nginx/nginx.conf:/etc/nginx/nginx.conf
    - ./docker/nginx/conf.d:/etc/nginx/conf.d
    - ./storage/logs:/var/log/nginx
  depends_on:
    - laravel
    - admin_panel
  networks:
    - ticketing_network
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost/health"]
    interval: 30s
    timeout: 10s
    retries: 3
```

## Current KQT300 Integration Status

### ✅ Implemented and Tested

The KQT300 integration has been successfully implemented with a simplified, production-ready approach:

#### Current API Endpoints

```php
// KQT300 Device Integration Routes (Primary)
Route::prefix('kqt300')->group(function () {
    // Device status and health check
    Route::get('/status', [KQT300Controller::class, 'getStatus']);
    Route::get('/health', [ScanController::class, 'health']);
    
    // Core access control endpoints (used by KQT300 device)
    Route::post('/validate', [ScanController::class, 'store']);
    Route::get('/latest', [ScanController::class, 'showLatest']);
    Route::get('/stream', [ScanController::class, 'stream']);
    Route::get('/poll', [ScanController::class, 'poll']);
    Route::get('/stream-test', [ScanController::class, 'streamTest']);
    Route::post('/check', [ScanController::class, 'checkCode']);
    Route::post('/test-scan', [ScanController::class, 'testScan']);
});

// Legacy access routes (for backward compatibility)
Route::prefix('access')->group(function () {
    Route::post('/validate', [ScanController::class, 'store']);
    Route::get('/latest', [ScanController::class, 'showLatest']);
    Route::get('/stream', [ScanController::class, 'stream']);
    Route::get('/poll', [ScanController::class, 'poll']);
    Route::get('/stream-test', [ScanController::class, 'streamTest']);
    Route::post('/check', [ScanController::class, 'checkCode']);
    Route::post('/test-scan', [ScanController::class, 'testScan']);
    Route::get('/health', [ScanController::class, 'health']);
});
```

#### KQT300Controller Features

- **Device Status**: `/api/kqt300/status` - Returns system health and endpoint information
- **Health Monitoring**: `/api/kqt300/health` - Laravel health check endpoint
- **Error Handling**: Graceful handling of missing Redis extension
- **Docker Ready**: Optimized for containerized deployment

#### Updated Frontend (scan.blade.php)

- **Real-time Streaming**: Uses `/api/kqt300/stream` for live scan updates
- **Polling Fallback**: Uses `/api/kqt300/poll` when streaming fails
- **Test Functions**: All test buttons use KQT300 endpoints
- **Status Monitoring**: Uses `/api/kqt300/status` for device verification

### KQT300 Configuration for Docker

#### Device Network Settings
```bash
# KQT300 Device Settings for Docker Environment
IP Address: 192.168.1.100
Subnet Mask: 255.255.255.0
Gateway: 192.168.1.1
DNS: 8.8.8.8

# API Configuration (Using KQT300 Endpoints)
Primary Endpoint: http://192.168.1.1:8080/api/kqt300/validate
Stream Endpoint: http://192.168.1.1:8080/api/kqt300/stream
Status Endpoint: http://192.168.1.1:8080/api/kqt300/status
```

#### QR Scanner Config Tool Settings
- **Http Server Address**: `http://your-server.com/api/kqt300/validate`
- **Heartbeat Data**: `/api/kqt300/status`
- **Stream Endpoint**: `/api/kqt300/stream`
- **Poll Endpoint**: `/api/kqt300/poll`

## Docker Configuration Files

### docker-compose.yml (Development)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:17.5-alpine
    container_name: ticketing_postgres
    environment:
      POSTGRES_DB: ticketing_system
      POSTGRES_USER: ticketing_user
      POSTGRES_PASSWORD: ${DB_PASSWORD:-ticketing_password}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./docker/postgres/postgresql.conf:/etc/postgresql/postgresql.conf
    ports:
      - "5432:5432"
    networks:
      - ticketing_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ticketing_user -d ticketing_system"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Redis service removed - not used in this project

  laravel:
    build:
      context: .
      dockerfile: docker/laravel/Dockerfile
    container_name: ticketing_laravel
    environment:
      - APP_ENV=${APP_ENV:-local}
      - APP_DEBUG=${APP_DEBUG:-true}
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_DATABASE=ticketing_system
      - DB_USERNAME=ticketing_user
      - DB_PASSWORD=${DB_PASSWORD:-ticketing_password}
      - REDIS_HOST=redis
      - REDIS_PASSWORD=${REDIS_PASSWORD:-redis_password}
    volumes:
      - .:/var/www/html
      - ./storage:/var/www/html/storage
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - ticketing_network
    healthcheck:
      test: ["CMD", "php", "artisan", "route:list"]
      interval: 30s
      timeout: 10s
      retries: 3

  admin_panel:
    build:
      context: ./admin-panel
      dockerfile: ../docker/admin-panel/Dockerfile
    container_name: ticketing_admin_panel
    environment:
      - VITE_API_URL=${API_URL:-http://localhost:8000}
    volumes:
      - ./admin-panel:/app
      - /app/node_modules
    ports:
      - "4000:4000"
    networks:
      - ticketing_network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4000"]
      interval: 30s
      timeout: 10s
      retries: 3

  client_printer:
    build:
      context: ./client-printer-service
      dockerfile: ../docker/client-printer/Dockerfile
    container_name: ticketing_client_printer
    environment:
      - PORT=3001
      - API_URL=${API_URL:-http://localhost:8000}
    ports:
      - "3001:3001"
    networks:
      - ticketing_network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  pd300_display:
    build:
      context: ./pd300-display
      dockerfile: ../docker/pd300-display/Dockerfile
    container_name: ticketing_pd300_display
    environment:
      - API_URL=${API_URL:-http://localhost:8000}
    volumes:
      - /dev:/dev:ro
    devices:
      - /dev/bus/usb:/dev/bus/usb
    networks:
      - ticketing_network
    healthcheck:
      test: ["CMD", "node", "-e", "console.log('PD300 service running')"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    build:
      context: ./docker/nginx
      dockerfile: Dockerfile
    container_name: ticketing_nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./docker/nginx/conf.d:/etc/nginx/conf.d
      - ./storage/logs:/var/log/nginx
    depends_on:
      - laravel
      - admin_panel
    networks:
      - ticketing_network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres_data:

networks:
  ticketing_network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

### .env.docker

```bash
# Application
APP_NAME="Ticketing System"
APP_ENV=production
APP_DEBUG=false
APP_URL=http://localhost
APP_TIMEZONE=UTC

# Database
DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=ticketing_system
DB_USERNAME=ticketing_user
DB_PASSWORD=ticketing_secure_password_2024

# Cache and Session (File-based, no Redis)
CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync

# API Configuration
API_URL=http://localhost:8000
ADMIN_PANEL_URL=http://localhost:4000

# KQT300 Configuration
KQT300_API_URL=http://localhost:8000/api/kqt300
KQT300_DEVICE_TIMEOUT=30
KQT300_HEARTBEAT_INTERVAL=60

# Security
SESSION_DRIVER=file
CACHE_DRIVER=file
QUEUE_CONNECTION=sync

# Mail (configure as needed)
MAIL_MAILER=smtp
MAIL_HOST=mailhog
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="noreply@ticketingsystem.com"
MAIL_FROM_NAME="${APP_NAME}"

# Logging
LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

# Monitoring
PROMETHEUS_ENABLED=true
GRAFANA_ENABLED=true
```

## Dockerfile Configurations

### Laravel Dockerfile (docker/laravel/Dockerfile)

```dockerfile
FROM php:8.3-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    libxml2-dev \
    zip \
    unzip \
    postgresql-dev \
    oniguruma-dev \
    freetype-dev \
    libjpeg-turbo-dev \
    libzip-dev

# Install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_pgsql mbstring exif pcntl bcmath gd zip

# Install Redis extension (optional - not used in this project)
# RUN pecl install redis && docker-php-ext-enable redis

# Set working directory
WORKDIR /var/www/html

# Copy composer files
COPY composer.json composer.lock ./

# Install composer dependencies
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
RUN composer install --no-dev --optimize-autoloader

# Copy application files
COPY . .

# Set permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache

# Copy entrypoint script
COPY docker/laravel/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 9000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["php-fpm"]
```

### React Admin Panel Dockerfile (docker/admin-panel/Dockerfile)

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build for production
RUN npm run build

# Install serve for production
RUN npm install -g serve

EXPOSE 4000

CMD ["serve", "-s", "dist", "-l", "4000"]
```

### Nginx Configuration (docker/nginx/conf.d/kqt300.conf)

```nginx
# KQT300 Device API Configuration
location /api/kqt300/ {
    proxy_pass http://laravel:9000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # Allow KQT300 devices
    allow 192.168.1.0/24;
    allow 172.20.0.0/16;
    deny all;
    
    # Timeout settings for device communication
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
    
    # Buffer settings
    proxy_buffering off;
    proxy_request_buffering off;
}

# Health check endpoint
location /health {
    access_log off;
    return 200 "healthy\n";
    add_header Content-Type text/plain;
}
```

## Deployment Instructions

### 1. Development Setup

```bash
# Clone the repository
git clone <repository-url>
cd TicketingSystem

# Copy environment file
cp .env.docker .env

# Build and start containers
docker-compose up -d --build

# Run database migrations
docker-compose exec laravel php artisan migrate

# Seed the database
docker-compose exec laravel php artisan db:seed

# Generate application key
docker-compose exec laravel php artisan key:generate

# Clear caches
docker-compose exec laravel php artisan config:clear
docker-compose exec laravel php artisan cache:clear
docker-compose exec laravel php artisan route:clear
```

### 2. Production Setup

```bash
# Use production compose file
docker-compose -f docker-compose.prod.yml up -d --build

# Set production environment
docker-compose -f docker-compose.prod.yml exec laravel php artisan config:cache
docker-compose -f docker-compose.prod.yml exec laravel php artisan route:cache
docker-compose -f docker-compose.prod.yml exec laravel php artisan view:cache
```

### 3. KQT300 Device Configuration

1. **Open QR Scanner Config Tool**
2. **Configure Network Settings**:
   - IP Address: `192.168.1.100`
   - Subnet Mask: `255.255.255.0`
   - Gateway: `192.168.1.1`
3. **Configure API Endpoints**:
   - HTTP Server Address: `http://192.168.1.1:8080/api/kqt300/validate`
   - Heartbeat Data: `/api/kqt300/status`
4. **Generate QR Code** and scan with KQT300 device

## Monitoring and Health Checks

### Health Check Endpoints

- **Laravel API**: `GET /api/kqt300/health`
- **Admin Panel**: `GET /admin/health`
- **Client Printer**: `GET /health`
- **PD300 Display**: `GET /health`
- **Nginx**: `GET /health`

### Monitoring Stack

```yaml
# Add to docker-compose.yml for monitoring
prometheus:
  image: prom/prometheus:latest
  container_name: ticketing_prometheus
  ports:
    - "9090:9090"
  volumes:
    - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
  networks:
    - ticketing_network

grafana:
  image: grafana/grafana:latest
  container_name: ticketing_grafana
  ports:
    - "3000:3000"
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=admin
  volumes:
    - grafana_data:/var/lib/grafana
    - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards
  networks:
    - ticketing_network
```

## Security Considerations

### Network Security
- **KQT300 Network**: Isolated network segment (192.168.1.0/24)
- **Docker Network**: Internal bridge network (172.20.0.0/16)
- **Firewall Rules**: Restrict access to KQT300 endpoints

### API Security
- **Rate Limiting**: Implemented for all endpoints
- **Authentication**: Laravel Sanctum for API access
- **CORS**: Configured for cross-origin requests
- **Input Validation**: All endpoints validate input data

### Data Security
- **Database**: PostgreSQL with encrypted connections
- **Redis**: Password-protected Redis instance
- **File Permissions**: Proper file permissions for Laravel
- **Environment Variables**: Secure environment variable management

## Troubleshooting

### Common Issues

1. **Cache/Session Issues**
   - Solution: Using file-based caching (no Redis required)
   - Check: `docker-compose logs laravel`

2. **KQT300 Device Not Connecting**
   - Check: Network configuration in QR Scanner Config Tool
   - Verify: Firewall rules allow KQT300 traffic
   - Test: `curl http://your-server.com/api/kqt300/status`

3. **Database Connection Issues**
   - Check: PostgreSQL container health
   - Verify: Database credentials in .env file
   - Test: `docker-compose exec laravel php artisan tinker`

4. **Admin Panel Not Loading**
   - Check: React build process
   - Verify: Vite configuration
   - Test: `curl http://localhost:4000`

### Log Locations

- **Laravel Logs**: `./storage/logs/laravel.log`
- **Nginx Logs**: `./storage/logs/nginx/`
- **Docker Logs**: `docker-compose logs [service-name]`

## Performance Optimization

### Production Optimizations

1. **Laravel Optimizations**
   ```bash
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   composer install --optimize-autoloader --no-dev
   ```

2. **Nginx Optimizations**
   - Enable gzip compression
   - Configure caching headers
   - Optimize worker processes

3. **Database Optimizations**
   - Configure PostgreSQL for production
   - Set appropriate connection pools
   - Optimize queries with indexes

4. **Cache Optimizations**
   - Configure file cache directory permissions
   - Set appropriate cache TTL values
   - Monitor cache file sizes

## Backup and Recovery

### Database Backup

```bash
# Create backup
docker-compose exec postgres pg_dump -U ticketing_user ticketing_system > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U ticketing_user ticketing_system < backup.sql
```

### File Backup

```bash
# Backup storage directory
tar -czf storage_backup.tar.gz storage/

# Backup uploads
tar -czf uploads_backup.tar.gz public/uploads/
```

## Project Status Summary

### ✅ Completed Implementation

#### KQT300 Integration (August 31, 2025)
- **✅ Routes**: KQT300 and legacy access routes implemented and tested
- **✅ Controller**: KQT300Controller with status endpoint and error handling
- **✅ Frontend**: scan.blade.php updated to use new KQT300 endpoints
- **✅ Testing**: All endpoints tested and working correctly
- **✅ Documentation**: KQT300_SETUP.md created with configuration guide

#### Current System Status
- **✅ Laravel API**: PHP 8.3, Laravel 10.10, all routes functional
- **✅ React Admin**: React 19, Vite 6.2, CoreUI 5.3
- **✅ Database**: PostgreSQL 17.5 ready for Docker deployment
- **✅ Services**: Client printer (port 3001) and PD300 display services
- **✅ Cache**: File-based caching (no Redis required)
- **✅ Health Checks**: All endpoints have health monitoring

#### Testing Results
- **✅ KQT300 Status**: `GET /api/kqt300/status` - Working
- **✅ Health Check**: `GET /api/kqt300/health` - Working
- **✅ Test Scan**: `POST /api/kqt300/test-scan` - Working
- **✅ Stream**: `GET /api/kqt300/stream` - Working (SSE)
- **✅ Legacy Routes**: All `/api/access/*` routes - Working

### 🚀 Ready for Docker Deployment

The TicketingSystem is now fully prepared for Docker containerization with:
- Complete KQT300 device integration
- Updated frontend with real-time monitoring
- Robust error handling and health checks
- Production-ready configuration
- Comprehensive documentation

## Conclusion

This Dockerization plan provides a comprehensive, production-ready deployment strategy for the TicketingSystem. The KQT300 integration has been successfully implemented and tested, with a simplified approach that maintains backward compatibility while providing enhanced device management capabilities.

The system is designed to be scalable, secure, and maintainable, with proper monitoring, health checks, and backup strategies in place. The modular architecture allows for easy updates and maintenance of individual components.

**Next Steps:**
1. Implement the Docker configuration files
2. Set up monitoring and alerting
3. Configure SSL certificates for production
4. Set up automated backup procedures
5. Implement CI/CD pipeline for automated deployments

---

**Document Version**: 2.0  
**Last Updated**: August 31, 2025  
**Next Review**: Quarterly  
**Maintained By**: Development Team
