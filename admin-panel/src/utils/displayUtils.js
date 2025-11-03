/**
 * Frontend display utilities for PD-300 DISPLAY
 * This calls a local Node.js service that executes send-display.js
 */

import { serviceDiscovery } from './serviceDiscovery.js';

export class ClientDisplay {
    constructor() {
        this.clientServiceUrl = null; // Will be set dynamically
        this.serviceDiscovery = serviceDiscovery;
    }

    /**
     * Get the current service URL (with auto-discovery)
     */
    async getServiceUrl() {
        if (!this.clientServiceUrl) {
            this.clientServiceUrl = await this.serviceDiscovery.getBestServiceUrl();
        }
        return this.clientServiceUrl;
    }

    /**
     * Check if client display service is running
     */
    async checkServiceHealth() {
        try {
            const serviceUrl = await this.getServiceUrl();
            const response = await fetch(`${serviceUrl}/health`);
            const result = await response.json();
            return result.status === 'healthy';
        } catch (error) {
            console.error('❌ Client display service not available:', error);
            // Try to rediscover services
            this.clientServiceUrl = null;
            return false;
        }
    }

    /**
     * Send text to PD-300 display via client service
     */
    async sendToDisplay(line1, line2 = '') {
        try {
            console.log('📺 Frontend sending to PD-300 display:', { line1, line2 });
            
            // Get the current service URL
            const serviceUrl = await this.getServiceUrl();
            
            // Check if service is running
            const isHealthy = await this.checkServiceHealth();
            if (!isHealthy) {
                console.error('❌ Client display service not running');
                console.error('❌ Please start the service: client-side-service/start-service.bat');
                console.error(`❌ Tried to connect to: ${serviceUrl}`);
                return false;
            }
            
            // Call the local client service display endpoint
            const response = await fetch(`${serviceUrl}/display`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content: `${line1 || ''}\n${line2 || ''}`.trim(),
                    type: 'display'
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                console.log('✅ Display message sent successfully');
                return true;
            } else {
                console.error('❌ Display command failed:', result.error);
                return false;
            }
        } catch (error) {
            console.error('❌ Display command error:', error);
            // Reset service URL to force rediscovery
            this.clientServiceUrl = null;
            return false;
        }
    }

    /**
     * Clear PD-300 display
     * Sends empty content to clear the display (server now accepts empty strings)
     */
    async clearDisplay() {
        // Send empty strings - server will handle it and send-display.js will send clear command
        return await this.sendToDisplay('', '');
    }

    /**
     * Show welcome message on display
     */
    async showWelcome() {
        return await this.sendToDisplay('Welcome!', 'Please wait...');
    }

    /**
     * Show transaction in progress
     */
    async showTransactionInProgress() {
        return await this.sendToDisplay('Processing...', 'Please wait');
    }

    /**
     * Show transaction complete
     */
    async showTransactionComplete() {
        return await this.sendToDisplay('Transaction', 'Complete!');
    }

    /**
     * Show error message
     */
    async showError(message = 'Error occurred') {
        return await this.sendToDisplay('Error:', message.substring(0, 20));
    }

    /**
     * Show cashier ready message
     */
    async showCashierReady() {
        return await this.sendToDisplay('Cashier Ready', 'Next customer...');
    }

    /**
     * Show payment processing
     */
    async showPaymentProcessing() {
        return await this.sendToDisplay('Payment', 'Processing...');
    }

    /**
     * Show thank you message
     */
    async showThankYou() {
        return await this.sendToDisplay('Thank You!', 'Come again!');
    }

    /**
     * Show custom message (truncated to fit display)
     */
    async showCustomMessage(line1, line2 = '') {
        // Truncate to 20 characters each line
        const truncatedLine1 = (line1 || '').substring(0, 20);
        const truncatedLine2 = (line2 || '').substring(0, 20);
        return await this.sendToDisplay(truncatedLine1, truncatedLine2);
    }

    /**
     * Show transaction display sequence: Total → Change → Thank You
     * @param {string} promoterName - Promoter name (max 20 chars)
     * @param {number} total - Total amount
     * @param {number} change - Change amount
     * @param {Object} options - Options for timing
     * @param {number} options.totalDuration - Time to show total in ms (default: 3000)
     * @param {number} options.changeDuration - Time to show change in ms (default: 3000)
     * @param {number} options.thankYouDuration - Time to show thank you in ms (default: 2000)
     * @returns {Promise<Object>} Control object with cancel method
     */
    async showTransactionSequence(promoterName, total, change, options = {}) {
        const {
            totalDuration = 3000,      // Show total for 3 seconds
            changeDuration = 3000,      // Show change for 3 seconds
            thankYouDuration = 2000     // Show thank you for 2 seconds
        } = options;

        let timeouts = [];

        const cancel = () => {
            timeouts.forEach(timeout => clearTimeout(timeout));
            timeouts = [];
        };

        try {
            // Step 1: Show Total
            const totalLine1 = (promoterName || 'Total').substring(0, 20);
            const totalLine2 = `Total: P${total.toFixed(2)}`.substring(0, 20);
            await this.showCustomMessage(totalLine1, totalLine2);

            // Step 2: After totalDuration, show Change
            const changeTimeout = setTimeout(async () => {
                const changeLine1 = 'Change:';
                const changeLine2 = `P${change.toFixed(2)}`.substring(0, 20);
                await this.showCustomMessage(changeLine1, changeLine2);
            }, totalDuration);
            timeouts.push(changeTimeout);

            // Step 3: After totalDuration + changeDuration, show Thank You (only if thankYouDuration > 0)
            if (thankYouDuration > 0) {
                const thankYouTimeout = setTimeout(async () => {
                    await this.showThankYou();
                }, totalDuration + changeDuration);
                timeouts.push(thankYouTimeout);
            }

            // Return control object
            const totalSequenceDuration = totalDuration + changeDuration + (thankYouDuration > 0 ? thankYouDuration : 0);
            return {
                cancel,
                promise: new Promise((resolve) => {
                    const finalTimeout = setTimeout(() => {
                        resolve({ success: true });
                    }, totalSequenceDuration);
                    timeouts.push(finalTimeout);
                })
            };

        } catch (error) {
            console.error('❌ Transaction sequence error:', error);
            cancel();
            return { cancel, promise: Promise.resolve({ success: false, error }) };
        }
    }

    /**
     * Show total only (for when change is not available yet)
     */
    async showTotal(promoterName, total) {
        const line1 = (promoterName || 'Total').substring(0, 20);
        const line2 = `Total: P${total.toFixed(2)}`.substring(0, 20);
        return await this.showCustomMessage(line1, line2);
    }

    /**
     * Show change amount
     */
    async showChange(change) {
        const line1 = 'Change:';
        const line2 = `P${change.toFixed(2)}`.substring(0, 20);
        return await this.showCustomMessage(line1, line2);
    }
}

// Export singleton instance
export const clientDisplay = new ClientDisplay();
