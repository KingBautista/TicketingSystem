# Printer Quick Reference Guide

## Quick Setup Checklist

### ✅ Hardware Setup
- [ ] Star BSC10 connected via USB
- [ ] PD-300 display connected via USB
- [ ] Thermal paper roll (80mm) loaded
- [ ] Both devices powered on
- [ ] Windows recognizes devices in Device Manager

### ✅ Software Setup
- [ ] Node.js 18.x installed
- [ ] Client-side service dependencies installed (`npm install`)
- [ ] Printer shared as "StarBSC10"
- [ ] Service running on port 3001

### ✅ Testing
- [ ] Basic printer test passes
- [ ] Open Cash receipt prints correctly
- [ ] Transaction tickets print with QR codes
- [ ] Close Cash receipt prints with proper formatting

## Common Commands

### Start Service
```bash
cd client-side-service
node server.js
```

### Test Commands
```bash
# Test Open Cash
node star-final-printer.js opencash "Cashier,100.00,12345"

# Test Transaction
node star-final-printer.js transaction '{"transactionId":"123","promoterName":"Test","rateName":"Standard","quantity":1,"total":"100.00","paidAmount":"100.00","change":"0.00","cashierName":"Cashier","sessionId":"12345","discounts":[],"tickets":["QR123"],"createdAt":"2024-01-01T10:00:00Z"}'

# Test Close Cash
node star-final-printer.js closecash "Cashier,12345,100.00,500.00,[],400.00"
```

## Troubleshooting Quick Fixes

### Printer Not Working
1. Check USB connection
2. Restart service: `node server.js`
3. Check printer share name: "StarBSC10"
4. Verify paper is loaded

### QR Code Issues
1. Check QR code size (currently set to 12)
2. Verify paper quality
3. Test with different QR codes

### Layout Problems
1. Check paper width (80mm)
2. Verify ESC/POS commands
3. Test alignment settings

## Configuration Settings

### Current Settings
- **Printer Name**: StarBSC10
- **QR Code Size**: 12
- **Paper Width**: 80mm (48 columns)
- **Service Port**: 3001
- **Print Method**: copy /B to printer share

### ESC/POS Commands Used
- Initialize: `0x1B 0x40`
- Center: `0x1B 0x61 0x01`
- Left: `0x1B 0x61 0x00`
- Bold: `0x1B 0x45 0x01`
- Double Size: `0x1D 0x21 0x11`
- Normal: `0x1D 0x21 0x00`
- Feed: `0x1B 0x64 0x03`
- Cut: `0x1D 0x56 0x00`

## Service Endpoints

### Print Open Cash
```
POST http://localhost:3001/print/opencash
{
  "cashierName": "string",
  "cashOnHand": "number",
  "sessionId": "string"
}
```

### Print Transaction
```
POST http://localhost:3001/print/transaction
{
  "transactionData": { ... }
}
```

### Print Close Cash
```
POST http://localhost:3001/print/closecash
{
  "cashierName": "string",
  "sessionId": "string",
  "openingCash": "number",
  "closingCash": "number",
  "dailyTransactions": [],
  "dailyTotal": "number"
}
```

## Log Messages

### Successful Print
```
🖨️ ===== PRINT OPEN CASH RECEIPT CALLED =====
🖨️ Cashier: [Name]
🖨️ Amount: P[Amount]
🖨️ Session: #[ID]
🖨️ Printer Name: StarBSC10
🖨️ Buffer created: [X] bytes
🖨️ Calling printRaw...
✅ Raw data sent to printer
🖨️ ===== END PRINT OPEN CASH RECEIPT =====
```

### Error Messages
```
❌ Raw print error: [Error details]
❌ Printer not found
❌ Connection failed
❌ Print timeout
```

## Maintenance Schedule

### Daily
- [ ] Check paper supply
- [ ] Test print function
- [ ] Verify connections

### Weekly
- [ ] Clean print head
- [ ] Check alignment
- [ ] Update logs

### Monthly
- [ ] Full calibration
- [ ] Driver updates
- [ ] Performance review

---

**Quick Support**: Check console logs for detailed error messages
**Emergency**: Restart service and check USB connections
