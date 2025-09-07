/**
 * Frontend display utilities for PD-300 DISPLAY
 * This calls a local Node.js service that executes send-display.js
 */

export class ClientDisplay {
    constructor() {
        this.clientServiceUrl = 'http://localhost:3000';
    }

    /**
     * Check if client display service is running
     */
    async checkServiceHealth() {
        try {
            const response = await fetch(`${this.clientServiceUrl}/health`);
            const result = await response.json();
            return result.status === 'healthy';
        } catch (error) {
            console.error('❌ Client display service not available:', error);
            return false;
        }
    }

    /**
     * Send text to PD-300 display via client service
     */
    async sendToDisplay(line1, line2 = '') {
        try {
            console.log('📺 Frontend sending to PD-300 display:', { line1, line2 });
            
            // Check if service is running
            const isHealthy = await this.checkServiceHealth();
            if (!isHealthy) {
                console.error('❌ Client display service not running');
                console.error('❌ Please start the service: client-side-service/start-service.bat');
                return false;
            }
            
            // Call the local client service display endpoint
            const response = await fetch(`${this.clientServiceUrl}/display`, {
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
            return false;
        }
    }

    /**
     * Clear PD-300 display
     */
    async clearDisplay() {
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
}

// Export singleton instance
export const clientDisplay = new ClientDisplay();
