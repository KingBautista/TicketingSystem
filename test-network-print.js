// Test script to verify network connection to client service
const testData = {
    content: 'TestCashier,1000.00,TEST-123',
    type: 'opencash'
};

console.log('Testing network connection to client service...');
console.log('Sending request to: http://10.153.243.170:3001/print');
console.log('Request data:', testData);

try {
    const response = await fetch('http://10.153.243.170:3001/print', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(testData)
    });

    console.log('Response status:', response.status);
    const result = await response.json();
    console.log('Response body:', result);
    
    if (result.success) {
        console.log('✅ Network print test successful!');
        console.log('Method used:', result.result?.method);
    } else {
        console.log('❌ Test failed:', result.error);
    }
} catch (error) {
    console.error('❌ Network connection error:', error.message);
}
