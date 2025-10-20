#!/usr/bin/env node

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 VERIFYING PRINTER IS ACTUALLY FIRING');
console.log('========================================');

async function verifyPrinterFiring() {
    console.log('\n📋 Step 1: Check if printer is online and ready');
    
    // Check Windows printer status
    const printerStatus = await new Promise((resolve) => {
        exec('wmic printer get name,printerstatus,workoffline', (error, stdout, stderr) => {
            if (error) {
                console.log('❌ Could not check printer status:', error.message);
                resolve(false);
            } else {
                console.log('📱 Printer Status:');
                console.log(stdout);
                resolve(true);
            }
        });
    });
    
    console.log('\n📋 Step 2: Test basic text printing (should work)');
    
    // Test 1: Basic text (this should work)
    const textFile = path.join(__dirname, 'verify_text.txt');
    const testText = `VERIFICATION TEST - ${new Date().toLocaleString()}\nThis should print if printer is working.\n`;
    fs.writeFileSync(textFile, testText, 'utf8');
    
    console.log('🧪 Testing basic text printing...');
    const textCmd = `powershell -Command "Get-Content '${textFile}' -Raw | Out-Printer -Name 'Star BSC10'"`;
    
    const textSuccess = await new Promise((resolve) => {
        console.log(`📤 Sending command: ${textCmd}`);
        exec(textCmd, (error, stdout, stderr) => {
            if (error) {
                console.log(`❌ Text print failed: ${error.message}`);
                console.log(`📱 Error code: ${error.code}`);
                console.log(`📱 Stderr: ${stderr}`);
                resolve(false);
            } else {
                console.log(`✅ Text print command executed successfully`);
                console.log(`📱 Output: ${stdout}`);
                resolve(true);
            }
        });
    });
    
    // Clean up
    try { fs.unlinkSync(textFile); } catch {}
    
    console.log('\n📋 Step 3: Test raw data printing (ESC/POS commands)');
    
    // Test 2: Raw ESC/POS data
    const rawData = Buffer.from([
        0x1B, 0x40,  // ESC init
        0x1B, 0x61, 0x01,  // center align
        0x1B, 0x45, 0x01,  // bold ON
        0x1D, 0x21, 0x11,  // double width + height
        0x52, 0x41, 0x57, 0x20, 0x44, 0x41, 0x54, 0x41, 0x20, 0x54, 0x45, 0x53, 0x54, 0x0A,  // "RAW DATA TEST\n"
        0x1B, 0x45, 0x00,  // bold OFF
        0x1D, 0x21, 0x00,  // normal size
        0x1B, 0x64, 0x02   // feed 2 lines
    ]);
    
    const rawFile = path.join(__dirname, 'verify_raw.bin');
    fs.writeFileSync(rawFile, rawData, 'binary');
    
    console.log('🧪 Testing raw data printing via USB001...');
    const rawCmd = `copy /B "${rawFile}" "USB001"`;
    
    const rawSuccess = await new Promise((resolve) => {
        console.log(`📤 Sending command: ${rawCmd}`);
        exec(rawCmd, (error, stdout, stderr) => {
            if (error) {
                console.log(`❌ Raw print failed: ${error.message}`);
                console.log(`📱 Error code: ${error.code}`);
                console.log(`📱 Stderr: ${stderr}`);
                resolve(false);
            } else {
                console.log(`✅ Raw print command executed successfully`);
                console.log(`📱 Output: ${stdout}`);
                resolve(true);
            }
        });
    });
    
    // Clean up
    try { fs.unlinkSync(rawFile); } catch {}
    
    console.log('\n📋 Step 4: Test alternative USB ports');
    
    // Test other USB ports
    const usbPorts = ['USB002', 'USB003', 'USB004'];
    let workingPort = null;
    
    for (const port of usbPorts) {
        console.log(`🧪 Testing port ${port}...`);
        
        const testData = Buffer.from([
            0x1B, 0x40,  // ESC init
            0x54, 0x45, 0x53, 0x54, 0x20, 0x50, 0x4F, 0x52, 0x54, 0x0A,  // "TEST PORT\n"
            0x1B, 0x64, 0x02   // feed 2 lines
        ]);
        
        const testFile = path.join(__dirname, `test_${port}.bin`);
        fs.writeFileSync(testFile, testData, 'binary');
        
        const portCmd = `copy /B "${testFile}" "${port}"`;
        
        const portSuccess = await new Promise((resolve) => {
            exec(portCmd, (error, stdout, stderr) => {
                if (error) {
                    console.log(`❌ Port ${port} failed: ${error.message}`);
                    resolve(false);
                } else {
                    console.log(`✅ Port ${port} successful!`);
                    resolve(true);
                }
            });
        });
        
        // Clean up
        try { fs.unlinkSync(testFile); } catch {}
        
        if (portSuccess) {
            workingPort = port;
            break;
        }
    }
    
    console.log('\n📋 Step 5: Test printer sharing');
    
    // Test printer sharing
    const shareData = Buffer.from([
        0x1B, 0x40,  // ESC init
        0x53, 0x48, 0x41, 0x52, 0x45, 0x20, 0x54, 0x45, 0x53, 0x54, 0x0A,  // "SHARE TEST\n"
        0x1B, 0x64, 0x02   // feed 2 lines
    ]);
    
    const shareFile = path.join(__dirname, 'verify_share.bin');
    fs.writeFileSync(shareFile, shareData, 'binary');
    
    const shareCmd = `copy /B "${shareFile}" "\\\\localhost\\Star BSC10"`;
    
    const shareSuccess = await new Promise((resolve) => {
        console.log(`📤 Sending command: ${shareCmd}`);
        exec(shareCmd, (error, stdout, stderr) => {
            if (error) {
                console.log(`❌ Share print failed: ${error.message}`);
                resolve(false);
            } else {
                console.log(`✅ Share print successful!`);
                resolve(true);
            }
        });
    });
    
    // Clean up
    try { fs.unlinkSync(shareFile); } catch {}
    
    console.log('\n📋 VERIFICATION RESULTS');
    console.log('=======================');
    console.log(`Printer Status Check: ${printerStatus ? '✅ Passed' : '❌ Failed'}`);
    console.log(`Text Printing: ${textSuccess ? '✅ Passed' : '❌ Failed'}`);
    console.log(`Raw Data USB001: ${rawSuccess ? '✅ Passed' : '❌ Failed'}`);
    console.log(`Working USB Port: ${workingPort || 'None found'}`);
    console.log(`Printer Sharing: ${shareSuccess ? '✅ Passed' : '❌ Failed'}`);
    
    console.log('\n💡 ANALYSIS:');
    if (textSuccess && rawSuccess) {
        console.log('✅ Both text and raw data printing work!');
        console.log('✅ Your printer is firing correctly');
        console.log('✅ The issue might be in the server code');
    } else if (textSuccess && !rawSuccess) {
        console.log('⚠️ Text printing works but raw data fails');
        console.log('💡 This suggests ESC/POS commands are not being processed');
        console.log('💡 Check if your printer supports ESC/POS commands');
    } else if (!textSuccess) {
        console.log('❌ Basic text printing failed');
        console.log('💡 Check printer connection, drivers, and power');
        console.log('💡 Make sure printer is online and not paused');
    }
    
    console.log('\n🎯 RECOMMENDATIONS:');
    if (textSuccess) {
        console.log('1. Use text-based printing instead of raw ESC/POS');
        console.log('2. Convert ESC/POS commands to plain text');
        console.log('3. Use PowerShell printing method');
    } else {
        console.log('1. Check printer connection and power');
        console.log('2. Install/update printer drivers');
        console.log('3. Check Windows printer settings');
        console.log('4. Try different USB cable or port');
    }
}

// Run the verification
verifyPrinterFiring().then(() => {
    console.log('\n🎉 Verification completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Check your printer for any printed test pages');
    console.log('2. If nothing printed, check printer connection');
    console.log('3. If text printed but raw data didn\'t, use text method');
    process.exit(0);
}).catch(error => {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
});
