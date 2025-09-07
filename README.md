# TicketingSystem

A comprehensive Laravel-based ticketing and cashier management system with React admin panel and hardware integration.

## 🎯 Overview

TicketingSystem is designed for businesses that need to manage ticket sales, cashier operations, and hardware integration including:
- Star BSC10 thermal printers
- PD300 customer displays  
- KQT300 QR code scanners
- Multiple cashier stations
- Real-time transaction processing
- Comprehensive reporting and analytics

## 🏗️ Architecture

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

## 🚀 Quick Start

### Prerequisites
- **PHP 8.1+** with extensions: curl, json, mbstring, xml, zip, gd, intl, bcmath
- **Node.js 18+** with npm
- **PostgreSQL 12+**
- **Composer** (PHP dependency manager)
- **Git** (version control)
- **WAMP Server** (Windows) or **LAMP Stack** (Linux)

> 📖 **For detailed installation instructions, see [INSTALLATION_MANUAL.md](INSTALLATION_MANUAL.md)**

### Installation

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
   
   # Consolidated client-side service
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

### **Access Points**
- **Admin Panel**: http://localhost:4000
- **API Documentation**: http://localhost:8000/api/documentation
- **Client Service Health**: http://localhost:3000/health

## 📁 Project Structure

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
├── tests/                 # Test files
├── INSTALLATION_MANUAL.md # Detailed installation guide
├── KQT300_SETUP.md       # QR scanner setup guide
└── README.md             # This file
```

## 🔧 Configuration

### Database
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
- **Client-Side Service**: Port 3000 (consolidated printer + display)

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

# Swagger Documentation
L5_SWAGGER_CONST_HOST=http://127.0.0.1:8000
L5_SWAGGER_BASE_PATH=http://127.0.0.1:8000
```

## 🖥️ Client-Side Hardware Setup

### **Consolidated Client-Side Service**

The system now uses a **single consolidated service** that handles both printer and display functionality, simplifying deployment and management.

```
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION SERVER                       │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │   PostgreSQL    │    │   Laravel       │                │
│  │   Database      │    │   Application   │                │
│  │                 │    │                 │                │
│  │ • Database      │    │ • API Endpoints │                │
│  │ • Storage       │    │ • Business      │                │
│  │ • Backups       │    │   Logic         │                │
│  └─────────────────┘    └─────────────────┘                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   NETWORK       │
                    │   (LAN/WAN)     │
                    └─────────────────┘
                              │
                    ┌─────────────────┐
                    │   CASHIER 1     │
                    │   COMPUTER      │
                    │  ┌─────────────┐ │
                    │  │ Frontend    │ │
                    │  │ (React)     │ │
                    │  └─────────────┘ │
                    │  ┌─────────────┐ │
                    │  │ Client-Side │ │
                    │  │ Service     │ │
                    │  │ (Port 3000) │ │
                    │  └─────────────┘ │
                    │  ┌─────────────┐ │
                    │  │ Star BSC10  │ │
                    │  │ Printer     │ │
                    │  └─────────────┘ │
                    │  ┌─────────────┐ │
                    │  │ PD300       │ │
                    │  │ Display     │ │
                    │  └─────────────┘ │
                    └─────────────────┘
```

### **Setup Instructions**

#### **Step 1: Server Side Setup**
1. **Copy the client service files** to a shared location
2. **Update the client configuration** in your Laravel application
3. **Ensure network connectivity** between server and client computers

#### **Step 2: Client Side Setup (Cashier Computers)**

For each cashier computer:

1. **Create a folder** for the hardware services
2. **Copy the consolidated service files** from the server
3. **Install Node.js** (if not already installed)
4. **Run the consolidated service** using the provided batch file

#### **File Structure for Client Computers**
```
C:\TicketingSystem\ClientServices\
└── client-side-service\
    ├── server.js              # Main consolidated service
    ├── star-final-printer.js  # Star BSC10 printer integration
    ├── send-display.js        # PD300 display integration
    ├── package.json           # Node.js dependencies
    └── start-service.bat      # Windows startup script
```

#### **Installation on Client Computers**

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

### **Network Configuration**

**Server Access to Clients:**
The server will access client services using computer names:
- **CASHIER-1**: `http://CASHIER-1:3000` (consolidated service)
- **CASHIER-2**: `http://CASHIER-2:3000` (consolidated service)

**Requirements:**
1. **Same network** (LAN/WAN)
2. **Computer names** must be resolvable
3. **Firewall** must allow port 3000
4. **Windows file sharing** enabled (optional, for easier setup)

### **Hardware Setup**

#### **Star BSC10 Printer:**
1. **Connect printer** to USB port
2. **Install drivers** if needed
3. **Share printer** (optional, for network access)
4. **Test printing** using the test endpoint

#### **PD300 Display:**
1. **Connect display** to USB port
2. **Install drivers** if needed
3. **Test display** using the test endpoint

### **Testing Hardware**

**Test Printer:**
```bash
curl -X GET http://localhost:3000/test/printer
```

**Test Display:**
```bash
curl -X GET http://localhost:3000/test/display
```

**Test Transaction Printing:**
```bash
curl -X POST http://localhost:3000/print \
  -H "Content-Type: application/json" \
  -d '{"content": "Test Print", "type": "receipt"}'
```

**Health Check:**
```bash
# Check consolidated service health
curl http://localhost:3000/health
```

### **Frontend Integration**

**JavaScript Example:**
```javascript
// Print transaction receipt
const printResponse = await fetch('http://localhost:3000/print', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        content: JSON.stringify(transactionData),
        type: 'transaction'
    })
});

// Display message on PD300
const displayResponse = await fetch('http://localhost:3000/display', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        content: 'Order Ready!\nPlease Collect',
        type: 'display'
    })
});

// Combined print and display
const combinedResponse = await fetch('http://localhost:3000/print-and-display', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        printContent: 'Receipt content',
        displayContent: 'Thank you!\nPlease come again'
    })
});
```

### **Benefits of Consolidated Setup:**
✅ **Simplified deployment** - Single service to manage  
✅ **Reduced complexity** - One port, one service  
✅ **Better reliability** - Fewer moving parts  
✅ **Easier maintenance** - Single update point  
✅ **Resource efficient** - Lower memory and CPU usage  
✅ **Network-based** - No need for USB extenders  
✅ **Centralized control** - Server manages all hardware  

## 📚 Additional Documentation

- **[Installation Manual](INSTALLATION_MANUAL.md)** - Comprehensive installation and deployment guide
- **[KQT300 Setup Guide](KQT300_SETUP.md)** - QR scanner hardware setup

## 🛠️ Development

### API Documentation
Access Swagger documentation at: `http://localhost:8000/api/documentation`

### Available API Endpoints
- **Authentication**: `/api/auth/*`
- **Cashier Management**: `/api/cashier/*`
- **User Management**: `/api/users/*`
- **Promoter Management**: `/api/promoters/*`
- **Rate Management**: `/api/rates/*`
- **Discount Management**: `/api/discounts/*`
- **VIP Management**: `/api/vips/*`
- **Reports**: `/api/reports/*`

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
```

## 🔧 Key Features

### **Backend Features**
- ✅ **RESTful API** with comprehensive endpoints
- ✅ **Authentication & Authorization** with Sanctum
- ✅ **Role-based Access Control** (Admin, Cashier, etc.)
- ✅ **Audit Trail** for all system activities
- ✅ **Email Notifications** for password reset, etc.
- ✅ **PDF Generation** for reports and receipts
- ✅ **Image Upload & Management** with media library
- ✅ **Database Seeding** with sample data

### **Frontend Features**
- ✅ **Modern React Admin Panel** with CoreUI
- ✅ **Responsive Design** for all screen sizes
- ✅ **Real-time Dashboard** with statistics
- ✅ **Rich Text Editor** (TinyMCE) for content management
- ✅ **User Management** with role assignment
- ✅ **Cashier Interface** for transaction processing
- ✅ **Promoter & Rate Management**
- ✅ **Discount System** with percentage and fixed amounts
- ✅ **VIP Customer Management**
- ✅ **Comprehensive Reporting**

### **Hardware Integration**
- ✅ **Star BSC10 Thermal Printer** support
- ✅ **PD300 Customer Display** integration
- ✅ **QR Code Generation** and printing
- ✅ **Transaction Receipt Printing**
- ✅ **Open/Close Cash Reports**
- ✅ **KQT300 QR Scanner** integration
- ✅ **Distributed Architecture** for multiple cashier stations

## 📄 License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

---

**Version**: 1.0.0  
**Last Updated**: September 2025  
**Author**: Your Company Name