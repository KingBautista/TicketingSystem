# TicketingSystem

A comprehensive Laravel-based ticketing and cashier management system with React admin panel and hardware integration.

## 🎯 Overview

TicketingSystem is designed for businesses that need to manage ticket sales, cashier operations, and hardware integration including:
- Star BSC10 thermal printers
- PD300 customer displays  
- KQT300 QR code scanners
- Multiple cashier stations

## 🏗️ Architecture

### Backend (Laravel 10)
- RESTful API with Swagger documentation
- PostgreSQL database
- Service layer architecture
- Sanctum authentication
- Role-based access control
- Audit trail system

### Frontend (React 19 + CoreUI)
- Modern admin panel with responsive design
- Rich text editor (TinyMCE)
- Real-time dashboard with statistics
- Cashier transaction management

### Hardware Integration
- Client-side printer service (Node.js)
- Client-side display service (Node.js)
- KQT300 QR scanner integration
- Distributed architecture for multiple cashier stations

## 🚀 Quick Start

### Prerequisites
- PHP 8.1+
- Node.js 18+
- PostgreSQL 12+
- Composer
- npm/yarn

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
   
   # Client services
   cd client-printer-service
   npm install
   cd ..
   
   cd client-side-display-service
   npm install
   cd ..
   ```

4. **Environment setup**
   ```bash
   cp env.example .env
   # Edit .env with your database credentials
   ```

5. **Database setup**
   ```bash
   php artisan migrate
   php artisan db:seed
   ```

6. **Start services**
   ```bash
   # Start Laravel development server
   php artisan serve
   
   # Start admin panel (in new terminal)
   cd admin-panel
   npm run dev
   
   # Start client services (in separate terminals)
   cd client-printer-service
   npm start
   
   cd client-side-display-service
   npm start
   ```

## 📁 Project Structure

```
TicketingSystem/
├── app/                    # Laravel application
│   ├── Http/Controllers/   # API controllers
│   ├── Models/            # Eloquent models
│   ├── Services/          # Business logic services
│   └── ...
├── admin-panel/           # React admin panel
├── client-side-printer-service/ # Node.js printer service
├── client-side-display-service/ # Node.js display service
├── pd300-display/         # Hardware integration scripts
├── database/              # Migrations and seeders
└── routes/                # API routes
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

### Hardware Services
- **Printer Service**: Runs on port 3001
- **Display Service**: Runs on port 3002
- **Admin Panel**: Runs on port 4000
- **Laravel API**: Runs on port 8000

## 🖥️ Client-Side Hardware Setup

### **Distributed Hardware Architecture**

This setup allows multiple cashier computers to have their own printers and displays, controlled from the central server.

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
                    │  │ Node.js     │ │
                    │  │ Printer     │ │
                    │  │ Service     │ │
                    │  └─────────────┘ │
                    │  ┌─────────────┐ │
                    │  │ Star BSC10  │ │
                    │  │ Printer     │ │
                    │  └─────────────┘ │
                    └─────────────────┘
                              │
                    ┌─────────────────┐
                    │   CASHIER 2     │
                    │   COMPUTER      │
                    │  ┌─────────────┐ │
                    │  │ Frontend    │ │
                    │  │ (React)     │ │
                    │  │ Display     │ │
                    │  └─────────────┘ │
                    │  ┌─────────────┐ │
                    │  │ Node.js     │ │
                    │  │ Display     │ │
                    │  │ Service     │ │
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
2. **Copy the service files** from the server
3. **Install Node.js** (if not already installed)
4. **Run the services** using the provided batch files

#### **File Structure for Client Computers**
```
C:\TicketingSystem\ClientServices\
├── client-side-printer-service\
│   ├── server.js
│   ├── package.json
│   └── start-service.bat
├── client-side-display-service\
│   ├── server.js
│   ├── package.json
│   └── start-service.bat
└── pd300-display\ (copy from server)
    ├── star-final-printer.js
    ├── send-display.bat
    └── send-display.js
```

#### **Installation on Client Computers**

**Printer Service:**
```cmd
cd C:\TicketingSystem\ClientServices\client-side-printer-service
npm install
start-service.bat
```

**Display Service:**
```cmd
cd C:\TicketingSystem\ClientServices\client-side-display-service
npm install
start-service.bat
```

### **Network Configuration**

**Server Access to Clients:**
The server will access client services using computer names:
- **CASHIER-1**: `http://CASHIER-1:3001` (printer), `http://CASHIER-1:3002` (display)
- **CASHIER-2**: `http://CASHIER-2:3001` (printer), `http://CASHIER-2:3002` (display)

**Requirements:**
1. **Same network** (LAN/WAN)
2. **Computer names** must be resolvable
3. **Firewall** must allow ports 3001 and 3002
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
curl -X POST http://localhost:3001/test-print \
  -H "Content-Type: application/json" \
  -d '{"text": "Test print from client computer"}'
```

**Test Display:**
```bash
curl -X POST http://localhost:3002/test-display \
  -H "Content-Type: application/json" \
  -d '{"line1": "Test Display", "line2": "From Client"}'
```

**Health Check:**
```bash
# Check printer service health
curl http://localhost:3001/health

# Check display service health
curl http://localhost:3002/health
```

### **Frontend Integration**

**JavaScript Example:**
```javascript
// Send print command to specific cashier
const printResponse = await fetch('/api/print/to-cashier', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        cashier: 'CASHIER-1',
        command: 'transactionfile',
        data: { order_id: 'TKT-001', total: 25.99 }
    })
});

// Send display message to specific cashier
const displayResponse = await fetch('/api/display/to-cashier', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        cashier: 'CASHIER-1',
        line1: 'Order Ready!',
        line2: 'Please Collect'
    })
});
```

### **Benefits of This Setup:**
✅ **Distributed hardware** - Each cashier has their own devices  
✅ **Scalable** - Easy to add more cashier computers  
✅ **Network-based** - No need for USB extenders  
✅ **Centralized control** - Server manages all hardware  
✅ **Independent operation** - Clients work even if server is down  
✅ **Easy maintenance** - Update services independently  

## 📚 Additional Documentation

- [KQT300 Setup Guide](KQT300_SETUP.md)

## 🛠️ Development

### API Documentation
Access Swagger documentation at: `http://localhost:8000/api/documentation`

### Testing
```bash
# Run PHP tests
php artisan test

# Run frontend tests
cd admin-panel
npm test
```

## 📄 License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).