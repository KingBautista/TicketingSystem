// Test script to verify open cash printing works with direct method

const testData = {
    content: 'TestCashier,1000.00,TEST-123',
    type: 'opencash'
};

console.log('Testing open cash printing with direct method...');
console.log('Sending request to: http://localhost:3001/print');
console.log('Request data:', testData);

try {
    const response = await fetch('http://localhost:3001/print', {
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
        console.log('✅ Open cash printing test successful!');
        console.log('Method used:', result.result?.method);
    } else {
        console.log('❌ Test failed:', result.error);
    }
} catch (error) {
    console.error('❌ Connection error:', error.message);
}
