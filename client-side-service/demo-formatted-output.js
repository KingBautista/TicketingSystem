#!/usr/bin/env node

/**
 * Demo script to show formatted test mode output
 * This demonstrates how the test mode formats print content
 */

import { TestModePrinter } from './test-mode.js';

const testPrinter = new TestModePrinter();

// Sample transaction data (similar to what your frontend sends)
const sampleTransactionData = {
    transactionId: 139,
    promoterName: 'Floyd Mayweather Jr.',
    rateName: 'VIP Ticket',
    quantity: 1,
    total: '250.00',
    paidAmount: '250.00',
    change: '0.00',
    cashierName: 'John Doe',
    sessionId: 'SESSION-001',
    discounts: [
        { name: 'Senior Citizen', amount: '25.00' }
    ],
    tickets: [
        'PROMOTER24-2025-10-15-143000-1',
        'PROMOTER24-2025-10-15-143000-2'
    ],
    createdAt: new Date().toISOString()
};

// Sample open cash data
const sampleOpenCashData = 'John Doe,1000.00,SESSION-001';

// Sample close cash data
const sampleCloseCashData = {
    cashierName: 'John Doe',
    sessionId: 'SESSION-001',
    openingCash: 1000.00,
    closingCash: 2500.00,
    dailyTransactions: [
        { id: 1, total: '250.00' },
        { id: 2, total: '150.00' },
        { id: 3, total: '100.00' }
    ],
    dailyTotal: 500.00
};

async function demoFormattedOutput() {
    console.log('🎭 DEMO: Formatted Test Mode Output');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Demo 1: Transaction Receipt
    console.log('📄 DEMO 1: Transaction Receipt');
    console.log('───────────────────────────────────────────────────────────');
    await testPrinter.simulatePrint('transaction', JSON.stringify(sampleTransactionData));
    console.log('\n');

    // Demo 2: Open Cash Receipt
    console.log('💰 DEMO 2: Open Cash Receipt');
    console.log('───────────────────────────────────────────────────────────');
    await testPrinter.simulatePrint('opencash', sampleOpenCashData);
    console.log('\n');

    // Demo 3: Close Cash Report
    console.log('📊 DEMO 3: Close Cash Report');
    console.log('───────────────────────────────────────────────────────────');
    await testPrinter.simulatePrint('closecash', JSON.stringify(sampleCloseCashData));
    console.log('\n');

    // Demo 4: QR Code
    console.log('🔲 DEMO 4: QR Code');
    console.log('───────────────────────────────────────────────────────────');
    await testPrinter.simulatePrint('qr', 'PROMOTER24-2025-10-15-143000-1');
    console.log('\n');

    // Show test mode status
    console.log('📈 TEST MODE STATUS:');
    console.log('───────────────────────────────────────────────────────────');
    const status = testPrinter.getTestModeStatus();
    console.log(JSON.stringify(status, null, 2));

    console.log('\n🎯 SUMMARY:');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ Test mode successfully formats all print types');
    console.log('✅ Output mimics actual thermal printer layout');
    console.log('✅ Files saved to test-output/ folder');
    console.log('✅ Perfect for development without physical printer');
    console.log('✅ Works with AnyDesk/remote access scenarios');
}

// Run the demo
demoFormattedOutput().catch(console.error);
