# Printer Setup Guide for Server-Laptop Configuration

## Your Setup
- **Server**: `http://192.168.0.176:4000/` (POS System)
- **Laptop**: Where printer is connected (USB)
- **Goal**: Print receipts from server to laptop's printer

## Step 1: Update Configuration

### 1.1 Update Deployment Config
Edit `admin-panel/src/utils/deployment-config.js`:
```javascript
serviceUrl: 'http://YOUR_LAPTOP_IP:3001', // Replace with your laptop's IP
```

### 1.2 Find Your Laptop's IP
Run this command on your laptop:
```cmd
ipconfig
```
Look for your laptop's IP address (usually 192.168.x.x)

## Step 2: Start Client-Side Service on Laptop

### 2.1 Navigate to client-side-service directory
```cmd
cd C:\wamp64\www\TicketingSystem\client-side-service
```

### 2.2 Install dependencies (if not already done)
```cmd
npm install
```

### 2.3 Start the service
```cmd
npm start
```
Or manually:
```cmd
node server.js
```

The service will start on port 3001 and bind to all network interfaces.

## Step 3: Test Printer Detection

### 3.1 Run printer detection test
```cmd
node test-printer-detection.js
```

### 3.2 Or use the batch file
```cmd
test-printer-detection.bat
```

This will:
- Detect your printer's USB port
- Test printing capabilities
- Show which port is working

## Step 4: Test Network Connection

### 4.1 From your laptop, test the service
Open browser and go to:
```
http://localhost:3001/health
```

### 4.2 From the server, test the connection
Open browser and go to:
```
http://YOUR_LAPTOP_IP:3001/health
```

## Step 5: Configure Firewall (if needed)

### 5.1 Allow port 3001 through Windows Firewall
```cmd
netsh advfirewall firewall add rule name="Client Service" dir=in action=allow protocol=TCP localport=3001
```

## Step 6: Test Open Cash Receipt

### 6.1 From the POS system (server)
1. Go to `http://192.168.0.176:4000/`
2. Login to cashier
3. Click "Open Cash"
4. Enter cash amount
5. Click "Print Receipt"

### 6.2 Check the laptop's console
You should see:
```
🔍 Starting printer detection...
✅ Printer detection successful!
📱 Working port: USB001 (or whatever port is detected)
🖨️ Printing Open Cash Receipt...
✅ Print successful!
```

## Troubleshooting

### Problem: "Connection refused" from server
**Solution**: 
1. Check if client-service is running on laptop
2. Verify laptop's IP address
3. Check firewall settings
4. Ensure both devices are on same network

### Problem: "No working printer port found"
**Solution**:
1. Ensure printer is connected via USB
2. Check if printer is recognized by Windows
3. Try different USB ports
4. Restart the client-service

### Problem: "Print failed" but printer is connected
**Solution**:
1. Run `test-printer-detection.js` to diagnose
2. Check printer drivers
3. Try printing from Windows first
4. Check USB cable connection

## Manual Testing Commands

### Test printer detection only:
```cmd
node printer-detector.js
```

### Test specific USB port:
```cmd
node star-final-printer.js test
```

### Test open cash receipt:
```cmd
node star-final-printer.js opencash "CashierName,1000.00,123"
```

## Network Configuration

### Required Ports:
- **3001**: Client-side service (laptop)
- **4000**: POS system (server)

### Network Requirements:
- Both devices on same network (192.168.x.x)
- No firewall blocking port 3001
- Client-service accessible from server

## Success Indicators

✅ **Service Running**: `http://YOUR_LAPTOP_IP:3001/health` returns JSON
✅ **Printer Detected**: Console shows "Working port: USBxxx"
✅ **Print Test**: Test receipt prints successfully
✅ **Network Access**: Server can reach laptop service
✅ **POS Integration**: Open cash receipt prints from POS

## Next Steps

Once everything is working:
1. The system will automatically detect your printer's USB port
2. All print requests from the server will be sent to your laptop
3. Receipts will print automatically when you click print buttons
4. The system handles different USB ports automatically

## Support

If you encounter issues:
1. Check the console output for error messages
2. Verify network connectivity between server and laptop
3. Ensure printer is properly connected and recognized
4. Test with the provided test scripts
