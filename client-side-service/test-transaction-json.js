#!/usr/bin/env node

/**
 * Test script to validate transaction JSON format
 */

// Sample transaction data that should match what the admin panel sends
const sampleTransactionData = {
  transactionId: 'TEST-123',
  promoterName: 'Test Promoter',
  rateName: 'Test Rate',
  quantity: 1,
  total: 100,
  paidAmount: 100,
  change: 0,
  cashierName: 'TestCashier',
  sessionId: '12345',
  discounts: [],
  tickets: ['QR-TEST-1', 'QR-TEST-2'],
  createdAt: '2025-01-16T10:00:00.000Z'
};

console.log('🧪 Testing Transaction JSON Format');
console.log('==================================');

try {
  // Convert to JSON string (like the admin panel does)
  const jsonString = JSON.stringify(sampleTransactionData);
  console.log('✅ JSON string created successfully');
  console.log('📄 JSON length:', jsonString.length);
  console.log('📄 JSON preview:', jsonString.substring(0, 100) + '...');
  
  // Parse it back (like the printer does)
  const parsedData = JSON.parse(jsonString);
  console.log('✅ JSON parsed successfully');
  console.log('📄 Parsed data keys:', Object.keys(parsedData));
  
  // Test the printer method
  console.log('\n🖨️ Testing printer method...');
  const { StarBSC10Printer } = await import('./star-final-printer.js');
  const printer = new StarBSC10Printer();
  
  // This should work without errors
  await printer.printTransactionTickets(jsonString);
  console.log('✅ Printer method executed successfully');
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.error('📄 Error details:', error);
}
