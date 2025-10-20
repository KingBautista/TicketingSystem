#!/usr/bin/env node

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 SIMPLE SERVER FIX');
console.log('===================');

// Simple text-based printer that actually works
class SimpleWorkingPrinter {
    constructor() {
        this.printerName = 'Star BSC10';
        console.log('🔍 Creating Simple Working Printer...');
    }

    async printText(text) {
        console.log(`🖨️ Printing text: ${text.substring(0, 50)}...`);
        
        const tempFile = path.join(__dirname, 'simple_print.txt');
        fs.writeFileSync(tempFile, text, 'utf8');
        
        const psCmd = `powershell -Command "Get-Content '${tempFile}' -Raw | Out-Printer -Name '${this.printerName}'"`;
        
        return new Promise((resolve, reject) => {
            exec(psCmd, (error, stdout, stderr) => {
                try { fs.unlinkSync(tempFile); } catch {}
                
                if (error) {
                    console.log(`❌ Text print failed: ${error.message}`);
                    reject(error);
                } else {
                    console.log(`✅ Text sent to printer successfully`);
                    resolve();
                }
            });
        });
    }

    async printBoldText(text) {
        console.log(`🖨️ Printing bold text: ${text}`);
        
        const formattedText = `
========================================
${text}
========================================

`;
        
        await this.printText(formattedText);
    }

    async printOpenCashReceipt(cashierName, cashOnHand, sessionId) {
        console.log(`🖨️ Printing open cash receipt - Cashier: ${cashierName}, Amount: P${cashOnHand}, Session: #${sessionId}`);
        
        const receiptText = `
========================================
           OPEN CASH RECEIPT
========================================

Cashier: ${cashierName}
Date: ${new Date().toLocaleString()}
Cash on Hand: P${parseFloat(cashOnHand).toFixed(2)}
Session ID: #${sessionId}

========================================
         --- End of Receipt ---
========================================


`;
        
        await this.printText(receiptText);
    }

    async printCloseCashReceipt(cashierName, sessionId, openingCash, closingCash, dailyTransactions, dailyTotal) {
        console.log(`🖨️ Printing close cash receipt - Cashier: ${cashierName}, Session: #${sessionId}`);
        
        const receiptText = `
========================================
          CLOSE CASH REPORT
========================================

Date: ${new Date().toLocaleString()}
Cashier: ${cashierName}
Session: #${sessionId}

*** DAILY TRANSACTIONS ***

${dailyTransactions.map((transaction, idx) => `
Transaction #${transaction.id}
Time: ${new Date(transaction.created_at).toLocaleTimeString()}
${transaction.rate?.name || 'N/A'}                    x${transaction.quantity}
${transaction.discounts?.length > 0 
  ? transaction.discounts.map(discount => 
      `- ${discount.discount_name}               P${discount.discount_value_type === 'percentage' ? `${discount.discount_value}%` : `${discount.discount_value}`}`
    ).join('\n')
  : ''
}
Total:                        P${parseFloat(transaction.total).toFixed(2)}
${idx < dailyTransactions.length - 1 ? '--------------------------------' : ''}
`).join('')}

*** SUMMARY ***

Opening Cash:                 P${parseFloat(openingCash).toFixed(2)}
Total Transactions:            ${dailyTransactions.length}
Total Sales:                  P${parseFloat(dailyTotal).toFixed(2)}
Closing Cash:                 P${parseFloat(closingCash).toFixed(2)}

--- End of Report ---


`;
        
        await this.printText(receiptText);
    }

    async printTransactionTickets(transactionData) {
        console.log(`🖨️ Printing transaction tickets...`);
        
        let data;
        if (typeof transactionData === 'string') {
            data = JSON.parse(transactionData);
        } else {
            data = transactionData;
        }
        
        const {
            transactionId,
            promoterName,
            rateName,
            quantity,
            total,
            paidAmount,
            change,
            cashierName,
            sessionId,
            discounts,
            tickets,
            createdAt
        } = data;
        
        // Print individual QR code tickets
        for (let i = 0; i < tickets.length; i++) {
            const qrCode = tickets[i];
            console.log(`🖨️ Printing QR ticket ${i + 1}: ${qrCode}`);
            
            const ticketText = `
========================================
              TICKET
========================================

${promoterName}

${new Date(createdAt).toLocaleString()}

Code: ${qrCode}

Single use only

========================================


`;
            
            await this.printText(ticketText);
            
            // Wait between tickets
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // Print main receipt
        console.log(`🖨️ Printing main receipt...`);
        
        const receiptText = `
========================================
              RECEIPT
========================================

Promoter: ${promoterName}
Date: ${new Date(createdAt).toLocaleString()}
Single use only

PROMOTER: ${promoterName}
DATE: ${new Date(createdAt).toLocaleString()}
RATE: ${rateName}
QTY: ${quantity}
TOTAL: P${parseFloat(total).toFixed(2)}
PAID: P${parseFloat(paidAmount).toFixed(2)}
CHANGE: P${parseFloat(change).toFixed(2)}
CASHIER: ${cashierName}
SESSION: #${sessionId}
TXN ID: #${transactionId}

DISCOUNTS:
${discounts && discounts.length > 0 
  ? discounts.map(discount => 
      `${discount.discount_name}: ${discount.discount_value_type === 'percentage' ? `${discount.discount_value}%` : `P${discount.discount_value}`}`
    ).join('\n')
  : 'None'
}

Thank you!

========================================


`;
        
        await this.printText(receiptText);
    }

    async printQRCode(data) {
        console.log(`🖨️ Printing QR code: ${data}`);
        
        const qrText = `
========================================
              QR CODE
========================================

Data: ${data}

(QR code would be printed here)

========================================


`;
        
        await this.printText(qrText);
    }
}

// Test the simple working printer
async function testSimpleWorkingPrinter() {
    console.log('🧪 Testing Simple Working Printer');
    console.log('=================================');
    
    const printer = new SimpleWorkingPrinter();
    
    console.log('\n📋 Test 1: Bold text');
    try {
        await printer.printBoldText('SIMPLE WORKING TEST');
        console.log('✅ Bold text test completed');
    } catch (error) {
        console.log('❌ Bold text test failed:', error.message);
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('\n📋 Test 2: Open cash receipt');
    try {
        await printer.printOpenCashReceipt('Test Cashier', '1000.00', '123');
        console.log('✅ Open cash receipt test completed');
    } catch (error) {
        console.log('❌ Open cash receipt test failed:', error.message);
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('\n📋 Test 3: QR code');
    try {
        await printer.printQRCode('QR-SIMPLE-TEST-' + Date.now());
        console.log('✅ QR code test completed');
    } catch (error) {
        console.log('❌ QR code test failed:', error.message);
    }
    
    console.log('\n🎉 Simple working printer test completed!');
    console.log('💡 This approach should work reliably');
    console.log('💡 Use this for the server instead of complex ESC/POS');
}

// Run test if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    testSimpleWorkingPrinter().then(() => {
        console.log('\n🎉 All tests completed!');
        process.exit(0);
    }).catch(error => {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    });
}

export { SimpleWorkingPrinter };
