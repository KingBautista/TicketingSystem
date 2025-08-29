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

app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Client printer service running' });
});

app.listen(PORT, () => {
    console.log(`🖨️ Client printer service running on port ${PORT}`);
    console.log(`📁 Printer script: ${printerScript}`);
    console.log(`🌐 Service URL: http://localhost:${PORT}`);
});
