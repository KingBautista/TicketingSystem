#!/usr/bin/env node

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 TESTING SIMPLE TEXT PRINTER');
console.log('==============================');

async function testSimpleTextPrinter() {
    console.log('\n📋 Test 1: Simple text printing');
    
    const simpleText = 'SIMPLE TEXT PRINTER TEST\n';
    const textFile = path.join(__dirname, 'simple_test.txt');
    fs.writeFileSync(textFile, simpleText, 'utf8');
    
    const textCmd = `powershell -Command "Get-Content '${textFile}' -Raw | Out-Printer -Name 'Star BSC10'"`;
    console.log(`📤 Command: ${textCmd}`);
    
    const textSuccess = await new Promise((resolve) => {
        exec(textCmd, (error, stdout, stderr) => {
            if (error) {
                console.log(`❌ Simple text failed: ${error.message}`);
                resolve(false);
            } else {
                console.log(`✅ Simple text sent successfully`);
                resolve(true);
            }
        });
    });
    
    // Clean up
    try { fs.unlinkSync(textFile); } catch {}
    
    if (!textSuccess) {
        console.log('❌ Simple text failed - check printer connection');
        return;
    }
    
    console.log('\n📋 Test 2: Bold text formatting');
    
    const boldText = `
========================================
BOLD TEXT TEST
========================================

`;
    
    const boldFile = path.join(__dirname, 'bold_test.txt');
    fs.writeFileSync(boldFile, boldText, 'utf8');
    
    const boldCmd = `powershell -Command "Get-Content '${boldFile}' -Raw | Out-Printer -Name 'Star BSC10'"`;
    console.log(`📤 Command: ${boldCmd}`);
    
    const boldSuccess = await new Promise((resolve) => {
        exec(boldCmd, (error, stdout, stderr) => {
            if (error) {
                console.log(`❌ Bold text failed: ${error.message}`);
                resolve(false);
            } else {
                console.log(`✅ Bold text sent successfully`);
                resolve(true);
            }
        });
    });
    
    // Clean up
    try { fs.unlinkSync(boldFile); } catch {}
    
    console.log('\n📋 Test 3: Open cash receipt');
    
    const receiptText = `
========================================
           OPEN CASH RECEIPT
========================================

Cashier: Test Cashier
Date: ${new Date().toLocaleString()}
Cash on Hand: P1000.00
Session ID: #123

========================================
         --- End of Receipt ---
========================================


`;
    
    const receiptFile = path.join(__dirname, 'receipt_test.txt');
    fs.writeFileSync(receiptFile, receiptText, 'utf8');
    
    const receiptCmd = `powershell -Command "Get-Content '${receiptFile}' -Raw | Out-Printer -Name 'Star BSC10'"`;
    console.log(`📤 Command: ${receiptCmd}`);
    
    const receiptSuccess = await new Promise((resolve) => {
        exec(receiptCmd, (error, stdout, stderr) => {
            if (error) {
                console.log(`❌ Receipt failed: ${error.message}`);
                resolve(false);
            } else {
                console.log(`✅ Receipt sent successfully`);
                resolve(true);
            }
        });
    });
    
    // Clean up
    try { fs.unlinkSync(receiptFile); } catch {}
    
    console.log('\n📋 Test 4: QR code as text');
    
    const qrText = `
========================================
              QR CODE
========================================

Data: QR-TEST-${Date.now()}

(QR code would be printed here)

========================================


`;
    
    const qrFile = path.join(__dirname, 'qr_test.txt');
    fs.writeFileSync(qrFile, qrText, 'utf8');
    
    const qrCmd = `powershell -Command "Get-Content '${qrFile}' -Raw | Out-Printer -Name 'Star BSC10'"`;
    console.log(`📤 Command: ${qrCmd}`);
    
    const qrSuccess = await new Promise((resolve) => {
        exec(qrCmd, (error, stdout, stderr) => {
            if (error) {
                console.log(`❌ QR code failed: ${error.message}`);
                resolve(false);
            } else {
                console.log(`✅ QR code sent successfully`);
                resolve(true);
            }
        });
    });
    
    // Clean up
    try { fs.unlinkSync(qrFile); } catch {}
    
    console.log('\n📋 RESULTS:');
    console.log('===========');
    console.log(`Simple text: ${textSuccess ? '✅ Works' : '❌ Failed'}`);
    console.log(`Bold text: ${boldSuccess ? '✅ Works' : '❌ Failed'}`);
    console.log(`Receipt: ${receiptSuccess ? '✅ Works' : '❌ Failed'}`);
    console.log(`QR code: ${qrSuccess ? '✅ Works' : '❌ Failed'}`);
    
    console.log('\n💡 CHECK YOUR PRINTER:');
    console.log('1. Look for "SIMPLE TEXT PRINTER TEST"');
    console.log('2. Look for "BOLD TEXT TEST" with borders');
    console.log('3. Look for "OPEN CASH RECEIPT" with formatting');
    console.log('4. Look for "QR CODE" with test data');
    
    if (textSuccess && boldSuccess && receiptSuccess && qrSuccess) {
        console.log('\n🎯 ALL TESTS PASSED!');
        console.log('💡 Text-based printing works perfectly!');
        console.log('💡 We can use this approach for all receipts');
    } else {
        console.log('\n❌ Some tests failed');
        console.log('💡 Check which specific test failed and why');
    }
}

// Run the test
testSimpleTextPrinter().then(() => {
    console.log('\n🎉 Simple text printer test completed!');
    process.exit(0);
}).catch(error => {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
});
