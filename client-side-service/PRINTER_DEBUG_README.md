# 🖨️ Printer Debug Tools

This document explains how to debug printer issues when the client-side service reports successful printing but the actual printer doesn't print.

## 🚨 Problem Description

You're getting this response:
```
✅ Transaction printed successfully via client printer service
```

But the physical printer is not actually printing anything.

## 🔧 Debug Tools Available

### 1. **Web-Based Test Dashboard** (Recommended)
Access the printer test dashboard in your browser:
```
http://localhost:3001/printer-test
```

This provides a user-friendly interface to:
- Check system status
- Verify printer availability
- List all available printers
- Run various printer tests
- View detailed error logs

### 2. **Command Line Debug Script**
Run the comprehensive debug script:
```bash
node test-printer-debug.js
```

This will check:
- StarBSC10 printer existence
- All available printers
- Printer sharing status
- Raw printing capability
- PowerShell printing
- Print Spooler service
- Printer ports

### 3. **Batch File (Windows)**
Double-click `debug-printer.bat` to run all debug tools automatically.

### 4. **API Endpoints**
Test individual components via HTTP:

```bash
# Check printer status
curl http://localhost:3001/printer/status

# List all printers
curl http://localhost:3001/printer/list

# Test simple printing
curl -X POST http://localhost:3001/printer/test \
  -H "Content-Type: application/json" \
  -d '{"testType":"simple"}'

# Test QR code printing
curl -X POST http://localhost:3001/printer/test \
  -H "Content-Type: application/json" \
  -d '{"testType":"qr"}'
```

## 🔍 Common Issues & Solutions

### Issue 1: StarBSC10 Printer Not Found
**Symptoms:** `❌ StarBSC10 printer not found`

**Solutions:**
1. **Install the printer:**
   - Go to Windows Settings > Devices > Printers & scanners
   - Click "Add a printer or scanner"
   - Install StarBSC10 or similar thermal printer

2. **Use a different printer name:**
   - Edit `star-final-printer.js` line 14: `this.printerName = 'YourPrinterName';`
   - Restart the client service

3. **Install a generic text printer:**
   - Add "Generic / Text Only" printer
   - Name it "StarBSC10"

### Issue 2: Print Spooler Service Not Running
**Symptoms:** `❌ Print Spooler service not running`

**Solutions:**
1. **Start the service:**
   ```powershell
   Start-Service -Name Spooler
   ```

2. **Set to auto-start:**
   ```powershell
   Set-Service -Name Spooler -StartupType Automatic
   ```

### Issue 3: Printer Not Shared
**Symptoms:** Raw printing fails with network errors

**Solutions:**
1. **Share the printer:**
   - Right-click printer in Devices & Printers
   - Select "Printer properties"
   - Go to "Sharing" tab
   - Check "Share this printer"

2. **Check network access:**
   ```powershell
   Get-Printer | Where-Object {$_.Shared -eq $true}
   ```

### Issue 4: Permission Issues
**Symptoms:** Access denied errors

**Solutions:**
1. **Run as Administrator:**
   - Right-click Command Prompt
   - Select "Run as administrator"
   - Start the client service

2. **Check printer permissions:**
   - Go to printer properties
   - Security tab
   - Ensure your user has "Print" permission

### Issue 5: Firewall Blocking
**Symptoms:** Connection timeouts

**Solutions:**
1. **Allow Node.js through firewall:**
   - Windows Defender Firewall
   - Allow an app through firewall
   - Add Node.js

2. **Check port 3001:**
   ```powershell
   netstat -an | findstr :3001
   ```

## 🧪 Testing Steps

### Step 1: Basic Connectivity
1. Open `http://localhost:3001/printer-test`
2. Check if "System Status" shows ✅ Online
3. If offline, restart the client service

### Step 2: Printer Detection
1. Click "Check Status" in Printer Diagnostics
2. Should show StarBSC10 as available
3. If not, install or configure the printer

### Step 3: Simple Test
1. Click "Test Simple Text" in Printer Tests
2. Check if physical printer responds
3. If not, check printer power and connection

### Step 4: Advanced Tests
1. Try "Test Raw Data" - tests low-level printing
2. Try "Test QR Code" - tests ESC/POS commands
3. Try "Test Bold Text" - tests formatting

## 📋 Manual PowerShell Commands

If the web interface doesn't work, try these commands directly:

```powershell
# Check if StarBSC10 exists
Get-Printer -Name "StarBSC10"

# List all printers
Get-Printer | Select-Object Name, PrinterStatus, DriverName

# Check Print Spooler service
Get-Service -Name Spooler

# Test printing via PowerShell
"Test Print" | Out-Printer -Name "StarBSC10"

# Check printer ports
Get-PrinterPort | Select-Object Name, PrinterHostAddress, PortType
```

## 🔄 Alternative Printer Setup

If StarBSC10 is not available, you can:

### Option 1: Use Any Available Printer
1. Edit `star-final-printer.js` line 14
2. Change `this.printerName = 'StarBSC10';` to your printer name
3. Restart the service

### Option 2: Install Generic Text Printer
1. Add "Generic / Text Only" printer
2. Name it "StarBSC10"
3. This will work for basic text printing

### Option 3: Use File Output (for testing)
1. Modify the printer class to write to a file instead
2. This allows testing without a physical printer

## 📞 Remote Debugging

Since you're using AnyDesk for remote access:

1. **Access the test dashboard remotely:**
   ```
   http://[REMOTE_IP]:3001/printer-test
   ```

2. **Run debug commands remotely:**
   ```bash
   # On the remote machine
   node test-printer-debug.js
   ```

3. **Check printer status remotely:**
   ```bash
   curl http://localhost:3001/printer/status
   ```

## 🎯 Quick Fix Checklist

- [ ] Client service is running (`npm start` or `node server.js`)
- [ ] StarBSC10 printer is installed and visible in Windows
- [ ] Print Spooler service is running
- [ ] Printer is powered on and connected
- [ ] Printer is shared (for network access)
- [ ] Windows Firewall allows Node.js
- [ ] User has printer permissions
- [ ] Test with simple text first
- [ ] Check printer paper and ink/ribbon

## 📝 Log Files

Check these locations for detailed error logs:
- Client service console output
- Windows Event Viewer > Applications and Services Logs
- Print Spooler logs in Event Viewer

## 🆘 Still Not Working?

If none of the above solutions work:

1. **Try a different printer driver**
2. **Use a USB connection instead of network**
3. **Test with Windows Notepad first** (File > Print)
4. **Check if the printer works with other applications**
5. **Consider using a different printer model**

The debug tools will help identify exactly where the issue is occurring in the printing pipeline.
