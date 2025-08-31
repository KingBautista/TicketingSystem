# TicketingSystem Dockerization Plan

## Project Overview

The TicketingSystem is a multi-component application designed for ticket management with hardware integration capabilities. This document outlines the complete Dockerization strategy for deploying the system in both development and production environments.

### System Components

1. **Laravel Backend API** (PHP 8.3, Laravel 10)
2. **React Admin Panel** (React 19, Vite, CoreUI)
3. **Client Printer Service** (Node.js Express)
4. **PD300 Display Service** (Node.js with USB/Serial dependencies)
5. **PostgreSQL Database** (v17.5)
6. **Redis Cache** (v7)
7. **KQT300 Device Integration** (QR/RFID Access Control)

## Architecture Overview

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
                    │   PostgreSQL + Redis     │
                    │   (Port 5432 + 6379)     │
                    └───────────────────────────┘
```

## Directory Structure

```
TicketingSystem/
├── docker-compose.yml                 # Development environment
├── docker-compose.prod.yml           # Production environment
├── docker-compose.override.yml       # Local overrides
├── .env.docker                       # Docker environment variables
├── .dockerignore                     # Docker ignore file
├── docker/
│   ├── laravel/
│   │   ├── Dockerfile                # PHP 8.3 + Laravel
│   │   ├── Dockerfile.prod           # Production optimized
│   │   └── docker-entrypoint.sh      # Container startup script
│   ├── admin-panel/
│   │   ├── Dockerfile                # React + Vite build
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
└── monitoring/
    ├── prometheus.yml                # Prometheus configuration
    └── grafana/
        └── dashboards/               # Grafana dashboards
```

## Container Specifications

### 1. PostgreSQL Container (v17.5)

**Image**: `postgres:17.5-alpine`

**Configuration**:
- Database: `ticketing_system`
- User: `ticketing_user`
- Port: `5432`
- Extensions: `pg_stat_statements`, `uuid-ossp`
- Optimized for high-performance queries
- Automated backups
- Health checks

**Key Features**:
- Connection pooling
- Query optimization
- Comprehensive logging
- Backup and recovery

### 2. Laravel API Container (PHP 8.3)

**Base Image**: `php:8.3-fpm-alpine`

**PHP Extensions**:
- `pdo`, `pdo_pgsql`, `pgsql` (PostgreSQL support)
- `redis` (Caching)
- `gd`, `zip`, `intl` (Image processing, compression, internationalization)
- `opcache` (Performance optimization)
- `mbstring`, `exif`, `pcntl`, `bcmath` (Core functionality)

**Laravel Features**:
- Optimized autoloader
- Route and view caching
- Queue processing
- API documentation (Swagger)
- KQT300 device integration endpoints

### 3. React Admin Panel Container

**Build Stage**: `node:18-alpine`
**Runtime**: `nginx:alpine`

**Features**:
- Hot module replacement (development)
- Optimized production build
- Static file serving
- API proxy configuration
- CoreUI integration

### 4. Redis Container (v7)

**Image**: `redis:7-alpine`

**Configuration**:
- Persistent storage
- Password protection
- Memory optimization
- Backup strategies

### 5. Nginx Reverse Proxy

**Image**: `nginx:alpine`

**Features**:
- SSL/TLS termination
- Load balancing
- Rate limiting
- Static file serving
- API routing
- WebSocket support

### 6. Client Printer Service

**Image**: `node:18-alpine`

**Features**:
- USB device access
- Printer communication
- Receipt generation
- Error handling

### 7. PD300 Display Service

**Image**: `node:18-alpine`

**Features**:
- Serial port communication
- Display management
- USB device access
- Real-time updates

## Network Configuration

### Development Network

```yaml
networks:
  ticketing_network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
          gateway: 172.20.0.1
  
  kqt300_network:
    driver: bridge
    ipam:
      config:
        - subnet: 192.168.1.0/24
          gateway: 192.168.1.1
```

### Production Network

```yaml
networks:
  ticketing_network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
  
  kqt300_network:
    driver: bridge
    ipam:
      config:
        - subnet: 192.168.1.0/24
  
  monitoring_network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.21.0.0/16
```

## Environment Configuration

### Development Environment Variables

```bash
# Database Configuration
DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=ticketing_system
DB_USERNAME=ticketing_user
DB_PASSWORD=dev_password_123

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=dev_redis_123

# Laravel Configuration
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000
LOG_CHANNEL=stack
CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

# KQT300 Configuration
KQT300_API_ENABLED=true
KQT300_DEVICE_IP=192.168.1.100
KQT300_API_PORT=8080
KQT300_API_SECRET=dev_secret_123
KQT300_TIMEOUT=30

# Admin Panel Configuration
VITE_API_BASE_URL=http://localhost:8000/api
NODE_ENV=development

# PHP Configuration
PHP_VERSION=8.3
PHP_MEMORY_LIMIT=512M
PHP_MAX_EXECUTION_TIME=300
PHP_UPLOAD_MAX_FILESIZE=100M
PHP_POST_MAX_SIZE=100M
```

### Production Environment Variables

```bash
# Database Configuration
DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=ticketing_system
DB_USERNAME=ticketing_user
DB_PASSWORD=prod_secure_password_456

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=prod_redis_456

# Laravel Configuration
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com
LOG_CHANNEL=stack
CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

# KQT300 Configuration
KQT300_API_ENABLED=true
KQT300_DEVICE_IP=192.168.1.100
KQT300_API_PORT=8080
KQT300_API_SECRET=prod_secret_456
KQT300_TIMEOUT=30

# Admin Panel Configuration
VITE_API_BASE_URL=https://yourdomain.com/api
NODE_ENV=production

# PHP Configuration
PHP_VERSION=8.3
PHP_MEMORY_LIMIT=1G
PHP_MAX_EXECUTION_TIME=300
PHP_UPLOAD_MAX_FILESIZE=100M
PHP_POST_MAX_SIZE=100M

# SSL Configuration
SSL_CERT_PATH=/etc/nginx/ssl/cert.pem
SSL_KEY_PATH=/etc/nginx/ssl/key.pem
```

## KQT300 Device Integration

### Existing API Endpoints

Your current implementation already includes comprehensive access control endpoints:

```php
// routes/api.php - Existing KQT300 Integration Routes
Route::post('/access/validate', [ScanController::class, 'store']);
Route::get('/access/latest', [ScanController::class, 'showLatest']);
Route::get('/access/stream', [ScanController::class, 'stream']);
Route::get('/access/poll', [ScanController::class, 'poll']);
Route::get('/access/stream-test', [ScanController::class, 'streamTest']);
Route::post('/access/check', [ScanController::class, 'checkCode']);
Route::post('/access/test-scan', [ScanController::class, 'testScan']);
```

### Docker-Optimized KQT300 Configuration

#### Recommended Additional Routes for Enhanced Integration

```php
// Additional routes for comprehensive KQT300 integration
Route::prefix('kqt300')->group(function () {
    // Device management
    Route::get('/status', [KQT300Controller::class, 'getStatus']);
    Route::post('/heartbeat', [KQT300Controller::class, 'heartbeat']);
    Route::post('/register', [KQT300Controller::class, 'registerDevice']);
    
    // Enhanced access control (complementing existing routes)
    Route::post('/scan', [KQT300Controller::class, 'handleScan']);
    Route::post('/card-read', [KQT300Controller::class, 'handleCardRead']);
    Route::post('/access-control', [KQT300Controller::class, 'accessControl']);
    
    // Device configuration
    Route::get('/config', [KQT300Controller::class, 'getConfig']);
    Route::post('/config', [KQT300Controller::class, 'updateConfig']);
});
```

### Communication Protocol

#### QR Code Scan Request (Using Existing Endpoint)
```json
POST /api/access/validate
{
  "device_id": "KQT300_001",
  "qr_data": "TICKET_QR_CODE_123",
  "timestamp": "2024-01-15T10:30:00Z",
  "location": "ENTRANCE_01",
  "api_key": "device_api_key_here"
}
```

#### Access Control Response
```json
{
  "status": "success",
  "access_granted": true,
  "message": "Access granted",
  "ticket_info": {
    "ticket_id": "TICKET_123",
    "customer_name": "John Doe",
    "valid_until": "2024-01-15T23:59:59Z",
    "ticket_type": "VIP",
    "remaining_uses": 1
  },
  "device_action": {
    "unlock_door": true,
    "display_message": "Welcome, John Doe!",
    "sound_alert": "success"
  }
}
```

#### Real-time Streaming (Using Existing Endpoint)
```bash
# KQT300 can use the existing stream endpoint
GET /api/access/stream
# Returns Server-Sent Events (SSE) for real-time updates
```

#### Polling for Updates (Using Existing Endpoint)
```bash
# KQT300 can poll for latest scan data
GET /api/access/latest
# Returns the most recent scan/access attempt
```

### Docker-Specific KQT300 Configuration

#### Device Network Settings
```bash
# KQT300 Device Settings for Docker Environment
IP Address: 192.168.1.100
Subnet Mask: 255.255.255.0
Gateway: 192.168.1.1
DNS: 8.8.8.8

# API Configuration (Using Existing Endpoints)
Primary Endpoint: http://192.168.1.1:8080/api/access/validate
Stream Endpoint: http://192.168.1.1:8080/api/access/stream
Poll Endpoint: http://192.168.1.1:8080/api/access/poll
Latest Endpoint: http://192.168.1.1:8080/api/access/latest

# Communication Settings
Polling Interval: 5 seconds
Timeout: 30 seconds
Retry Attempts: 3
Connection Keep-Alive: true
```

#### Docker Environment Variables for KQT300
```bash
# KQT300 Configuration in .env.docker
KQT300_API_ENABLED=true
KQT300_DEVICE_IP=192.168.1.100
KQT300_API_PORT=8080
KQT300_API_SECRET=your_api_secret_here
KQT300_TIMEOUT=30

# Existing endpoint configuration
ACCESS_VALIDATE_ENDPOINT=/api/access/validate
ACCESS_STREAM_ENDPOINT=/api/access/stream
ACCESS_POLL_ENDPOINT=/api/access/poll
ACCESS_LATEST_ENDPOINT=/api/access/latest
```

### Docker Network Configuration for KQT300

#### Nginx Configuration for KQT300 Endpoints
```nginx
# docker/nginx/conf.d/kqt300.conf
server {
    listen 8080;
    server_name kqt300.local;
    
    # KQT300 API endpoints
    location /api/access/ {
        proxy_pass http://laravel:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # KQT300 specific settings
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
        
        # Allow KQT300 device IP
        allow 192.168.1.0/24;
        deny all;
    }
    
    # Real-time streaming support
    location /api/access/stream {
        proxy_pass http://laravel:8000;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 86400s;
    }
}
```

### Performance Optimization for KQT300

#### Laravel Configuration for High-Frequency Access
```php
// config/queue.php - Optimize for KQT300 requests
'connections' => [
    'redis' => [
        'driver' => 'redis',
        'connection' => 'default',
        'queue' => env('REDIS_QUEUE', 'default'),
        'retry_after' => 90,
        'block_for' => null,
    ],
],

// config/cache.php - Optimize caching for KQT300
'stores' => [
    'redis' => [
        'driver' => 'redis',
        'connection' => 'cache',
        'lock_connection' => 'default',
    ],
],
```

#### Database Optimization for KQT300 Queries
```sql
-- PostgreSQL indexes for KQT300 performance
CREATE INDEX idx_access_logs_device_id ON access_logs(device_id);
CREATE INDEX idx_access_logs_timestamp ON access_logs(timestamp);
CREATE INDEX idx_access_logs_qr_data ON access_logs(qr_data);
CREATE INDEX idx_tickets_status_valid_until ON tickets(status, valid_until);
```

### Monitoring KQT300 Integration

#### Health Check Endpoints
```php
// Add to ScanController for Docker health checks
public function health()
{
    return response()->json([
        'status' => 'healthy',
        'timestamp' => now(),
        'device_connections' => $this->getActiveDeviceCount(),
        'last_scan' => $this->getLastScanTime(),
    ]);
}
```

#### Docker Health Check Configuration
```yaml
# In docker-compose.yml for Laravel service
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8000/api/access/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### Security Considerations for KQT300

#### API Rate Limiting
```php
// config/rate_limiting.php
'kqt300' => [
    'max_attempts' => 100, // Per minute for KQT300 devices
    'decay_minutes' => 1,
    'response_headers' => [
        'X-RateLimit-Limit',
        'X-RateLimit-Remaining',
        'X-RateLimit-Reset',
    ],
],
```

#### Network Security
```bash
# Docker firewall rules for KQT300
# Allow only KQT300 devices to access the API
iptables -A INPUT -p tcp --dport 8080 -s 192.168.1.0/24 -j ACCEPT
iptables -A INPUT -p tcp --dport 8080 -j DROP
```

### Troubleshooting KQT300 in Docker

#### Common Issues and Solutions

1. **Connection Timeout**
   ```bash
   # Check if KQT300 can reach Docker host
   docker-compose exec laravel ping 192.168.1.100
   
   # Check nginx logs
   docker-compose logs nginx
   ```

2. **API Endpoint Not Found**
   ```bash
   # Test endpoint from within container
   docker-compose exec laravel curl -X POST http://localhost:8000/api/access/validate
   
   # Check Laravel routes
   docker-compose exec laravel php artisan route:list | grep access
   ```

3. **Database Connection Issues**
   ```bash
   # Test database connection
   docker-compose exec laravel php artisan tinker
   DB::connection()->getPdo();
   ```

#### Debug Commands for KQT300
```bash
# Monitor KQT300 API requests
docker-compose exec laravel tail -f storage/logs/laravel.log | grep "access"

# Check network connectivity
docker-compose exec laravel netstat -tulpn | grep 8080

# Test streaming endpoint
curl -N http://localhost:8080/api/access/stream
```

## Security Considerations

### Container Security

1. **Non-root Users**: All containers run as non-root users
2. **Resource Limits**: CPU and memory limits for each container
3. **Network Isolation**: Separate networks for different components
4. **Secrets Management**: Environment variables for sensitive data
5. **Image Scanning**: Regular vulnerability scanning

### API Security

1. **Authentication**: JWT tokens for API access
2. **Rate Limiting**: Prevent abuse of endpoints
3. **Input Validation**: Comprehensive request validation
4. **SQL Injection Prevention**: Parameterized queries
5. **CORS Configuration**: Proper cross-origin settings

### Network Security

1. **Firewall Rules**: Restrict access to necessary ports only
2. **SSL/TLS**: Encrypt all communications
3. **VPN Access**: Secure remote access
4. **Monitoring**: Network traffic monitoring
5. **Backup Encryption**: Encrypt database backups

## Monitoring and Logging

### Application Monitoring

1. **Prometheus**: Metrics collection
2. **Grafana**: Visualization and dashboards
3. **Health Checks**: Container health monitoring
4. **Performance Metrics**: Response times, throughput
5. **Error Tracking**: Application error monitoring

### Logging Strategy

1. **Centralized Logging**: ELK stack or similar
2. **Log Levels**: Appropriate log levels for different environments
3. **Log Rotation**: Automatic log rotation and cleanup
4. **Audit Trails**: User action logging
5. **Error Logging**: Comprehensive error tracking

## Backup and Recovery

### Database Backup

1. **Automated Backups**: Daily automated backups
2. **Point-in-time Recovery**: PostgreSQL WAL archiving
3. **Backup Verification**: Regular backup testing
4. **Offsite Storage**: Cloud backup storage
5. **Recovery Procedures**: Documented recovery processes

### Application Backup

1. **Configuration Backup**: Environment and config files
2. **Code Backup**: Version control with Git
3. **Media Backup**: Uploaded files and assets
4. **Backup Testing**: Regular recovery testing
5. **Disaster Recovery**: Complete system recovery plan

## Deployment Strategy

### Development Deployment

```bash
# Start development environment
docker-compose up -d

# Run database migrations
docker-compose exec laravel php artisan migrate

# Seed database
docker-compose exec laravel php artisan db:seed

# Build admin panel
docker-compose exec admin-panel npm run build
```

### Production Deployment

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d

# Run database migrations
docker-compose -f docker-compose.prod.yml exec laravel php artisan migrate --force

# Optimize Laravel
docker-compose -f docker-compose.prod.yml exec laravel php artisan config:cache
docker-compose -f docker-compose.prod.yml exec laravel php artisan route:cache
docker-compose -f docker-compose.prod.yml exec laravel php artisan view:cache
```

### CI/CD Pipeline

1. **Code Commit**: Trigger build pipeline
2. **Testing**: Automated testing suite
3. **Security Scan**: Vulnerability scanning
4. **Build**: Docker image building
5. **Deploy**: Automated deployment
6. **Health Check**: Post-deployment verification

## Performance Optimization

### Database Optimization

1. **Indexing**: Proper database indexing
2. **Query Optimization**: Efficient SQL queries
3. **Connection Pooling**: Database connection management
4. **Caching**: Redis caching strategy
5. **Partitioning**: Large table partitioning

### Application Optimization

1. **OPcache**: PHP bytecode caching
2. **Route Caching**: Laravel route optimization
3. **View Caching**: Template caching
4. **Asset Optimization**: Minified and compressed assets
5. **CDN Integration**: Content delivery network

### Container Optimization

1. **Multi-stage Builds**: Optimized Docker images
2. **Layer Caching**: Efficient Docker layer usage
3. **Resource Limits**: Appropriate resource allocation
4. **Health Checks**: Container health monitoring
5. **Auto-scaling**: Horizontal scaling capabilities

## Troubleshooting Guide

### Common Issues

1. **Database Connection**: Check PostgreSQL container status
2. **API Endpoints**: Verify Laravel container health
3. **KQT300 Communication**: Check network connectivity
4. **Admin Panel**: Verify React build and nginx configuration
5. **Performance Issues**: Monitor resource usage

### Debug Commands

```bash
# Check container status
docker-compose ps

# View container logs
docker-compose logs [service_name]

# Access container shell
docker-compose exec [service_name] sh

# Check network connectivity
docker-compose exec laravel ping postgres

# Database connection test
docker-compose exec laravel php artisan tinker
```

## Maintenance Procedures

### Regular Maintenance

1. **Security Updates**: Regular image updates
2. **Database Maintenance**: Regular PostgreSQL maintenance
3. **Log Cleanup**: Automated log rotation
4. **Backup Verification**: Regular backup testing
5. **Performance Monitoring**: Regular performance reviews

### Emergency Procedures

1. **Service Recovery**: Quick service restart procedures
2. **Database Recovery**: Emergency database recovery
3. **Rollback Procedures**: Application rollback processes
4. **Communication Plan**: Stakeholder communication
5. **Documentation**: Incident documentation

## Conclusion

This Dockerization plan provides a comprehensive strategy for deploying the TicketingSystem in both development and production environments. The plan includes:

- **Multi-container architecture** with proper service separation
- **PostgreSQL 17.5** and **PHP 8.3** optimization
- **KQT300 device integration** with proper network configuration
- **Security hardening** and monitoring capabilities
- **Scalable deployment** strategies
- **Comprehensive documentation** for maintenance and troubleshooting

The implementation follows Docker best practices and provides a robust foundation for a production-ready ticketing system with hardware integration capabilities.

---

**Document Version**: 1.0  
**Last Updated**: January 2024  
**Next Review**: Quarterly  
**Maintained By**: Development Team
