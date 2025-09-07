const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Path to the display script (local to this computer)
const displayScript = path.join(__dirname, 'pd300-display.js');

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        service: 'Client Display Service',
        computer: process.env.COMPUTERNAME || 'Unknown',
        timestamp: new Date().toISOString()
    });
});

// Display endpoint for PD-300 display
app.post('/display', async (req, res) => {
    try {
        const { line1, line2 } = req.body;
        
        console.log(`📺 Client display service: Sending to PD-300 display`);
        console.log(`📄 Line 1: ${line1}`);
        console.log(`📄 Line 2: ${line2}`);
        console.log(`💻 Computer: ${process.env.COMPUTERNAME || 'Unknown'}`);
        
        if (!line1) {
            return res.json({ success: false, error: 'Line 1 is required' });
        }
        
        // Path to the display batch script (local to this computer)
        const displayBatchScript = path.join(__dirname, 'send-display.bat');
        
        // Prepare command with line1 and line2
        const nodeCommand = `"${displayBatchScript}" "${line1}" "${line2}"`;
        console.log(`🎯 Display command: ${nodeCommand}`);
        
        exec(nodeCommand, (error, stdout, stderr) => {
            if (error) {
                console.error('❌ Display error:', error);
                return res.json({ success: false, error: error.message });
            }
            
            if (stderr) {
                console.error('❌ Display stderr:', stderr);
            }
            
            console.log('✅ Display message sent:', stdout);
            res.json({ 
                success: true, 
                output: stdout,
                computer: process.env.COMPUTERNAME || 'Unknown'
            });
        });
        
    } catch (error) {
        console.error('❌ Display service error:', error);
        res.json({ success: false, error: error.message });
    }
});

// Test display endpoint
app.post('/test-display', async (req, res) => {
    try {
        const { line1 = 'Test Display', line2 = 'From Client' } = req.body;
        
        console.log(`🧪 Test display: ${line1} | ${line2}`);
        console.log(`💻 Computer: ${process.env.COMPUTERNAME || 'Unknown'}`);
        
        const displayBatchScript = path.join(__dirname, 'send-display.bat');
        const nodeCommand = `"${displayBatchScript}" "${line1}" "${line2}"`;
        
        exec(nodeCommand, (error, stdout, stderr) => {
            if (error) {
                console.error('❌ Test display error:', error);
                return res.json({ success: false, error: error.message });
            }
            
            console.log('✅ Test display successful:', stdout);
            res.json({ 
                success: true, 
                output: stdout,
                computer: process.env.COMPUTERNAME || 'Unknown'
            });
        });
        
    } catch (error) {
        console.error('❌ Test display error:', error);
        res.json({ success: false, error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Client Display Service running on port ${PORT}`);
    console.log(`💻 Computer: ${process.env.COMPUTERNAME || 'Unknown'}`);
    console.log(`🌐 Service URL: http://localhost:${PORT}`);
    console.log(`🔗 Server can access via: http://${process.env.COMPUTERNAME || 'localhost'}:${PORT}`);
});
