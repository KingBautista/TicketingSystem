const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3003;

app.use(cors());
app.use(express.json());

// Simple health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        service: 'PD300 Display Service (Test)',
        timestamp: new Date().toISOString()
    });
});

// Test endpoint
app.get('/test', (req, res) => {
    res.json({ 
        message: 'PD300 Display Service is working!',
        port: PORT
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 PD300 Display Service (Test) running on port ${PORT}`);
    console.log(`🌐 Service URL: http://localhost:${PORT}`);
    console.log(`🔗 Docker access: http://172.20.0.50:${PORT}`);
});
