# Deployment Guide for TicketingSystem Client-Side Service

## Quick Setup for Deployment

### 1. On the Target Computer (where the service will run):

1. **Copy the client-side-service folder** to the target computer
2. **Navigate to the client-side-service directory**
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Start the service**:
   ```bash
   node server.js
   ```
   OR use the batch file:
   ```bash
   start-service.bat
   ```

### 2. On the Frontend Computer (where the TicketingSystem runs):

The frontend is now configured to use **deployment mode** which:
- ✅ **Bypasses service discovery** (no more scanning hundreds of IPs)
- ✅ **Connects directly** to `http://192.168.0.176:4000`
- ✅ **Has retry logic** (3 attempts with 1-second delays)
- ✅ **Better error handling** for network issues

## Configuration Files

### Frontend Configuration
The frontend is configured to use:
- **Service URL**: `http://192.168.0.176:4000`
- **Deployment Mode**: Enabled (bypasses service discovery)
- **Retry Logic**: 3 attempts with 1-second delays
- **Timeout**: 5 seconds per request

### Service Configuration
The service is configured to:
- **Port**: 4000
- **CORS**: Enabled for all origins
- **Binding**: All interfaces (0.0.0.0)
- **Auto-detection**: Network IP detection

## Troubleshooting

### If you get CORS errors:
1. Make sure the service is running on the target computer
2. Check that port 4000 is open in the firewall
3. Verify the service is accessible: `http://192.168.0.176:4000/health`

### If you get connection errors:
1. Check if the service is running: `netstat -an | findstr :4000`
2. Test connectivity: `curl http://192.168.0.176:4000/health`
3. Check firewall settings on the target computer

### If the service won't start:
1. Make sure Node.js is installed
2. Check if port 4000 is already in use
3. Run `npm install` to ensure dependencies are installed

## Network Requirements

### Firewall Rules
Allow port 4000 through the firewall on the target computer:
```bash
# Windows Firewall
netsh advfirewall firewall add rule name="Client Service" dir=in action=allow protocol=TCP localport=4000
```

### Network Access
- The service binds to all interfaces (0.0.0.0:4000)
- Accessible from any IP on the network
- CORS enabled for all origins

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

## Deployment Mode vs Development Mode

### Deployment Mode (Current)
- **Direct connection** to configured IP
- **No service discovery** (faster, more reliable)
- **Retry logic** for network issues
- **Better error handling**

### Development Mode
- **Service discovery** (scans network for services)
- **Auto-detection** of available services
- **Fallback mechanisms**

To switch to development mode, edit `admin-panel/src/utils/deployment-config.js`:
```javascript
export const DEPLOYMENT_CONFIG = {
    isDeployment: false, // Change to false for development mode
    // ... rest of config
};
```

## Success Indicators

When everything is working correctly, you should see:
- ✅ Service running on port 4000
- ✅ No CORS errors in browser console
- ✅ Successful health checks
- ✅ Printer commands executing successfully
- ✅ Display commands working

## Common Issues and Solutions

### Issue: "Service not found"
**Solution**: Make sure the service is running on the target computer

### Issue: CORS errors
**Solution**: Service is running but CORS is not configured properly

### Issue: Connection timeout
**Solution**: Check firewall and network connectivity

### Issue: Service discovery taking too long
**Solution**: Use deployment mode (already configured)
