/**
 * Frontend printer utilities for CLIENT SIDE PRINTING
 * This calls a local Node.js service that executes star-final-printer.js
 */

import { serviceDiscovery } from './serviceDiscovery.js';
import { deploymentServiceChecker, DEPLOYMENT_CONFIG } from './deployment-config.js';

export class ClientPrinter {
    constructor() {
        this.clientServiceUrl = null; // Will be set dynamically
        this.serviceDiscovery = serviceDiscovery;
        this.deploymentMode = DEPLOYMENT_CONFIG.isDeployment;
        this.deploymentChecker = deploymentServiceChecker;
    }

    /**
     * Get the current service URL (with auto-discovery or deployment mode)
     */
    async getServiceUrl() {
        if (this.deploymentMode) {
            // In deployment mode, use direct connection
            return this.deploymentChecker.getServiceUrl();
        } else {
            // In development mode, use service discovery
            if (!this.clientServiceUrl) {
                this.clientServiceUrl = await this.serviceDiscovery.getBestServiceUrl();
            }
            return this.clientServiceUrl;
        }
    }

    /**
     * Check if client printer service is running
     */
    async checkServiceHealth() {
        if (this.deploymentMode) {
            // In deployment mode, use deployment checker
            return await this.deploymentChecker.checkService();
        } else {
            // In development mode, use service discovery
            try {
                const serviceUrl = await this.getServiceUrl();
                const response = await fetch(`${serviceUrl}/health`);
                const result = await response.json();
                return result.status === 'healthy';
            } catch (error) {
                console.error('❌ Client printer service not available:', error);
                // Try to rediscover services
                this.clientServiceUrl = null;
                return false;
            }
        }
    }

    /**
     * Execute printer command via local client service
     */
    async executePrinterCommand(command, data) {
        try {
            console.log(`🖨️ Executing printer command via client service: ${command}`);
            
            if (this.deploymentMode) {
              console.log(`🖨️ King is here`);
                // In deployment mode, use deployment checker with retry logic
                const result = await this.deploymentChecker.executeRequest('/print', {
                    method: 'POST',
                    body: JSON.stringify({
                        content: typeof data === 'object' ? JSON.stringify(data) : data,
                        type: command
                    })
                });
                
                if (result.success) {
                    console.log('✅ Printer command executed successfully (deployment mode)');
                    return true;
                } else {
                    console.error('❌ Printer command failed (deployment mode):', result.error);
                    return false;
                }
            } else {
                // In development mode, use service discovery
                // Get the current service URL
                const serviceUrl = await this.getServiceUrl();
                
                // Check if service is running
                const isHealthy = await this.checkServiceHealth();
                if (!isHealthy) {
                    console.error('❌ Client printer service not running');
                    console.error('❌ Please start the service: client-side-service/start-service.bat');
                    console.error(`❌ Tried to connect to: ${serviceUrl}`);
                    return false;
                }
                
                // Call the local client service
                const response = await fetch(`${serviceUrl}/print`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        content: typeof data === 'object' ? JSON.stringify(data) : data,
                        type: command
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    console.log('✅ Printer command executed successfully');
                    return true;
                } else {
                    console.error('❌ Printer command failed:', result.error);
                    return false;
                }
            }
        } catch (error) {
            console.error('❌ Printer command error:', error);
            // Reset service URL to force rediscovery (only in dev mode)
            if (!this.deploymentMode) {
                this.clientServiceUrl = null;
            }
            return false;
        }
    }

    /**
     * Print open cash receipt using existing printOpenCashReceipt method
     */
    async printOpenCash(cashierName, cashOnHand, sessionId) {
        try {
            console.log('🖨️ Frontend printing open cash receipt');
            
            // Use the existing printOpenCashReceipt method
            const data = `${cashierName},${cashOnHand},${sessionId}`;
            return await this.executePrinterCommand('opencash', data);
        } catch (error) {
            console.error('❌ Frontend open cash printing error:', error);
            return false;
        }
    }

    /**
     * Print transaction using existing printTransactionTickets method
     */
    async printTransaction(transactionData) {
        try {
            console.log('🖨️ Frontend printing transaction:', transactionData);
            
            // For transaction printing, we need to create a temporary file or pass JSON directly
            // Let's use the 'transaction' command instead of 'transactionfile'
            const jsonString = typeof transactionData === 'object' ? JSON.stringify(transactionData) : transactionData;
            return await this.executePrinterCommand('transaction', jsonString);
        } catch (error) {
            console.error('❌ Frontend printing error:', error);
            return false;
        }
    }

    /**
     * Print close cash report using existing printCloseCashReceipt method
     */
    async printCloseCash(closeCashData) {
        try {
            console.log('🖨️ Frontend printing close cash report:', closeCashData);
            
            // Convert object to JSON string for close cash printing
            const jsonString = typeof closeCashData === 'object' ? JSON.stringify(closeCashData) : closeCashData;
            return await this.executePrinterCommand('closecash', jsonString);
        } catch (error) {
            console.error('❌ Frontend close cash printing error:', error);
            return false;
        }
    }

    /**
     * Test printer connection
     */
    async testPrinter() {
        try {
            console.log('🖨️ Testing printer connection...');
            return await this.executePrinterCommand('test', '');
        } catch (error) {
            console.error('❌ Printer test error:', error);
            return false;
        }
    }


}

// Export singleton instance
export const clientPrinter = new ClientPrinter();
