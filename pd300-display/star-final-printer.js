#!/usr/bin/env node

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import QRCode from 'qrcode';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class StarBSC10Printer {
  constructor() {
    this.printerName = 'StarBSC10';
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
  default:
    console.log('Usage:');
    console.log('  node star-final-printer.js test');
    console.log('  node star-final-printer.js bold "YOUR TEXT"');
    console.log('  node star-final-printer.js qr "YOUR DATA"');
    console.log('  node star-final-printer.js qrimg "YOUR DATA"');
    console.log('  node star-final-printer.js qrreceipt "YOUR DATA"');
    console.log('  node star-final-printer.js multiqr "DATA1,DATA2,DATA3"');
    console.log('  node star-final-printer.js receipt');
    break;
}
