// Test script to verify admin-panel can reach client service

const testData = {
    content: 'test from admin-panel',
    type: 'test'
};

console.log('Testing admin-panel to client service connection...');
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
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const result = await response.json();
    console.log('Response body:', result);
    
    if (result.success) {
        console.log('✅ Admin-panel to client service connection is working!');
    } else {
        console.log('❌ Request failed:', result.error);
    }
} catch (error) {
    console.error('❌ Connection error:', error.message);
}
