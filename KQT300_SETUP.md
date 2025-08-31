# KQT300 Device Configuration Guide

## Overview
This guide explains how to configure KQT300 devices to work with the Ticketing System using the QR Scanner Config Tool.

## Configuration Process

### 1. Open QR Scanner Config Tool
- Launch the "QR Scanner Config Tool_http_v1" application
- The tool has a dark blue interface with configuration fields

### 2. Configure Device Settings

#### Network Configuration
- **Network Config**: Select "DHCP" or "Fixed IP" based on your network setup
- **IP Address**: Set the device IP address (if using Fixed IP)
- **Mask**: Set subnet mask (e.g., 255.255.255.0)
- **Gateway**: Set gateway IP address
- **DNS**: Set DNS server IP address

#### HTTP Server Configuration
- **Http Server Address**: Set to your Laravel API server address
  - Example: `http://192.168.1.100:8000/api/kqt300/validate`
  - Or: `http://your-domain.com/api/kqt300/validate`

#### Device Settings
- **Scanning Interval(ms)**: Set scanning frequency (e.g., 1000ms = 1 second)
- **Receive Timeout(≤5s)**: Set timeout for HTTP responses (max 5 seconds)
- **Device Name**: Give your device a descriptive name (e.g., "Entrance Scanner")

#### Heartbeat Configuration
- **Heartbeat Enable**: Select "Enable" for device monitoring
- **Heartbeat Data**: Set heartbeat endpoint (e.g., `/api/kqt300/status`)
- **Heartbeat Time**: Set heartbeat interval (e.g., 30000ms = 30 seconds)

#### Other Parameters
- **Other Parameter**: Any additional configuration needed

### 3. Generate Configuration QR Code
- Click the "Create Config Code" button
- The tool will generate a QR code containing all the configuration

### 4. Configure KQT300 Device
- Scan the generated QR code with your KQT300 device
- The device will automatically apply the configuration
- The device will start communicating with your Laravel API

## API Endpoints

### Core Endpoints (Used by KQT300)
- **POST** `/api/kqt300/validate` - Validate QR codes and RFID cards
- **GET** `/api/kqt300/stream` - Real-time scan data stream
- **GET** `/api/kqt300/poll` - Poll for scan data
- **GET** `/api/kqt300/status` - Device status check
- **GET** `/api/kqt300/health` - Health monitoring

### Legacy Endpoints (Backward Compatibility)
- **POST** `/api/access/validate` - Same as kqt300/validate
- **GET** `/api/access/stream` - Same as kqt300/stream
- **GET** `/api/access/poll` - Same as kqt300/poll
- **GET** `/api/access/health` - Same as kqt300/health

## Testing Configuration

### 1. Test Device Connectivity
```bash
curl -X GET http://your-server.com/api/kqt300/status
```

Expected response:
```json
{
  "status": "success",
  "data": {
    "device_status": "online",
    "timestamp": "2024-01-15T10:30:00Z",
    "api_version": "1.0",
    "database_connection": true,
    "redis_connection": true,
    "server_info": {
      "name": "Ticketing System",
      "environment": "production",
      "version": "1.0.0"
    },
    "endpoints": {
      "validate": "http://your-server.com/api/kqt300/validate",
      "stream": "http://your-server.com/api/kqt300/stream",
      "poll": "http://your-server.com/api/kqt300/poll",
      "health": "http://your-server.com/api/kqt300/health"
    },
    "uptime": "24h 30m 15s"
  }
}
```

### 2. Test Scan Validation
```bash
curl -X POST http://your-server.com/api/kqt300/validate \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "vgdecoderesult=313233343536&devicenumber=001"
```

## Troubleshooting

### Common Issues

1. **Device not connecting**
   - Check network configuration (IP, mask, gateway)
   - Verify HTTP server address is correct
   - Ensure firewall allows HTTP traffic

2. **Timeout errors**
   - Increase "Receive Timeout" value
   - Check server response time
   - Verify network connectivity

3. **Scan data not received**
   - Check scanning interval setting
   - Verify endpoint URLs are correct
   - Check server logs for errors

### Health Check
Monitor device health using:
```bash
curl -X GET http://your-server.com/api/kqt300/health
```

## Security Considerations

- Use HTTPS in production environments
- Configure firewall rules to restrict access
- Monitor device logs for suspicious activity
- Regularly update device firmware

## Support

For technical support:
- Check server logs in `storage/logs/laravel.log`
- Monitor device status via `/api/kqt300/status`
- Verify network connectivity between device and server
