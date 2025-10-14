import { networkInterfaces } from 'os';

/**
 * Configuration for client-side service
 * Automatically detects the best IP address to use
 */
export class ServiceConfig {
    constructor() {
        this.port = process.env.PORT || 4000; // Default to port 4000
        this.host = this.detectBestIP();
    }

    /**
     * Detect the best IP address for the service
     * Priority: 192.168.x.x > 10.x.x.x > 172.16-31.x.x > 127.0.0.1
     */
    detectBestIP() {
        const interfaces = networkInterfaces();
        const candidates = [];

        for (const [name, nets] of Object.entries(interfaces)) {
            if (!nets) continue;
            
            for (const net of nets) {
                // Skip internal and non-IPv4 addresses
                if (net.family !== 'IPv4' || net.internal) continue;
                
                const ip = net.address;
                const priority = this.getIPPriority(ip);
                
                candidates.push({
                    ip,
                    name,
                    priority,
                    net
                });
            }
        }

        // Sort by priority (higher number = higher priority)
        candidates.sort((a, b) => b.priority - a.priority);

        const bestIP = candidates[0]?.ip || '127.0.0.1';
        console.log(`🌐 Detected IP addresses:`, candidates.map(c => `${c.ip} (${c.name})`));
        console.log(`🎯 Selected IP: ${bestIP}`);
        
        return bestIP;
    }

    /**
     * Get priority for IP address
     * Higher number = higher priority
     */
    getIPPriority(ip) {
        if (ip.startsWith('192.168.')) return 100; // Local network
        if (ip.startsWith('10.')) return 90;       // Private network
        if (ip.startsWith('172.')) {
            const secondOctet = parseInt(ip.split('.')[1]);
            if (secondOctet >= 16 && secondOctet <= 31) return 80; // Private network
        }
        if (ip === '127.0.0.1') return 10;         // Localhost
        return 50; // Other addresses
    }

    /**
     * Get the service URL
     */
    getServiceUrl() {
        return `http://${this.host}:${this.port}`;
    }

    /**
     * Get configuration for frontend
     */
    getFrontendConfig() {
        return {
            serviceUrl: this.getServiceUrl(),
            host: this.host,
            port: this.port,
            computerName: process.env.COMPUTERNAME || 'Unknown'
        };
    }

    /**
     * Generate a configuration file for the frontend
     */
    generateFrontendConfig() {
        const config = this.getFrontendConfig();
        const configContent = `// Auto-generated client service configuration
// Generated at: ${new Date().toISOString()}
// Computer: ${config.computerName}

export const CLIENT_SERVICE_CONFIG = {
    serviceUrl: '${config.serviceUrl}',
    host: '${config.host}',
    port: ${config.port},
    computerName: '${config.computerName}'
};

// For backward compatibility
export const CLIENT_SERVICE_URL = '${config.serviceUrl}';
`;

        return configContent;
    }
}

// Export singleton instance
export const serviceConfig = new ServiceConfig();
