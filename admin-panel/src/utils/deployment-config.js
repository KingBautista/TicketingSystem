/**
 * Deployment-specific configuration for client-side service
 * This bypasses service discovery and uses direct connection
 */

export const DEPLOYMENT_CONFIG = {
    // Set to true for deployment scenarios
    isDeployment: true,
    
    // Direct service URL (no discovery)
    serviceUrl: 'http://192.168.0.176:4000',
    
    // Timeout settings
    connectionTimeout: 5000, // 5 seconds
    
    // Retry settings
    maxRetries: 3,
    retryDelay: 1000, // 1 second
};

/**
 * Simple service checker for deployment
 */
export class DeploymentServiceChecker {
    constructor() {
        this.config = DEPLOYMENT_CONFIG;
        this.serviceUrl = this.config.serviceUrl;
    }

    /**
     * Check if service is available (simple version)
     */
    async checkService() {
        try {
            console.log(`🔍 Checking deployment service: ${this.serviceUrl}`);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.config.connectionTimeout);
            
            const response = await fetch(`${this.serviceUrl}/health`, {
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
                    console.log(`✅ Deployment service is healthy: ${this.serviceUrl}`);
                    return true;
                }
            }
            
            console.log(`❌ Deployment service not healthy: ${response.status}`);
            return false;
        } catch (error) {
            console.log(`❌ Deployment service not available: ${error.message}`);
            return false;
        }
    }

    /**
     * Get service URL (always returns configured URL)
     */
    getServiceUrl() {
        return this.serviceUrl;
    }

    /**
     * Execute request with retry logic
     */
    async executeRequest(endpoint, options = {}) {
        let lastError;
        
        for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
            try {
                console.log(`🔄 Attempt ${attempt}/${this.config.maxRetries} to ${endpoint}`);
                
                const response = await fetch(`${this.serviceUrl}${endpoint}`, {
                    ...options,
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        ...options.headers
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    console.log(`✅ Request successful to ${endpoint}`);
                    return { success: true, data };
                } else {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
            } catch (error) {
                lastError = error;
                console.log(`❌ Attempt ${attempt} failed: ${error.message}`);
                
                if (attempt < this.config.maxRetries) {
                    console.log(`⏳ Waiting ${this.config.retryDelay}ms before retry...`);
                    await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
                }
            }
        }
        
        console.log(`❌ All attempts failed for ${endpoint}`);
        return { success: false, error: lastError.message };
    }
}

// Export singleton instance
export const deploymentServiceChecker = new DeploymentServiceChecker();
