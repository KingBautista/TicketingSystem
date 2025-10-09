# TicketingSystem - Intranet Deployment Manual

## 📋 Overview
This manual provides step-by-step instructions for deploying the TicketingSystem as an intranet application using WAMP server with IP addresses and specific ports.

## 🎯 Deployment Architecture
- **Laravel API**: `http://YOUR_IP:8000` (Port 8000)
- **Admin Panel & Client Interface**: `http://YOUR_IP:4000` (Port 4000)

---

## 🔧 Prerequisites

### **System Requirements**
- Windows 10/11 with WAMP Server installed
- PHP 8.1+ with required extensions
- Node.js 18+ with npm
- PostgreSQL 12+
- Composer (PHP dependency manager)
- Git (version control)

### **Network Requirements**
- Static IP address on your local machine
- Firewall configured to allow ports 4000 and 8000
- All client machines on the same network

---

## 📍 Step 1: Find Your Local IP Address

### **Method 1: Command Prompt**
```cmd
ipconfig
```
Look for your active network adapter:
```
IPv4 Address . . . . . . . . . . . : 192.168.1.100
```

**Note your IP address** - we'll use `192.168.1.100` as an example throughout this manual.

---

## 🌐 Step 2: Apache Configuration

### **2.1 Edit Apache Configuration**
Open `C:\wamp64\bin\apache\apache{version}\conf\httpd.conf`

Add these lines if not present:
```apache
Listen 80
Listen 4000
Listen 8000
Include conf/extra/httpd-vhosts.conf
```

### **2.2 Configure Virtual Hosts**
Edit `C:\wamp64\bin\apache\apache{version}\conf\extra\httpd-vhosts.conf`:

```apache
# Laravel API (Port 8000)
<VirtualHost *:8000>
    ServerName 192.168.1.100
    DocumentRoot "c:/wamp64/www/TicketingSystem/public"
    
    <Directory "c:/wamp64/www/TicketingSystem/public">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
        
        # Enable mod_rewrite
        RewriteEngine On
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule ^(.*)$ index.php [QSA,L]
    </Directory>
    
    # Log files
    ErrorLog "c:/wamp64/logs/ticketing_api_error.log"
    CustomLog "c:/wamp64/logs/ticketing_api_access.log" combined
</VirtualHost>

# React Admin Panel & Client Interface (Port 4000)
<VirtualHost *:4000>
    ServerName 192.168.1.100
    DocumentRoot "c:/wamp64/www/TicketingSystem/admin-panel/dist"
    
    <Directory "c:/wamp64/www/TicketingSystem/admin-panel/dist">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
        
        # Handle React Router for both admin and client interfaces
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
    
    # Log files
    ErrorLog "c:/wamp64/logs/ticketing_frontend_error.log"
    CustomLog "c:/wamp64/logs/ticketing_frontend_access.log" combined
</VirtualHost>
```

### **2.3 Restart Apache**
- Right-click WAMP icon → Apache → Service → Restart Service
- Or restart WAMP completely

---

## 🔥 Step 3: Windows Firewall Configuration

### **3.1 Open Windows Defender Firewall**
1. Press `Win + R`, type `wf.msc`, press Enter
2. Click "Inbound Rules" in the left panel
3. Click "New Rule..." in the right panel

### **3.2 Create Rules for Each Port**

#### **Port 8000 (Laravel API)**
- Rule Type: Port
- Protocol: TCP
- Specific Local Ports: 8000
- Action: Allow the connection
- Profile: All (Domain, Private, Public)
- Name: "TicketingSystem API - Port 8000"

#### **Port 4000 (React Admin & Client Interface)**
- Rule Type: Port
- Protocol: TCP
- Specific Local Ports: 4000
- Action: Allow the connection
- Profile: All (Domain, Private, Public)
- Name: "TicketingSystem Frontend - Port 4000"


---

## 🚀 Step 4: Start Services

### **4.1 Start WAMP Services**
1. Start WAMP Server
2. Ensure all services are green (Apache, MySQL, PostgreSQL)

### **4.2 Verify Services**
Test each service:

#### **API Health Check**
```cmd
curl http://192.168.1.100:8000/api/kqt300/status
```

#### **Admin Panel & Client Interface**
Open browser: `http://192.168.1.100:4000`
- Admin users will see the admin interface
- Cashier users will see the client/cashier interface

---

## ❓ Do We Need to Always Run `artisan serve`?

### **Answer: NO!** 

With proper Apache configuration, you **DO NOT** need to run `php artisan serve` manually. Here's why:

#### **✅ Apache Handles Laravel (Recommended)**
- Apache serves the Laravel API directly on port 8000
- More stable and production-ready
- Automatic startup with WAMP
- Better performance and security

#### **❌ Manual `artisan serve` (Not Recommended)**
- Only needed for development
- Must be manually started each time
- Less stable for production use
- Requires keeping command prompt open

### **How Apache Serves Laravel:**
1. **Virtual Host Configuration**: Apache listens on port 8000
2. **Document Root**: Points to `TicketingSystem/public`
3. **URL Rewriting**: Apache handles Laravel routing
4. **Automatic Startup**: Starts with WAMP server

---

## 📱 Step 5: Client Machine Setup

### **5.1 Access URLs for Clients**

#### **Frontend Access (Admin & Client Interface)**
- URL: `http://192.168.1.100:4000`
- Admin users: Full admin panel access
- Cashier users: Cashier interface access
- Default login credentials (check your database seeders)

#### **API Documentation**
- URL: `http://192.168.1.100:8000/api/documentation`

---

## 🔧 Step 6: Production Optimizations

### **6.1 Laravel Optimizations**
```cmd
cd C:\wamp64\www\TicketingSystem

# Optimize for production
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize

# Set proper permissions
icacls "C:\wamp64\www\TicketingSystem\storage" /grant "Everyone:(OI)(CI)F" /T
icacls "C:\wamp64\www\TicketingSystem\bootstrap\cache" /grant "Everyone:(OI)(CI)F" /T
```

### **6.2 Create Startup Scripts**

#### **WAMP Startup Script** (`start-wamp.bat`)
```batch
@echo off
echo Starting WAMP Server...
net start wampapache64
net start wampmysqld64
echo WAMP Server started successfully!
pause
```

---

## ✅ Step 7: Testing and Verification

### **7.1 Test API Endpoints**
```cmd
# Test authentication
curl -X POST http://192.168.1.100:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# Test KQT300 status
curl http://192.168.1.100:8000/api/kqt300/status
```

### **7.2 Test Frontend Interface**
1. Open `http://192.168.1.100:4000`
2. Login with admin credentials - should see admin interface
3. Login with cashier credentials - should see cashier interface
4. Test all major features for both interfaces


---

## 🛠️ Troubleshooting

### **Common Issues**

#### **Port Already in Use**
```cmd
# Find process using port
netstat -ano | findstr :8000
netstat -ano | findstr :4000

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

#### **Firewall Issues**
- Ensure Windows Firewall allows the ports
- Check if antivirus is blocking connections
- Test with `telnet 192.168.1.100 8000` from client machines

#### **Database Connection Issues**
```cmd
# Test PostgreSQL connection
psql -h 192.168.1.100 -U ticketing_user -d ticketing_system

# Check Laravel database connection
cd C:\wamp64\www\TicketingSystem
php artisan tinker
>>> DB::connection()->getPdo();
```

#### **Permission Issues**
```cmd
# Fix storage permissions
icacls "C:\wamp64\www\TicketingSystem\storage" /grant "Everyone:(OI)(CI)F" /T
icacls "C:\wamp64\www\TicketingSystem\bootstrap\cache" /grant "Everyone:(OI)(CI)F" /T
```

---

## 📋 Final Checklist

- [ ] WAMP Server running with all services green
- [ ] PostgreSQL database created and accessible
- [ ] Laravel API running on `http://192.168.1.100:8000`
- [ ] React Frontend (Admin & Client) accessible at `http://192.168.1.100:4000`
- [ ] Windows Firewall configured for all ports
- [ ] All client machines can access the services
- [ ] Hardware integration tested (printer, display, scanner)
- [ ] Admin panel login working
- [ ] API documentation accessible

---

## 🌐 Access URLs Summary

| Service | URL | Purpose |
|---------|-----|---------|
| **Laravel API** | `http://192.168.1.100:8000` | Backend API |
| **Frontend Interface** | `http://192.168.1.100:4000` | React Admin & Client Interface |
| **API Docs** | `http://192.168.1.100:8000/api/documentation` | Swagger Documentation |

---

## 📞 Support

For technical support:
- Check logs in `C:\wamp64\logs\`
- Monitor Laravel logs in `storage/logs/laravel.log`
- Test network connectivity between machines
- Verify all services are running and accessible

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Deployment Type**: Intranet with IP Addresses
