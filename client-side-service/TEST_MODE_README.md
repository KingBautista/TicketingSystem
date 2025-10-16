# Test Mode for TicketingSystem Printer Service

## 🧪 Overview

Test Mode allows you to test the printing functionality without requiring a physical Star BSC10 printer. This is perfect for:

-   **Development and testing** without hardware
-   **Remote access scenarios** (like AnyDesk)
-   **CI/CD pipelines** and automated testing
-   **Demo purposes** without physical setup

## 🚀 Quick Start

### Option 1: Use the Test Mode Batch File (Recommended)

```bash
# Double-click or run:
start-service-test-mode.bat
```

### Option 2: Use npm Scripts

```bash
# Install dependencies first
npm install

# Start in test mode
npm run start:test
```

### Option 3: Manual Environment Variable

```bash
# Set environment variable and start
set PRINTER_TEST_MODE=true
node server.js --test-mode
```

## 📊 What Test Mode Does

### ✅ **Simulates All Print Operations:**

-   **Transaction Receipts** - Complete receipt with QR codes (formatted like actual printer)
-   **Open Cash Receipts** - Cashier session opening (formatted layout)
-   **Close Cash Reports** - End-of-day summaries (formatted layout)
-   **QR Code Generation** - Individual ticket printing (formatted layout)
-   **Bold Text** - Formatted text printing

### 📁 **Saves Print Content:**

-   **Formatted Print Files** - Saved to `test-output/` folder with actual printer layout
-   **Console Preview** - Shows formatted output in terminal during printing
-   **Operation Logs** - Saved to `test-prints.log`
-   **Raw Data** - Complete transaction data preserved alongside formatted output
-   **Timestamps** - All operations timestamped

### 🔍 **Provides Statistics:**

-   Total print operations
-   Success/failure rates
-   Recent files generated
-   Test mode status

## 🛠️ Usage Examples

### Check Test Mode Status

```bash
# Via HTTP endpoint
curl http://localhost:4000/test-mode/status

# Via command line
node test-mode.js status
```

### Test Print Operation

```bash
# Run the test script
npm test

# Or manually
node test-print.js

# Demo formatted output
npm run demo
```

### Clear Test Data

```bash
# Via HTTP endpoint
curl -X POST http://localhost:4000/test-mode/clear

# Via command line
node test-mode.js clear
```

## 📋 API Endpoints

### Health Check (Enhanced)

```
GET /health
```

**Response includes test mode status:**

```json
{
    "status": "healthy",
    "testMode": true,
    "testModeStatus": {
        "totalOperations": 15,
        "successfulOperations": 15,
        "failedOperations": 0,
        "savedFiles": 15
    }
}
```

### Test Mode Status

```
GET /test-mode/status
```

### Clear Test Data

```
POST /test-mode/clear
```

### Print Operations (Same as Production)

```
POST /print
Content-Type: application/json

{
  "content": "print content or JSON data",
  "type": "transaction|opencash|closecash|qr|bold"
}
```

## 📁 File Structure

```
client-side-service/
├── test-output/           # Generated print content files
│   ├── transaction_2025-10-15T10-30-00-000Z.txt
│   ├── opencash_2025-10-15T10-31-00-000Z.txt
│   └── closecash_2025-10-15T10-32-00-000Z.txt
├── test-prints.log        # Operation log file
├── test-mode.js          # Test mode implementation
├── test-print.js         # Test script
├── start-service-test-mode.bat  # Test mode startup
└── server.js             # Main service (modified for test mode)
```

## 🔧 Configuration

### Environment Variables

```bash
# Enable test mode
PRINTER_TEST_MODE=true

# Optional: Custom output directory
TEST_OUTPUT_DIR=./custom-test-output
```

### Command Line Arguments

```bash
# Enable test mode via argument
node server.js --test-mode
```

## 🧪 Testing Scenarios

### 1. Transaction Printing

```javascript
// Frontend sends transaction data
const transactionData = {
    transactionId: 139,
    promoterName: "Floyd Mayweather Jr.",
    rateName: "VIP Ticket",
    quantity: 1,
    total: "250.00",
    // ... complete transaction data
};

// Test mode simulates the print and saves content
// Result: transaction_2025-10-15T10-30-00-000Z.txt
```

### 2. Open Cash Receipt

```javascript
// Cashier opens session
const openCashData = "CashierName,1000.00,SESSION-001";

// Test mode simulates open cash receipt
// Result: opencash_2025-10-15T10-31-00-000Z.txt
```

### 3. Close Cash Report

```javascript
// End of day summary
const closeCashData = {
  cashierName: "CashierName",
  sessionId: "SESSION-001",
  openingCash: 1000.00,
  closingCash: 2500.00,
  dailyTransactions: [...],
  dailyTotal: 1500.00
};

// Test mode simulates close cash report
// Result: closecash_2025-10-15T10-32-00-000Z.txt
```

## 🚨 Troubleshooting

### Test Mode Not Working

1. **Check Environment Variable:**

    ```bash
    echo %PRINTER_TEST_MODE%
    # Should output: true
    ```

2. **Check Service Status:**

    ```bash
    curl http://localhost:4000/health
    # Look for "testMode": true
    ```

3. **Check Logs:**
    ```bash
    # Look for test mode messages in console
    🧪 Test mode enabled - simulating print operation
    ```

### Files Not Being Saved

1. **Check Permissions:**

    - Ensure write permissions to `test-output/` folder
    - Check if folder exists and is writable

2. **Check Disk Space:**
    - Ensure sufficient disk space for log files

### Service Won't Start

1. **Check Dependencies:**

    ```bash
    npm install
    ```

2. **Check Port Availability:**
    ```bash
    netstat -an | findstr :4000
    ```

## 🔄 Switching Between Modes

### Enable Test Mode

```bash
# Method 1: Batch file
start-service-test-mode.bat

# Method 2: Environment variable
set PRINTER_TEST_MODE=true
node server.js

# Method 3: Command line argument
node server.js --test-mode
```

### Disable Test Mode (Use Physical Printer)

```bash
# Method 1: Regular batch file
start-service.bat

# Method 2: Clear environment variable
set PRINTER_TEST_MODE=
node server.js

# Method 3: npm script
npm start
```

## 📈 Monitoring and Analytics

### View Test Statistics

```bash
# Check current status
curl http://localhost:4000/test-mode/status

# View log file
type test-prints.log

# List generated files
dir test-output
```

### Example Output

```
🧪 Test Mode Status:
{
  "testMode": true,
  "totalOperations": 25,
  "successfulOperations": 25,
  "failedOperations": 0,
  "savedFiles": 25,
  "recentFiles": [
    "transaction_2025-10-15T10-30-00-000Z.txt",
    "opencash_2025-10-15T10-31-00-000Z.txt"
  ]
}
```

## 🎯 Benefits

1. **No Hardware Required** - Test without physical printer
2. **Remote Development** - Work from anywhere via AnyDesk
3. **CI/CD Integration** - Automated testing in pipelines
4. **Debug Capability** - See exactly what would be printed
5. **Performance Testing** - Test high-volume scenarios
6. **Demo Ready** - Show functionality without setup

## 🔗 Integration with Frontend

The frontend automatically works with test mode - no changes needed! The same API calls work for both test and production modes.

**Frontend logs will show:**

```
✅ Transaction printed successfully via client printer service
```

**Test mode logs will show:**

```
🧪 [TEST MODE] Simulating transaction print operation

📄 FORMATTED OUTPUT PREVIEW:
═══════════════════════════════════════
╔══════════════════════════════════════╗
║              QR TICKET 1             ║
╠══════════════════════════════════════╣
║                                      ║
║           [QR CODE: PROMOTER24-...]  ║
║                                      ║
║  Promoter: Floyd Mayweather Jr.      ║
║  Date: 10/15/2025, 2:30:00 PM       ║
║  Code: PROMOTER24-2025-10-15-...     ║
║                                      ║
║         Single use only              ║
║                                      ║
╚══════════════════════════════════════╝

╔══════════════════════════════════════╗
║              RECEIPT                 ║
╠══════════════════════════════════════╣
║                                      ║
║  Promoter: Floyd Mayweather Jr.      ║
║                                      ║
║  10/15/2025, 2:30:00 PM             ║
║         Single use only              ║
║                                      ║
╠══════════════════════════════════════╣
║                                      ║
║  PROMOTER: Floyd Mayweather Jr.      ║
║  DATE: 10/15/2025, 2:30:00 PM       ║
║  RATE: VIP Ticket                    ║
║  QTY: 1                             ║
║  TOTAL: ₱250.00                     ║
║  PAID: ₱250.00                      ║
║                                      ║
║  Cashier: John Doe                  ║
║  Session: SESSION-001               ║
║                                      ║
║           Thank you!                 ║
║                                      ║
╚══════════════════════════════════════╝
═══════════════════════════════════════

📄 Print content saved to: transaction_2025-10-15T10-30-00-000Z.txt
✅ [TEST MODE] Print simulation completed successfully
```

This allows seamless development and testing without any frontend modifications!
