const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Path to the printer script (local to this computer)
const printerScript = path.join(__dirname, 'star-printer.js');

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        service: 'Client Printer Service',
        computer: process.env.COMPUTERNAME || 'Unknown',
        timestamp: new Date().toISOString()
    });
});

// Print endpoint
app.post('/print', async (req, res) => {
    try {
        const { command, data } = req.body;
        
        console.log(`🖨️ Client printer service: Executing ${command}`);
        console.log(`📄 Data:`, data);
        console.log(`💻 Computer: ${process.env.COMPUTERNAME || 'Unknown'}`);
        
        let nodeCommand;
        
        // Handle complex data (objects) by writing to temp file
        if ((command === 'transactionfile' || command === 'closecash') && typeof data === 'object') {
            const tempJsonFile = path.join(__dirname, `temp_${command}.json`);
            fs.writeFileSync(tempJsonFile, JSON.stringify(data));
            
            nodeCommand = `node "${printerScript}" ${command} "${tempJsonFile}"`;
        } else {
            const dataString = typeof data === 'object' ? JSON.stringify(data) : String(data);
            nodeCommand = `node "${printerScript}" ${command} "${dataString}"`;
        }
        
        console.log(`🎯 Command: ${nodeCommand}`);
        
        exec(nodeCommand, (error, stdout, stderr) => {
            if (error) {
                console.error('❌ Printer error:', error);
                return res.json({ success: false, error: error.message });
            }
            
            if (stderr) {
                console.error('❌ Printer stderr:', stderr);
            }
            
            console.log('✅ Print successful:', stdout);
            res.json({ 
                success: true, 
                output: stdout,
                computer: process.env.COMPUTERNAME || 'Unknown'
            });
        });
        
    } catch (error) {
        console.error('❌ Service error:', error);
        res.json({ success: false, error: error.message });
    }
});

// Test print endpoint
app.post('/test-print', async (req, res) => {
    try {
        const { text = 'Test Print from Client' } = req.body;
        
        console.log(`🧪 Test printing: ${text}`);
        console.log(`💻 Computer: ${process.env.COMPUTERNAME || 'Unknown'}`);
        
        const nodeCommand = `node "${printerScript}" text "${text}"`;
        
        exec(nodeCommand, (error, stdout, stderr) => {
            if (error) {
                console.error('❌ Test print error:', error);
                return res.json({ success: false, error: error.message });
            }
            
            console.log('✅ Test print successful:', stdout);
            res.json({ 
                success: true, 
                output: stdout,
                computer: process.env.COMPUTERNAME || 'Unknown'
            });
        });
        
    } catch (error) {
        console.error('❌ Test print error:', error);
        res.json({ success: false, error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Client Printer Service running on port ${PORT}`);
    console.log(`💻 Computer: ${process.env.COMPUTERNAME || 'Unknown'}`);
    console.log(`🌐 Service URL: http://localhost:${PORT}`);
    console.log(`🔗 Server can access via: http://${process.env.COMPUTERNAME || 'localhost'}:${PORT}`);
});
