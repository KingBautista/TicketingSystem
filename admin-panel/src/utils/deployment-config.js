/**
 * Deployment-specific configuration for client-side service
 * This bypasses service discovery and uses direct connection
 */

export const DEPLOYMENT_CONFIG = {
    // Set to true for deployment scenarios
    isDeployment: true,
    
    // Direct service URL (no discovery) - using port 3001 to avoid conflicts
    serviceUrl: 'http://192.168.0.176:3001',
    
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
            
            console.log(`📡 Health check response: ${response.status} ${response.statusText}`);
            console.log(`📡 Content-Type: ${response.headers.get('content-type')}`);
            
            if (response.ok) {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const data = await response.json();
                    if (data.status === 'healthy') {
                        console.log(`✅ Deployment service is healthy: ${this.serviceUrl}`);
                        return true;
                    } else {
                        console.log(`❌ Service not healthy:`, data);
                        return false;
                    }
                } else {
                    const text = await response.text();
                    console.log(`❌ Health endpoint returned non-JSON:`, text.substring(0, 200));
                    return false;
                }
            }
            
            const text = await response.text();
            console.log(`❌ Health check failed (${response.status}):`, text.substring(0, 200));
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
                
                console.log(`📡 Response status: ${response.status} ${response.statusText}`);
                console.log(`📡 Response headers:`, Object.fromEntries(response.headers.entries()));
                
                if (response.ok) {
                    // Check if response is actually JSON
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        const data = await response.json();
                        console.log(`✅ Request successful to ${endpoint}:`, data);
                        return { success: true, data };
                    } else {
                        // Response is not JSON, get text to see what we got
                        const text = await response.text();
                        console.log(`⚠️ Non-JSON response from ${endpoint}:`, text.substring(0, 200));
                        throw new Error(`Expected JSON but got ${contentType || 'unknown content type'}`);
                    }
                } else {
                    // Get response text for better error reporting
                    const text = await response.text();
                    console.log(`❌ HTTP ${response.status} response:`, text.substring(0, 200));
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
