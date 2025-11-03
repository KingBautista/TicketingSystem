# TicketingSystem

A comprehensive Laravel-based ticketing and cashier management system with React admin panel and hardware integration.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Quick Start](#quick-start)
4. [Installation Guide](#installation-guide)
5. [Configuration](#configuration)
6. [Deployment](#deployment)
7. [Hardware Setup](#hardware-setup)
8. [Development](#development)
9. [API Reference](#api-reference)
10. [Troubleshooting](#troubleshooting)
11. [Support](#support)

---

## 🎯 Overview

TicketingSystem is designed for businesses that need to manage ticket sales, cashier operations, and hardware integration including:
- Star BSC10 thermal printers
- PD300 customer displays  
- KQT300 QR code scanners
- Multiple cashier stations
- Real-time transaction processing
- Comprehensive reporting and analytics

### Key Features

#### **Backend Features**
- ✅ RESTful API with Swagger documentation
- ✅ Authentication & Authorization with Sanctum
- ✅ Role-based Access Control (Admin, Cashier, etc.)
- ✅ Audit Trail for all system activities
- ✅ Email Notifications for password reset, etc.
- ✅ PDF Generation for reports and receipts
- ✅ Image Upload & Management with media library
- ✅ Database Seeding with sample data

#### **Frontend Features**
- ✅ Modern React Admin Panel with CoreUI
- ✅ Responsive Design for all screen sizes
- ✅ Real-time Dashboard with statistics
- ✅ Rich Text Editor (TinyMCE) for content management
- ✅ User Management with role assignment
- ✅ Cashier Interface for transaction processing
- ✅ Promoter & Rate Management
- ✅ Discount System with percentage and fixed amounts
- ✅ VIP Customer Management
- ✅ Comprehensive Reporting

#### **Hardware Integration**
- ✅ Star BSC10 Thermal Printer support
- ✅ PD300 Customer Display integration with automatic sequences
- ✅ QR Code Generation and printing
- ✅ Transaction Receipt Printing
- ✅ Open/Close Cash Reports
- ✅ KQT300 QR Scanner integration
- ✅ Distributed Architecture for multiple cashier stations

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION SERVER                       │
│  ┌─────────────────┐    ┌─────────────────┐              │
│  │   PostgreSQL    │    │   Laravel       │              │
│  │   Database      │    │   Application   │              │
│  │                 │    │                 │              │
│  │ • Database      │    │ • API Endpoints │              │
│  │ • Storage       │    │ • Business      │              │
│  │ • Backups       │    │   Logic         │              │
│  └─────────────────┘    └─────────────────┘              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   NETWORK       │
                    │   (LAN/WAN)     │
                    └─────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   CASHIER 1     │  │   CASHIER 2     │  │   CASHIER N     │
│   COMPUTER      │  │   COMPUTER      │  │   COMPUTER      │
│  ┌─────────────┐ │  │  ┌─────────────┐ │  │  ┌─────────────┐ │
│  │ Frontend    │ │  │  │ Frontend    │ │  │  │ Frontend    │ │
│  │ (React)     │ │  │  │ (React)     │ │  │  │ (React)     │ │
│  └─────────────┘ │  │  └─────────────┘ │  │  └─────────────┘ │
│  ┌─────────────┐ │  │  ┌─────────────┐ │  │  ┌─────────────┐ │
│  │ Client-Side │ │  │  │ Client-Side │ │  │  │ Client-Side │ │
│  │ Service     │ │  │  │ Service     │ │  │  │ Service     │ │
│  │ (Port 3000) │ │  │  │ (Port 3000) │ │  │  │ (Port 3000) │ │
│  └─────────────┘ │  │  └─────────────┘ │  │  └─────────────┘ │
│  ┌─────────────┐ │  │  ┌─────────────┐ │  │  ┌─────────────┐ │
│  │ Star BSC10  │ │  │  │ Star BSC10  │ │  │  │ Star BSC10  │ │
│  │ Printer     │ │  │  │ Printer     │ │  │  │ Printer     │ │
│  └─────────────┘ │  │  └─────────────┘ │  │  └─────────────┘ │
│  ┌─────────────┐ │  │  ┌─────────────┐ │  │  ┌─────────────┐ │
│  │ PD300       │ │  │  │ PD300       │ │  │  │ PD300       │ │
│  │ Display     │ │  │  │ Display     │ │  │  │ Display     │ │
│  └─────────────┘ │  │  └─────────────┘ │  │  └─────────────┘ │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### Backend (Laravel 10)
- RESTful API with Swagger documentation
- PostgreSQL database
- Service layer architecture
- Sanctum authentication
- Role-based access control
- Audit trail system
- Email notifications
- PDF generation

### Frontend (React 19 + CoreUI)
- Modern admin panel with responsive design
- Rich text editor (TinyMCE)
- Real-time dashboard with statistics
- Cashier transaction management
- User management and role assignment
- Promoter and rate management
- Discount system
- VIP customer management

### Hardware Integration
- **Consolidated Client-Side Service** (Node.js)
  - Star BSC10 thermal printer integration
  - PD300 customer display control
  - QR code generation and printing
  - Transaction receipt printing
  - Open/close cash reports
- KQT300 QR scanner integration
- Distributed architecture for multiple cashier stations

---

## 🚀 Quick Start

### Prerequisites
- **PHP 8.1+** with extensions: curl, json, mbstring, xml, zip, gd, intl, bcmath
- **Node.js 18+** with npm
- **PostgreSQL 12+**
- **Composer** (PHP dependency manager)
- **Git** (version control)
- **WAMP Server** (Windows) or **LAMP Stack** (Linux)

### Installation (5 Minutes)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd TicketingSystem
   ```

2. **Install PHP dependencies**
   ```bash
   composer install
   ```

3. **Install Node.js dependencies**
   ```bash
   # Main project
   npm install
   
   # Admin panel
   cd admin-panel
   npm install
   cd ..
   
   # Client-side service
   cd client-side-service
   npm install
   cd ..
   ```

4. **Environment setup**
   ```bash
   cp env.example .env
   # Edit .env with your database credentials
   php artisan key:generate
   ```

5. **Database setup**
   ```bash
   php artisan migrate
   php artisan db:seed
   ```

6. **Start services**
   ```bash
   # Terminal 1: Start Laravel API server
   php artisan serve --port=8000
   
   # Terminal 2: Start admin panel
   cd admin-panel
   npm run dev
   
   # Terminal 3: Start consolidated client-side service
   cd client-side-service
   npm start
   # OR use the batch file (Windows)
   start-service.bat
   ```

### Access Points
- **Admin Panel**: http://localhost:4000
- **API Documentation**: http://localhost:8000/api/documentation
- **Client Service Health**: http://localhost:3000/health

---

## 📖 Installation Guide

### System Requirements

#### Minimum Requirements
- **OS**: Windows 10/11, Ubuntu 20.04+, CentOS 8+
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 10GB free space
- **Network**: LAN/WAN connectivity for distributed setup

#### Recommended Requirements
- **OS**: Windows 11, Ubuntu 22.04 LTS
- **RAM**: 16GB
- **Storage**: 50GB SSD
- **Network**: Gigabit Ethernet

### Prerequisites Installation

#### 1. WAMP Server (Windows) / LAMP Stack (Linux)

**Windows - WAMP Server**

⚠️ **Important: DLL Requirements**
Before installing WAMP Server, you must install the required Microsoft Visual C++ Redistributable Packages.

**Install Visual C++ Redistributables:**
1. Download **VisualCppRedist AIO** (All-In-One installer) from [GitHub Releases](https://github.com/abbodi1406/vcredist/releases)
2. Download the latest `VisualCppRedist_AIO_x86_x64.exe` file
3. Run as Administrator and follow the installation wizard
4. Restart your computer after installation

**Install WAMP Server:**
1. Download WAMP Server from [wampserver.com](https://www.wampserver.com/)
2. Install WAMP Server with default settings
3. Verify installation:
   - Open browser → `http://localhost`
   - Should see WAMP Server dashboard
   - Ensure Apache and MySQL services are running

**Linux - LAMP Stack**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install apache2 mysql-server php php-mysql php-curl php-json php-mbstring php-xml php-zip php-gd php-intl php-bcmath

# CentOS/RHEL
sudo yum install httpd mysql-server php php-mysql php-curl php-json php-mbstring php-xml php-zip php-gd php-intl php-bcmath
```

#### 2. PostgreSQL Database

**Windows**
1. Download PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Install PostgreSQL with default settings
3. Remember the postgres user password
4. Add PostgreSQL to PATH (usually done automatically)

**Linux**
```bash
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib

# CentOS/RHEL
sudo yum install postgresql postgresql-server postgresql-contrib
sudo postgresql-setup initdb
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

**PostgreSQL Configuration**
```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE ticketing_system;
CREATE USER ticketing_user WITH PASSWORD 'ticketing_password';
GRANT ALL PRIVILEGES ON DATABASE ticketing_system TO ticketing_user;
\q
```

#### 3. Composer (PHP Dependency Manager)

**Windows**
1. Download Composer from [getcomposer.org](https://getcomposer.org/download/)
2. Run the installer and follow the setup wizard
3. Verify installation:
   ```cmd
   composer --version
   ```

**Linux**
```bash
# Download and install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
sudo chmod +x /usr/local/bin/composer

# Verify installation
composer --version
```

#### 4. Node.js & npm

**Windows**
1. Download Node.js from [nodejs.org](https://nodejs.org/)
2. Install Node.js (includes npm)
3. Verify installation:
   ```cmd
   node --version
   npm --version
   ```

**Linux**
```bash
# Using NodeSource repository (recommended)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

#### 5. Git Version Control

**Windows**
1. Download Git from [git-scm.com](https://git-scm.com/download/win)
2. Install Git with default settings
3. Verify installation:
   ```cmd
   git --version
   ```

**Linux**
```bash
# Ubuntu/Debian
sudo apt install git

# CentOS/RHEL
sudo yum install git

# Verify installation
git --version
```

### Project Setup

#### 1. Clone the Repository
```bash
# Clone the project
git clone <repository-url>
cd TicketingSystem

# Verify project structure
ls -la
```

#### 2. Install PHP Dependencies
```bash
# Install Composer dependencies
composer install

# Generate application key
php artisan key:generate
```

#### 3. Install Node.js Dependencies

**Main Project**
```bash
npm install
```

**Admin Panel**
```bash
cd admin-panel
npm install
cd ..
```

**Client-Side Service**
```bash
cd client-side-service
npm install
cd ..
```

### Database Configuration

#### 1. Create Database
```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database and user
CREATE DATABASE ticketing_system;
CREATE USER ticketing_user WITH PASSWORD 'ticketing_password';
GRANT ALL PRIVILEGES ON DATABASE ticketing_system TO ticketing_user;
\q
```

#### 2. Run Migrations
```bash
# Run database migrations
php artisan migrate

# Seed the database with initial data
php artisan db:seed
```

#### 3. Verify Database Setup
```bash
# Check database connection
php artisan tinker
>>> DB::connection()->getPdo();
>>> exit
```

---

## 🔧 Configuration

### Database Configuration
Update your `.env` file with PostgreSQL credentials:
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=ticketing_system
DB_USERNAME=ticketing_user
DB_PASSWORD=your_password
```

### Service Ports
- **Laravel API**: Port 8000
- **Admin Panel**: Port 4000
- **Client-Side Service**: Port 3001 (configurable)

### Environment Variables
Key environment variables in `.env`:
```env
# Application
APP_NAME="TicketingSystem"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=ticketing_system
DB_USERNAME=ticketing_user
DB_PASSWORD=your_password

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

### Client-Side Service Configuration
The service automatically configures itself with these settings:
```javascript
// Default Configuration
const config = {
  printerName: 'StarBSC10',           // Windows printer share name
  workingPort: 'USB001',              // Primary USB port
  backupPorts: ['USB002', 'USB003'],  // Backup ports
  qrCodeSize: 12,                     // QR code size (1-16)
  paperWidth: 80,                     // Paper width in mm
  columns: 48,                        // Character columns
  timeout: 5000                       // Print timeout in ms
};
```

---

## 🌐 Deployment

### Local Development Deployment

For local development using WAMP Server:

#### Step 1: Find Local IP Address
Run in **Command Prompt**:
```bash
ipconfig
```
Look for your active adapter (Ethernet/Wi-Fi):
```
IPv4 Address . . . . . : 192.168.1.100
```

#### Step 2: Configure Laravel
Edit `.env` in Laravel project:
```env
APP_URL=http://192.168.1.100:8000
```

#### Step 3: Build React Admin Panel
Inside `admin-panel/`:
```bash
npm run build
```
This generates a `dist/` folder.

Update `admin-panel/.env` (if exists):
```env
VITE_API_BASE_URL=http://192.168.1.100:8000
```

#### Step 4: Apache Configuration

**1. Open `httpd.conf`**
Located at:
```
C:\wamp64\bin\apache\apache{version}\conf\httpd.conf
```
Ensure these lines exist:
```apache
Listen 80
Listen 4000
Listen 8000
Include conf/extra/httpd-vhosts.conf
```

**2. Edit Virtual Hosts**
File:
```
C:\wamp64\bin\apache\apache{version}\conf\extra\httpd-vhosts.conf
```

Add:
```apache
# Laravel API (port 8000)
<VirtualHost *:8000>
    ServerName 192.168.1.100
    DocumentRoot "c:/wamp64/www/TicketingSystem/public"

    <Directory "c:/wamp64/www/TicketingSystem/public">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>

# React Admin Panel (port 4000)
<VirtualHost *:4000>
    ServerName 192.168.1.100
    DocumentRoot "c:/wamp64/www/TicketingSystem/admin-panel/dist"

    <Directory "c:/wamp64/www/TicketingSystem/admin-panel/dist">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

**3. Restart Apache**
Restart **WAMP → Apache Service**.

#### Step 5: Allow Firewall
Open ports **8000** and **4000**:
- Open **Windows Defender Firewall → Advanced Settings → Inbound Rules**
- Add **TCP rules** for ports `8000` and `4000`.

#### Step 6: Access URLs
- Laravel API → `http://192.168.1.100:8000`  
- React Admin → `http://192.168.1.100:4000`

### Production Deployment

#### 1. Server Preparation
```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
```

#### 2. Application Deployment
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

#### 3. Configure Environment
```bash
# Copy and configure environment
cp env.example .env
# Edit .env for production settings
php artisan key:generate
```

#### 4. Database Setup
```bash
# Run migrations
php artisan migrate --force

# Seed database
php artisan db:seed --force
```

#### 5. Web Server Configuration

**Apache Configuration**
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

**Nginx Configuration**
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
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_index;
        include fastcgi_params;
    }
}
```

#### 6. Process Management

**Using PM2 (Node.js Services)**
```bash
# Install PM2
npm install -g pm2

# Start client-side service
cd client-side-service
pm2 start server.js --name "ticketing-client-service"
pm2 save
pm2 startup
```

**Using Supervisor (Laravel Queue)**
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

#### 7. SSL Certificate
```bash
# Install Certbot
sudo apt install certbot python3-certbot-apache

# Get SSL certificate
sudo certbot --apache -d yourdomain.com
```

#### 8. Production Optimizations
```bash
# Laravel optimizations
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize

# Set proper permissions
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

---

## 🖥️ Hardware Setup

### Client-Side Hardware Architecture

The system uses a **single consolidated service** that handles both printer and display functionality, simplifying deployment and management.

Each POS machine runs:
- React Admin Panel (browser)
- Client-Side Service (Node.js on port 3001)
- Direct USB connection to printer and display

### Client-Side Service Setup

#### Step 1: Server Side Setup
1. Copy the client service files to a shared location
2. Update the client configuration in your Laravel application
3. Ensure network connectivity between server and client computers

#### Step 2: Client Side Setup (Cashier Computers)

For each cashier computer:

1. **Create a folder** for the hardware services
2. **Copy the consolidated service files** from the server
3. **Install Node.js** (if not already installed)
4. **Run the consolidated service** using the provided batch file

#### File Structure for Client Computers
```
C:\TicketingSystem\ClientServices\
└── client-side-service\
    ├── server.js              # Main consolidated service
    ├── star-final-printer.js  # Star BSC10 printer integration
    ├── send-display.js        # PD300 display integration
    ├── package.json           # Node.js dependencies
    └── start-service.bat      # Windows startup script
```

#### Installation on Client Computers

**Consolidated Service:**
```cmd
cd C:\TicketingSystem\ClientServices\client-side-service
npm install
start-service.bat
```

**Manual Start (Alternative):**
```cmd
cd C:\TicketingSystem\ClientServices\client-side-service
npm start
```

### Network Configuration

**Server Access to Clients:**
The server will access client services using computer names:
- **CASHIER-1**: `http://CASHIER-1:3001` (consolidated service)
- **CASHIER-2**: `http://CASHIER-2:3001` (consolidated service)

**Requirements:**
1. **Same network** (LAN/WAN)
2. **Computer names** must be resolvable
3. **Firewall** must allow port 3001
4. **Windows file sharing** enabled (optional, for easier setup)

### Star BSC10 Thermal Printer Setup

#### Hardware Specifications
| Specification | Value |
|---------------|-------|
| **Model** | Star BSC10 |
| **Type** | Thermal Line Printer |
| **Paper Width** | 80mm (576 dots) |
| **Print Speed** | 150mm/s |
| **Resolution** | 203 DPI |
| **Connection** | USB 2.0 |
| **Power** | 12V DC, 2A |
| **Paper Type** | Thermal paper roll (80mm width) |

#### Installation Steps

**1. Hardware Connection**
- Connect Star BSC10 to USB port
- Power on the printer
- Load thermal paper roll (80mm width)

**2. Driver Installation**
- Download Star Micronics drivers from official website
- Install Star BSC10 driver
- Verify device appears in Device Manager

**3. Printer Configuration**
- Open Windows Settings > Devices > Printers & scanners
- Find "Star BSC10" printer
- Right-click > Printer properties
- Go to Sharing tab
- Enable sharing with name "StarBSC10"

**4. Test Printer**
```bash
cd client-side-service
node star-final-printer.js test
```

#### ESC/POS Commands Used
- **Initialize**: `0x1B 0x40`
- **Center Align**: `0x1B 0x61 0x01`
- **Left Align**: `0x1B 0x61 0x00`
- **Bold On**: `0x1B 0x45 0x01`
- **Bold Off**: `0x1B 0x45 0x00`
- **Double Size**: `0x1D 0x21 0x11`
- **Normal Size**: `0x1D 0x21 0x00`
- **Paper Feed**: `0x1B 0x64 0x03`
- **Full Cut**: `0x1D 0x56 0x00`
- **QR Code Size**: `0x1D 0x28 0x6B 0x03 0x00 0x31 0x43 0x0C` (size 12)

#### Print Receipt Formats

**Open Cash Receipt:**
```
┌─────────────────────────────────────────┐
│              OPEN CASH RECEIPT          │
│                                         │
│              Cashier: [Name]            │
│              Date: [DateTime]           │
│              Cash on Hand: ₱[Amount]   │
│              Session ID: #[ID]          │
│              --- End of Receipt ---     │
└─────────────────────────────────────────┘
```

**Transaction Ticket:**
```
┌─────────────────────────────────────────┐
│              [QR CODE]                 │
│              [Promoter Name]           │
│              [DateTime]                │
│              Code: [QR Code]           │
│              Single use only           │
└─────────────────────────────────────────┘
```

**Close Cash Receipt:**
```
┌─────────────────────────────────────────┐
│            CLOSE CASH REPORT            │
│              Date: [DateTime]           │
│              Cashier: [Name]            │
│              Session: #[ID]             │
│              *** DAILY TRANSACTIONS *** │
│              *** SUMMARY ***            │
│              Opening Cash: ₱[Amount]   │
│              Total Sales: ₱[Amount]    │
│              Closing Cash: ₱[Amount]   │
│              --- End of Report ---     │
└─────────────────────────────────────────┘
```

### PD300 Customer Display Setup

#### Hardware Specifications
| Specification | Value |
|---------------|-------|
| **Model** | Star PD-300 |
| **Display** | 2x20 character LCD |
| **Connection** | USB 2.0 |
| **Power** | USB powered |
| **Dimensions** | 150 x 100 x 50mm |

#### Installation Steps

**1. Hardware Connection**
- Connect PD-300 display to USB port
- Power on the display
- Verify device appears in Device Manager

**2. Driver Installation**
- Drivers usually install automatically on Windows
- Verify device appears in Device Manager
- Check serial port assignment

**3. Test Display**
```bash
cd client-side-service
node send-display.js "Test Line 1" "Test Line 2"
```

#### Display Features

The PD300 display now supports automatic sequences:

**Transaction Display Sequence:**
1. **Total** → Shows "Promoter: [Name]" / "Total: P[amount]" (2 seconds)
2. **Change** → Shows "Change:" / "P[change amount]" (until printing completes)
3. **Thank You** → Shows "Thank You!" / "Come again!" (after printing)

**Display Methods:**
```javascript
// Show total
clientDisplay.showTotal(promoterName, total);

// Show transaction sequence (Total → Change → Thank You)
clientDisplay.showTransactionSequence(promoterName, total, change, {
  totalDuration: 2000,    // Show total for 2 seconds
  changeDuration: 10000,  // Show change for 10 seconds
  thankYouDuration: 0     // Auto-show disabled (triggered after printing)
});

// Show thank you
clientDisplay.showThankYou();
```

### KQT300 QR Scanner Setup

#### Configuration Process

**1. Open QR Scanner Config Tool**
- Launch the "QR Scanner Config Tool_http_v1" application
- The tool has a dark blue interface with configuration fields

**2. Configure Device Settings**

**Network Configuration:**
- **Network Config**: Select "DHCP" or "Fixed IP" based on your network setup
- **IP Address**: Set the device IP address (if using Fixed IP)
- **Mask**: Set subnet mask (e.g., 255.255.255.0)
- **Gateway**: Set gateway IP address
- **DNS**: Set DNS server IP address

**HTTP Server Configuration:**
- **Http Server Address**: Set to your Laravel API server address
  - Example: `http://192.168.1.100:8000/api/kqt300/validate`
  - Or: `http://your-domain.com/api/kqt300/validate`

**Device Settings:**
- **Scanning Interval(ms)**: Set scanning frequency (e.g., 1000ms = 1 second)
- **Receive Timeout(≤5s)**: Set timeout for HTTP responses (max 5 seconds)
- **Device Name**: Give your device a descriptive name (e.g., "Entrance Scanner")

**Heartbeat Configuration:**
- **Heartbeat Enable**: Select "Enable" for device monitoring
- **Heartbeat Data**: Set heartbeat endpoint (e.g., `/api/kqt300/status`)
- **Heartbeat Time**: Set heartbeat interval (e.g., 30000ms = 30 seconds)

**3. Generate Configuration QR Code**
- Click the "Create Config Code" button
- The tool will generate a QR code containing all the configuration

**4. Configure KQT300 Device**
- Scan the generated QR code with your KQT300 device
- The device will automatically apply the configuration
- The device will start communicating with your Laravel API

#### API Endpoints

**Core Endpoints (Used by KQT300):**
- **POST** `/api/kqt300/validate` - Validate QR codes and RFID cards
- **GET** `/api/kqt300/stream` - Real-time scan data stream
- **GET** `/api/kqt300/poll` - Poll for scan data
- **GET** `/api/kqt300/status` - Device status check
- **GET** `/api/kqt300/health` - Health monitoring

**Legacy Endpoints (Backward Compatibility):**
- **POST** `/api/access/validate` - Same as kqt300/validate
- **GET** `/api/access/stream` - Same as kqt300/stream
- **GET** `/api/access/poll` - Same as kqt300/poll
- **GET** `/api/access/health` - Same as kqt300/health

### Testing Hardware

**Test Printer:**
```bash
curl -X GET http://localhost:3001/test/printer
```

**Test Display:**
```bash
curl -X GET http://localhost:3001/test/display
```

**Test Transaction Printing:**
```bash
curl -X POST http://localhost:3001/print \
  -H "Content-Type: application/json" \
  -d '{"content": "Test Print", "type": "receipt"}'
```

**Health Check:**
```bash
# Check consolidated service health
curl http://localhost:3001/health
```

**Test KQT300 Connection:**
```bash
curl -X GET http://your-server.com/api/kqt300/status
```

**Test KQT300 Scan Validation:**
```bash
curl -X POST http://your-server.com/api/kqt300/validate \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "vgdecoderesult=313233343536&devicenumber=001"
```

### Frontend Integration

**JavaScript Example:**
```javascript
// Print transaction receipt
const printResponse = await fetch('http://localhost:3001/print', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        content: JSON.stringify(transactionData),
        type: 'transaction'
    })
});

// Display message on PD300
const displayResponse = await fetch('http://localhost:3001/display', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        content: 'Order Ready!\nPlease Collect',
        type: 'display'
    })
});

// Combined print and display
const combinedResponse = await fetch('http://localhost:3001/print-and-display', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        printContent: 'Receipt content',
        displayContent: 'Thank you!\nPlease come again'
    })
});
```

### Benefits of Consolidated Setup
✅ **Simplified deployment** - Single service to manage  
✅ **Reduced complexity** - One port, one service  
✅ **Better reliability** - Fewer moving parts  
✅ **Easier maintenance** - Single update point  
✅ **Resource efficient** - Lower memory and CPU usage  
✅ **Network-based** - No need for USB extenders  
✅ **Centralized control** - Server manages all hardware  

---

## 🛠️ Development

### API Documentation
Access Swagger documentation at: `http://localhost:8000/api/documentation`

### Available API Endpoints

**Authentication:**
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/validate-password` - Validate current password

**User Management:**
- `GET /api/user-management/users` - List users
- `POST /api/user-management/users` - Create user
- `PUT /api/user-management/users/{id}` - Update user
- `DELETE /api/user-management/users/{id}` - Delete user
- `POST /api/user-management/users/bulk/delete` - Bulk delete
- `POST /api/user-management/users/bulk/role` - Bulk change role

**Cashier Management:**
- `POST /api/cashier/open-session` - Open cashier session
- `POST /api/cashier/close-session` - Close cashier session
- `POST /api/cashier/transactions` - Create transaction
- `GET /api/cashier/transactions/daily` - Get daily transactions
- `POST /api/cashier/transactions/{id}/reprint` - Reprint transaction

**Promoter Management:**
- `GET /api/promoter-management/promoters` - List promoters
- `POST /api/promoter-management/promoters` - Create promoter
- `GET /api/promoter-management/promoters/of-the-day` - Get promoter of the day

**Rate Management:**
- `GET /api/rate-management/rates` - List rates
- `POST /api/rate-management/rates` - Create rate
- `GET /api/rate-management/rates/dropdown` - Get rates for dropdown

**Discount Management:**
- `GET /api/rate-management/discounts` - List discounts
- `POST /api/rate-management/discounts` - Create discount

**VIP Management:**
- `GET /api/vip-management/vips` - List VIPs
- `POST /api/vip-management/vips` - Create VIP
- `GET /api/vip-management/vips/expiring` - Get expiring VIPs

**Reports:**
- `GET /api/reports/sales` - Sales reports
- `POST /api/reports/sales/export` - Export sales report
- `GET /api/reports/closing` - Closing reports
- `POST /api/reports/closing/export` - Export closing report

**Dashboard:**
- `GET /api/dashboard/statistics` - Dashboard statistics
- `GET /api/dashboard/cashier-performance` - Cashier performance
- `GET /api/dashboard/today-summary` - Today's summary

**KQT300 Integration:**
- `POST /api/kqt300/validate` - Validate scanned code
- `GET /api/kqt300/status` - Device status
- `GET /api/kqt300/health` - Health check

### Testing
```bash
# Run PHP tests
php artisan test

# Run frontend tests
cd admin-panel
npm test

# Test client-side service
cd client-side-service
npm test
```

### Development Commands
```bash
# Clear Laravel caches
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Regenerate Swagger documentation
php artisan l5-swagger:generate

# Run database migrations
php artisan migrate

# Seed database with test data
php artisan db:seed

# Create migration
php artisan make:migration create_example_table

# Create model
php artisan make:model Example

# Create controller
php artisan make:controller ExampleController
```

### Project Structure
```
TicketingSystem/
├── app/                    # Laravel application
│   ├── Http/Controllers/   # API controllers
│   ├── Models/            # Eloquent models
│   ├── Services/          # Business logic services
│   ├── Mail/              # Email templates
│   ├── Traits/            # Reusable traits
│   └── ...
├── admin-panel/           # React admin panel (CoreUI)
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Page components
│   │   ├── utils/         # Utility functions
│   │   ├── contexts/      # React contexts
│   │   └── hooks/         # Custom React hooks
│   └── public/            # Static assets
├── client-side-service/   # Consolidated Node.js service
│   ├── server.js          # Main service server
│   ├── star-final-printer.js # Star BSC10 printer integration
│   ├── send-display.js    # PD300 display integration
│   ├── start-service.bat  # Windows startup script
│   └── package.json       # Node.js dependencies
├── database/              # Database files
│   ├── migrations/        # Database migrations
│   ├── seeders/           # Database seeders
│   └── factories/         # Model factories
├── config/                # Laravel configuration
├── routes/                # API routes
├── storage/               # File storage
└── tests/                 # Test files
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Database Connection Error
```bash
# Check PostgreSQL service
sudo systemctl status postgresql  # Linux
# OR
services.msc → Check PostgreSQL service  # Windows

# Check database exists
psql -U postgres -l

# Test connection
php artisan tinker
>>> DB::connection()->getPdo();
```

#### 2. Permission Issues
```bash
# Linux
sudo chown -R www-data:www-data storage
sudo chmod -R 775 storage
sudo chown -R www-data:www-data bootstrap/cache
sudo chmod -R 775 bootstrap/cache

# Windows
icacls "storage" /grant "Everyone:(OI)(CI)F" /T
icacls "bootstrap\cache" /grant "Everyone:(OI)(CI)F" /T
```

#### 3. Node.js Service Not Starting
```bash
# Check if port is in use
netstat -tulpn | grep :3001  # Linux
netstat -ano | findstr :3001  # Windows

# Kill process using port (Windows)
taskkill /PID <PID> /F

# Check Node.js version
node --version
```

#### 4. Printer Not Working
```bash
# Check USB connection
lsusb | grep Star  # Linux
# Check Device Manager  # Windows

# Test printer directly
cd client-side-service
node star-final-printer.js test

# Check printer sharing
# Windows: Control Panel → Devices and Printers
# Verify printer name is "StarBSC10"
```

#### 5. Display Not Working
```bash
# Test display directly
cd client-side-service
node send-display.js "Test Line 1" "Test Line 2"

# Check serial port assignment
# Windows: Device Manager → Ports (COM & LPT)

# Test service endpoint
curl -X POST http://localhost:3001/display \
  -H "Content-Type: application/json" \
  -d '{"content": "Test\nDisplay"}'
```

#### 6. API Documentation Not Loading
```bash
# Regenerate Swagger documentation
php artisan l5-swagger:generate

# Clear cache
php artisan config:clear
php artisan cache:clear
```

#### 7. Port Already in Use
```bash
# Find process using port (Windows)
netstat -ano | findstr :8000
netstat -ano | findstr :4000
netstat -ano | findstr :3001

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Linux
lsof -i :8000
kill -9 <PID>
```

#### 8. Firewall Issues
- Ensure Windows Firewall allows the ports
- Check if antivirus is blocking connections
- Test with `telnet 192.168.1.100 8000` from client machines

#### 9. Network Connectivity Issues
```bash
# Test connectivity (Windows)
ping CASHIER-1
telnet CASHIER-1 3001

# Test service health
curl http://CASHIER-1:3001/health
```

### Log Files
- **Laravel Logs**: `storage/logs/laravel.log`
- **Apache Logs**: `/var/log/apache2/error.log` (Linux) or `C:\wamp64\logs\` (Windows)
- **Nginx Logs**: `/var/log/nginx/error.log`
- **PostgreSQL Logs**: `/var/log/postgresql/postgresql-*.log`
- **Client Service Logs**: Console output from `server.js`

### Performance Optimization

#### Laravel Optimization
```bash
# Optimize for production
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize
```

#### Database Optimization
```sql
-- Analyze tables
ANALYZE;

-- Reindex database
REINDEX DATABASE ticketing_system;
```

---

## 📞 Support

### Documentation
- [Laravel Documentation](https://laravel.com/docs)
- [React Documentation](https://reactjs.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Node.js Documentation](https://nodejs.org/docs)

### Hardware Documentation
- [Star BSC10 Manual](https://www.starmicronics.com/support/manuals/)
- [PD300 Display Manual](https://www.starmicronics.com/support/manuals/)
- [ESC/POS Commands Reference](https://reference.starmicronics.com/)

### Additional Resources
- **Code Review**: See `CODE_REVIEW.md` for security and code quality recommendations
- **PD300 Display Review**: See `PD300_DISPLAY_REVIEW.md` for display integration details
- **Printer Setup**: See `client-side-service/PRINTER_SETUP_DOCUMENTATION.md` for detailed printer setup
- **Printer Technical Specs**: See `client-side-service/PRINTER_TECHNICAL_SPECS.md` for technical details

---

## 📄 License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

---

**Version**: 1.0.0  
**Last Updated**: November 2025  
**Author**: Your Company Name
