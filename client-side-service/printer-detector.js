#!/usr/bin/env node

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Enhanced Printer Detection and Management
 * Automatically detects USB ports and finds the connected printer
 */
export class PrinterDetector {
    constructor() {
        this.printerName = 'Star BSC10';
        this.detectedPorts = [];
        this.workingPort = null;
    }

    /**
     * Detect all available USB ports
     */
    async detectUSBPorts() {
        console.log('🔍 Detecting USB ports...');
        
        return new Promise((resolve) => {
            // Use PowerShell to get USB devices
            const psCommand = `
                Get-WmiObject -Class Win32_USBHub | 
                Where-Object { $_.DeviceID -like "*VID_*" } | 
                Select-Object DeviceID, Description, Status | 
                ConvertTo-Json
            `;
            
            exec(`powershell -Command "${psCommand}"`, (error, stdout, stderr) => {
                if (error) {
                    console.log('⚠️ PowerShell USB detection failed, trying alternative method...');
                    this.detectUSBPortsAlternative().then(resolve);
                    return;
                }
                
                try {
                    const devices = JSON.parse(stdout);
                    const usbDevices = Array.isArray(devices) ? devices : [devices];
                    
                    console.log(`📱 Found ${usbDevices.length} USB devices:`);
                    usbDevices.forEach((device, index) => {
                        console.log(`  ${index + 1}. ${device.Description || 'Unknown'} - ${device.DeviceID}`);
                    });
                    
                    resolve(usbDevices);
                } catch (parseError) {
                    console.log('⚠️ JSON parse failed, trying alternative method...');
                    this.detectUSBPortsAlternative().then(resolve);
                }
            });
        });
    }

    /**
     * Alternative USB detection method
     */
    async detectUSBPortsAlternative() {
        return new Promise((resolve) => {
            // Try to detect USB ports by checking common port names
            const commonPorts = ['USB001', 'USB002', 'USB003', 'USB004', 'USB005'];
            const availablePorts = [];
            
            console.log('🔍 Checking common USB port names...');
            
            const checkPort = (portName, index) => {
                if (index >= commonPorts.length) {
                    console.log(`📱 Found ${availablePorts.length} available USB ports:`, availablePorts);
                    resolve(availablePorts);
                    return;
                }
                
                const port = commonPorts[index];
                const timestamp = Date.now();
                const randomId = Math.random().toString(36).substring(2, 8);
                const testFile = path.join(__dirname, `test_${port}_${timestamp}_${randomId}.tmp`);
                
                try {
                    // Create a small test file with unique name
                    fs.writeFileSync(testFile, 'test', 'utf8');
                    
                    // Try to copy to the port
                    exec(`copy /B "${testFile}" "${port}" 2>nul`, (error) => {
                        if (!error) {
                            console.log(`✅ Port ${port} is available`);
                            availablePorts.push(port);
                        } else {
                            console.log(`❌ Port ${port} not available`);
                        }
                        
                        // Clean up test file
                        try { 
                            fs.unlinkSync(testFile); 
                        } catch (cleanupError) {
                            // Ignore cleanup errors
                        }
                        
                        // Check next port
                        checkPort(port, index + 1);
                    });
                } catch (writeError) {
                    console.log(`⚠️ Could not create test file for ${port}: ${writeError.message}`);
                    // Check next port even if file creation failed
                    checkPort(port, index + 1);
                }
            };
            
            checkPort('', 0);
        });
    }

    /**
     * Test which USB port actually works with the printer
     */
    async testPrinterPorts(ports) {
        console.log('🧪 Testing printer ports...');
        
        for (const port of ports) {
            console.log(`🔍 Testing port: ${port}`);
            
            const success = await this.testPort(port);
            if (success) {
                console.log(`✅ Port ${port} works with printer!`);
                this.workingPort = port;
                return port;
            } else {
                console.log(`❌ Port ${port} failed`);
            }
        }
        
        console.log('❌ No working USB port found');
        return null;
    }

    /**
     * Test a specific port with the printer
     */
    async testPort(portName) {
        return new Promise((resolve) => {
            // Create a more comprehensive test that actually checks if printer responds
            const testData = Buffer.from([
                0x1B, 0x40,  // ESC init
                0x1B, 0x61, 0x01,  // center align
                0x1B, 0x45, 0x01,  // bold ON
                0x1D, 0x21, 0x11,  // double width + height
                0x54, 0x45, 0x53, 0x54, 0x0A,  // "TEST\n"
                0x1B, 0x45, 0x00,  // bold OFF
                0x1D, 0x21, 0x00,  // normal size
                0x1B, 0x64, 0x02   // feed 2 lines
            ]);
            
            const timestamp = Date.now();
            const randomId = Math.random().toString(36).substring(2, 8);
            const tempFile = path.join(__dirname, `test_${portName}_${timestamp}_${randomId}.bin`);
            
            try {
                fs.writeFileSync(tempFile, testData, 'binary');
            } catch (writeError) {
                console.log(`⚠️ Could not create test file for ${portName}: ${writeError.message}`);
                resolve(false);
                return;
            }
            
            const command = `copy /B "${tempFile}" "${portName}"`;
            console.log(`🧪 Testing port ${portName}: ${command}`);
            
            // Add timeout to prevent hanging
            const timeout = setTimeout(() => {
                console.log(`⏰ Port ${portName} test timed out`);
                try { fs.unlinkSync(tempFile); } catch {}
                resolve(false);
            }, 5000); // 5 second timeout
            
            exec(command, (error, stdout, stderr) => {
                clearTimeout(timeout);
                
                // Clean up test file
                try { fs.unlinkSync(tempFile); } catch {}
                
                if (error) {
                    console.log(`❌ Port ${portName} test failed: ${error.message}`);
                    console.log(`📱 Error code: ${error.code}`);
                    console.log(`📱 Stderr: ${stderr}`);
                    resolve(false);
                } else {
                    console.log(`✅ Port ${portName} test successful!`);
                    console.log(`📱 Output: ${stdout}`);
                    resolve(true);
                }
            });
        });
    }

    /**
     * Find the working printer port
     */
    async findWorkingPort() {
        console.log('🔍 Finding working printer port...');
        
        // First, try to detect USB ports
        const usbDevices = await this.detectUSBPorts();
        
        // Get available ports
        const availablePorts = await this.detectUSBPortsAlternative();
        
        if (availablePorts.length === 0) {
            console.log('❌ No USB ports detected');
            return null;
        }
        
        // Test each port
        const workingPort = await this.testPrinterPorts(availablePorts);
        
        if (workingPort) {
            console.log(`🎯 Working printer port found: ${workingPort}`);
            this.workingPort = workingPort;
            return workingPort;
        }
        
        // Fallback: try common ports
        console.log('🔄 Trying common USB ports as fallback...');
        const commonPorts = ['USB001', 'USB002', 'USB003'];
        return await this.testPrinterPorts(commonPorts);
    }

    /**
     * Get the current working port
     */
    getWorkingPort() {
        return this.workingPort;
    }

    /**
     * Print to the detected working port
     */
    async printToWorkingPort(buffer) {
        if (!this.workingPort) {
            console.log('🔍 No working port detected, finding one...');
            await this.findWorkingPort();
        }
        
        if (!this.workingPort) {
            throw new Error('No working printer port found');
        }
        
        return new Promise((resolve, reject) => {
            const tempFile = path.join(__dirname, 'print_data.bin');
            fs.writeFileSync(tempFile, buffer, 'binary');
            
            const command = `copy /B "${tempFile}" "${this.workingPort}"`;
            console.log(`🖨️ Printing to ${this.workingPort}: ${command}`);
            
            exec(command, (error, stdout, stderr) => {
                // Clean up temp file
                try { fs.unlinkSync(tempFile); } catch {}
                
                if (error) {
                    console.error(`❌ Print failed on ${this.workingPort}:`, error.message);
                    reject(error);
                } else {
                    console.log(`✅ Print successful on ${this.workingPort}`);
                    resolve(true);
                }
            });
        });
    }

    /**
     * Initialize and detect printer
     */
    async initialize() {
        console.log('🚀 Initializing printer detection...');
        
        try {
            const workingPort = await this.findWorkingPort();
            if (workingPort) {
                console.log(`✅ Printer detection complete. Working port: ${workingPort}`);
                return {
                    success: true,
                    port: workingPort,
                    message: `Printer detected on port ${workingPort}`
                };
            } else {
                console.log('❌ No working printer port found');
                return {
                    success: false,
                    port: null,
                    message: 'No working printer port found'
                };
            }
        } catch (error) {
            console.error('❌ Printer detection failed:', error.message);
            return {
                success: false,
                port: null,
                message: `Printer detection failed: ${error.message}`
            };
        }
    }
}

// Export singleton instance
export const printerDetector = new PrinterDetector();

// Command line interface
if (process.argv[1] === __filename) {
    const detector = new PrinterDetector();
    detector.initialize().then(result => {
        console.log('📋 Detection Result:', result);
        process.exit(result.success ? 0 : 1);
    });
}
