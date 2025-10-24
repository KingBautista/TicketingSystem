# Printer Technical Specifications

## System Architecture

### Client-Side Service Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │  Client Service │
│   (React)       │◄──►│   (Laravel)     │◄──►│   (Node.js)     │
│   Port: 3000    │    │   Port: 8000    │    │   Port: 3001    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                                                       ▼
                                               ┌─────────────────┐
                                               │   Star BSC10    │
                                               │   Thermal       │
                                               │   Printer       │
                                               └─────────────────┘
```

### Print Flow
1. **Frontend Request** → React component triggers print
2. **Backend Processing** → Laravel API processes request
3. **Client Service** → Node.js service receives print command
4. **ESC/POS Generation** → Raw commands generated
5. **Printer Output** → Physical receipt printed

## Hardware Specifications

### Star BSC10 Thermal Printer
| Specification | Value |
|---------------|-------|
| **Model** | Star BSC10 |
| **Type** | Thermal Line Printer |
| **Paper Width** | 80mm (576 dots) |
| **Print Speed** | 150mm/s |
| **Resolution** | 203 DPI |
| **Connection** | USB 2.0 |
| **Power** | 12V DC, 2A |
| **Dimensions** | 200 x 150 x 100mm |
| **Weight** | 1.2kg |
| **Paper Type** | Thermal paper roll |
| **Paper Capacity** | 80mm x 80m roll |

### PD-300 Customer Display
| Specification | Value |
|---------------|-------|
| **Model** | Star PD-300 |
| **Display** | 2x20 character LCD |
| **Connection** | USB 2.0 |
| **Power** | USB powered |
| **Dimensions** | 150 x 100 x 50mm |
| **Weight** | 0.3kg |

## Software Specifications

### Node.js Service Requirements
```json
{
  "node": ">=18.0.0",
  "npm": ">=8.0.0",
  "dependencies": {
    "express": "^4.18.2",
    "serialport": "^12.0.0",
    "qrcode": "^1.5.3"
  }
}
```

### Windows Requirements
- **OS**: Windows 10/11 (64-bit)
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 100MB free space
- **USB**: 2x USB 2.0 ports minimum
- **Power**: 500W PSU recommended

## ESC/POS Command Specifications

### Printer Initialization
```javascript
const initCommands = [
  0x1B, 0x40,  // Initialize printer
  0x1B, 0x61, 0x01,  // Center alignment
  0x1D, 0x57, 0x02, 0x40  // Set paper width (80mm)
];
```

### Text Formatting Commands
```javascript
const textCommands = {
  centerAlign: [0x1B, 0x61, 0x01],
  leftAlign: [0x1B, 0x61, 0x00],
  boldOn: [0x1B, 0x45, 0x01],
  boldOff: [0x1B, 0x45, 0x00],
  doubleSize: [0x1D, 0x21, 0x11],
  normalSize: [0x1D, 0x21, 0x00]
};
```

### Paper Control Commands
```javascript
const paperCommands = {
  feed3Lines: [0x1B, 0x64, 0x03],
  fullCut: [0x1D, 0x56, 0x00],
  partialCut: [0x1D, 0x56, 0x01]
};
```

### QR Code Commands
```javascript
const qrCommands = {
  setup: [0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x43, 0x0C], // Size 12
  errorCorrection: [0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x45, 0x30], // Level L
  storeData: [0x1D, 0x28, 0x6B, dataLength + 3, 0x00, 0x31, 0x50, 0x30],
  print: [0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x51, 0x30]
};
```

## Print Job Specifications

### Open Cash Receipt Format
```
┌─────────────────────────────────────────┐
│              OPEN CASH RECEIPT          │
│                                         │
│              Cashier: [Name]            │
│                                         │
│              Date: [DateTime]           │
│                                         │
│              Cash on Hand: ₱[Amount]   │
│                                         │
│              Session ID: #[ID]          │
│                                         │
│              --- End of Receipt ---     │
└─────────────────────────────────────────┘
```

### Transaction Ticket Format
```
┌─────────────────────────────────────────┐
│              [QR CODE]                 │
│                                         │
│              [Promoter Name]           │
│                                         │
│              [DateTime]                │
│                                         │
│              Code: [QR Code]           │
│                                         │
│              Single use only           │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│                 RECEIPT                 │
│                                         │
│              Promoter: [Name]           │
│              [DateTime]                 │
│              Single use only            │
│              ────────────────────────   │
│              PROMOTER: [Name]           │
│              DATE: [DateTime]           │
│              RATE: [Rate Name]          │
│              QTY: [Quantity]            │
│              TOTAL: ₱[Amount]          │
│              PAID: ₱[Amount]           │
│              CHANGE: ₱[Amount]         │
│              CASHIER: [Name]            │
│              SESSION: #[ID]            │
│              TXN ID: #[ID]             │
│              DISCOUNTS: [List]         │
│              ────────────────────────   │
│              Thank you!                 │
└─────────────────────────────────────────┘
```

### Close Cash Receipt Format
```
┌─────────────────────────────────────────┐
│            CLOSE CASH REPORT            │
│              ========================== │
│              Date: [DateTime]           │
│              Cashier: [Name]            │
│              Session: #[ID]             │
│              ========================== │
│              ────────────────────────── │
│              *** DAILY TRANSACTIONS *** │
│                                         │
│              Transaction #[ID]         │
│              Time: [Time]               │
│              [Rate] x[Qty]             │
│              - [Discount]              │
│              Total: ₱[Amount]          │
│              ───────────────────────── │
│              *** SUMMARY ***            │
│                                         │
│              Opening Cash: ₱[Amount]   │
│              Total Transactions: [Count]│
│              Total Sales: ₱[Amount]    │
│              Closing Cash: ₱[Amount]   │
│              ───────────────────────── │
│              --- End of Report ---     │
└─────────────────────────────────────────┘
```

## Performance Specifications

### Print Speed
- **Text**: 150mm/s
- **QR Code**: 100mm/s
- **Mixed Content**: 120mm/s average

### Memory Usage
- **Service Startup**: ~50MB
- **Per Print Job**: ~5MB
- **Peak Usage**: ~100MB

### Response Times
- **Open Cash**: <2 seconds
- **Transaction**: <5 seconds (per ticket)
- **Close Cash**: <10 seconds

## Error Handling Specifications

### Error Codes
```javascript
const errorCodes = {
  PRINTER_NOT_FOUND: 'PRINTER_001',
  USB_CONNECTION_FAILED: 'PRINTER_002',
  PAPER_OUT: 'PRINTER_003',
  COVER_OPEN: 'PRINTER_004',
  PRINT_TIMEOUT: 'PRINTER_005',
  INVALID_COMMAND: 'PRINTER_006'
};
```

### Retry Logic
- **Max Retries**: 3
- **Retry Delay**: 1 second
- **Timeout**: 5 seconds
- **Fallback**: USB port switching

## Security Specifications

### Data Protection
- **Print Data**: Not stored permanently
- **Temporary Files**: Auto-deleted after print
- **Logs**: No sensitive data logged
- **Network**: Local communication only

### Access Control
- **Service Port**: 3001 (local only)
- **API Authentication**: Required
- **Print Permissions**: User-based

## Monitoring Specifications

### Health Checks
- **Printer Status**: Every 30 seconds
- **USB Connection**: Continuous
- **Service Status**: Every 10 seconds
- **Print Queue**: Real-time

### Logging
- **Print Jobs**: All logged
- **Errors**: Detailed logging
- **Performance**: Metrics collected
- **Retention**: 30 days

## Maintenance Specifications

### Daily Tasks
- **Paper Check**: Automated
- **Connection Test**: On startup
- **Print Test**: Manual trigger
- **Log Review**: Automated

### Weekly Tasks
- **Deep Clean**: Manual
- **Alignment Check**: Manual
- **Driver Update**: Check for updates
- **Performance Review**: Automated report

### Monthly Tasks
- **Full Calibration**: Manual
- **Hardware Inspection**: Manual
- **Software Update**: Manual
- **Documentation Update**: Manual

## Compliance Specifications

### Standards Compliance
- **ESC/POS**: Full compliance
- **USB 2.0**: Full compliance
- **Windows**: Compatible
- **Thermal Paper**: Standard 80mm

### Environmental
- **Operating Temperature**: 5°C to 40°C
- **Storage Temperature**: -10°C to 50°C
- **Humidity**: 20% to 80% RH
- **Power Consumption**: 12W average

---

**Document Version**: 1.0
**Last Updated**: January 2024
**Technical Contact**: [Your technical team]
