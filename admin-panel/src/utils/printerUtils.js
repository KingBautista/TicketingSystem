/**
 * Frontend printer utilities for CLIENT SIDE PRINTING
 * This calls a local Node.js service that executes star-final-printer.js
 */

export class ClientPrinter {
    constructor() {
        this.clientServiceUrl = 'http://localhost:3000';
    }

    /**
     * Check if client printer service is running
     */
    async checkServiceHealth() {
        try {
            const response = await fetch(`${this.clientServiceUrl}/health`);
            const result = await response.json();
            return result.status === 'healthy';
        } catch (error) {
            console.error('❌ Client printer service not available:', error);
            return false;
        }
    }

    /**
     * Execute printer command via local client service
     */
    async executePrinterCommand(command, data) {
        try {
            console.log(`🖨️ Executing printer command via client service: ${command}`);
            
            // Check if service is running
            const isHealthy = await this.checkServiceHealth();
            if (!isHealthy) {
                console.error('❌ Client printer service not running');
                console.error('❌ Please start the service: client-side-service/start-service.bat');
                return false;
            }
            
            // Call the local client service
            const response = await fetch(`${this.clientServiceUrl}/print`, {
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
        } catch (error) {
            console.error('❌ Printer command error:', error);
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
