/**
 * Dynamic service discovery for client-side service
 * Automatically detects the client service on the local network
 */

import { CLIENT_SERVICE_CONFIG } from './client-service-config.js';

export class ServiceDiscovery {
    constructor() {
        this.config = CLIENT_SERVICE_CONFIG;
        this.discoveredServices = new Map();
        this.currentServiceUrl = null;
    }

    /**
     * Discover client services on the local network
     * Tries common IP ranges and ports
     */
    async discoverServices() {
        const commonPorts = [3000, 4000, 5000];
        const ipRanges = this.generateIPRanges();
        
        console.log('🔍 Discovering client services...');
        
        const promises = [];
        
        for (const ip of ipRanges) {
            for (const port of commonPorts) {
                promises.push(this.checkService(`${ip}:${port}`));
            }
        }
        
        const results = await Promise.allSettled(promises);
        
        for (const result of results) {
            if (result.status === 'fulfilled' && result.value) {
                this.discoveredServices.set(result.value.url, result.value);
            }
        }
        
        console.log(`✅ Discovered ${this.discoveredServices.size} client services`);
        return Array.from(this.discoveredServices.values());
    }

    /**
     * Generate common IP ranges to check
     */
    generateIPRanges() {
        const ips = [];
        
        // Add localhost
        ips.push('127.0.0.1');
        
        // Add current config IP if it's not localhost
        if (this.config.host !== '127.0.0.1' && this.config.host !== 'localhost') {
            ips.push(this.config.host);
        }
        
        // Add common local network ranges
        // 192.168.0.x (most common home networks)
        for (let i = 1; i <= 254; i++) {
            ips.push(`192.168.0.${i}`);
        }
        
        // 192.168.1.x (alternative home networks)
        for (let i = 1; i <= 254; i++) {
            ips.push(`192.168.1.${i}`);
        }
        
        // 10.0.0.x (corporate networks)
        for (let i = 1; i <= 254; i++) {
            ips.push(`10.0.0.${i}`);
        }
        
        return ips;
    }

    /**
     * Check if a service is running at the given URL
     */
    async checkService(url) {
        try {
            const fullUrl = `http://${url}`;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout
            
            const response = await fetch(`${fullUrl}/health`, {
                method: 'GET',
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                const data = await response.json();
                if (data.status === 'healthy') {
                    return {
                        url: fullUrl,
                        host: url.split(':')[0],
                        port: parseInt(url.split(':')[1]),
                        data: data
                    };
                }
            }
        } catch (error) {
            // Service not available or timeout
        }
        
        return null;
    }

    /**
     * Get the best available service URL
     */
    async getBestServiceUrl() {
        // First try the configured service
        if (this.config.serviceUrl) {
            const configService = await this.checkService(this.config.serviceUrl.replace('http://', ''));
            if (configService) {
                this.currentServiceUrl = configService.url;
                return configService.url;
            }
        }
        
        // If configured service is not available, discover services
        const services = await this.discoverServices();
        
        if (services.length > 0) {
            // Prefer services with the same computer name or similar IP
            const preferredService = services.find(s => 
                s.data.computer === this.config.computerName ||
                s.host.startsWith('192.168.0.') ||
                s.host.startsWith('192.168.1.')
            );
            
            const selectedService = preferredService || services[0];
            this.currentServiceUrl = selectedService.url;
            return selectedService.url;
        }
        
        // Fallback to configured URL
        return this.config.serviceUrl;
    }

    /**
     * Get current service URL (cached)
     */
    getCurrentServiceUrl() {
        return this.currentServiceUrl || this.config.serviceUrl;
    }

    /**
     * Update the service configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.currentServiceUrl = null; // Reset cache
    }
}

// Export singleton instance
export const serviceDiscovery = new ServiceDiscovery();
