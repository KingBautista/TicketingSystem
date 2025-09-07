#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import { StarBSC10Printer } from './star-final-printer.js';

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

// Initialize printer
const printer = new StarBSC10Printer();

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        service: 'PD300 Display Service',
        printer: 'Star BSC10',
        timestamp: new Date().toISOString()
    });
});

// Test printer endpoint
app.post('/test-print', async (req, res) => {
    try {
        const { text = 'Test Print' } = req.body;
        
        console.log(`🖨️ Test printing: ${text}`);
        
        // Test print
        printer.printText(text);
        
        res.json({ 
            success: true, 
            message: 'Test print sent to printer',
            text: text
        });
        
    } catch (error) {
        console.error('❌ Test print error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Print endpoint
app.post('/print', async (req, res) => {
    try {
        const { command, data } = req.body;
        
        console.log(`🖨️ Print command: ${command}`);
        console.log(`📄 Data:`, data);
        
        // Handle different print commands
        switch (command) {
            case 'text':
                printer.printText(data);
                break;
            case 'bold':
                printer.printBoldText(data);
                break;
            case 'qr':
                printer.printQRCode(data);
                break;
            case 'transactionfile':
                // Handle transaction file printing
                printer.printTransactionFile(data);
                break;
            case 'closecash':
                // Handle close cash printing
                printer.printCloseCash(data);
                break;
            default:
                printer.printText(data);
        }
        
        res.json({ 
            success: true, 
            message: 'Print command executed',
            command: command
        });
        
    } catch (error) {
        console.error('❌ Print error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Display endpoint for PD-300
app.post('/display', async (req, res) => {
    try {
        const { line1, line2 } = req.body;
        
        console.log(`📺 Display message:`);
        console.log(`   Line 1: ${line1}`);
        console.log(`   Line 2: ${line2}`);
        
        // Here you would implement the actual PD-300 display logic
        // For now, we'll just log it
        console.log(`📺 Sending to PD-300 display: ${line1} | ${line2}`);
        
        res.json({ 
            success: true, 
            message: 'Display message sent',
            line1: line1,
            line2: line2
        });
        
    } catch (error) {
        console.error('❌ Display error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 PD300 Display Service running on port ${PORT}`);
    console.log(`🌐 Service URL: http://localhost:${PORT}`);
    console.log(`🔗 Docker access: http://172.20.0.50:${PORT}`);
    console.log(`🖨️ Printer: Star BSC10 initialized`);
    console.log(`📺 Display: PD-300 ready`);
});
