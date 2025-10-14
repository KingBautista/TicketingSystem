#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import { exec, spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { StarBSC10Printer } from './star-final-printer.js';
import { serviceConfig } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = serviceConfig.port;
const HOST = serviceConfig.host;

// Configure CORS to allow all origins
app.use(cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: false
}));

app.use(express.json());

// Initialize printer
const printer = new StarBSC10Printer();

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        service: 'Client-Side Service (Printer + Display + PD300)',
        computer: process.env.COMPUTERNAME || 'Unknown',
        host: HOST,
        port: PORT,
        serviceUrl: serviceConfig.getServiceUrl(),
        timestamp: new Date().toISOString(),
        features: ['printer', 'display', 'pd300']
    });
});

// Configuration endpoint for frontend
app.get('/config', (req, res) => {
    res.json(serviceConfig.getFrontendConfig());
});

// Printer endpoints
app.post('/print', async (req, res) => {
    try {
        const { content, type = 'receipt' } = req.body;
        
        if (!content) {
            return res.status(400).json({ 
                success: false, 
                error: 'Content is required' 
            });
        }

        console.log(`🖨️ Printing ${type}:`, content);
        
        // Use the appropriate Star printer method based on type
        let result;
        switch (type) {
            case 'bold':
                printer.printBoldText(content);
                result = { method: 'printBoldText', success: true };
                break;
            case 'qr':
                printer.printQRCode(content);
                result = { method: 'printQRCode', success: true };
                break;
            case 'qrimg':
                await printer.printQRCodeAsImage(content);
                result = { method: 'printQRCodeAsImage', success: true };
                break;
            case 'transaction':
                // Handle transaction printing using a temporary file approach
                result = await new Promise((resolve, reject) => {
                    try {
                        // Create a temporary file with the transaction data
                        const tempFile = path.join(__dirname, `temp_transaction_${Date.now()}.json`);
                        fs.writeFileSync(tempFile, content, 'utf8');
                        
                        const transactionProcess = spawn('node', ['star-final-printer.js', 'transactionfile', tempFile], {
                            cwd: __dirname
                        });
                        
                        let output = '';
                        let errorOutput = '';
                        
                        transactionProcess.stdout.on('data', (data) => {
                            output += data.toString();
                        });
                        
                        transactionProcess.stderr.on('data', (data) => {
                            errorOutput += data.toString();
                        });
                        
                        transactionProcess.on('close', (code) => {
                            // Clean up temp file
                            try { fs.unlinkSync(tempFile); } catch {}
                            
                            if (code === 0) {
                                resolve({ output, success: true });
                            } else {
                                reject(new Error(errorOutput || 'Transaction printing failed'));
                            }
                        });
                    } catch (error) {
                        reject(error);
                    }
                });
                break;
            case 'closecash':
                // Handle close cash printing using the star-final-printer.js script
                result = await new Promise((resolve, reject) => {
                    const closeCashProcess = spawn('node', ['star-final-printer.js', 'closecash', content], {
                        cwd: __dirname
                    });
                    
                    let output = '';
                    let errorOutput = '';
                    
                    closeCashProcess.stdout.on('data', (data) => {
                        output += data.toString();
                    });
                    
                    closeCashProcess.stderr.on('data', (data) => {
                        errorOutput += data.toString();
                    });
                    
                    closeCashProcess.on('close', (code) => {
                        if (code === 0) {
                            resolve({ output, success: true });
                        } else {
                            reject(new Error(errorOutput || 'Close cash printing failed'));
                        }
                    });
                });
                break;
            case 'opencash':
                // Handle open cash printing using the star-final-printer.js script
                result = await new Promise((resolve, reject) => {
                    const openCashProcess = spawn('node', ['star-final-printer.js', 'opencash', content], {
                        cwd: __dirname
                    });
                    
                    let output = '';
                    let errorOutput = '';
                    
                    openCashProcess.stdout.on('data', (data) => {
                        output += data.toString();
                    });
                    
                    openCashProcess.stderr.on('data', (data) => {
                        errorOutput += data.toString();
                    });
                    
                    openCashProcess.on('close', (code) => {
                        if (code === 0) {
                            resolve({ output, success: true });
                        } else {
                            reject(new Error(errorOutput || 'Open cash printing failed'));
                        }
                    });
                });
                break;
            default:
                printer.printText(content);
                result = { method: 'printText', success: true };
                break;
        }
        
        res.json({ 
            success: true, 
            message: `${type} printed successfully`,
            result: result
        });
        
    } catch (error) {
        console.error('❌ Print error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Display endpoints
app.post('/display', async (req, res) => {
    try {
        const { content, type = 'ticket' } = req.body;
        
        if (!content) {
            return res.status(400).json({ 
                success: false, 
                error: 'Content is required' 
            });
        }

        console.log(`📺 Displaying ${type}:`, content);
        
        // Parse content for display (expecting line1\nline2 format)
        const lines = content.split('\n');
        const line1 = lines[0] || '';
        const line2 = lines[1] || '';
        
        // Use the send-display.js script
        const result = await new Promise((resolve, reject) => {
            const displayProcess = spawn('node', ['send-display.js', line1, line2], {
                cwd: __dirname
            });
            
            let output = '';
            let errorOutput = '';
            
            displayProcess.stdout.on('data', (data) => {
                output += data.toString();
            });
            
            displayProcess.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });
            
            displayProcess.on('close', (code) => {
                if (code === 0) {
                    resolve({ output, success: true });
                } else {
                    reject(new Error(errorOutput || 'Display command failed'));
                }
            });
        });
        
        res.json({ 
            success: true, 
            message: `${type} displayed successfully`,
            result: result
        });
        
    } catch (error) {
        console.error('❌ Display error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// PD300 specific endpoints
app.post('/pd300/display', async (req, res) => {
    try {
        const { content, type = 'ticket' } = req.body;
        
        if (!content) {
            return res.status(400).json({ 
                success: false, 
                error: 'Content is required' 
            });
        }

        console.log(`📱 PD300 Display:`, content);
        
        // Use PD300 specific display functionality
        const result = await printer.pd300Display(content, type);
        
        res.json({ 
            success: true, 
            message: 'PD300 display updated successfully',
            result: result
        });
        
    } catch (error) {
        console.error('❌ PD300 Display error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Combined print and display endpoint
app.post('/print-and-display', async (req, res) => {
    try {
        const { content, type = 'ticket' } = req.body;
        
        if (!content) {
            return res.status(400).json({ 
                success: false, 
                error: 'Content is required' 
            });
        }

        console.log(`🖨️📺 Print and Display ${type}:`, content);
        
        // Print the content
        printer.printText(content);
        const printResult = { method: 'printText', success: true };
        
        // Display the content
        const lines = content.split('\n');
        const line1 = lines[0] || '';
        const line2 = lines[1] || '';
        
        const displayResult = await new Promise((resolve, reject) => {
            const displayProcess = spawn('node', ['send-display.js', line1, line2], {
                cwd: __dirname
            });
            
            let output = '';
            let errorOutput = '';
            
            displayProcess.stdout.on('data', (data) => {
                output += data.toString();
            });
            
            displayProcess.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });
            
            displayProcess.on('close', (code) => {
                if (code === 0) {
                    resolve({ output, success: true });
                } else {
                    reject(new Error(errorOutput || 'Display command failed'));
                }
            });
        });
        
        res.json({ 
            success: true, 
            message: `${type} printed and displayed successfully`,
            print: printResult,
            display: displayResult
        });
        
    } catch (error) {
        console.error('❌ Print and Display error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Test endpoints
app.get('/test/printer', async (req, res) => {
    try {
        const testContent = "Test Print - " + new Date().toLocaleString();
        printer.printText(testContent);
        
        res.json({ 
            success: true, 
            message: 'Printer test completed',
            result: { method: 'printText', success: true }
        });
        
    } catch (error) {
        console.error('❌ Printer test error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

app.get('/test/display', async (req, res) => {
    try {
        const testContent = "Test Display - " + new Date().toLocaleString();
        const lines = testContent.split('\n');
        const line1 = lines[0] || '';
        const line2 = lines[1] || '';
        
        const result = await new Promise((resolve, reject) => {
            const displayProcess = spawn('node', ['send-display.js', line1, line2], {
                cwd: __dirname
            });
            
            let output = '';
            let errorOutput = '';
            
            displayProcess.stdout.on('data', (data) => {
                output += data.toString();
            });
            
            displayProcess.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });
            
            displayProcess.on('close', (code) => {
                if (code === 0) {
                    resolve({ output, success: true });
                } else {
                    reject(new Error(errorOutput || 'Display command failed'));
                }
            });
        });
        
        res.json({ 
            success: true, 
            message: 'Display test completed',
            result: result
        });
        
    } catch (error) {
        console.error('❌ Display test error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Start server - bind to all interfaces (0.0.0.0) to accept connections from any IP
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Client-Side Service running on ALL INTERFACES:${PORT}`);
    console.log(`💻 Computer: ${process.env.COMPUTERNAME || 'Unknown'}`);
    console.log(`🌐 Service accessible from any IP on port ${PORT}`);
    console.log(`🔗 Local access: http://localhost:${PORT}`);
    console.log(`🔗 Network access: http://${HOST}:${PORT}`);
    console.log(`🔗 Any IP access: http://[ANY_IP]:${PORT}`);
    console.log(`📺 Display: PD-300 ready`);
    console.log(`🖨️ Printer: Star BSC10 ready`);
    console.log(`📱 Features: Printer + Display + PD300`);
    console.log(`🌐 CORS: Enabled for all origins`);
    console.log(`\n📋 Available endpoints:`);
    console.log(`   GET  /health - Health check`);
    console.log(`   GET  /config - Service configuration`);
    console.log(`   POST /print - Print content`);
    console.log(`   POST /display - Display content`);
    console.log(`   POST /pd300/display - PD300 display`);
    console.log(`   POST /print-and-display - Print and display`);
    console.log(`   GET  /test/printer - Test printer`);
    console.log(`   GET  /test/display - Test display`);
    console.log(`\n🔧 Frontend Configuration:`);
    console.log(`   Service accepts connections from ANY IP address`);
    console.log(`   Recommended URL: http://192.168.0.176:${PORT}`);
});
