#!/usr/bin/env node

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 DEBUGGING PRINTRAW METHOD');
console.log('============================');

async function debugPrintRaw() {
    console.log('\n📋 Step 1: Test if basic file copy to USB001 works');
    
    // Create a simple test file
    const testText = 'BASIC TEST - ' + new Date().toLocaleString() + '\n';
    const testFile = path.join(__dirname, 'debug_basic.txt');
    fs.writeFileSync(testFile, testText, 'utf8');
    
    const basicCmd = `copy /B "${testFile}" "USB001"`;
    console.log(`📤 Command: ${basicCmd}`);
    
    const basicSuccess = await new Promise((resolve) => {
        exec(basicCmd, (error, stdout, stderr) => {
            if (error) {
                console.log(`❌ Basic test failed: ${error.message}`);
                console.log(`📱 Error code: ${error.code}`);
                resolve(false);
            } else {
                console.log(`✅ Basic test successful!`);
                console.log(`📱 Output: ${stdout}`);
                resolve(true);
            }
        });
    });
    
    // Clean up
    try { fs.unlinkSync(testFile); } catch {}
    
    if (!basicSuccess) {
        console.log('❌ Even basic file copy failed - check USB001 connection');
        return;
    }
    
    console.log('\n📋 Step 2: Test with binary data (like printRaw uses)');
    
    // Create binary data similar to what printRaw uses
    const binaryData = Buffer.from([
        0x1B, 0x40,  // ESC init
        0x1B, 0x61, 0x01,  // center align
        0x1B, 0x45, 0x01,  // bold ON
        0x1D, 0x21, 0x11,  // double width + height
        0x42, 0x49, 0x4E, 0x41, 0x52, 0x59, 0x20, 0x54, 0x45, 0x53, 0x54, 0x0A,  // "BINARY TEST\n"
        0x1B, 0x45, 0x00,  // bold OFF
        0x1D, 0x21, 0x00,  // normal size
        0x1B, 0x64, 0x02   // feed 2 lines
    ]);
    
    const binaryFile = path.join(__dirname, 'debug_binary.bin');
    fs.writeFileSync(binaryFile, binaryData, 'binary');
    
    const binaryCmd = `copy /B "${binaryFile}" "USB001"`;
    console.log(`📤 Command: ${binaryCmd}`);
    console.log(`📊 Binary data size: ${binaryData.length} bytes`);
    console.log(`📊 Binary data preview: ${binaryData.toString('hex').substring(0, 32)}...`);
    
    const binarySuccess = await new Promise((resolve) => {
        exec(binaryCmd, (error, stdout, stderr) => {
            if (error) {
                console.log(`❌ Binary test failed: ${error.message}`);
                console.log(`📱 Error code: ${error.code}`);
                resolve(false);
            } else {
                console.log(`✅ Binary test successful!`);
                console.log(`📱 Output: ${stdout}`);
                resolve(true);
            }
        });
    });
    
    // Clean up
    try { fs.unlinkSync(binaryFile); } catch {}
    
    console.log('\n📋 Step 3: Test QR code binary data');
    
    // Create QR code data like printQRCode uses
    const qrData = 'QR-DEBUG-TEST';
    const qrBuffer = Buffer.concat([
        Buffer.from([0x1B, 0x40]),         // init
        Buffer.from([0x1B, 0x61, 0x01]),   // center align
        
        // QR code setup
        Buffer.from([0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x43, 0x0A]), // QR code: model 2, size 10
        Buffer.from([0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x45, 0x30]), // QR code: error correction level L
        
        // QR code data
        Buffer.from([0x1D, 0x28, 0x6B, qrData.length + 3, 0x00, 0x31, 0x50, 0x30]),
        Buffer.from(qrData, 'ascii'),
        
        // Print QR code
        Buffer.from([0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x51, 0x30]),
        Buffer.from('\n\n', 'ascii')
    ]);
    
    const qrFile = path.join(__dirname, 'debug_qr.bin');
    fs.writeFileSync(qrFile, qrBuffer, 'binary');
    
    const qrCmd = `copy /B "${qrFile}" "USB001"`;
    console.log(`📤 Command: ${qrCmd}`);
    console.log(`📊 QR data size: ${qrBuffer.length} bytes`);
    console.log(`📊 QR data preview: ${qrBuffer.toString('hex').substring(0, 32)}...`);
    
    const qrSuccess = await new Promise((resolve) => {
        exec(qrCmd, (error, stdout, stderr) => {
            if (error) {
                console.log(`❌ QR test failed: ${error.message}`);
                console.log(`📱 Error code: ${error.code}`);
                resolve(false);
            } else {
                console.log(`✅ QR test successful!`);
                console.log(`📱 Output: ${stdout}`);
                resolve(true);
            }
        });
    });
    
    // Clean up
    try { fs.unlinkSync(qrFile); } catch {}
    
    console.log('\n📋 RESULTS:');
    console.log('===========');
    console.log(`Basic text: ${basicSuccess ? '✅ Works' : '❌ Failed'}`);
    console.log(`Binary data: ${binarySuccess ? '✅ Works' : '❌ Failed'}`);
    console.log(`QR code data: ${qrSuccess ? '✅ Works' : '❌ Failed'}`);
    
    console.log('\n💡 CHECK YOUR PRINTER:');
    console.log('1. Look for "BASIC TEST" with timestamp');
    console.log('2. Look for "BINARY TEST" in bold');
    console.log('3. Look for actual QR code (scannable)');
    
    if (basicSuccess && binarySuccess && qrSuccess) {
        console.log('\n🎯 ALL TESTS PASSED!');
        console.log('💡 The issue is in the printRaw method implementation');
        console.log('💡 We need to fix how printRaw calls these commands');
    } else {
        console.log('\n❌ Some tests failed');
        console.log('💡 Check which specific test failed and why');
    }
}

// Run the debug
debugPrintRaw().then(() => {
    console.log('\n🎉 PrintRaw debug completed!');
    process.exit(0);
}).catch(error => {
    console.error('❌ Debug failed:', error.message);
    process.exit(1);
});
