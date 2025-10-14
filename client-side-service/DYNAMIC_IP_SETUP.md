# Dynamic IP Setup for Client-Side Service

This document explains how to configure the client-side service to work with dynamic IP addresses, allowing it to work on any PC accessing the TicketingSystem.

## Problem Solved

Previously, the frontend was hardcoded to connect to `localhost:3000`, which only worked when the frontend and client service were on the same machine. Now the system can:

1. **Auto-detect** the best IP address for the service
2. **Work across the network** from any PC
3. **Fallback gracefully** if the service is not available
4. **Rediscover services** if the connection is lost

## Quick Setup for Your Case

Since you have a server at `192.168.0.176:4000`, here's how to configure it:

### Option 1: Manual IP Setting (Recommended for your case)

```bash
# Navigate to the client-side-service directory
cd client-side-service

# Set the specific IP and port
node set-ip.js 192.168.0.176 4000

# Start the service
npm start
```

### Option 2: Auto-Detection

```bash
# Navigate to the client-side-service directory
cd client-side-service

# Start the service (it will auto-detect the best IP)
npm start
```

## How It Works

### 1. Service Configuration (`config.js`)
- Automatically detects the best IP address (prioritizes 192.168.x.x networks)
- Binds the service to all network interfaces
- Provides configuration for the frontend

### 2. Service Discovery (`serviceDiscovery.js`)
- Scans common IP ranges (192.168.0.x, 192.168.1.x, 10.0.0.x)
- Checks multiple ports (3000, 4000, 5000)
- Caches discovered services for performance

### 3. Dynamic Frontend Utilities
- `printerUtils.js` and `displayUtils.js` now use service discovery
- Automatically find and connect to available services
- Fallback to configured service if discovery fails

## Configuration Files

### Generated Files
- `frontend-config.js` - Local configuration
- `admin-panel/src/utils/client-service-config.js` - Frontend configuration

### Manual Configuration
You can manually edit the frontend configuration:

```javascript
export const CLIENT_SERVICE_CONFIG = {
    serviceUrl: 'http://192.168.0.176:4000',
    host: '192.168.0.176',
    port: 4000,
    computerName: 'YourComputerName'
};
```

## Available Scripts

```bash
# Start the service
npm start

# Generate frontend configuration
npm run config

# Set specific IP address
npm run set-ip [ip] [port]

# Development mode with auto-restart
npm run dev
```

## Network Requirements

### Firewall
Make sure the following ports are open:
- **3000** (default service port)
- **4000** (your custom port)
- **5000** (alternative port)

### Network Access
The service binds to all interfaces (`0.0.0.0`), so it's accessible from:
- `localhost:3000` (local access)
- `192.168.0.176:4000` (network access)
- Any other network interface

## Troubleshooting

### Service Not Found
1. Check if the service is running: `npm start`
2. Verify the IP address: Check the console output
3. Test connectivity: `curl http://192.168.0.176:4000/health`

### Frontend Connection Issues
1. Check browser console for errors
2. Verify the frontend config file is updated
3. Try manual IP setting: `node set-ip.js 192.168.0.176 4000`

### Network Issues
1. Ensure firewall allows the port
2. Check if the IP address is correct
3. Verify the service is binding to all interfaces

## Testing

### Test Service Health
```bash
curl http://192.168.0.176:4000/health
```

### Test Configuration
```bash
curl http://192.168.0.176:4000/config
```

### Test Printer
```bash
curl -X POST http://192.168.0.176:4000/print \
  -H "Content-Type: application/json" \
  -d '{"content": "Test Print", "type": "receipt"}'
```

## Migration from Static Configuration

If you were previously using `localhost:3000`:

1. **No changes needed** - the system will auto-detect and work
2. **For specific IPs** - use `node set-ip.js [ip] [port]`
3. **For network deployment** - the service will automatically bind to all interfaces

## Security Considerations

- The service binds to all network interfaces for accessibility
- Consider firewall rules for production environments
- The service discovery scans common IP ranges (may be slow on large networks)
- Consider using specific IP configuration for production

## Performance Notes

- Service discovery has a 2-second timeout per IP check
- Results are cached to avoid repeated discovery
- The system prefers local network IPs (192.168.x.x) over others
- Fallback to configured service if discovery fails
