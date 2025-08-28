const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');

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
        console.log(`📄 Data: ${data}`);
        
        const nodeCommand = `node "${printerScript}" ${command} "${data}"`;
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
