const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Path to the printer script
const printerScript = path.join(__dirname, '..', 'pd300-display', 'star-final-printer.js');

app.post('/print', async (req, res) => {
    try {
        const { command, data } = req.body;
        
        console.log(`🖨️ Client printer service: Executing ${command}`);
        console.log(`📄 Data type: ${typeof data}`);
        
        let nodeCommand;
        
        // Handle complex data (objects) by writing to temp file
        if ((command === 'transactionfile' || command === 'closecash') && typeof data === 'object') {
            // Write data to temporary file
            const tempJsonFile = path.join(__dirname, '..', 'pd300-display', `temp_${command}.json`);
            fs.writeFileSync(tempJsonFile, JSON.stringify(data));
            
            nodeCommand = `node "${printerScript}" ${command} "${tempJsonFile}"`;
            console.log(`🎯 Command with temp file: ${nodeCommand}`);
        } else {
            // Handle simple string data
            const dataString = typeof data === 'object' ? JSON.stringify(data) : String(data);
            nodeCommand = `node "${printerScript}" ${command} "${dataString}"`;
            console.log(`🎯 Command: ${nodeCommand}`);
        }
        
        exec(nodeCommand, (error, stdout, stderr) => {
            if (error) {
                console.error('❌ Printer error:', error);
                return res.json({ success: false, error: error.message });
            }
            
            if (stderr) {
                console.error('❌ Printer stderr:', stderr);
            }
            
            console.log('✅ Print successful:', stdout);
            res.json({ success: true, output: stdout });
        });
        
    } catch (error) {
        console.error('❌ Service error:', error);
        res.json({ success: false, error: error.message });
    }
});

// Display endpoint for PD-300 display
app.post('/display', async (req, res) => {
    try {
        const { data } = req.body;
        
        console.log(`📺 Client display service: Sending to PD-300 display`);
        console.log(`📄 Display data:`, data);
        
        if (!data || !data.line1) {
            return res.json({ success: false, error: 'Display data is required' });
        }
        
        // Path to the display batch script (same as PHP version)
        const displayScript = path.join(__dirname, '..', 'pd300-display', 'send-display.bat');
        
        // Prepare command with line1 and line2
        const line1 = data.line1 || '';
        const line2 = data.line2 || '';
        
        const nodeCommand = `"${displayScript}" "${line1}" "${line2}"`;
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
            res.json({ success: true, output: stdout });
        });
        
    } catch (error) {
        console.error('❌ Display service error:', error);
        res.json({ success: false, error: error.message });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Client printer service running' });
});

app.listen(PORT, () => {
    console.log(`🖨️ Client printer service running on port ${PORT}`);
    console.log(`📁 Printer script: ${printerScript}`);
    console.log(`🌐 Service URL: http://localhost:${PORT}`);
});
