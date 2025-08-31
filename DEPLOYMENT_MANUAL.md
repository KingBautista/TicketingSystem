# TicketingSystem Deployment Manual

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [System Requirements](#system-requirements)
3. [Development Deployment](#development-deployment)
4. [Production Deployment](#production-deployment)
5. [KQT300 Device Configuration](#kqt300-device-configuration)
6. [Monitoring and Maintenance](#monitoring-and-maintenance)
7. [Troubleshooting](#troubleshooting)
8. [Backup and Recovery](#backup-and-recovery)
9. [Environment Configuration](#environment-configuration)

## Prerequisites

### Required Software
- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher
- **Git**: For version control
- **Make**: For automation (optional)

### System Requirements
- **CPU**: 2 cores minimum, 4 cores recommended
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 20GB minimum free space
- **Network**: Stable internet connection for initial setup

### Operating System Support
- **Linux**: Ubuntu 20.04+, CentOS 8+, RHEL 8+
- **Windows**: Windows 10/11 with WSL2 or Docker Desktop
- **macOS**: macOS 10.15+ with Docker Desktop

## System Requirements

### Development Environment
- **Docker Desktop** or **Docker Engine** with Compose
- **Git** for source code management
- **Text Editor** (VS Code, Sublime Text, etc.)
- **Browser** for accessing the application

### Production Environment
- **Docker Engine** 20.10+
- **Docker Compose** 2.0+
- **SSL Certificate** (Let's Encrypt or commercial)
- **Domain Name** (optional but recommended)
- **Firewall** configuration
- **Backup Strategy** implementation

## Development Deployment

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd TicketingSystem
```

### Step 2: Automated Deployment (Recommended)
```bash
# Windows
.\deploy.bat

# Linux/macOS
./deploy.sh
```

The deployment script will automatically:
- Check Docker installation
- Set up environment files
- Build and start containers
- Generate application keys
- Run database migrations and seeding
- Verify service health

### Step 3: Manual Environment Setup (Alternative)
```bash
# Copy environment file
cp env.docker .env

# Create admin panel environment
echo VITE_API_BASE_URL=http://localhost:8080 > admin-panel/.env

# Edit environment variables if needed
nano .env
```

### Step 4: Manual Build and Start Services
```bash
# Build all containers
docker-compose -f docker-compose.dev.yml build

# Start all services
docker-compose -f docker-compose.dev.yml up -d

# Check service status
docker-compose -f docker-compose.dev.yml ps
```

### Step 5: Database Initialization
```bash
# Run database migrations
docker-compose -f docker-compose.dev.yml exec laravel php artisan migrate

# Seed the database
docker-compose -f docker-compose.dev.yml exec laravel php artisan db:seed

# Generate application key (if not done by script)
docker-compose -f docker-compose.dev.yml exec laravel php artisan key:generate
```

### Step 6: Verify Installation
```bash
# Check Laravel API
curl http://localhost:8080/api/kqt300/health

# Check Admin Panel
curl http://localhost:4000

# Check Nginx Proxy
curl http://localhost:8080
```

### Step 7: Access the Application
- **Main Application**: http://localhost:8080
- **API Documentation**: http://localhost:8080/api/documentation
- **Admin Panel**: http://localhost:4000
- **Laravel API**: http://localhost:8080

## Production Deployment

### Step 1: Server Preparation
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
```

### Step 2: Clone and Configure
```bash
# Clone repository
git clone <repository-url>
cd TicketingSystem

# Copy production environment
cp env.docker .env

# Edit production settings
nano .env
```

### Step 3: SSL Certificate Setup (Optional)
```bash
# Create SSL directory
mkdir -p ssl

# For Let's Encrypt (example)
sudo certbot certonly --standalone -d yourdomain.com
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/
```

### Step 4: Production Deployment
```bash
# Automated deployment
./deploy.sh -e prod

# Or manual deployment
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml ps
```

### Step 5: Database Setup
```bash
# Run migrations
docker-compose -f docker-compose.prod.yml exec laravel php artisan migrate --force

# Seed database
docker-compose -f docker-compose.prod.yml exec laravel php artisan db:seed --force

# Optimize for production
docker-compose -f docker-compose.prod.yml exec laravel php artisan config:cache
docker-compose -f docker-compose.prod.yml exec laravel php artisan route:cache
docker-compose -f docker-compose.prod.yml exec laravel php artisan view:cache
```

### Step 6: Firewall Configuration
```bash
# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Allow SSH (if needed)
sudo ufw allow 22

# Enable firewall
sudo ufw enable
```

## Environment Configuration

### Main Application Environment (.env)
The main application uses the following key environment variables:

```bash
# Application
APP_NAME="Ticketing System"
APP_ENV=local                    # local for dev, production for prod
APP_DEBUG=true                   # true for dev, false for prod
APP_URL=http://localhost:8080    # Your domain in production
APP_KEY=                         # Auto-generated during deployment

# Database
DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=ticketing_system
DB_USERNAME=ticketing_user
DB_PASSWORD=ticketing_password

# API Configuration
API_URL=http://localhost:8080    # Used by admin panel and services
L5_SWAGGER_CONST_HOST=http://localhost:8080

# KQT300 Device Configuration
KQT300_DEVICE_IP=192.168.1.100
KQT300_DEVICE_PORT=8080
KQT300_TIMEOUT=30
KQT300_RETRY_ATTEMPTS=3
```

### Admin Panel Environment (admin-panel/.env)
The React admin panel uses:
```bash
VITE_API_BASE_URL=http://localhost:8080
```

**Note**: This is automatically set by Docker Compose during deployment and should not be hardcoded.

### Environment Variable Overrides
You can override any environment variable by setting it in your shell or Docker Compose:

```bash
# Set custom API URL
export API_URL=http://your-domain.com

# Deploy with custom settings
docker-compose -f docker-compose.dev.yml up -d
```

## KQT300 Device Configuration

### Step 1: Network Configuration
Configure the KQT300 device with the following network settings:
- **IP Address**: 192.168.1.100
- **Subnet Mask**: 255.255.255.0
- **Gateway**: 192.168.1.1
- **DNS**: 8.8.8.8

### Step 2: API Endpoint Configuration
In the QR Scanner Config Tool, set:
- **HTTP Server Address**: `http://your-server-ip/api/kqt300/validate`
- **Heartbeat Data**: `/api/kqt300/status`
- **Stream Endpoint**: `/api/kqt300/stream`
- **Poll Endpoint**: `/api/kqt300/poll`

### Step 3: Device Testing
```bash
# Test device connectivity
curl http://your-server-ip/api/kqt300/health

# Test scan endpoint
curl -X POST http://your-server-ip/api/kqt300/test-scan

# Monitor device logs
docker-compose -f docker-compose.dev.yml logs -f laravel
```

## Monitoring and Maintenance

### Health Checks
```bash
# Check all services
docker-compose -f docker-compose.dev.yml ps

# Check specific service logs
docker-compose -f docker-compose.dev.yml logs laravel
docker-compose -f docker-compose.dev.yml logs admin_panel
docker-compose -f docker-compose.dev.yml logs nginx

# Monitor resource usage
docker stats
```

### Log Management
```bash
# View Laravel logs
docker-compose -f docker-compose.dev.yml exec laravel tail -f storage/logs/laravel.log

# View Nginx logs
docker-compose -f docker-compose.dev.yml exec nginx tail -f /var/log/nginx/access.log

# View PostgreSQL logs
docker-compose -f docker-compose.dev.yml logs postgres
```

### Performance Monitoring
```bash
# Check database performance
docker-compose -f docker-compose.dev.yml exec postgres psql -U ticketing_user -d ticketing_system -c "SELECT * FROM pg_stat_activity;"

# Monitor API response times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:8080/api/kqt300/health
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Issues
```bash
# Check database container
docker-compose -f docker-compose.dev.yml ps postgres

# Check database logs
docker-compose -f docker-compose.dev.yml logs postgres

# Test database connection
docker-compose -f docker-compose.dev.yml exec laravel php artisan tinker
```

#### 2. Laravel Application Issues
```bash
# Clear Laravel caches
docker-compose -f docker-compose.dev.yml exec laravel php artisan cache:clear
docker-compose -f docker-compose.dev.yml exec laravel php artisan config:clear
docker-compose -f docker-compose.dev.yml exec laravel php artisan route:clear

# Check Laravel logs
docker-compose -f docker-compose.dev.yml exec laravel tail -f storage/logs/laravel.log

# Regenerate application key
docker-compose -f docker-compose.dev.yml exec laravel php artisan key:generate --force
```

#### 3. Nginx Issues
```bash
# Check Nginx configuration
docker-compose -f docker-compose.dev.yml exec nginx nginx -t

# Restart Nginx
docker-compose -f docker-compose.dev.yml restart nginx

# Check Nginx logs
docker-compose -f docker-compose.dev.yml logs nginx
```

#### 4. Admin Panel Issues
```bash
# Check admin panel logs
docker-compose -f docker-compose.dev.yml logs admin_panel

# Verify environment variables
docker-compose -f docker-compose.dev.yml exec admin_panel env | grep VITE

# Restart admin panel
docker-compose -f docker-compose.dev.yml restart admin_panel
```

#### 5. KQT300 Device Issues
```bash
# Test device endpoints
curl http://localhost:8080/api/kqt300/status
curl http://localhost:8080/api/kqt300/health

# Check device logs
docker-compose -f docker-compose.dev.yml logs laravel | grep kqt300

# Test scan functionality
curl -X POST http://localhost:8080/api/kqt300/test-scan
```

### Service Recovery
```bash
# Restart specific service
docker-compose -f docker-compose.dev.yml restart laravel

# Restart all services
docker-compose -f docker-compose.dev.yml restart

# Rebuild and restart
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml build
docker-compose -f docker-compose.dev.yml up -d
```

### Common Error Solutions

#### APP_KEY Issues
```bash
# Generate new application key
docker-compose -f docker-compose.dev.yml exec laravel php artisan key:generate --force

# Clear configuration cache
docker-compose -f docker-compose.dev.yml exec laravel php artisan config:clear
```

#### Port Conflicts
If you get port conflicts (especially on Windows with WAMP):
```bash
# Check what's using the ports
netstat -ano | findstr :8080
netstat -ano | findstr :4000

# Stop conflicting services or change ports in docker-compose.dev.yml
```

#### Environment Variable Issues
```bash
# Verify environment variables are loaded
docker-compose -f docker-compose.dev.yml exec laravel env | grep API_URL

# Recreate .env file
cp env.docker .env
```

## Backup and Recovery

### Database Backup
```bash
# Create backup
docker-compose -f docker-compose.dev.yml exec postgres pg_dump -U ticketing_user ticketing_system > backup_$(date +%Y%m%d_%H%M%S).sql

# Automated backup script
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose -f docker-compose.dev.yml exec -T postgres pg_dump -U ticketing_user ticketing_system > $BACKUP_DIR/backup_$DATE.sql
```

### File Backup
```bash
# Backup storage directory
tar -czf storage_backup_$(date +%Y%m%d_%H%M%S).tar.gz storage/

# Backup uploads
tar -czf uploads_backup_$(date +%Y%m%d_%H%M%S).tar.gz public/uploads/
```

### Recovery Procedures
```bash
# Restore database
docker-compose -f docker-compose.dev.yml exec -T postgres psql -U ticketing_user ticketing_system < backup_file.sql

# Restore files
tar -xzf storage_backup_file.tar.gz
tar -xzf uploads_backup_file.tar.gz
```

### Automated Backup Script
Create `/usr/local/bin/backup-ticketing.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/backups/ticketing"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
docker-compose -f docker-compose.dev.yml exec -T postgres pg_dump -U ticketing_user ticketing_system > $BACKUP_DIR/db_backup_$DATE.sql

# File backup
tar -czf $BACKUP_DIR/files_backup_$DATE.tar.gz storage/ public/uploads/

# Clean old backups (keep 7 days)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

Add to crontab:
```bash
# Daily backup at 2 AM
0 2 * * * /usr/local/bin/backup-ticketing.sh
```

## Security Considerations

### Environment Variables
- Use strong passwords for database
- Keep API keys secure
- Rotate credentials regularly
- Use environment-specific configurations

### Network Security
- Configure firewall rules
- Use SSL/TLS encryption
- Restrict access to admin endpoints
- Monitor network traffic

### Container Security
- Keep containers updated
- Use minimal base images
- Scan for vulnerabilities
- Implement resource limits

## Performance Optimization

### Database Optimization
```bash
# Analyze database performance
docker-compose -f docker-compose.dev.yml exec postgres psql -U ticketing_user -d ticketing_system -c "ANALYZE;"

# Check slow queries
docker-compose -f docker-compose.dev.yml exec postgres psql -U ticketing_user -d ticketing_system -c "SELECT * FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
```

### Application Optimization
```bash
# Optimize Laravel
docker-compose -f docker-compose.dev.yml exec laravel php artisan config:cache
docker-compose -f docker-compose.dev.yml exec laravel php artisan route:cache
docker-compose -f docker-compose.dev.yml exec laravel php artisan view:cache

# Optimize Composer
docker-compose -f docker-compose.dev.yml exec laravel composer install --optimize-autoloader --no-dev
```

### Nginx Optimization
```bash
# Enable gzip compression
# (Already configured in nginx.conf)

# Optimize worker processes
# (Already configured in nginx.conf)
```

## Support and Maintenance

### Regular Maintenance Tasks
- **Daily**: Check service health and logs
- **Weekly**: Review performance metrics
- **Monthly**: Update containers and dependencies
- **Quarterly**: Security audit and backup testing

### Contact Information
- **Technical Support**: support@ticketingsystem.com
- **Documentation**: https://docs.ticketingsystem.com
- **Issue Tracker**: https://github.com/ticketingsystem/issues

---

**Document Version**: 2.0  
**Last Updated**: December 2024  
**Next Review**: Quarterly  
**Maintained By**: Development Team
