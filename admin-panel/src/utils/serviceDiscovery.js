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
     * Generate common IP ranges to check (optimized for faster discovery)
     */
    generateIPRanges() {
        const ips = [];
        
        // Add current config IP first (highest priority)
        if (this.config.host && this.config.host !== '127.0.0.1' && this.config.host !== 'localhost') {
            ips.push(this.config.host);
        }
        
        // Add localhost
        ips.push('127.0.0.1');
        
        // Add specific known IPs (your server IP)
        ips.push('192.168.0.176');
        
        // Add limited range around the configured IP
        if (this.config.host && this.config.host.startsWith('192.168.0.')) {
            const baseIP = this.config.host.split('.')[3];
            const startIP = Math.max(1, parseInt(baseIP) - 10);
            const endIP = Math.min(254, parseInt(baseIP) + 10);
            
            for (let i = startIP; i <= endIP; i++) {
                if (`192.168.0.${i}` !== this.config.host) {
                    ips.push(`192.168.0.${i}`);
                }
            }
        }
        
        // Add a few common gateway IPs
        ips.push('192.168.0.1');
        ips.push('192.168.1.1');
        ips.push('10.0.0.1');
        
        return ips;
    }

    /**
     * Check if a service is running at the given URL
     */
    async checkService(url) {
        try {
            const fullUrl = `http://${url}`;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1000); // 1 second timeout for faster discovery
            
            const response = await fetch(`${fullUrl}/health`, {
                method: 'GET',
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                const data = await response.json();
                if (data.status === 'healthy') {
                    console.log(`✅ Found service at: ${fullUrl}`);
                    return {
                        url: fullUrl,
                        host: url.split(':')[0],
                        port: parseInt(url.split(':')[1]),
                        data: data
                    };
                }
            }
        } catch (error) {
            // Service not available or timeout - silently continue
        }
        
        return null;
    }

    /**
     * Get the best available service URL
     */
    async getBestServiceUrl() {
        console.log('🔍 Looking for client service...');
        
        // First try the configured service (direct connection)
        if (this.config.serviceUrl) {
            console.log(`🎯 Trying configured service: ${this.config.serviceUrl}`);
            const configService = await this.checkService(this.config.serviceUrl.replace('http://', ''));
            if (configService) {
                console.log(`✅ Using configured service: ${configService.url}`);
                this.currentServiceUrl = configService.url;
                return configService.url;
            } else {
                console.log(`❌ Configured service not available: ${this.config.serviceUrl}`);
            }
        }
        
        // Try localhost as fallback
        console.log('🔍 Trying localhost fallback...');
        const localhostService = await this.checkService('127.0.0.1:4000');
        if (localhostService) {
            console.log(`✅ Using localhost service: ${localhostService.url}`);
            this.currentServiceUrl = localhostService.url;
            return localhostService.url;
        }
        
        // If configured service is not available, try limited discovery
        console.log('🔍 Trying limited service discovery...');
        const services = await this.discoverServices();
        
        if (services.length > 0) {
            // Prefer services with the same computer name or similar IP
            const preferredService = services.find(s => 
                s.data.computer === this.config.computerName ||
                s.host.startsWith('192.168.0.') ||
                s.host.startsWith('192.168.1.')
            );
            
            const selectedService = preferredService || services[0];
            console.log(`✅ Using discovered service: ${selectedService.url}`);
            this.currentServiceUrl = selectedService.url;
            return selectedService.url;
        }
        
        // Final fallback to configured URL (even if not responding)
        console.log(`⚠️ No services found, using configured URL: ${this.config.serviceUrl}`);
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
