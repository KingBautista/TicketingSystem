// Test script to run in browser console
// Copy and paste this into the browser console at http://localhost:4000

console.log('🧪 Testing print functions from browser console...');

// Test 1: Import and test clientPrinter
async function testClientPrinter() {
    try {
        console.log('📦 Importing clientPrinter...');
        const { clientPrinter } = await import('./src/utils/printerUtils.js');
        console.log('✅ clientPrinter imported successfully');
        
        // Test 2: Test printer connection
        console.log('🔍 Testing printer connection...');
        const isHealthy = await clientPrinter.checkServiceHealth();
        console.log('📊 Service health:', isHealthy);
        
        // Test 3: Test simple print
        console.log('🖨️ Testing simple print...');
        const printResult = await clientPrinter.testPrinter();
        console.log('📊 Print test result:', printResult);
        
        // Test 4: Test open cash print
        console.log('🖨️ Testing open cash print...');
        const openCashResult = await clientPrinter.printOpenCash('Test Cashier', 1000, 'TEST-123');
        console.log('📊 Open cash print result:', openCashResult);
        
        return true;
    } catch (error) {
        console.error('❌ Test failed:', error);
        return false;
    }
}

// Run the test
testClientPrinter().then(success => {
    if (success) {
        console.log('✅ All tests completed successfully!');
    } else {
        console.log('❌ Some tests failed. Check the errors above.');
    }
});

console.log('🚀 Test script loaded. Check the results above.');
