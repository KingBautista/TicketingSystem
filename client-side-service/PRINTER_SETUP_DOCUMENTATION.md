# Printer Setup Documentation

## Overview
This document provides comprehensive instructions for setting up and configuring the Star BSC10 thermal printer for the TicketingSystem application. The system uses a client-side Node.js service to handle printing operations with ESC/POS commands.

## Table of Contents
1. [Hardware Requirements](#hardware-requirements)
2. [Software Requirements](#software-requirements)
3. [Printer Specifications](#printer-specifications)
4. [Installation Steps](#installation-steps)
5. [Configuration](#configuration)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)
8. [API Reference](#api-reference)
9. [Print Commands](#print-commands)
10. [Maintenance](#maintenance)

## Hardware Requirements

### Primary Printer: Star BSC10
- **Model**: Star BSC10 Thermal Printer
- **Paper Size**: 80mm (48 columns)
- **Connection**: USB 2.0
- **Power**: 12V DC (included adapter)
- **Print Speed**: 150mm/s
- **Resolution**: 203 DPI
- **Paper Type**: Thermal paper roll (80mm width)

### Customer Display: PD-300
- **Model**: Star PD-300 Customer Display
- **Connection**: USB 2.0
- **Display**: 2x20 character LCD
- **Power**: USB powered

### System Requirements
- **Operating System**: Windows 10/11
- **USB Ports**: At least 2 available USB 2.0 ports
- **RAM**: Minimum 4GB
- **Storage**: 100MB free space for drivers and software

## Software Requirements

### Node.js Environment
- **Node.js**: Version 18.x or higher
- **npm**: Version 8.x or higher
- **Required Packages**:
  ```json
  {
    "express": "^4.18.2",
    "serialport": "^12.0.0",
    "qrcode": "^1.5.3",
    "child_process": "built-in",
    "fs": "built-in",
    "path": "built-in"
  }
  ```

### Windows Dependencies
- **Windows Raw Printer API**: winspool.drv
- **PowerShell**: Version 5.1 or higher
- **USB Drivers**: Star Micronics USB drivers

## Printer Specifications

### Star BSC10 Technical Details
- **Print Method**: Thermal line printing
- **Print Width**: 80mm (576 dots at 203 DPI)
- **Character Set**: ESC/POS compatible
- **Barcode Support**: Code128, Code39, QR Code
- **Cutting**: Automatic paper cut
- **Paper Feed**: Automatic paper feed
- **Status Monitoring**: Paper out, cover open, error detection

### ESC/POS Commands Used
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

## Installation Steps

### Step 1: Hardware Installation
1. **Connect the Printer**:
   - Connect Star BSC10 to USB port
   - Connect PD-300 display to USB port
   - Power on both devices
   - Load thermal paper roll (80mm width)

2. **Install Drivers**:
   - Download Star Micronics drivers from official website
   - Install Star BSC10 driver
   - Install PD-300 driver
   - Verify devices appear in Device Manager

### Step 2: Software Installation
1. **Install Node.js**:
   ```bash
   # Download from https://nodejs.org
   # Install Node.js 18.x LTS
   # Verify installation
   node --version
   npm --version
   ```

2. **Install Project Dependencies**:
   ```bash
   cd client-side-service
   npm install
   ```

### Step 3: Printer Configuration
1. **Set Printer Share Name**:
   - Open Windows Settings > Devices > Printers & scanners
   - Find "Star BSC10" printer
   - Right-click > Printer properties
   - Go to Sharing tab
   - Enable sharing with name "StarBSC10"

2. **Configure USB Port**:
   - The system auto-detects USB ports (USB001, USB002, etc.)
   - Primary port is usually USB001
   - Backup ports: USB002, USB003, etc.

## Configuration

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

### Environment Variables
Create a `.env` file in the client-side-service directory:

```env
# Printer Configuration
PRINTER_NAME=StarBSC10
PRINTER_PORT=USB001
QR_CODE_SIZE=12
PAPER_WIDTH=80

# Service Configuration
SERVICE_PORT=3001
API_BASE_URL=http://localhost:8000/api
LOG_LEVEL=info
```

## Testing

### Step 1: Basic Printer Test
```bash
# Navigate to client-side-service directory
cd client-side-service

# Start the service
node server.js

# Test printer connection
node star-final-printer.js test
```

### Step 2: Print Test Commands
```bash
# Test Open Cash Receipt
node star-final-printer.js opencash "Cashier Name,100.00,12345"

# Test Transaction Tickets
node star-final-printer.js transaction '{"transactionId":"123","promoterName":"Test Promoter","rateName":"Standard","quantity":2,"total":"200.00","paidAmount":"200.00","change":"0.00","cashierName":"Cashier","sessionId":"12345","discounts":[],"tickets":["QR123","QR456"],"createdAt":"2024-01-01T10:00:00Z"}'

# Test Close Cash Receipt
node star-final-printer.js closecash "Cashier Name,12345,100.00,500.00,[],400.00"
```

### Step 3: Frontend Integration Test
1. Start the Laravel backend server
2. Start the client-side service
3. Open the admin panel
4. Test printing from the frontend interface

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: Printer Not Detected
**Symptoms**: Service shows "Printer not found" error
**Solutions**:
1. Check USB connection
2. Verify printer is powered on
3. Check Windows Device Manager
4. Reinstall printer drivers
5. Try different USB port

#### Issue 2: Print Jobs Not Printing
**Symptoms**: Service shows success but no physical output
**Solutions**:
1. Check paper roll installation
2. Verify paper is loaded correctly
3. Check for paper jams
4. Ensure printer cover is closed
5. Check printer status lights

#### Issue 3: QR Code Too Small
**Symptoms**: QR codes are unreadable
**Solutions**:
1. Increase QR code size in configuration
2. Check paper quality
3. Verify printer resolution settings
4. Test with different QR code sizes

#### Issue 4: Layout Issues
**Symptoms**: Text alignment problems, compressed output
**Solutions**:
1. Verify ESC/POS commands
2. Check paper width settings
3. Ensure proper character encoding
4. Test with different alignment commands

#### Issue 5: Service Connection Issues
**Symptoms**: Frontend cannot connect to service
**Solutions**:
1. Check service is running on port 3001
2. Verify firewall settings
3. Check network configuration
4. Restart the service

### Debug Commands
```bash
# Check printer status
node star-final-printer.js status

# Test raw printing
node star-final-printer.js raw "Test message"

# Check USB ports
node star-final-printer.js ports

# Verify configuration
node star-final-printer.js config
```

## API Reference

### Service Endpoints
The client-side service provides these endpoints:

#### POST /print/opencash
Print Open Cash Receipt
```json
{
  "cashierName": "string",
  "cashOnHand": "number",
  "sessionId": "string"
}
```

#### POST /print/transaction
Print Transaction Tickets
```json
{
  "transactionData": {
    "transactionId": "string",
    "promoterName": "string",
    "rateName": "string",
    "quantity": "number",
    "total": "number",
    "paidAmount": "number",
    "change": "number",
    "cashierName": "string",
    "sessionId": "string",
    "discounts": "array",
    "tickets": "array",
    "createdAt": "string"
  }
}
```

#### POST /print/closecash
Print Close Cash Receipt
```json
{
  "cashierName": "string",
  "sessionId": "string",
  "openingCash": "number",
  "closingCash": "number",
  "dailyTransactions": "array",
  "dailyTotal": "number"
}
```

### Response Format
```json
{
  "success": true,
  "message": "Print job completed successfully",
  "timestamp": "2024-01-01T10:00:00Z"
}
```

## Print Commands

### ESC/POS Command Reference

#### Text Formatting
```javascript
// Initialize printer
Buffer.from([0x1B, 0x40])

// Center alignment
Buffer.from([0x1B, 0x61, 0x01])

// Left alignment
Buffer.from([0x1B, 0x61, 0x00])

// Bold on
Buffer.from([0x1B, 0x45, 0x01])

// Bold off
Buffer.from([0x1B, 0x45, 0x00])

// Double size
Buffer.from([0x1D, 0x21, 0x11])

// Normal size
Buffer.from([0x1D, 0x21, 0x00])
```

#### Paper Control
```javascript
// Feed 3 lines
Buffer.from([0x1B, 0x64, 0x03])

// Full cut
Buffer.from([0x1D, 0x56, 0x00])

// Partial cut
Buffer.from([0x1D, 0x56, 0x01])
```

#### QR Code Commands
```javascript
// QR Code setup (size 12)
Buffer.from([0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x43, 0x0C])

// Error correction level L
Buffer.from([0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x45, 0x30])

// Store QR data
Buffer.from([0x1D, 0x28, 0x6B, dataLength + 3, 0x00, 0x31, 0x50, 0x30])

// Print QR code
Buffer.from([0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x51, 0x30])
```

## Maintenance

### Daily Maintenance
1. **Check Paper Supply**: Ensure adequate thermal paper
2. **Clean Print Head**: Use alcohol wipes if needed
3. **Check Connections**: Verify USB connections
4. **Test Print**: Run daily test print

### Weekly Maintenance
1. **Deep Clean**: Clean printer interior
2. **Check Alignment**: Verify print alignment
3. **Update Drivers**: Check for driver updates
4. **Backup Configuration**: Save current settings

### Monthly Maintenance
1. **Full Calibration**: Recalibrate printer settings
2. **Driver Updates**: Install latest drivers
3. **Performance Check**: Test all print functions
4. **Documentation Update**: Update configuration logs

### Troubleshooting Log
Keep a log of issues and solutions:

| Date | Issue | Solution | Status |
|------|-------|----------|--------|
| 2024-01-01 | Printer not detected | Reinstalled drivers | Resolved |
| 2024-01-02 | QR code too small | Increased size to 12 | Resolved |

## Support and Resources

### Official Documentation
- Star Micronics: https://www.starmicronics.com/support/
- ESC/POS Commands: https://reference.starmicronics.com/

### Contact Information
- Technical Support: [Your support email]
- Documentation: [Your documentation URL]
- Issue Tracker: [Your issue tracker URL]

### Version History
- v1.0.0: Initial setup and configuration
- v1.1.0: Added QR code support
- v1.2.0: Enhanced error handling
- v1.3.0: Improved layout and formatting

---

**Last Updated**: January 2024
**Document Version**: 1.0
**Maintained By**: [Your Name/Team]
