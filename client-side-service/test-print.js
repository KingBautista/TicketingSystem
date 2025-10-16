#!/usr/bin/env node

/**
 * Test script to verify printing functionality
 * Works with both test mode and actual printer
 */

import fetch from 'node-fetch';

const SERVICE_URL = 'http://localhost:4000';

async function testPrintOperation() {
    console.log('🧪 Testing print operation...');
    
    try {
        // Test transaction printing
        const transactionData = {
            transactionId: 999,
            promoterName: 'Test Promoter',
            rateName: 'Test Rate',
            quantity: 1,
            total: '100.00',
            paidAmount: '100.00',
            change: '0.00',
            cashierName: 'Test Cashier',
            sessionId: 'TEST-001',
            discounts: [],
            tickets: ['TEST-QR-CODE-001'],
            createdAt: new Date().toISOString()
        };
        
        console.log('📄 Sending transaction print request...');
        const response = await fetch(`${SERVICE_URL}/print`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: JSON.stringify(transactionData),
                type: 'transaction'
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Print operation successful!');
            console.log('📊 Result:', result);
            
            if (result.testMode) {
                console.log('🧪 Test mode detected - no physical printer used');
                if (result.result && result.result.savedFile) {
                    console.log(`📄 Print content saved to: ${result.result.savedFile}`);
                }
            } else {
                console.log('🖨️ Physical printer operation completed');
            }
        } else {
            console.log('❌ Print operation failed:', result.error);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

async function checkServiceStatus() {
    console.log('🔍 Checking service status...');
    
    try {
        const response = await fetch(`${SERVICE_URL}/health`);
        const status = await response.json();
        
        console.log('📊 Service Status:');
        console.log(`  Status: ${status.status}`);
        console.log(`  Computer: ${status.computer}`);
        console.log(`  Service URL: ${status.serviceUrl}`);
        console.log(`  Test Mode: ${status.testMode ? '✅ ENABLED' : '❌ DISABLED'}`);
        
        if (status.testMode && status.testModeStatus) {
            console.log('🧪 Test Mode Statistics:');
            console.log(`  Total Operations: ${status.testModeStatus.totalOperations || 0}`);
            console.log(`  Successful: ${status.testModeStatus.successfulOperations || 0}`);
            console.log(`  Failed: ${status.testModeStatus.failedOperations || 0}`);
            console.log(`  Saved Files: ${status.testModeStatus.savedFiles || 0}`);
        }
        
    } catch (error) {
        console.error('❌ Failed to check service status:', error.message);
    }
}

async function main() {
    console.log('🚀 Starting print test...');
    console.log('================================');
    
    await checkServiceStatus();
    console.log('');
    await testPrintOperation();
    
    console.log('');
    console.log('================================');
    console.log('✅ Test completed!');
}

main().catch(console.error);
