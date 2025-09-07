# TicketingSystem - Installation & Deployment Manual

## 📋 Table of Contents
1. [System Requirements](#system-requirements)
2. [Prerequisites Installation](#prerequisites-installation)
3. [Project Setup](#project-setup)
4. [Database Configuration](#database-configuration)
5. [Environment Configuration](#environment-configuration)
6. [Service Configuration](#service-configuration)
7. [Hardware Setup](#hardware-setup)
8. [Testing & Verification](#testing--verification)
9. [Production Deployment](#production-deployment)
10. [Troubleshooting](#troubleshooting)

---

## 🖥️ System Requirements

### **Minimum Requirements**
- **OS**: Windows 10/11, Ubuntu 20.04+, CentOS 8+
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 10GB free space
- **Network**: LAN/WAN connectivity for distributed setup

### **Recommended Requirements**
- **OS**: Windows 11, Ubuntu 22.04 LTS
- **RAM**: 16GB
- **Storage**: 50GB SSD
- **Network**: Gigabit Ethernet

---

## 🔧 Prerequisites Installation

### **1. WAMP Server (Windows) / LAMP Stack (Linux)**

#### **Windows - WAMP Server**
1. **Download WAMP Server** from [wampserver.com](https://www.wampserver.com/)
2. **Install WAMP Server** with default settings
3. **Verify installation**:
   - Open browser → `http://localhost`
   - Should see WAMP Server dashboard
   - Ensure Apache and MySQL services are running

#### **Linux - LAMP Stack**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install apache2 mysql-server php php-mysql php-curl php-json php-mbstring php-xml php-zip php-gd php-intl php-bcmath

# CentOS/RHEL
sudo yum install httpd mysql-server php php-mysql php-curl php-json php-mbstring php-xml php-zip php-gd php-intl php-bcmath
```

### **2. PostgreSQL Database**

#### **Windows**
1. **Download PostgreSQL** from [postgresql.org](https://www.postgresql.org/download/windows/)
2. **Install PostgreSQL** with default settings
3. **Remember the postgres user password**
4. **Add PostgreSQL to PATH** (usually done automatically)

#### **Linux**
```bash
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib

# CentOS/RHEL
sudo yum install postgresql postgresql-server postgresql-contrib
sudo postgresql-setup initdb
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

#### **PostgreSQL Configuration**
```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE ticketing_system;
CREATE USER ticketing_user WITH PASSWORD 'ticketing_password';
GRANT ALL PRIVILEGES ON DATABASE ticketing_system TO ticketing_user;
\q
```

### **3. Composer (PHP Dependency Manager)**

#### **Windows**
1. **Download Composer** from [getcomposer.org](https://getcomposer.org/download/)
2. **Run the installer** and follow the setup wizard
3. **Verify installation**:
   ```cmd
   composer --version
   ```

#### **Linux**
```bash
# Download and install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
sudo chmod +x /usr/local/bin/composer

# Verify installation
composer --version
```

### **4. Node.js & npm**

#### **Windows**
1. **Download Node.js** from [nodejs.org](https://nodejs.org/)
2. **Install Node.js** (includes npm)
3. **Verify installation**:
   ```cmd
   node --version
   npm --version
   ```

#### **Linux**
```bash
# Using NodeSource repository (recommended)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### **5. Git Version Control**

#### **Windows**
1. **Download Git** from [git-scm.com](https://git-scm.com/download/win)
2. **Install Git** with default settings
3. **Verify installation**:
   ```cmd
   git --version
   ```

#### **Linux**
```bash
# Ubuntu/Debian
sudo apt install git

# CentOS/RHEL
sudo yum install git

# Verify installation
git --version
```

### **6. Additional Tools**

#### **Windows**
- **Visual Studio Code** (recommended IDE)
- **Postman** (API testing)
- **pgAdmin** (PostgreSQL GUI)

#### **Linux**
```bash
# Install additional tools
sudo apt install curl wget unzip vim nano
```

---

## 🚀 Project Setup

### **1. Clone the Repository**
```bash
# Clone the project
git clone <repository-url>
cd TicketingSystem

# Verify project structure
ls -la
```

### **2. Install PHP Dependencies**
```bash
# Install Composer dependencies
composer install

# Generate application key
php artisan key:generate
```

### **3. Install Node.js Dependencies**

#### **Main Project**
```bash
# Install main project dependencies
npm install
```

#### **Admin Panel**
```bash
# Install admin panel dependencies
cd admin-panel
npm install
cd ..
```

#### **Client-Side Service**
```bash
# Install client-side service dependencies
cd client-side-service
npm install
cd ..
```

---

## 🗄️ Database Configuration

### **1. Create Database**
```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database and user
CREATE DATABASE ticketing_system;
CREATE USER ticketing_user WITH PASSWORD 'ticketing_password';
GRANT ALL PRIVILEGES ON DATABASE ticketing_system TO ticketing_user;
\q
```

### **2. Run Migrations**
```bash
# Run database migrations
php artisan migrate

# Seed the database with initial data
php artisan db:seed
```

### **3. Verify Database Setup**
```bash
# Check database connection
php artisan tinker
>>> DB::connection()->getPdo();
>>> exit
```

---

## ⚙️ Environment Configuration

### **1. Copy Environment File**
```bash
# Copy environment template
cp env.example .env
```

### **2. Configure Environment Variables**
Edit `.env` file with your settings:

```env
# Application
APP_NAME="TicketingSystem"
APP_ENV=local
APP_KEY=base64:your_generated_key_here
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=ticketing_system
DB_USERNAME=ticketing_user
DB_PASSWORD=ticketing_password

# API Configuration
API_URL=http://localhost:8000

# Mail Configuration (optional)
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your_email@gmail.com
MAIL_FROM_NAME="${APP_NAME}"

# Swagger Documentation
L5_SWAGGER_CONST_HOST=http://127.0.0.1:8000
L5_SWAGGER_BASE_PATH=http://127.0.0.1:8000
```

### **3. Generate Application Key**
```bash
# Generate application key
php artisan key:generate
```

---

## 🔧 Service Configuration

### **1. Laravel Application**
```bash
# Clear configuration cache
php artisan config:clear
php artisan cache:clear
php artisan route:clear

# Generate Swagger documentation
php artisan l5-swagger:generate
```

### **2. Admin Panel Configuration**
```bash
# Build admin panel for production
cd admin-panel
npm run build
cd ..
```

### **3. Client-Side Service Configuration**
```bash
# Test client-side service
cd client-side-service
npm start
```

---

## 🖨️ Hardware Setup

### **1. Star BSC10 Thermal Printer**

#### **Hardware Connection**
1. **Connect printer** to USB port
2. **Install drivers** (usually automatic on Windows)
3. **Share printer** (optional, for network access):
   - Control Panel → Devices and Printers
   - Right-click printer → Printer Properties
   - Sharing tab → Share this printer
   - Note the printer name (e.g., "StarBSC10")

#### **Test Printer**
```bash
# Test printer connection
cd client-side-service
node star-final-printer.js test
```

### **2. PD300 Customer Display**

#### **Hardware Connection**
1. **Connect display** to USB port
2. **Install drivers** (usually automatic)
3. **Test display**:
   ```bash
   cd client-side-service
   node send-display.js "Test Line 1" "Test Line 2"
   ```

### **3. KQT300 QR Scanner**

#### **Hardware Connection**
1. **Connect scanner** to USB port
2. **Install drivers** (usually automatic)
3. **Configure scanner** (see KQT300_SETUP.md)

---

## ✅ Testing & Verification

### **1. Start All Services**

#### **Terminal 1 - Laravel API**
```bash
php artisan serve --port=8000
```

#### **Terminal 2 - Admin Panel**
```bash
cd admin-panel
npm run dev
```

#### **Terminal 3 - Client-Side Service**
```bash
cd client-side-service
npm start
```

### **2. Verify Services**

#### **API Health Check**
```bash
curl http://localhost:8000/api/health
```

#### **Admin Panel**
- Open browser → `http://localhost:4000`
- Should see login page

#### **Client-Side Service**
```bash
curl http://localhost:3000/health
```

### **3. Test Hardware Integration**

#### **Test Printer**
```bash
curl -X POST http://localhost:3000/test/printer
```

#### **Test Display**
```bash
curl -X POST http://localhost:3000/test/display
```

#### **Test Transaction Printing**
```bash
curl -X POST http://localhost:3000/print \
  -H "Content-Type: application/json" \
  -d '{"content": "Test Print", "type": "receipt"}'
```

---

## 🚀 Production Deployment

### **1. Server Preparation**

#### **Update System**
```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
```

#### **Install Required Software**
```bash
# Install LAMP stack, PostgreSQL, Node.js, etc.
# (Follow prerequisites installation steps)
```

### **2. Application Deployment**

#### **Clone and Setup**
```bash
# Clone repository
git clone <repository-url>
cd TicketingSystem

# Install dependencies
composer install --optimize-autoloader --no-dev
npm install --production
cd admin-panel && npm run build && cd ..
cd client-side-service && npm install --production && cd ..
```

#### **Configure Environment**
```bash
# Copy and configure environment
cp env.example .env
# Edit .env for production settings
```

#### **Database Setup**
```bash
# Run migrations
php artisan migrate --force

# Seed database
php artisan db:seed --force
```

### **3. Web Server Configuration**

#### **Apache Configuration**
```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    DocumentRoot /path/to/TicketingSystem/public
    
    <Directory /path/to/TicketingSystem/public>
        AllowOverride All
        Require all granted
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/ticketing_error.log
    CustomLog ${APACHE_LOG_DIR}/ticketing_access.log combined
</VirtualHost>
```

#### **Nginx Configuration**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /path/to/TicketingSystem/public;
    
    index index.php;
    
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

### **4. Process Management**

#### **Using PM2 (Node.js Services)**
```bash
# Install PM2
npm install -g pm2

# Start client-side service
cd client-side-service
pm2 start server.js --name "ticketing-client-service"
pm2 save
pm2 startup
```

#### **Using Supervisor (Laravel Queue)**
```bash
# Install supervisor
sudo apt install supervisor

# Create configuration
sudo nano /etc/supervisor/conf.d/ticketing-worker.conf
```

```ini
[program:ticketing-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/TicketingSystem/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/path/to/TicketingSystem/storage/logs/worker.log
stopwaitsecs=3600
```

### **5. SSL Certificate**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-apache

# Get SSL certificate
sudo certbot --apache -d yourdomain.com
```

---

## 🔧 Troubleshooting

### **Common Issues**

#### **1. Database Connection Error**
```bash
# Check PostgreSQL service
sudo systemctl status postgresql

# Check database exists
psql -U postgres -l

# Test connection
php artisan tinker
>>> DB::connection()->getPdo();
```

#### **2. Permission Issues**
```bash
# Fix storage permissions
sudo chown -R www-data:www-data storage
sudo chmod -R 775 storage

# Fix bootstrap cache permissions
sudo chown -R www-data:www-data bootstrap/cache
sudo chmod -R 775 bootstrap/cache
```

#### **3. Node.js Service Not Starting**
```bash
# Check if port is in use
netstat -tulpn | grep :3000

# Kill process using port
sudo kill -9 $(lsof -t -i:3000)

# Check Node.js version
node --version
```

#### **4. Printer Not Working**
```bash
# Check printer connection
lsusb | grep Star

# Test printer directly
cd client-side-service
node star-final-printer.js test

# Check printer sharing
netstat -tulpn | grep :631
```

#### **5. API Documentation Not Loading**
```bash
# Regenerate Swagger documentation
php artisan l5-swagger:generate

# Clear cache
php artisan config:clear
php artisan cache:clear
```

### **Log Files**
- **Laravel Logs**: `storage/logs/laravel.log`
- **Apache Logs**: `/var/log/apache2/error.log`
- **Nginx Logs**: `/var/log/nginx/error.log`
- **PostgreSQL Logs**: `/var/log/postgresql/postgresql-*.log`

### **Performance Optimization**

#### **Laravel Optimization**
```bash
# Optimize for production
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize
```

#### **Database Optimization**
```sql
-- Analyze tables
ANALYZE;

-- Reindex database
REINDEX DATABASE ticketing_system;
```

---

## 📞 Support

### **Documentation**
- [Laravel Documentation](https://laravel.com/docs)
- [React Documentation](https://reactjs.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### **Hardware Documentation**
- [Star BSC10 Manual](https://www.starmicronics.com/support/manuals/)
- [PD300 Display Manual](https://www.starmicronics.com/support/manuals/)

### **Contact Information**
- **Technical Support**: [support@yourcompany.com]
- **Documentation**: [docs@yourcompany.com]
- **Issues**: [GitHub Issues](https://github.com/yourcompany/ticketingsystem/issues)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Last Updated**: September 2025  
**Version**: 1.0.0  
**Author**: Your Company Name
