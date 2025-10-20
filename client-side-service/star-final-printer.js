#!/usr/bin/env node

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import QRCode from 'qrcode';
import { printerDetector } from './printer-detector.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class StarBSC10Printer {
  constructor() {
    this.printerName = 'Star BSC10';
    this.detector = printerDetector;
    this.workingPort = null;
    console.log('🔍 Creating Final Star BSC10 Printer (RAW mode)...');
    
    // Initialize printer detection
    this.initializePrinter();
  }

  /**
   * Initialize printer detection
   */
  async initializePrinter() {
    try {
      const result = await this.detector.initialize();
      if (result.success) {
        this.workingPort = result.port;
        console.log(`✅ Printer initialized on port: ${this.workingPort}`);
      } else {
        console.log(`⚠️ Printer detection failed: ${result.message}`);
        this.workingPort = null; // Reset port if detection failed
      }
    } catch (error) {
      console.log(`⚠️ Printer initialization error: ${error.message}`);
      this.workingPort = null; // Reset port on error
    }
  }

  /**
   * Force re-detection of printer port
   */
  async redetectPrinter() {
    console.log('🔄 Re-detecting printer port...');
    this.workingPort = null; // Clear current port
    await this.initializePrinter();
    return this.workingPort;
  }

  // -------------------------
  // RAW ESC/POS printing (for bold text, formatting)
  // -------------------------
  async printRaw(buffer) {
    console.log(`🖨️ Sending RAW data to printer: ${this.printerName}`);
    console.log(`📊 Buffer size: ${buffer.length} bytes`);
    console.log(`📊 Buffer preview: ${buffer.toString('hex').substring(0, 32)}...`);
    
    try {
      // Convert ESC/POS buffer to readable text for printing
      console.log('🔄 Converting ESC/POS to text format...');
      
      // Extract text content from the buffer (skip ESC/POS commands)
      let textContent = '';
      let i = 0;
      
      while (i < buffer.length) {
        const byte = buffer[i];
        
        // Skip ESC/POS commands and extract printable text
        if (byte >= 0x20 && byte <= 0x7E) {
          // Printable ASCII character
          textContent += String.fromCharCode(byte);
        } else if (byte === 0x0A) {
          // Line feed
          textContent += '\n';
        } else if (byte === 0x0D) {
          // Carriage return
          textContent += '\r';
        }
        // Skip other control characters
        
        i++;
      }
      
      // If we found text content, print it
      if (textContent.trim()) {
        console.log(`📝 Extracted text: ${textContent.substring(0, 100)}...`);
        
        const textFile = path.join(__dirname, 'extracted_text.txt');
        fs.writeFileSync(textFile, textContent, 'utf8');
        
        const psCmd = `powershell -Command "Get-Content '${textFile}' -Raw | Out-Printer -Name '${this.printerName}'"`;
        console.log(`📤 Executing: ${psCmd}`);
        
        const textSuccess = await new Promise((resolve) => {
          exec(psCmd, (error, stdout, stderr) => {
            if (error) {
              console.log(`❌ Text print failed: ${error.message}`);
              resolve(false);
            } else {
              console.log(`✅ Text sent to printer successfully`);
              resolve(true);
            }
          });
        });
        
        // Clean up
        try { fs.unlinkSync(textFile); } catch {}
        
        if (textSuccess) {
          console.log('🎯 Print job completed successfully!');
          return; // Success!
        }
      }
      
      // Fallback: Try direct USB method
      console.log('🔄 Fallback: Trying direct USB method...');
      const tempFile = path.join(__dirname, 'raw_print.bin');
      fs.writeFileSync(tempFile, buffer, 'binary');
      
      const directCmd = `copy /B "${tempFile}" "USB001"`;
      console.log(`📤 Executing: ${directCmd}`);
      
      const usbSuccess = await new Promise((resolve) => {
        exec(directCmd, (error, stdout, stderr) => {
          if (error) {
            console.log(`❌ Direct USB failed: ${error.message}`);
            resolve(false);
          } else {
            console.log(`✅ Raw data sent to printer via USB001`);
            resolve(true);
          }
        });
      });
      
      // Clean up
      try { fs.unlinkSync(tempFile); } catch {}
      
      if (usbSuccess) {
        console.log('🎯 Print job completed successfully!');
        return; // Success!
      }
      
      // Final fallback
      console.log('🔄 Final fallback: Trying other methods...');
      await this.printRawFallback(buffer);
      
    } catch (error) {
      console.error('❌ All print methods failed:', error.message);
      console.error('📱 Full error:', error);
      // Try one more time with fallback
      await this.printRawFallback(buffer);
    }
  }

  /**
   * Fallback printing method - tries PowerShell first, then USB ports
   */
  async printRawFallback(buffer) {
    const tempFile = path.join(__dirname, 'raw_print.bin');
    fs.writeFileSync(tempFile, buffer, 'binary');
    
    console.log('🔄 Trying PowerShell printing first...');
    
    // Try PowerShell first (like printText does)
    const psCmd = `powershell -Command "Get-Content '${tempFile}' -Raw -Encoding Byte | ForEach-Object { [System.Console]::OpenStandardOutput().Write([byte]$_); } | Out-Printer -Name '${this.printerName}'"`;
    
    const psSuccess = await new Promise((resolve) => {
      exec(psCmd, (error, stdout, stderr) => {
        if (error) {
          console.log(`⚠️ PowerShell print failed: ${error.message}`);
          resolve(false);
        } else {
          console.log(`✅ Raw data sent to printer via PowerShell`);
          resolve(true);
        }
      });
    });
    
    if (psSuccess) {
      try { fs.unlinkSync(tempFile); } catch {}
      return;
    }
    
    console.log('🔄 PowerShell failed, trying direct USB ports...');
    
    // Try all possible USB ports
    const allPorts = ['USB001', 'USB002', 'USB003', 'USB004', 'USB005', 'USB006', 'USB007', 'USB008'];
    
    for (const port of allPorts) {
      try {
        const directCmd = `copy /B "${tempFile}" "${port}"`;
        console.log(`🔄 Testing port: ${port}`);
        
        const success = await new Promise((resolve) => {
          exec(directCmd, (error, stdout, stderr) => {
            if (!error) {
              console.log(`✅ SUCCESS! Printer found on port: ${port}`);
              console.log(`📱 Output: ${stdout}`);
              resolve(true);
            } else {
              console.log(`❌ Port ${port} failed: ${error.message}`);
              resolve(false);
            }
          });
        });
        
        if (success) {
          // Update the working port for future use
          this.workingPort = port;
          console.log(`🎯 Updated working port to: ${port}`);
          
          // Clean up temp file
          try { fs.unlinkSync(tempFile); } catch {}
          return;
        }
        
      } catch (error) {
        console.log(`❌ Port ${port} error: ${error.message}`);
      }
    }
    
    // Final fallback: try printer share
    console.log('🔄 Trying printer share as last resort...');
    const shareCmd = `copy /B "${tempFile}" "\\\\localhost\\${this.printerName}"`;
    
    return new Promise((resolve) => {
      exec(shareCmd, (error, stdout, stderr) => {
        if (error) {
          console.error('❌ All print methods failed:', error.message);
          console.error('💡 Check printer connection and USB port');
          console.error('💡 Try moving printer to different USB port');
          resolve(false);
        } else {
          console.log('✅ Raw data sent to printer via share');
          resolve(true);
        }
        // Clean up temp file
        try { fs.unlinkSync(tempFile); } catch {}
      });
    });
  }

  // -------------------------
  // Plain text printing
  // -------------------------
  printText(text) {
    const tempFile = path.join(__dirname, 'text_print.txt');
    fs.writeFileSync(tempFile, text, 'utf8');
    
    // Try PowerShell first, then fallback to direct USB
    const psCmd = `powershell -Command "Get-Content '${tempFile}' -Raw | Out-Printer -Name '${this.printerName}'"`;
    const directCmd = `copy /B "${tempFile}" "USB001"`;
    
    console.log(`🖨️ Printing text: ${text.substring(0, 50)}...`);
    
    exec(psCmd, (error) => {
      if (error) {
        console.log(`⚠️ PowerShell print failed, trying direct USB...`);
        // Fallback to direct USB
        exec(directCmd, (error2) => {
          if (error2) {
            console.error('❌ Both PowerShell and direct USB print failed:', error2.message);
            console.error('💡 Check printer connection and sharing settings');
          } else {
            console.log('✅ Text sent to printer via direct USB');
          }
          try { fs.unlinkSync(tempFile); } catch {}
        });
      } else {
        console.log('✅ Text sent to printer via PowerShell');
        try { fs.unlinkSync(tempFile); } catch {}
      }
    });
  }

  // -------------------------
  // Bold text with ESC/POS commands
  // -------------------------
  async printBoldText(text) {
    console.log(`🖨️ Printing printBoldText King`);

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
    await this.printRaw(buffer);
  }

  // -------------------------
  // QR code using ESC/POS commands (bigger size)
  // -------------------------
  async printQRCode(data) {
    console.log(`🖨️ Printing printQRCode King`);
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
    
    await this.printRaw(buffer);
    console.log(`🖨️ Printing QR code (size 10): ${data}`);
  }

  // -------------------------
  // QR code as IMAGE (fixed square aspect ratio)
  // -------------------------
  async printQRCodeAsImage(data) {
    console.log(`🖨️ Printing printQRCodeAsImage King`);
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
    await this.printQRCode(qrData);
    
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
    await this.printRaw(buffer);
    
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
      await this.printRaw(buffer);
      
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
      await this.printQRCode(data);
      
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
    console.log(`🖨️ Printing printTransactionTickets King`);
    console.log('🖨️ Printing transaction tickets...');
    console.log('📄 Received data:', transactionData);
    
    try {
      // Parse transaction data - handle both string and object
      let data;
      if (typeof transactionData === 'string') {
        console.log('📄 Parsing JSON string...');
        data = JSON.parse(transactionData);
      } else {
        console.log('📄 Using object directly...');
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
        await this.printQRCode(qrCode);
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
        
        await this.printRaw(ticketBuffer);
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
      
      await this.printRaw(receiptBuffer);
      
      console.log('✅ Transaction tickets printing completed');
      
    } catch (error) {
      console.error('❌ Error printing transaction tickets:', error);
      console.error('📄 Raw transaction data that failed:', transactionData);
      console.error('📄 Data type:', typeof transactionData);
      console.error('📄 Data length:', transactionData ? transactionData.length : 'N/A');
      
      // Try to identify the JSON issue
      if (typeof transactionData === 'string') {
        try {
          // Try to find the problematic character
          const lines = transactionData.split('\n');
          lines.forEach((line, index) => {
            if (line.length > 250) {
              console.error(`📄 Long line ${index + 1}:`, line.substring(250, 270));
            }
          });
        } catch (e) {
          console.error('📄 Could not analyze JSON structure');
        }
      }
    }
  }

  // -------------------------
  // Open Cash Receipt
  // -------------------------
  async printOpenCashReceipt(cashierName, cashOnHand, sessionId) {
    console.log(`🖨️ Printing printOpenCashReceipt King`);
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
    
    await this.printRaw(buffer);
    console.log(`🖨️ Printing Open Cash Receipt - Cashier: ${cashierName}, Amount: ₱${cashOnHand}, Session: #${sessionId}`);
  }

  // -------------------------
  // Close Cash Receipt
  // -------------------------
  async printCloseCashReceipt(cashierName, sessionId, openingCash, closingCash, dailyTransactions, dailyTotal) {
    console.log(`🖨️ Printing printCloseCashReceipt King`);
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
    
    await this.printRaw(buffer);
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
