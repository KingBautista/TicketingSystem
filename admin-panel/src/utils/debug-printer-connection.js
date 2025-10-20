/**
 * Debug Printer Connection Utility
 * Use this to test the connection between admin-panel and client-service
 */

import { deploymentServiceChecker } from './deployment-config.js';
import { clientPrinter } from './printerUtils.js';

export class PrinterConnectionDebugger {
    constructor() {
        this.deploymentChecker = deploymentServiceChecker;
        this.clientPrinter = clientPrinter;
    }

    /**
     * Run comprehensive connection tests
     */
    async runAllTests() {
        console.log('🔍 Starting Printer Connection Debug Tests');
        console.log('==========================================');

        const results = {
            serviceHealth: false,
            printerStatus: false,
            testPrint: false,
            transactionPrint: false,
            errors: []
        };

        // Test 1: Service Health Check
        console.log('\n1️⃣ Testing Service Health...');
        try {
            results.serviceHealth = await this.deploymentChecker.checkService();
            if (results.serviceHealth) {
                console.log('✅ Service health check passed');
            } else {
                console.log('❌ Service health check failed');
                results.errors.push('Service health check failed');
            }
        } catch (error) {
            console.log('❌ Service health check error:', error.message);
            results.errors.push(`Service health check error: ${error.message}`);
        }

        // Test 2: Printer Status Check
        console.log('\n2️⃣ Testing Printer Status...');
        try {
            const printerStatusResult = await this.deploymentChecker.executeRequest('/printer/status');
            if (printerStatusResult.success) {
                console.log('✅ Printer status check passed');
                console.log('📊 Printer status:', printerStatusResult.data);
                results.printerStatus = true;
            } else {
                console.log('❌ Printer status check failed:', printerStatusResult.error);
                results.errors.push(`Printer status check failed: ${printerStatusResult.error}`);
            }
        } catch (error) {
            console.log('❌ Printer status check error:', error.message);
            results.errors.push(`Printer status check error: ${error.message}`);
        }

        // Test 3: Simple Test Print
        console.log('\n3️⃣ Testing Simple Print...');
        try {
            const testPrintResult = await this.deploymentChecker.executeRequest('/test/printer');
            if (testPrintResult.success) {
                console.log('✅ Simple test print passed');
                results.testPrint = true;
            } else {
                console.log('❌ Simple test print failed:', testPrintResult.error);
                results.errors.push(`Simple test print failed: ${testPrintResult.error}`);
            }
        } catch (error) {
            console.log('❌ Simple test print error:', error.message);
            results.errors.push(`Simple test print error: ${error.message}`);
        }

        // Test 4: Transaction Print Test
        console.log('\n4️⃣ Testing Transaction Print...');
        try {
            const testTransactionData = {
                transactionId: 'TEST-' + Date.now(),
                promoterName: 'Test Promoter',
                rateName: 'Test Rate',
                quantity: 1,
                total: 100.00,
                paidAmount: 100.00,
                change: 0.00,
                cashierName: 'Test Cashier',
                sessionId: 'TEST-SESSION',
                discounts: [],
                tickets: ['TEST-QR-CODE-1', 'TEST-QR-CODE-2'],
                createdAt: new Date().toISOString()
            };

            const transactionPrintResult = await this.clientPrinter.printTransaction(testTransactionData);
            if (transactionPrintResult) {
                console.log('✅ Transaction print test passed');
                results.transactionPrint = true;
            } else {
                console.log('❌ Transaction print test failed');
                results.errors.push('Transaction print test failed');
            }
        } catch (error) {
            console.log('❌ Transaction print test error:', error.message);
            results.errors.push(`Transaction print test error: ${error.message}`);
        }

        // Summary
        console.log('\n📋 Test Results Summary');
        console.log('======================');
        console.log(`Service Health: ${results.serviceHealth ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`Printer Status: ${results.printerStatus ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`Test Print: ${results.testPrint ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`Transaction Print: ${results.transactionPrint ? '✅ PASS' : '❌ FAIL'}`);

        if (results.errors.length > 0) {
            console.log('\n❌ Errors Found:');
            results.errors.forEach((error, index) => {
                console.log(`${index + 1}. ${error}`);
            });
        }

        return results;
    }

    /**
     * Test specific endpoint
     */
    async testEndpoint(endpoint, method = 'GET', data = null) {
        console.log(`🔍 Testing endpoint: ${method} ${endpoint}`);
        
        try {
            const options = { method };
            if (data && method === 'POST') {
                options.body = JSON.stringify(data);
            }

            const result = await this.deploymentChecker.executeRequest(endpoint, options);
            
            if (result.success) {
                console.log('✅ Endpoint test passed');
                console.log('📊 Response:', result.data);
                return result;
            } else {
                console.log('❌ Endpoint test failed:', result.error);
                return result;
            }
        } catch (error) {
            console.log('❌ Endpoint test error:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Test printer re-detection
     */
    async testPrinterRedetection() {
        console.log('\n🔄 Testing Printer Re-detection...');
        try {
            const result = await this.deploymentChecker.executeRequest('/printer/redetect', { method: 'POST' });
            if (result.success) {
                console.log('✅ Printer re-detection successful');
                console.log('📊 New port:', result.data.port);
                console.log('📋 Message:', result.data.message);
                return result;
            } else {
                console.log('❌ Printer re-detection failed:', result.error);
                return result;
            }
        } catch (error) {
            console.log('❌ Printer re-detection error:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get service configuration info
     */
    getServiceInfo() {
        console.log('📋 Service Configuration Info');
        console.log('=============================');
        console.log(`Service URL: ${this.deploymentChecker.getServiceUrl()}`);
        console.log(`Deployment Mode: ${this.clientPrinter.deploymentMode}`);
        console.log(`Connection Timeout: 5000ms`);
        console.log(`Max Retries: 3`);
        console.log(`Retry Delay: 1000ms`);
    }
}

// Export singleton instance
export const printerConnectionDebugger = new PrinterConnectionDebugger();

// Make it available globally for browser console testing
if (typeof window !== 'undefined') {
    window.printerConnectionDebugger = printerConnectionDebugger;
    console.log('🔧 Printer Connection Debugger loaded!');
    console.log('💡 Use window.printerConnectionDebugger.runAllTests() to test connection');
    console.log('💡 Use window.printerConnectionDebugger.getServiceInfo() to see config');
}
