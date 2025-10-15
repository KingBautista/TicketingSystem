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

// Serve static files (for the test HTML page)
app.use(express.static(__dirname));

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

// Test page endpoint
app.get('/printer-test', (req, res) => {
    res.sendFile(path.join(__dirname, 'printer-test.html'));
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

// Printer availability and status endpoints
app.get('/printer/status', async (req, res) => {
    try {
        const printerStatus = await checkPrinterAvailability();
        res.json({
            success: true,
            message: 'Printer status checked',
            status: printerStatus
        });
    } catch (error) {
        console.error('❌ Printer status check error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/printer/list', async (req, res) => {
    try {
        const printers = await listAvailablePrinters();
        res.json({
            success: true,
            message: 'Available printers listed',
            printers: printers
        });
    } catch (error) {
        console.error('❌ Printer list error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/printer/test', async (req, res) => {
    try {
        const { testType = 'simple' } = req.body;
        const testResult = await runPrinterTest(testType);
        
        res.json({
            success: true,
            message: `Printer test (${testType}) completed`,
            result: testResult
        });
    } catch (error) {
        console.error('❌ Printer test error:', error);
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

// Helper functions for printer diagnostics
async function checkPrinterAvailability() {
    return new Promise((resolve) => {
        const printerName = 'Star BSC10';
        
        // Check if printer exists using PowerShell - use -File approach to avoid quote issues
        const tempScript = path.join(__dirname, 'temp_printer_check.ps1');
        const scriptContent = `Get-Printer -Name "${printerName}" -ErrorAction SilentlyContinue | Select-Object Name, PrinterStatus, DriverName`;
        fs.writeFileSync(tempScript, scriptContent, 'utf8');
        
        exec(`powershell -ExecutionPolicy Bypass -File "${tempScript}"`, (error, stdout, stderr) => {
            const result = {
                printerName: printerName,
                available: false,
                status: 'Unknown',
                driver: 'Unknown',
                error: null,
                details: {}
            };
            
            if (error) {
                result.error = error.message;
                result.details.errorCode = error.code;
                result.details.stderr = stderr;
            } else if (stdout.trim()) {
                // Parse PowerShell output - handle different output formats
                const lines = stdout.trim().split('\n');
                console.log('PowerShell output lines:', lines);
                
                // Look for the data line (skip headers)
                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (line && !line.includes('----') && !line.includes('Name')) {
                        const parts = line.split(/\s+/);
                        if (parts.length >= 3) {
                            result.available = true;
                            result.status = parts[1] || 'Unknown';
                            result.driver = parts[2] || 'Unknown';
                            break;
                        }
                    }
                }
                
                // If no specific data found but we have output, assume available
                if (!result.available && stdout.trim().length > 0) {
                    result.available = true;
                    result.status = 'Available';
                    result.driver = 'Star BSC10';
                }
            }
            
            // Additional checks
            result.details.rawOutput = stdout;
            result.details.rawError = stderr;
            result.details.timestamp = new Date().toISOString();
            
            // Clean up temp file
            try { fs.unlinkSync(tempScript); } catch {}
            
            resolve(result);
        });
    });
}

async function listAvailablePrinters() {
    return new Promise((resolve) => {
        const tempScript = path.join(__dirname, 'temp_list_printers.ps1');
        const scriptContent = `Get-Printer | Select-Object Name, PrinterStatus, DriverName, PortName | ConvertTo-Json`;
        fs.writeFileSync(tempScript, scriptContent, 'utf8');
        
        exec(`powershell -ExecutionPolicy Bypass -File "${tempScript}"`, (error, stdout, stderr) => {
            const result = {
                success: !error,
                printers: [],
                error: error ? error.message : null,
                rawOutput: stdout,
                rawError: stderr,
                timestamp: new Date().toISOString()
            };
            
            if (!error && stdout.trim()) {
                console.log('Raw JSON stdout length:', stdout.length);
                console.log('Raw JSON stdout (first 200 chars):', stdout.substring(0, 200));
                console.log('Raw JSON stdout (last 200 chars):', stdout.substring(Math.max(0, stdout.length - 200)));
                
                try {
                    // Clean the stdout - remove any carriage returns and extra whitespace
                    const cleanStdout = stdout.replace(/\r/g, '').trim();
                    console.log('Cleaned stdout:', cleanStdout);
                    
                    // Parse JSON output from PowerShell
                    const jsonData = JSON.parse(cleanStdout);
                    console.log('Parsed JSON data:', jsonData);
                    console.log('JSON data type:', typeof jsonData);
                    console.log('Is array:', Array.isArray(jsonData));
                    
                    // Handle both single object and array
                    const printerArray = Array.isArray(jsonData) ? jsonData : [jsonData];
                    console.log('Printer array length:', printerArray.length);
                    
                    const printers = printerArray.map((printer, index) => {
                        console.log(`Processing printer ${index}:`, printer);
                        return {
                            name: printer.Name || 'Unknown',
                            status: printer.PrinterStatus || 'Unknown',
                            driver: printer.DriverName || 'Unknown',
                            port: printer.PortName || 'Unknown'
                        };
                    });
                    
                    console.log('Final printers array:', printers);
                    result.printers = printers;
                } catch (parseError) {
                    console.log('JSON parse error:', parseError.message);
                    console.log('JSON parse error stack:', parseError.stack);
                    console.log('Falling back to text parsing...');
                    
                    // Fallback to text parsing if JSON fails
                    const lines = stdout.trim().split('\n');
                    const printers = [];
                    
                    for (let i = 0; i < lines.length; i++) {
                        const line = lines[i].trim();
                        if (line && line.length > 10 && !line.includes('----') && !line.includes('Name')) {
                            const name = line.substring(0, 20).trim();
                            const status = line.substring(20, 35).trim();
                            const driver = line.substring(35, 60).trim();
                            const port = line.substring(60).trim();
                            
                            if (name && name.length > 0) {
                                printers.push({
                                    name: name,
                                    status: status || 'Unknown',
                                    driver: driver || 'Unknown',
                                    port: port || 'Unknown'
                                });
                            }
                        }
                    }
                    
                    console.log('Fallback printers array:', printers);
                    result.printers = printers;
                }
            } else {
                console.log('No stdout or error occurred');
                console.log('Error:', error);
                console.log('Stdout:', stdout);
                console.log('Stderr:', stderr);
            }
            
            // Clean up temp file
            try { fs.unlinkSync(tempScript); } catch {}
            
            resolve(result);
        });
    });
}

async function runPrinterTest(testType) {
    return new Promise((resolve) => {
        const result = {
            testType: testType,
            success: false,
            method: '',
            output: '',
            error: null,
            timestamp: new Date().toISOString()
        };
        
        try {
            switch (testType) {
                case 'simple':
                    result.method = 'printText';
                    printer.printText(`Printer Test - ${new Date().toLocaleString()}`);
                    result.success = true;
                    result.output = 'Simple text test sent to printer';
                    break;
                    
                case 'raw':
                    result.method = 'printRaw';
                    const testBuffer = Buffer.from('Raw Test Data\n', 'ascii');
                    printer.printRaw(testBuffer);
                    result.success = true;
                    result.output = 'Raw data test sent to printer';
                    break;
                    
                case 'qr':
                    result.method = 'printQRCode';
                    printer.printQRCode('TEST-QR-CODE-' + Date.now());
                    result.success = true;
                    result.output = 'QR code test sent to printer';
                    break;
                    
                case 'bold':
                    result.method = 'printBoldText';
                    printer.printBoldText('BOLD TEST');
                    result.success = true;
                    result.output = 'Bold text test sent to printer';
                    break;
                    
                default:
                    result.error = `Unknown test type: ${testType}`;
                    break;
            }
        } catch (error) {
            result.error = error.message;
        }
        
        resolve(result);
    });
}

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
    console.log(`   GET  /printer-test - Printer test dashboard (web interface)`);
    console.log(`   POST /print - Print content`);
    console.log(`   POST /display - Display content`);
    console.log(`   POST /pd300/display - PD300 display`);
    console.log(`   POST /print-and-display - Print and display`);
    console.log(`   GET  /printer/status - Check printer availability`);
    console.log(`   GET  /printer/list - List all available printers`);
    console.log(`   POST /printer/test - Run printer tests`);
    console.log(`   GET  /test/printer - Test printer`);
    console.log(`   GET  /test/display - Test display`);
    console.log(`\n🔧 Frontend Configuration:`);
    console.log(`   Service accepts connections from ANY IP address`);
    console.log(`   Recommended URL: http://192.168.0.176:${PORT}`);
});
