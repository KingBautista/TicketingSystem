#!/usr/bin/env node

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Finding Your Printer Port');
console.log('============================');

async function findPrinterPort() {
    console.log('\n📋 Step 1: Checking Windows printer list...');
    
    // Check Windows printer list
    await new Promise((resolve) => {
        exec('wmic printer get name,portname,printerstatus', (error, stdout, stderr) => {
            if (error) {
                console.log('❌ Could not get printer list:', error.message);
            } else {
                console.log('📱 Windows Printer List:');
                console.log(stdout);
            }
            resolve();
        });
    });
    
    console.log('\n📋 Step 2: Testing all possible USB ports...');
    
    // Test all possible USB ports
    const allPorts = ['USB001', 'USB002', 'USB003', 'USB004', 'USB005', 'USB006', 'USB007', 'USB008'];
    const workingPorts = [];
    
    for (const port of allPorts) {
        console.log(`\n🧪 Testing port: ${port}`);
        
        const success = await testPort(port);
        if (success) {
            workingPorts.push(port);
            console.log(`✅ Port ${port} is working!`);
        } else {
            console.log(`❌ Port ${port} failed`);
        }
    }
    
    console.log('\n📋 Step 3: Testing printer sharing...');
    
    // Test printer sharing
    const shareSuccess = await testPrinterShare();
    if (shareSuccess) {
        console.log('✅ Printer sharing is working!');
    } else {
        console.log('❌ Printer sharing failed');
    }
    
    console.log('\n📋 Results Summary:');
    console.log('==================');
    
    if (workingPorts.length > 0) {
        console.log(`✅ Working USB ports: ${workingPorts.join(', ')}`);
        console.log(`🎯 Recommended port: ${workingPorts[0]}`);
    } else {
        console.log('❌ No working USB ports found');
    }
    
    if (shareSuccess) {
        console.log('✅ Printer sharing is available as fallback');
    }
    
    console.log('\n💡 Next steps:');
    if (workingPorts.length > 0) {
        console.log(`1. Use port ${workingPorts[0]} for printing`);
        console.log('2. Update your printer configuration');
        console.log('3. Test printing with the working port');
    } else {
        console.log('1. Check if printer is connected and powered on');
        console.log('2. Check if printer drivers are installed');
        console.log('3. Try different USB cable or port');
        console.log('4. Enable printer sharing as fallback');
    }
}

async function testPort(portName) {
    return new Promise((resolve) => {
        // Create a simple test print job
        const testData = Buffer.from([
            0x1B, 0x40,  // ESC init
            0x1B, 0x61, 0x01,  // center align
            0x1B, 0x45, 0x01,  // bold ON
            0x1D, 0x21, 0x11,  // double width + height
            0x50, 0x52, 0x49, 0x4E, 0x54, 0x45, 0x52, 0x20, 0x54, 0x45, 0x53, 0x54, 0x0A,  // "PRINTER TEST\n"
            0x1B, 0x45, 0x00,  // bold OFF
            0x1D, 0x21, 0x00,  // normal size
            0x1B, 0x64, 0x02   // feed 2 lines
        ]);
        
        const tempFile = path.join(__dirname, `test_${portName}.bin`);
        fs.writeFileSync(tempFile, testData, 'binary');
        
        const command = `copy /B "${tempFile}" "${portName}"`;
        
        // Add timeout
        const timeout = setTimeout(() => {
            console.log(`⏰ Port ${portName} timed out`);
            try { fs.unlinkSync(tempFile); } catch {}
            resolve(false);
        }, 3000);
        
        exec(command, (error, stdout, stderr) => {
            clearTimeout(timeout);
            
            // Clean up
            try { fs.unlinkSync(tempFile); } catch {}
            
            if (error) {
                console.log(`   ❌ ${portName}: ${error.message}`);
                resolve(false);
            } else {
                console.log(`   ✅ ${portName}: Success!`);
                resolve(true);
            }
        });
    });
}

async function testPrinterShare() {
    return new Promise((resolve) => {
        const testData = Buffer.from([
            0x1B, 0x40,  // ESC init
            0x1B, 0x61, 0x01,  // center align
            0x50, 0x52, 0x49, 0x4E, 0x54, 0x45, 0x52, 0x20, 0x53, 0x48, 0x41, 0x52, 0x45, 0x20, 0x54, 0x45, 0x53, 0x54, 0x0A,  // "PRINTER SHARE TEST\n"
            0x1B, 0x64, 0x02   // feed 2 lines
        ]);
        
        const tempFile = path.join(__dirname, 'test_share.bin');
        fs.writeFileSync(tempFile, testData, 'binary');
        
        const command = `copy /B "${tempFile}" "\\\\localhost\\Star BSC10"`;
        
        const timeout = setTimeout(() => {
            console.log('⏰ Printer share timed out');
            try { fs.unlinkSync(tempFile); } catch {}
            resolve(false);
        }, 3000);
        
        exec(command, (error, stdout, stderr) => {
            clearTimeout(timeout);
            
            // Clean up
            try { fs.unlinkSync(tempFile); } catch {}
            
            if (error) {
                console.log(`❌ Printer share failed: ${error.message}`);
                resolve(false);
            } else {
                console.log('✅ Printer share successful!');
                resolve(true);
            }
        });
    });
}

// Run the test
findPrinterPort().then(() => {
    console.log('\n🎉 Printer port detection completed!');
    process.exit(0);
}).catch(error => {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
});
