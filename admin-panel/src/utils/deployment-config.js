/**
 * Deployment-specific configuration for client-side service
 * This bypasses service discovery and uses direct connection
 */

export const DEPLOYMENT_CONFIG = {
    // Set to true for deployment scenarios
    isDeployment: true,
    
    // Direct service URL - using the laptop's IP where printer is connected
    // Change this to your laptop's IP address where the printer is connected
    serviceUrl: 'http://localhost:3001', // Update this to your laptop's IP
    
    // Timeout settings
    connectionTimeout: 10000, // 10 seconds (increased for network requests)
    
    // Retry settings
    maxRetries: 5, // Increased retries for network reliability
    retryDelay: 2000, // 2 seconds between retries
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
        console.log(`🔍 Deployment checker service URL: ${this.serviceUrl}`);
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
                console.log(`🔍 Full URL: ${this.serviceUrl}${endpoint}`);
                
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
                const errorMessage = error.message || error.toString();
                console.log(`❌ Attempt ${attempt} failed: ${errorMessage}`);
                
                // Detect ERR_BLOCKED_BY_CLIENT and provide helpful guidance
                if (errorMessage.includes('ERR_BLOCKED_BY_CLIENT') || 
                    errorMessage.includes('Failed to fetch') && errorMessage.includes('blocked')) {
                    console.warn(`⚠️ Browser Extension Blocking Detected!`);
                    console.warn(`   This error usually means a browser extension is blocking the request.`);
                    console.warn(`   Solutions:`);
                    console.warn(`   1. Disable ad blockers/privacy extensions (uBlock Origin, AdBlock, Privacy Badger, etc.)`);
                    console.warn(`   2. Try a different browser (Chrome, Firefox, Edge)`);
                    console.warn(`   3. Check if the service is running: ${this.serviceUrl}/health`);
                    console.warn(`   4. Add ${this.serviceUrl} to your extension's whitelist`);
                    console.warn(`   5. Try incognito/private mode to test without extensions`);
                } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
                    console.warn(`⚠️ Network Error Detected!`);
                    console.warn(`   This could mean:`);
                    console.warn(`   1. The service is not running on ${this.serviceUrl}`);
                    console.warn(`   2. Firewall is blocking the connection`);
                    console.warn(`   3. The service URL is incorrect`);
                    console.warn(`   Check if service is running: ${this.serviceUrl}/health`);
                }
                
                if (attempt < this.config.maxRetries) {
                    console.log(`⏳ Waiting ${this.config.retryDelay}ms before retry...`);
                    await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
                }
            }
        }
        
        console.log(`❌ All attempts failed for ${endpoint}`);
        
        // Provide final helpful error message
        const finalError = lastError?.message || (lastError ? String(lastError) : 'Unknown error');
        if (finalError.includes('ERR_BLOCKED_BY_CLIENT')) {
            console.error(`\n🚫 REQUEST BLOCKED BY BROWSER EXTENSION`);
            console.error(`   The browser is blocking requests to ${this.serviceUrl}`);
            console.error(`   Please disable ad blockers or privacy extensions and try again.`);
            console.error(`   Or verify the service is running: ${this.serviceUrl}/health\n`);
        } else if (finalError.includes('Failed to fetch')) {
            console.error(`\n🌐 NETWORK CONNECTION FAILED`);
            console.error(`   Cannot connect to ${this.serviceUrl}`);
            console.error(`   Please verify:`);
            console.error(`   1. The service is running (check the terminal where you started it)`);
            console.error(`   2. The service URL is correct: ${this.serviceUrl}`);
            console.error(`   3. No firewall is blocking port 3001`);
            console.error(`   Test the service: Open ${this.serviceUrl}/health in your browser\n`);
        }
        
        return { success: false, error: finalError };
    }
}

// Export singleton instance
export const deploymentServiceChecker = new DeploymentServiceChecker();
