#!/usr/bin/env node

import fetch from 'node-fetch';

async function testPrint() {
    try {
        const response = await fetch('http://localhost:3001/print', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: 'Test Print - Hello World!\nThis is a test receipt\n\nThank you!',
                type: 'test'
            })
        });
        
        const result = await response.json();
        console.log('Print Test Response:', result);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testPrint();
