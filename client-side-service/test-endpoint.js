import http from 'http';

const postData = JSON.stringify({
    content: 'test print',
    type: 'test'
});

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/print',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

console.log('Testing /print endpoint...');

const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);
    
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`Response: ${chunk}`);
    });
    
    res.on('end', () => {
        console.log('Request completed');
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.write(postData);
req.end();
