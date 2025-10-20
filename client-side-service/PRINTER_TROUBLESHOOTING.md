# Printer Troubleshooting Guide

## Current Issue Analysis

Based on your logs, I can see that:

✅ **Data is being sent successfully** - The logs show `✅ Print successful on USB001`
❌ **Printer is not actually printing** - The data reaches the port but printer doesn't respond
❌ **Duplicate requests** - Same print job is being sent multiple times
❌ **Wrong port assumption** - System assumes USB001 but printer might be elsewhere

## Root Causes

### 1. **Wrong USB Port**
- System is defaulting to USB001
- Your printer might be on USB002, USB003, etc.
- Need to find the actual working port

### 2. **Printer Not Responding**
- Data reaches the port but printer doesn't process it
- Could be driver issues, wrong port, or printer not ready

### 3. **Duplicate Requests**
- Same print job sent multiple times
- Causing confusion in logs

## Solutions

### 🔍 **Step 1: Find Your Actual Printer Port**

Run this command to find where your printer really is:

```cmd
cd C:\wamp64\www\TicketingSystem\client-side-service
find-printer-port.bat
```

This will:
- Test all USB ports (USB001-USB008)
- Check printer sharing
- Show you which port actually works
- Give you the correct port to use

### 🔧 **Step 2: Fix the Port Detection**

Once you know the correct port, update the system:

1. **If printer is on USB002** (for example):
   - The system will automatically detect it
   - No manual changes needed

2. **If printer sharing works**:
   - System will use printer sharing as fallback
   - More reliable than USB ports

### 🚫 **Step 3: Fix Duplicate Requests**

I've added deduplication to prevent the same print job being sent multiple times.

### 🧪 **Step 4: Test the Complete Flow**

Run this comprehensive test:

```cmd
cd C:\wamp64\www\TicketingSystem\client-side-service
test-print-fix.bat
```

## Expected Results

### ✅ **What Should Happen**

1. **Port Detection**: System finds your actual printer port
2. **Single Print Job**: No more duplicate requests
3. **Actual Printing**: Printer should fire and print the receipt
4. **Clear Logs**: Clean, single print job logs

### 📋 **Log Analysis**

**Before Fix:**
```
🖨️ Printing Open Cash - Cashier: Warren, Amount: P2000, Session: #43
🖨️ Printing printOpenCashReceipt King
🖨️ Sending RAW data to printer: Star BSC10
🔍 Using detected port: USB001
✅ Print successful on USB001
🖨️ King is here 2  <-- DUPLICATE REQUEST
```

**After Fix:**
```
🖨️ Printing Open Cash - Cashier: Warren, Amount: P2000, Session: #43
🖨️ Printing printOpenCashReceipt King
🖨️ Sending RAW data to printer: Star BSC10
🔍 Using detected port: USB002  <-- CORRECT PORT
✅ Print successful on USB002
✅ Receipt printed successfully  <-- ACTUAL PRINTING
```

## Troubleshooting Steps

### If Printer Still Doesn't Print:

1. **Check Printer Status**:
   ```cmd
   # Check if printer is online
   wmic printer get name,printerstatus
   ```

2. **Test Direct Printing**:
   ```cmd
   # Test if you can print directly
   echo "TEST PRINT" > test.txt
   copy test.txt "USB002"  # Use your actual port
   ```

3. **Check Printer Sharing**:
   ```cmd
   # Enable printer sharing
   # Control Panel > Devices and Printers > Right-click printer > Printer Properties > Sharing
   ```

4. **Verify Printer Drivers**:
   - Make sure Star BSC10 drivers are installed
   - Check Device Manager for any issues

### If Port Detection Fails:

1. **Try Different USB Ports**:
   - Move printer to different USB port
   - Run `find-printer-port.bat` again

2. **Check USB Cable**:
   - Try different USB cable
   - Ensure cable is data cable, not just power

3. **Restart Services**:
   ```cmd
   # Restart the client-side service
   # Stop and start the service again
   ```

## Quick Fix Commands

```cmd
# 1. Find your printer port
find-printer-port.bat

# 2. Test the complete system
test-print-fix.bat

# 3. Test from POS system
# Go to http://192.168.0.176:4000/ and try printing
```

## Success Indicators

✅ **Console shows**: "SUCCESS! Printer found on port: USBxxx"
✅ **Test script passes**: All detection tests successful  
✅ **Single print job**: No duplicate requests in logs
✅ **Actual printing**: Printer fires and prints receipt
✅ **POS printing works**: Open cash receipt prints from server

## Next Steps

1. **Run the port finder** to identify your actual printer port
2. **Test the complete system** to verify everything works
3. **Try printing from POS** to confirm end-to-end functionality
4. **Monitor logs** to ensure no more duplicate requests

The key is finding the correct USB port where your printer is actually connected!
