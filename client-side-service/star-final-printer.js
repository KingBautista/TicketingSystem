#!/usr/bin/env node

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import QRCode from 'qrcode';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class StarBSC10Printer {
  constructor() {
    this.printerName = 'Star BSC10';
    console.log('🔍 Creating Final Star BSC10 Printer (RAW mode)...');
  }

  // -------------------------
  // RAW ESC/POS printing (for bold text, formatting)
  // -------------------------
  printRaw(buffer) {
    const tempFile = path.join(__dirname, 'raw_print.bin');
    fs.writeFileSync(tempFile, buffer, 'binary');
    
    // Use copy /B to send raw binary to printer share
    const cmd = `copy /B "${tempFile}" "\\\\localhost\\${this.printerName}"`;
    
    console.log(`🖨️ Sending RAW data to printer: ${this.printerName}`);
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Raw print error:', error.message);
      } else {
        console.log('✅ Raw data sent to printer');
      }
      // Clean up temp file
      try { fs.unlinkSync(tempFile); } catch {}
    });
  }

  // -------------------------
  // Plain text printing
  // -------------------------
  printText(text) {
    const tempFile = path.join(__dirname, 'text_print.txt');
    fs.writeFileSync(tempFile, text, 'utf8');
    
    const cmd = `powershell -Command "Get-Content '${tempFile}' -Raw | Out-Printer -Name '${this.printerName}'`;
    
    console.log(`🖨️ Printing text: ${text.substring(0, 50)}...`);
    exec(cmd, (error) => {
      if (error) {
        console.error('❌ Text print error:', error.message);
      } else {
        console.log('✅ Text sent to printer');
      }
      try { fs.unlinkSync(tempFile); } catch {}
    });
  }

  // -------------------------
  // Bold text with ESC/POS commands
  // -------------------------
  printBoldText(text) {
    const buffer = Buffer.concat([
      Buffer.from([0x1B, 0x40]),         // init
      Buffer.from([0x1B, 0x61, 0x00]),   // left align
      Buffer.from([0x1B, 0x45, 0x01]),   // bold ON
      Buffer.from([0x1D, 0x21, 0x11]),   // double width + height
      Buffer.from(text + '\n', 'ascii'),
      Buffer.from([0x1B, 0x45, 0x00]),   // bold OFF
      Buffer.from([0x1D, 0x21, 0x00]),   // normal size
      Buffer.from([0x1B, 0x64, 0x02])    // feed 2 lines (no cut)
    ]);
    this.printRaw(buffer);
  }

  // -------------------------
  // QR code using ESC/POS commands (bigger size)
  // -------------------------
  printQRCode(data) {
    // ESC/POS QR code commands
    const buffer = Buffer.concat([
      Buffer.from([0x1B, 0x40]),         // init
      Buffer.from([0x1B, 0x61, 0x01]),   // center align
      
      // QR code setup - bigger size (size 10 instead of 8)
      Buffer.from([0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x43, 0x0A]), // QR code: model 2, size 10
      Buffer.from([0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x45, 0x30]), // QR code: error correction level L
      
      // QR code data
      Buffer.from([0x1D, 0x28, 0x6B, data.length + 3, 0x00, 0x31, 0x50, 0x30]),
      Buffer.from(data, 'ascii'),
      
      // Print QR code
      Buffer.from([0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x51, 0x30]),
      Buffer.from('\n\n', 'ascii')
    ]);
    
    this.printRaw(buffer);
    console.log(`🖨️ Printing QR code (size 10): ${data}`);
  }

  // -------------------------
  // QR code as IMAGE (fixed square aspect ratio)
  // -------------------------
  async printQRCodeAsImage(data) {
    const tempFile = path.join(__dirname, 'qr.png');
    
    // Create a square QR code with proper margins
    const qrWidth = 200;  // Square size
    const margin = 4;
    
    await QRCode.toFile(tempFile, data, { 
      type: 'png', 
      margin: margin,
      width: qrWidth,
      color: {
        dark: '#000000',  // Black QR code
        light: '#FFFFFF'  // White background
      }
    });

    // Use PowerShell to print image with proper sizing
    const psScript = `
      Add-Type -AssemblyName System.Drawing
      $image = [System.Drawing.Image]::FromFile("${tempFile}")
      $printDoc = New-Object System.Drawing.Printing.PrintDocument
      $printDoc.PrinterSettings.PrinterName = "${this.printerName}"
      $printDoc.PrintController = New-Object System.Drawing.Printing.StandardPrintController
      
      $printDoc.PrintPage = {
        param($sender, $e)
        $e.Graphics.DrawImage($image, 0, 0, 200, 200)
      }
      
      $printDoc.Print()
      $printDoc.Dispose()
      $image.Dispose()
    `;
    
    const cmd = `powershell -Command "${psScript}"`;
    
    console.log(`🖨️ Printing QR as square image (${qrWidth}x${qrWidth}px): ${data}`);
    exec(cmd, (error) => {
      if (error) {
        console.error('❌ QR image print error:', error.message);
      } else {
        console.log('✅ QR image sent to printer via PowerShell');
      }
    });
  }

  // -------------------------
  // Print single QR code receipt
  // -------------------------
  async printSingleQRReceipt(qrData, qrNumber) {
    // Print QR code first, then the receipt format
    console.log(`🖨️ Printing QR code ${qrNumber} first...`);
    this.printQRCode(qrData);
    
    // Wait a moment, then print receipt format
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const buffer = Buffer.concat([
      Buffer.from([0x1B, 0x40]),         // init
      Buffer.from([0x1B, 0x61, 0x01]),   // center align
      
      // Promoter name
      Buffer.from('Promoter 24\n', 'ascii'),
      Buffer.from('\n', 'ascii'),
      
      // Date and time
      Buffer.from('8/27/2025, 11:55:04 PM\n', 'ascii'),
      Buffer.from('\n', 'ascii'),
      
      // Code in text
      Buffer.from(`Code: ${qrData}\n`, 'ascii'),
      Buffer.from('\n', 'ascii'),
      
      // Single use only label
      Buffer.from('Single use only\n', 'ascii'),
      Buffer.from('\n\n', 'ascii'),
      
      // Feed and cut
      Buffer.from([0x1B, 0x64, 0x03]),   // feed 3 lines
      Buffer.from([0x1D, 0x56, 0x00])    // full cut
    ]);
    
    // Print the receipt format
    this.printRaw(buffer);
    
    console.log(`✅ QR receipt ${qrNumber} completed`);
  }

  // -------------------------
  // Complete receipt sample (3 QR receipts + main receipt)
  // -------------------------
  async printReceiptSample() {
    console.log('🖨️ Printing complete receipt sample...');
    
    try {
      // Helper function to add delay
      const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
      
      // Print 3 separate QR code receipts
      console.log('🖨️ Printing QR code receipts...');
      
      // QR Receipt 1
      await this.printSingleQRReceipt('PROMOTER24-2025-08-27-235115-1', 1);
      await delay(500);
      
      // QR Receipt 2
      await this.printSingleQRReceipt('PROMOTER24-2025-08-27-235115-2', 2);
      await delay(500);
      
      // QR Receipt 3
      await this.printSingleQRReceipt('PROMOTER24-2025-08-27-235115-3', 3);
      await delay(500);
      
      // Now print the main receipt information
      console.log('🖨️ Printing main receipt information...');
      
      const buffer = Buffer.concat([
        Buffer.from([0x1B, 0x40]),         // init
        Buffer.from([0x1B, 0x61, 0x01]),   // center align
        
        // Header
        Buffer.from([0x1B, 0x45, 0x01]),   // bold ON
        Buffer.from([0x1D, 0x21, 0x11]),   // double width + height
        Buffer.from('RECEIPT\n', 'ascii'),
        Buffer.from([0x1B, 0x45, 0x00]),   // bold OFF
        Buffer.from([0x1D, 0x21, 0x00]),   // normal size
        
        // Promoter
        Buffer.from('Promoter: Promoter 24\n', 'ascii'),
        Buffer.from('\n', 'ascii'),
        
        // Date and time
        Buffer.from('8/27/2025, 11:51:15 PM\n', 'ascii'),
        Buffer.from('Single use only\n', 'ascii'),
        Buffer.from('\n', 'ascii'),
        
        // Separator
        Buffer.from('----------------------------------------\n', 'ascii'),
        
        // Details (left align)
        Buffer.from([0x1B, 0x61, 0x00]),   // left align
        Buffer.from('PROMOTER: Promoter 24\n', 'ascii'),
        Buffer.from('DATE: 8/27/2025, 11:51:15 PM\n', 'ascii'),
        Buffer.from('RATE: Regular Ticket\n', 'ascii'),
        Buffer.from('QTY: 1\n', 'ascii'),
        Buffer.from('TOTAL: P100.00\n', 'ascii'),
        Buffer.from('DISCOUNTS:\n', 'ascii'),
        Buffer.from('None\n', 'ascii'),
        
        // Separator
        Buffer.from('----------------------------------------\n', 'ascii'),
        
        // Footer (center align)
        Buffer.from([0x1B, 0x61, 0x01]),   // center align
        Buffer.from('Thank you!\n', 'ascii'),
        Buffer.from('\n\n', 'ascii'),
        
        // Feed and cut
        Buffer.from([0x1B, 0x64, 0x03]),   // feed 3 lines
        Buffer.from([0x1D, 0x56, 0x00])    // full cut
      ]);
      
      // Send the main receipt information
      this.printRaw(buffer);
      
      console.log('✅ Complete receipt sample finished');
      
    } catch (error) {
      console.error('❌ Error printing receipt:', error);
    }
  }

  // -------------------------
  // Print multiple QR codes
  // -------------------------
  async printMultipleQRCodes(qrDataArray) {
    console.log(`🖨️ Printing ${qrDataArray.length} QR codes...`);
    
    for (let i = 0; i < qrDataArray.length; i++) {
      const data = qrDataArray[i];
      console.log(`🖨️ Printing QR code ${i + 1}: ${data}`);
      this.printQRCode(data);
      
      // Add delay between QR codes (except for the last one)
      if (i < qrDataArray.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
    
    console.log('✅ Multiple QR codes completed');
  }

  // -------------------------
  // Print Transaction Tickets (Official)
  // -------------------------
  async printTransactionTickets(transactionData) {
    console.log('🖨️ Printing transaction tickets...');
    console.log('📄 Received data:', transactionData);
    
    try {
      // Parse transaction data
      const data = JSON.parse(transactionData);
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
        tickets, // Array of QR codes
        createdAt
      } = data;
      
      // Helper function to add delay
      const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
      
      // Print individual QR code tickets first
      console.log(`🖨️ Printing ${tickets.length} QR code tickets...`);
      
      for (let i = 0; i < tickets.length; i++) {
        const qrCode = tickets[i];
        console.log(`🖨️ Printing QR ticket ${i + 1}: ${qrCode}`);
        
        // Print QR code first
        this.printQRCode(qrCode);
        await delay(500);
        
        // Print ticket format
        const ticketBuffer = Buffer.concat([
          Buffer.from([0x1B, 0x40]),         // init
          Buffer.from([0x1B, 0x61, 0x01]),   // center align
          
          // Promoter name
          Buffer.from(`${promoterName}\n`, 'ascii'),
          Buffer.from('\n', 'ascii'),
          
          // Date and time
          Buffer.from(`${new Date(createdAt).toLocaleString()}\n`, 'ascii'),
          Buffer.from('\n', 'ascii'),
          
          // Code in text
          Buffer.from(`Code: ${qrCode}\n`, 'ascii'),
          Buffer.from('\n', 'ascii'),
          
          // Single use only label
          Buffer.from('Single use only\n', 'ascii'),
          Buffer.from('\n\n', 'ascii'),
          
          // Feed and cut
          Buffer.from([0x1B, 0x64, 0x03]),   // feed 3 lines
          Buffer.from([0x1D, 0x56, 0x00])    // full cut
        ]);
        
        this.printRaw(ticketBuffer);
        await delay(500);
      }
      
      // Now print the main receipt information
      console.log('🖨️ Printing main transaction receipt...');
      
      const receiptBuffer = Buffer.concat([
        Buffer.from([0x1B, 0x40]),         // init
        Buffer.from([0x1B, 0x61, 0x01]),   // center align
        
        // Header
        Buffer.from([0x1B, 0x45, 0x01]),   // bold ON
        Buffer.from([0x1D, 0x21, 0x11]),   // double width + height
        Buffer.from('RECEIPT\n', 'ascii'),
        Buffer.from([0x1B, 0x45, 0x00]),   // bold OFF
        Buffer.from([0x1D, 0x21, 0x00]),   // normal size
        
        // Promoter
        Buffer.from(`Promoter: ${promoterName}\n`, 'ascii'),
        Buffer.from('\n', 'ascii'),
        
        // Date and time
        Buffer.from(`${new Date(createdAt).toLocaleString()}\n`, 'ascii'),
        Buffer.from('Single use only\n', 'ascii'),
        Buffer.from('\n', 'ascii'),
        
        // Separator
        Buffer.from('----------------------------------------\n', 'ascii'),
        
        // Details (left align)
        Buffer.from([0x1B, 0x61, 0x00]),   // left align
        Buffer.from(`PROMOTER: ${promoterName}\n`, 'ascii'),
        Buffer.from(`DATE: ${new Date(createdAt).toLocaleString()}\n`, 'ascii'),
        Buffer.from(`RATE: ${rateName}\n`, 'ascii'),
        Buffer.from(`QTY: ${quantity}\n`, 'ascii'),
        Buffer.from(`TOTAL: ₱${parseFloat(total).toFixed(2)}\n`, 'ascii'),
        Buffer.from(`PAID: ₱${parseFloat(paidAmount).toFixed(2)}\n`, 'ascii'),
        Buffer.from(`CHANGE: ₱${parseFloat(change).toFixed(2)}\n`, 'ascii'),
        Buffer.from(`CASHIER: ${cashierName}\n`, 'ascii'),
        Buffer.from(`SESSION: #${sessionId}\n`, 'ascii'),
        Buffer.from(`TXN ID: #${transactionId}\n`, 'ascii'),
        
        // Discounts section
        Buffer.from('DISCOUNTS:\n', 'ascii'),
        ...(discounts && discounts.length > 0 
          ? discounts.map(discount => 
              Buffer.from(`${discount.discount_name}: ${discount.discount_value_type === 'percentage' ? `${discount.discount_value}%` : `₱${discount.discount_value}`}\n`, 'ascii')
            )
          : [Buffer.from('None\n', 'ascii')]
        ),
        
        // Separator
        Buffer.from('----------------------------------------\n', 'ascii'),
        
        // Footer (center align)
        Buffer.from([0x1B, 0x61, 0x01]),   // center align
        Buffer.from('Thank you!\n', 'ascii'),
        Buffer.from('\n\n', 'ascii'),
        
        // Feed and cut
        Buffer.from([0x1B, 0x64, 0x03]),   // feed 3 lines
        Buffer.from([0x1D, 0x56, 0x00])    // full cut
      ]);
      
      this.printRaw(receiptBuffer);
      
      console.log('✅ Transaction tickets printing completed');
      
    } catch (error) {
      console.error('❌ Error printing transaction tickets:', error);
    }
  }

  // -------------------------
  // Open Cash Receipt
  // -------------------------
  printOpenCashReceipt(cashierName, cashOnHand, sessionId) {
    const buffer = Buffer.concat([
      Buffer.from([0x1B, 0x40]),         // init
      Buffer.from([0x1B, 0x61, 0x01]),   // center align
      
      // Header - Bold and Double Size
      Buffer.from([0x1B, 0x45, 0x01]),   // bold ON
      Buffer.from([0x1D, 0x21, 0x11]),   // double width + height
      Buffer.from('OPEN CASH RECEIPT\n', 'ascii'),
      Buffer.from([0x1B, 0x45, 0x00]),   // bold OFF
      Buffer.from([0x1D, 0x21, 0x00]),   // normal size
      Buffer.from('\n', 'ascii'),
      
      // Cashier name
      Buffer.from(`Cashier: ${cashierName}\n`, 'ascii'),
      Buffer.from('\n', 'ascii'),
      
      // Date and time
      Buffer.from(`Date: ${new Date().toLocaleString()}\n`, 'ascii'),
      Buffer.from('\n', 'ascii'),
      
      // Cash on Hand
      Buffer.from(`Cash on Hand: ₱${parseFloat(cashOnHand).toFixed(2)}\n`, 'ascii'),
      Buffer.from('\n', 'ascii'),
      
      // Session ID
      Buffer.from(`Session ID: #${sessionId}\n`, 'ascii'),
      Buffer.from('\n', 'ascii'),
      
      // Separator
      Buffer.from('----------------------------------------\n', 'ascii'),
      
      // End of Receipt
      Buffer.from('--- End of Receipt ---\n', 'ascii'),
      Buffer.from('\n\n', 'ascii'),
      
      // Feed and cut
      Buffer.from([0x1B, 0x64, 0x03]),   // feed 3 lines
      Buffer.from([0x1D, 0x56, 0x00])    // full cut
    ]);
    
    this.printRaw(buffer);
    console.log(`🖨️ Printing Open Cash Receipt - Cashier: ${cashierName}, Amount: ₱${cashOnHand}, Session: #${sessionId}`);
  }

  // -------------------------
  // Close Cash Receipt
  // -------------------------
  printCloseCashReceipt(cashierName, sessionId, openingCash, closingCash, dailyTransactions, dailyTotal) {
    const buffer = Buffer.concat([
      Buffer.from([0x1B, 0x40]),         // init
      Buffer.from([0x1B, 0x61, 0x01]),   // center align
      
      // Header - Bold and Double Size
      Buffer.from([0x1B, 0x45, 0x01]),   // bold ON
      Buffer.from([0x1D, 0x21, 0x11]),   // double width + height
      Buffer.from('CLOSE CASH REPORT\n', 'ascii'),
      Buffer.from([0x1B, 0x45, 0x00]),   // bold OFF
      Buffer.from([0x1D, 0x21, 0x00]),   // normal size
      Buffer.from('\n', 'ascii'),
      
      // Separator line (matching actual print - equal signs)
      Buffer.from('==============================\n', 'ascii'),
      
      // Date and time
      Buffer.from(`Date: ${new Date().toLocaleString()}\n`, 'ascii'),
      Buffer.from(`Cashier: ${cashierName}\n`, 'ascii'),
      Buffer.from(`Session: #${sessionId}\n`, 'ascii'),
      Buffer.from('==============================\n', 'ascii'),
      Buffer.from('------------------------------\n', 'ascii'),
      
      // Daily Transactions Section
      Buffer.from([0x1B, 0x61, 0x01]),   // center align
      Buffer.from('*** DAILY TRANSACTIONS ***\n', 'ascii'),
      Buffer.from([0x1B, 0x61, 0x00]),   // left align
      Buffer.from('\n', 'ascii'),
      
      // Print each transaction (matching actual print format)
      ...dailyTransactions.map((transaction, idx) => [
        Buffer.from(`Transaction #${transaction.id}\n`, 'ascii'),
        Buffer.from(`Time: ${new Date(transaction.created_at).toLocaleTimeString()}\n`, 'ascii'),
        Buffer.from(`${transaction.rate?.name || 'N/A'}                    x${transaction.quantity}\n`, 'ascii'),
        ...(transaction.discounts?.length > 0 
          ? transaction.discounts.map(discount => 
              Buffer.from(`- ${discount.discount_name}               ₱${discount.discount_value_type === 'percentage' ? `${discount.discount_value}%` : `${discount.discount_value}`}\n`, 'ascii')
            )
          : []
        ),
        Buffer.from(`Total:                        ₱${parseFloat(transaction.total).toFixed(2)}\n`, 'ascii'),
        ...(idx < dailyTransactions.length - 1 ? [Buffer.from('--------------------------------\n', 'ascii')] : [])
      ]).flat(),
      
      // Summary Section
      Buffer.from([0x1B, 0x61, 0x01]),   // center align
      Buffer.from('*** SUMMARY ***\n', 'ascii'),
      Buffer.from([0x1B, 0x61, 0x00]),   // left align
      Buffer.from('\n', 'ascii'),
      
      Buffer.from(`Opening Cash:                 ₱${parseFloat(openingCash).toFixed(2)}\n`, 'ascii'),
      Buffer.from(`Total Transactions:            ${dailyTransactions.length}\n`, 'ascii'),
      Buffer.from(`Total Sales:                  ₱${parseFloat(dailyTotal).toFixed(2)}\n`, 'ascii'),
      Buffer.from(`Closing Cash:                 ₱${parseFloat(closingCash).toFixed(2)}\n`, 'ascii'),
      Buffer.from('--------------------------------\n', 'ascii'),
      
      // End of Report
      Buffer.from([0x1B, 0x61, 0x01]),   // center align
      Buffer.from('--- End of Report ---\n', 'ascii'),
      Buffer.from('\n\n', 'ascii'),
      
      // Feed and cut
      Buffer.from([0x1B, 0x64, 0x03]),   // feed 3 lines
      Buffer.from([0x1D, 0x56, 0x00])    // full cut
    ]);
    
    this.printRaw(buffer);
    console.log(`🖨️ Printing Close Cash Report - Cashier: ${cashierName}, Session: #${sessionId}, Closing Cash: ₱${closingCash}`);
  }

  // -------------------------
  // Close Cash Sample (like receipt sample)
  // -------------------------
  printCloseCashSample() {
    console.log('🖨️ Printing close cash sample...');
    
    const buffer = Buffer.concat([
      Buffer.from([0x1B, 0x40]),         // init
      Buffer.from([0x1B, 0x61, 0x01]),   // center align
      
      // Header - Bold and Double Size
      Buffer.from([0x1B, 0x45, 0x01]),   // bold ON
      Buffer.from([0x1D, 0x21, 0x11]),   // double width + height
      Buffer.from('CLOSE CASH REPORT\n', 'ascii'),
      Buffer.from([0x1B, 0x45, 0x00]),   // bold OFF
      Buffer.from([0x1D, 0x21, 0x00]),   // normal size
      Buffer.from('\n', 'ascii'),
      
      // Separator line (matching actual print - equal signs)
      Buffer.from('==============================\n', 'ascii'),
      
      // Date and time
      Buffer.from(`Date: ${new Date().toLocaleString()}\n`, 'ascii'),
      Buffer.from(`Cashier: sales\n`, 'ascii'),
      Buffer.from(`Session: #23\n`, 'ascii'),
      Buffer.from('==============================\n', 'ascii'),
      Buffer.from('------------------------------\n', 'ascii'),
      
      // Daily Transactions Section
      Buffer.from([0x1B, 0x61, 0x01]),   // center align
      Buffer.from('*** DAILY TRANSACTIONS ***\n', 'ascii'),
      Buffer.from([0x1B, 0x61, 0x00]),   // left align
      Buffer.from('\n', 'ascii'),
      
      // Sample transaction 1 (matching actual print)
      Buffer.from(`Transaction #164\n`, 'ascii'),
      Buffer.from(`Time: 11:34:43 PM\n`, 'ascii'),
      Buffer.from(`VIP Ticket                    x2\n`, 'ascii'),
      Buffer.from(`- VIP Discount                ₱25.00\n`, 'ascii'),
      Buffer.from(`Total:                        ₱475.00\n`, 'ascii'),
      Buffer.from('--------------------------------\n', 'ascii'),
      
      // Sample transaction 2 (matching actual print)
      Buffer.from(`Transaction #165\n`, 'ascii'),
      Buffer.from(`Time: 11:35:12 PM\n`, 'ascii'),
      Buffer.from(`Regular Ticket                x4\n`, 'ascii'),
      Buffer.from(`- Senior Discount             ₱30.00\n`, 'ascii'),
      Buffer.from(`Total:                        ₱370.00\n`, 'ascii'),
      Buffer.from('--------------------------------\n', 'ascii'),
      
      // Summary Section
      Buffer.from([0x1B, 0x61, 0x01]),   // center align
      Buffer.from('*** SUMMARY ***\n', 'ascii'),
      Buffer.from([0x1B, 0x61, 0x00]),   // left align
      Buffer.from('\n', 'ascii'),
      
      Buffer.from(`Opening Cash:                 ₱2,000.00\n`, 'ascii'),
      Buffer.from(`Total Transactions:           2\n`, 'ascii'),
      Buffer.from(`Total Sales:                  ₱845.00\n`, 'ascii'),
      Buffer.from(`Closing Cash:                 ₱6,000.00\n`, 'ascii'),
      Buffer.from('--------------------------------\n', 'ascii'),
      
      // End of Report
      Buffer.from([0x1B, 0x61, 0x01]),   // center align
      Buffer.from('--- End of Report ---\n', 'ascii'),
      Buffer.from('\n\n', 'ascii'),
      
      // Feed and cut
      Buffer.from([0x1B, 0x64, 0x03]),   // feed 3 lines
      Buffer.from([0x1D, 0x56, 0x00])    // full cut
    ]);
    
    this.printRaw(buffer);
    console.log('✅ Close cash sample printed successfully');
  }

  // -------------------------
  // Final cut command
  // -------------------------
  printCut() {
    const buffer = Buffer.concat([
      Buffer.from([0x1B, 0x64, 0x03]),   // feed 3 lines
      Buffer.from([0x1D, 0x56, 0x00])    // full cut
    ]);
    this.printRaw(buffer);
  }

  // -------------------------
  // Simple test
  // -------------------------
  printTest() {
    this.printText('Hello from Star BSC10 Printer!\n');
    this.printText('Test completed successfully.\n\n');
  }
}

// -------------------------
// Command line interface
// -------------------------
const printer = new StarBSC10Printer();
const command = process.argv[2];
const data = process.argv[3] || '';

switch (command) {
  case 'test':
    printer.printTest();
    break;
  case 'bold':
    printer.printBoldText(data || 'HELLO BIG WORLD');
    break;
  case 'qr':
    printer.printQRCode(data || 'TEST123');
    break;
  case 'qrimg':
    printer.printQRCodeAsImage(data || 'TEST123');
    break;
  case 'qrreceipt':
    printer.printSingleQRReceipt(data || 'TEST123', 1);
    break;
  case 'multiqr':
    const qrDataArray = data ? data.split(',') : ['TEST1', 'TEST2', 'TEST3'];
    printer.printMultipleQRCodes(qrDataArray);
    break;
  case 'receipt':
    printer.printReceiptSample();
    break;
  case 'opencash':
    const openCashData = data ? data.split(',') : ['sales', '5000.00', '16'];
    printer.printOpenCashReceipt(openCashData[0], openCashData[1], openCashData[2]);
    break;
  case 'closecash':
    // For close cash, we need to pass JSON data with all the details
    try {
      let closeCashData;
      
      // If no data provided, use sample data
      if (!data || data.trim() === '') {
        printer.printCloseCashSample();
        break;
      }
      
      // Check if data is a file path
      if (data.endsWith('.json')) {
        const fs = await import('fs');
        const fileData = fs.readFileSync(data, 'utf8');
        closeCashData = JSON.parse(fileData);
      } else {
        closeCashData = JSON.parse(data);
      }
      
      printer.printCloseCashReceipt(
        closeCashData.cashierName,
        closeCashData.sessionId,
        closeCashData.openingCash,
        closeCashData.closingCash,
        closeCashData.dailyTransactions,
        closeCashData.dailyTotal
      );
    } catch (error) {
      console.error('❌ Error parsing close cash data:', error);
      console.log('📄 Expected format: JSON with cashierName, sessionId, openingCash, closingCash, dailyTransactions, dailyTotal');
    }
    break;
  case 'transaction':
    // Reconstruct the JSON from the remaining arguments
    const jsonData = process.argv.slice(3).join(' ');
    console.log('📄 Raw JSON data received:', jsonData);
    
    // Try to fix common JSON issues
    let fixedJson = jsonData;
    
    // Add quotes around property names if missing
    fixedJson = fixedJson.replace(/(\w+):/g, '"$1":');
    
    // Add quotes around string values if missing
    fixedJson = fixedJson.replace(/:\s*([^",\{\}\[\]\d][^,\{\}\[\]]*[^",\{\}\[\]\d\s])/g, ':"$1"');
    
    console.log('📄 Fixed JSON data:', fixedJson);
    
    try {
      printer.printTransactionTickets(fixedJson);
    } catch (error) {
      console.error('❌ Error in transaction printing:', error);
    }
    break;
  case 'transactionfile':
    // Read JSON from file
    const jsonFilePath = process.argv[3];
    console.log('📄 Reading JSON from file:', jsonFilePath);
    
    try {
      const fileContent = fs.readFileSync(jsonFilePath, 'utf8');
      console.log('📄 File content:', fileContent);
      printer.printTransactionTickets(fileContent);
      
      // Clean up temp file
      try { fs.unlinkSync(jsonFilePath); } catch {}
    } catch (error) {
      console.error('❌ Error reading transaction file:', error);
    }
    break;
  default:
    console.log('Usage:');
    console.log('  node star-final-printer.js test');
    console.log('  node star-final-printer.js bold "YOUR TEXT"');
    console.log('  node star-final-printer.js qr "YOUR DATA"');
    console.log('  node star-final-printer.js qrimg "YOUR DATA"');
    console.log('  node star-final-printer.js qrreceipt "YOUR DATA"');
    console.log('  node star-final-printer.js multiqr "DATA1,DATA2,DATA3"');
    console.log('  node star-final-printer.js receipt');
    console.log('  node star-final-printer.js closecash "JSON_CLOSE_CASH_DATA"');
    console.log('  node star-final-printer.js opencash "CASHIER_NAME,AMOUNT,SESSION_ID"');
    console.log('  node star-final-printer.js transaction "JSON_TRANSACTION_DATA"');
    console.log('  node star-final-printer.js transactionfile "JSON_FILE_PATH"');
    break;
}
