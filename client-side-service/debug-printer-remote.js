#!/usr/bin/env node

/**
 * Remote Printer Debug Script
 * Use this to test printer connectivity from the remote server
 */

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Remote Printer Debug Tool');
console.log('============================');

// Test 1: Check if Star BSC10 printer exists
console.log('\n1️⃣ Checking if "Star BSC10" printer exists...');
exec('powershell -Command "Get-Printer -Name \'Star BSC10\' -ErrorAction SilentlyContinue"', (error, stdout, stderr) => {
    if (error) {
        console.log('❌ Printer "Star BSC10" not found');
        console.log('   Error:', error.message);
        
        // Try alternative names
        console.log('\n🔍 Trying alternative printer names...');
        exec('powershell -Command "Get-Printer | Where-Object {$_.Name -like \'*Star*\'} | Select-Object Name"', (error2, stdout2, stderr2) => {
            if (!error2 && stdout2.trim()) {
                console.log('✅ Found Star printers:');
                console.log(stdout2);
            } else {
                console.log('❌ No Star printers found');
            }
        });
    } else {
        console.log('✅ Printer "Star BSC10" found!');
        console.log('   Details:', stdout.trim());
    }
});

// Test 2: List all available printers
console.log('\n2️⃣ Listing all available printers...');
exec('powershell -Command "Get-Printer | Select-Object Name, PrinterStatus, DriverName"', (error, stdout, stderr) => {
    if (error) {
        console.log('❌ Error listing printers:', error.message);
    } else {
        console.log('📋 Available printers:');
        console.log(stdout);
    }
});

// Test 3: Test simple print command
console.log('\n3️⃣ Testing simple print command...');
const testFile = path.join(__dirname, 'test_print.txt');
fs.writeFileSync(testFile, 'Remote Debug Test - ' + new Date().toLocaleString() + '\n', 'utf8');

exec(`powershell -Command "Get-Content '${testFile}' -Raw | Out-Printer -Name 'Star BSC10'"`, (error, stdout, stderr) => {
    if (error) {
        console.log('❌ Print test failed:', error.message);
        console.log('   This might indicate:');
        console.log('   - Printer name is incorrect');
        console.log('   - Printer is offline');
        console.log('   - Printer driver issues');
    } else {
        console.log('✅ Print test command executed successfully');
        console.log('   Check if paper came out of the printer');
    }
    
    // Clean up test file
    try { fs.unlinkSync(testFile); } catch {}
});

// Test 4: Test raw print command (like the actual printer uses)
console.log('\n4️⃣ Testing raw print command...');
const rawTestFile = path.join(__dirname, 'raw_test.bin');
const testBuffer = Buffer.from('Raw Test - ' + new Date().toLocaleString() + '\n', 'ascii');
fs.writeFileSync(rawTestFile, testBuffer, 'binary');

exec(`copy /B "${rawTestFile}" "\\\\localhost\\Star BSC10"`, (error, stdout, stderr) => {
    if (error) {
        console.log('❌ Raw print test failed:', error.message);
        console.log('   This indicates the printer share is not accessible');
    } else {
        console.log('✅ Raw print test command executed successfully');
        console.log('   Check if paper came out of the printer');
    }
    
    // Clean up test file
    try { fs.unlinkSync(rawTestFile); } catch {}
});

// Test 5: Check printer share
console.log('\n5️⃣ Checking printer share...');
exec('net view localhost', (error, stdout, stderr) => {
    if (error) {
        console.log('❌ Cannot access localhost shares:', error.message);
    } else {
        console.log('📁 Localhost shares:');
        console.log(stdout);
        
        if (stdout.includes('Star BSC10')) {
            console.log('✅ Printer share "Star BSC10" is available');
        } else {
            console.log('❌ Printer share "Star BSC10" not found in shares');
        }
    }
});

console.log('\n📋 Summary:');
console.log('===========');
console.log('1. Check if "Star BSC10" printer exists in Windows');
console.log('2. Verify printer is online and has paper');
console.log('3. Test if printer share is accessible');
console.log('4. Check if raw print commands work');
console.log('\n💡 If all tests pass but printing still fails:');
console.log('   - Check Windows Event Viewer for printer errors');
console.log('   - Try restarting the printer spooler service');
console.log('   - Verify printer driver is properly installed');
