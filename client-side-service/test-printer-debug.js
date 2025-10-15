#!/usr/bin/env node

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Printer Debug Tool');
console.log('===================\n');

// Test 1: Check if StarBSC10 printer exists
console.log('1️⃣ Checking if StarBSC10 printer exists...');
exec('powershell -Command "Get-Printer -Name \'StarBSC10\' -ErrorAction SilentlyContinue"', (error, stdout, stderr) => {
    if (error) {
        console.log('❌ StarBSC10 printer not found');
        console.log('   Error:', error.message);
    } else if (stdout.trim()) {
        console.log('✅ StarBSC10 printer found');
        console.log('   Details:', stdout.trim());
    } else {
        console.log('❌ StarBSC10 printer not found (no output)');
    }
    
    // Test 2: List all available printers
    console.log('\n2️⃣ Listing all available printers...');
    exec('powershell -Command "Get-Printer | Select-Object Name, PrinterStatus, DriverName, PortName | Format-Table -AutoSize"', (error, stdout, stderr) => {
        if (error) {
            console.log('❌ Failed to list printers');
            console.log('   Error:', error.message);
        } else {
            console.log('📋 Available printers:');
            console.log(stdout);
        }
        
        // Test 3: Check printer sharing
        console.log('\n3️⃣ Checking printer sharing...');
        exec('powershell -Command "Get-Printer | Where-Object {$_.Shared -eq $true} | Select-Object Name, Shared, ShareName"', (error, stdout, stderr) => {
            if (error) {
                console.log('❌ Failed to check printer sharing');
                console.log('   Error:', error.message);
            } else if (stdout.trim()) {
                console.log('📤 Shared printers:');
                console.log(stdout);
            } else {
                console.log('ℹ️ No shared printers found');
            }
            
            // Test 4: Test raw printing
            console.log('\n4️⃣ Testing raw printing...');
            const testFile = path.join(__dirname, 'test_raw.bin');
            const testData = Buffer.from('Hello from raw test!\n', 'ascii');
            
            fs.writeFileSync(testFile, testData, 'binary');
            
            exec(`copy /B "${testFile}" "\\\\localhost\\StarBSC10"`, (error, stdout, stderr) => {
                if (error) {
                    console.log('❌ Raw printing failed');
                    console.log('   Error:', error.message);
                } else {
                    console.log('✅ Raw printing command executed');
                    console.log('   Output:', stdout);
                }
                
                // Clean up test file
                try { fs.unlinkSync(testFile); } catch {}
                
                // Test 5: Test PowerShell printing
                console.log('\n5️⃣ Testing PowerShell printing...');
                const testText = 'Hello from PowerShell test!';
                const psCommand = `"${testText}" | Out-Printer -Name "StarBSC10"`;
                
                exec(`powershell -Command "${psCommand}"`, (error, stdout, stderr) => {
                    if (error) {
                        console.log('❌ PowerShell printing failed');
                        console.log('   Error:', error.message);
                    } else {
                        console.log('✅ PowerShell printing command executed');
                        console.log('   Output:', stdout);
                    }
                    
                    // Test 6: Check Windows Print Spooler service
                    console.log('\n6️⃣ Checking Print Spooler service...');
                    exec('powershell -Command "Get-Service -Name Spooler | Select-Object Name, Status, StartType"', (error, stdout, stderr) => {
                        if (error) {
                            console.log('❌ Failed to check Print Spooler service');
                            console.log('   Error:', error.message);
                        } else {
                            console.log('🖨️ Print Spooler service status:');
                            console.log(stdout);
                        }
                        
                        // Test 7: Check printer ports
                        console.log('\n7️⃣ Checking printer ports...');
                        exec('powershell -Command "Get-PrinterPort | Select-Object Name, PrinterHostAddress, PortType"', (error, stdout, stderr) => {
                            if (error) {
                                console.log('❌ Failed to check printer ports');
                                console.log('   Error:', error.message);
                            } else {
                                console.log('🔌 Available printer ports:');
                                console.log(stdout);
                            }
                            
                            console.log('\n🏁 Debug test completed!');
                            console.log('\n💡 Troubleshooting tips:');
                            console.log('   - Make sure StarBSC10 printer is installed and shared');
                            console.log('   - Check if Print Spooler service is running');
                            console.log('   - Verify printer is connected and powered on');
                            console.log('   - Try installing a generic text printer if StarBSC10 is not available');
                            console.log('   - Check Windows Firewall settings');
                        });
                    });
                });
            });
        });
    });
});
