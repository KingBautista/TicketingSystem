#!/usr/bin/env node

import { exec } from 'child_process';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import QRCode from 'qrcode';
import { printerDetector } from './printer-detector.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class StarBSC10Printer {
  constructor(options = {}) {
    this.printerName = options.printerName || 'StarBSC10';
    this.detector = printerDetector;
    this.workingPort = null;
    this.tempFiles = new Set();
    this.esc80mmCommand = Buffer.from([0x1D, 0x57, 128, 2]); // GS W nL nH -> ~640 dots (~80mm @ ~8dots/mm)
    console.log('🔍 Creating Final Star BSC10 Printer (RAW mode + image QR)...');
    
    // Initialize printer detection
    this.initializePrinter().catch(err => {
      console.warn('⚠️ initializePrinter failed:', err?.message || err);
    });
  }

  async initializePrinter() {
    try {
      if (!this.detector || !this.detector.initialize) {
        console.log('⚠️ No printer detector available, skipping auto-detect');
        return { success: false, message: 'no-detector' };
      }
      const result = await this.detector.initialize();
      if (result.success) {
        this.workingPort = result.port;
        console.log(`✅ Printer initialized on port: ${this.workingPort}`);
        return { success: true, port: this.workingPort };
      } else {
        console.log(`⚠️ Printer detection failed: ${result.message}`);
        this.workingPort = null;
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.log(`⚠️ Printer initialization error: ${error.message}`);
      this.workingPort = null;
      return { success: false, message: error.message };
    }
  }

  async redetectPrinter() {
    console.log('🔄 Re-detecting printer port...');
    this.workingPort = null;
    return (await this.initializePrinter()).port || null;
  }

  // Utility to create a temp file path and remember it for cleanup
  _tempPath(filename) {
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}-${filename}`;
    const p = path.join(__dirname, name);
    this.tempFiles.add(p);
    return p;
  }

  // Cleanup tracked temp files (best-effort)
  async _cleanupTemp(filePath) {
    try {
      if (filePath) {
        await fsPromises.unlink(filePath).catch(() => {});
        this.tempFiles.delete(filePath);
      }
    } catch (e) {}
  }

  // -------------------------
  // Low-level raw printing
  // -------------------------
  async printRaw(buffer) {
    console.log(`🖨️ printRaw invoked — buffer ${buffer.length} bytes`);

    // Use the old working method: copy /B to printer share
    const tempFile = this._tempPath('raw_print.bin');
    try {
      await fsPromises.writeFile(tempFile, buffer, { encoding: 'binary' });
      
      // Use copy /B to send raw binary to printer share (like the old working method)
      const cmd = `copy /B "${tempFile}" "\\\\localhost\\${this.printerName}"`;
      
      console.log(`🖨️ Sending RAW data to printer: ${this.printerName}`);
      const result = await new Promise((resolve) => {
        exec(cmd, (error, stdout, stderr) => {
          if (error) {
            console.error('❌ Raw print error:', error.message);
            resolve(false);
          } else {
            console.log('✅ Raw data sent to printer');
            resolve(true);
          }
          // Clean up temp file
          try { fs.unlinkSync(tempFile); } catch {}
        });
      });

      return result;
    } catch (error) {
      console.error('❌ Error in printRaw:', error);
      try { await this._cleanupTemp(tempFile); } catch {}
      return false;
    }
  }

  // -------------------------
  // Print text using Out-Printer (primary) and fallback to USB copy
  // -------------------------
  async printText(text) {
    const tempFile = this._tempPath('text_print.txt');
    await fsPromises.writeFile(tempFile, text, 'utf8');

    // PowerShell direct text printing with better formatting
    const psPath = this._tempPath('print_text.ps1');
    const psScript = `
      Add-Type -AssemblyName System.Drawing
      Add-Type -AssemblyName System.Windows.Forms

      $printer = "${this.printerName}"
      $text = Get-Content -Path "${tempFile}" -Raw

      $doc = New-Object System.Drawing.Printing.PrintDocument
      $doc.PrinterSettings.PrinterName = $printer
      $doc.PrintController = New-Object System.Drawing.Printing.StandardPrintController

      # Use a monospace font for better formatting
      $font = New-Object System.Drawing.Font("Courier New", 8, [System.Drawing.FontStyle]::Regular)

      $doc.add_PrintPage({
        param($sender, $e)
        # Set small margins for 80mm thermal paper (hundredths of an inch)
        $e.PageSettings.Margins.Left = 5
        $e.PageSettings.Margins.Right = 5
        $e.PageSettings.Margins.Top = 5
        $e.PageSettings.Margins.Bottom = 5
        
        $bounds = $e.MarginBounds
        
        # Centered text formatting
        $sf = New-Object System.Drawing.StringFormat
        $sf.Alignment = [System.Drawing.StringAlignment]::Center
        $sf.LineAlignment = [System.Drawing.StringAlignment]::Near
        
        # Choose a monospace font size to fit 48 columns across the printable width
        $fontSize = 8
        $workingFont = New-Object System.Drawing.Font("Courier New", $fontSize, [System.Drawing.FontStyle]::Regular)
        try {
          while (($e.Graphics.MeasureString(("W" * 48), $workingFont).Width -gt $bounds.Width) -and ($fontSize -gt 6)) {
            $workingFont.Dispose()
            $fontSize--
            $workingFont = New-Object System.Drawing.Font("Courier New", $fontSize, [System.Drawing.FontStyle]::Regular)
          }
        } catch {}
        
        $y = $bounds.Y
        $lineHeight = [int]$workingFont.GetHeight($e.Graphics)
        
        # Split text into lines and handle each line appropriately
        $lines = $text -split [Environment]::NewLine
        foreach ($line in $lines) {
          # Handle different line types
          if ($line.Trim() -eq "") {
            # Empty line - just add spacing
            $y += $lineHeight
          } elseif ($line.Trim() -eq "OPEN CASH RECEIPT" -or $line.Trim() -eq "--- End of Receipt ---") {
            # Center these specific lines
            $centerFormat = New-Object System.Drawing.StringFormat
            $centerFormat.Alignment = [System.Drawing.StringAlignment]::Center
            $centerFormat.LineAlignment = [System.Drawing.StringAlignment]::Near
            $rect = New-Object System.Drawing.RectangleF($bounds.X, $y, $bounds.Width, $lineHeight)
            $e.Graphics.DrawString($line.Trim(), $workingFont, [System.Drawing.Brushes]::Black, $rect, $centerFormat)
            $y += $lineHeight
          } elseif ($line.Contains("Cash on Hand:")) {
            # Bold the amount for cash on hand
            $boldFont = New-Object System.Drawing.Font("Courier New", $fontSize, [System.Drawing.FontStyle]::Bold)
            $leftFormat = New-Object System.Drawing.StringFormat
            $leftFormat.Alignment = [System.Drawing.StringAlignment]::Near
            $leftFormat.LineAlignment = [System.Drawing.StringAlignment]::Near
            $rect = New-Object System.Drawing.RectangleF($bounds.X, $y, $bounds.Width, $lineHeight)
            $e.Graphics.DrawString($line, $boldFont, [System.Drawing.Brushes]::Black, $rect, $leftFormat)
            $boldFont.Dispose()
            $y += $lineHeight
          } else {
            # Regular left-aligned text
            $leftFormat = New-Object System.Drawing.StringFormat
            $leftFormat.Alignment = [System.Drawing.StringAlignment]::Near
            $leftFormat.LineAlignment = [System.Drawing.StringAlignment]::Near
            $rect = New-Object System.Drawing.RectangleF($bounds.X, $y, $bounds.Width, $lineHeight)
            $e.Graphics.DrawString($line, $workingFont, [System.Drawing.Brushes]::Black, $rect, $leftFormat)
            $y += $lineHeight
          }
        }
      })

      try {
        $doc.Print()
      } catch {
        Write-Error $_.Exception.Message
        exit 1
      }`;
    await fsPromises.writeFile(psPath, psScript, 'utf8');

    const cmd = `powershell -ExecutionPolicy Bypass -File "${psPath}"`;
    console.log('🖨️ Sending formatted text to printer via PowerShell...');
    const success = await new Promise((resolve) => {
      exec(cmd, { windowsHide: true }, async (error, stdout, stderr) => {
      if (error) {
          console.log('⚠️ PowerShell text print failed:', error?.message || stderr);
          resolve(false);
          } else {
          console.log('✅ PowerShell text print succeeded');
          resolve(true);
        }
        // cleanup
        try { await fsPromises.unlink(tempFile); } catch {}
        try { await fsPromises.unlink(psPath); } catch {}
      });
    });

    if (success) return true;

    // Fallback: USB direct copy (first USB001)
    const fallback = `copy /B "${tempFile}" "USB001"`;
    return new Promise((resolve) => {
      exec(fallback, { windowsHide: true }, async (error) => {
        try { await fsPromises.unlink(tempFile); } catch {}
      if (error) {
          console.error('❌ USB direct text copy failed:', error.message);
          resolve(false);
      } else {
          console.log('✅ USB direct text copy succeeded');
          resolve(true);
      }
        });
    });
  }

  // -------------------------
  // Print bold text (ESC/POS)
  // -------------------------
  async printBoldText(text) {
    console.log('🖨️ printBoldText:', text);
    const buffer = Buffer.concat([
      Buffer.from([0x1B, 0x40]),         // init
      this.esc80mmCommand,
      Buffer.from([0x1B, 0x61, 0x00]),   // left align
      Buffer.from([0x1B, 0x45, 0x01]),   // bold ON
      Buffer.from([0x1D, 0x21, 0x11]),   // double width + height
      Buffer.from(text + '\n', 'ascii'),
      Buffer.from([0x1B, 0x45, 0x00]),   // bold OFF
      Buffer.from([0x1D, 0x21, 0x00]),   // normal size
      Buffer.from([0x1B, 0x64, 0x02])    // feed 2 lines
    ]);
    return await this.printRaw(buffer);
  }

  // -------------------------
  // QR code as IMAGE (preferred)
  // -------------------------
  async printQRCodeAsImage(data, opts = {}) {
    console.log('🖨️ printQRCodeAsImage:', data);
    const tempImage = this._tempPath('qr.png');
    const qrSize = opts.size || 20; // pixels, very small for thermal printer
    try {
      await QRCode.toFile(tempImage, data, {
      type: 'png', 
        margin: 2,
        width: qrSize,
        color: { dark: '#000000', light: '#FFFFFF' }
      });

      // create PS1 script to print image centered and scaled to 80mm width
      const psPath = this._tempPath('print_qr.ps1');
      const safeImg = tempImage.replace(/'/g, "''");
      const psScript = `
        Add-Type -AssemblyName System.Drawing
          Add-Type -AssemblyName System.Windows.Forms
          $printer = "${this.printerName}"
          $imagePath = "${safeImg}"

          $image = [System.Drawing.Image]::FromFile($imagePath)
          $doc = New-Object System.Drawing.Printing.PrintDocument
          $doc.PrinterSettings.PrinterName = $printer
          $doc.PrintController = New-Object System.Drawing.Printing.StandardPrintController

          $doc.add_PrintPage({
          param($sender, $e)
            try {
              # convert 20mm to inches (tiny QR code for 80mm paper)
              $pageWidthInches = 20 / 25.4
              $dpiX = $e.Graphics.DpiX
              $destWidth = [int]($dpiX * $pageWidthInches)
              # keep square QR
              $destHeight = $destWidth

              # center horizontally
              $pageBounds = $e.PageBounds
              $x = [int](($pageBounds.Width - $destWidth) / 2)
              $y = 10

              $e.Graphics.DrawImage($image, $x, $y, $destWidth, $destHeight)
            } catch {
              Write-Error $_.Exception.Message
              exit 1
            }
          })

          try {
            $doc.Print()
          } catch {
            Write-Error $_.Exception.Message
            exit 1
          } finally {
            $image.Dispose()
          }`;  
      await fsPromises.writeFile(psPath, psScript, 'utf8');

      const cmd = `powershell -ExecutionPolicy Bypass -File "${psPath}"`;
      const result = await new Promise((resolve) => {
        exec(cmd, { windowsHide: true }, async (error, stdout, stderr) => {
          // cleanup files
          try { await fsPromises.unlink(tempImage); } catch {}
          try { await fsPromises.unlink(psPath); } catch {}
      if (error) {
            console.error('❌ QR image print error:', error.message || stderr);
            resolve(false);
      } else {
            console.log('✅ QR image printed via PowerShell');
            resolve(true);
          }
        });
      });

      return result;
    } catch (err) {
      console.error('❌ QR image generation/print failed:', err?.message || err);
      // attempt cleanup
      try { await fsPromises.unlink(tempImage); } catch {}
      return false;
    }
  }

  // -------------------------
  // ESC/POS QR code method (kept but not primary)
  // -------------------------
  async printQRCode(data) {
    console.log('🖨️ printQRCode (esc/pos) size 12:', data);
    // Desktop printers sometimes won't accept these in non-RAW modes; kept for compatibility
    const payload = Buffer.concat([
      Buffer.from([0x1B, 0x40]),         // init
      this.esc80mmCommand,
      Buffer.from([0x1B, 0x61, 0x01]),   // center align
      
      // QR code setup: store data then print
      // Model and size - even bigger size (size 12 for better visibility)
      Buffer.from([0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x43, 0x0C]), // QR code: model 2, size 12
      Buffer.from([0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x45, 0x30]), // error correction level L

      // store data
      Buffer.from([0x1D, 0x28, 0x6B, data.length + 3, 0x00, 0x31, 0x50, 0x30]),
      Buffer.from(data, 'ascii'),

      // print
      Buffer.from([0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x51, 0x30]),
      Buffer.from('\n\n', 'ascii')
    ]);

    return await this.printRaw(payload);
  }

  // -------------------------
  // Print a single QR receipt (uses image QR)
  // -------------------------
  async printSingleQRReceipt(qrData, qrNumber = 1, metadata = {}) {
    console.log(`🖨️ printSingleQRReceipt #${qrNumber}`);
    // Preferred: image QR
    const qrOk = await this.printQRCodeAsImage(qrData);
    if (!qrOk) {
      console.log('⚠️ Image QR failed, trying ESC/POS QR fallback');
      await this.printQRCode(qrData);
    }

    // short delay
    await new Promise(r => setTimeout(r, 250));

    // then print simple receipt as text (driver will use width)
    const text = [
      metadata.promoterName || 'Promoter',
      metadata.date || new Date().toLocaleString(),
      `Code: ${qrData}`,
      '',
      'Single use only',
      '',
      ''
    ].join('\n');

    await this.printText(text);
    // Add some spacing and cut line
    await this.printText('\n\n--- End of Ticket ---\n\n\n'); // feed + cut
  }

  // -------------------------
  // Print main receipt sample (uses image QR for QR parts)
  // -------------------------
  async printReceiptSample() {
    console.log('🖨️ printReceiptSample starting...');
    try {
      const delay = ms => new Promise(r => setTimeout(r, ms));
      // Print 3 QR receipts
      await this.printSingleQRReceipt('PROMOTER24-2025-08-27-235115-1', 1);
      await delay(400);
      await this.printSingleQRReceipt('PROMOTER24-2025-08-27-235115-2', 2);
      await delay(400);
      await this.printSingleQRReceipt('PROMOTER24-2025-08-27-235115-3', 3);
      await delay(400);

      // Main receipt (text)
      const lines = [
        'RECEIPT',
        '',
        'Promoter: Promoter 24',
        new Date().toLocaleString(),
        'Single use only',
        '----------------------------------------',
        'PROMOTER: Promoter 24',
        'RATE: Regular Ticket',
        'QTY: 1',
        'TOTAL: 100.00',
        'DISCOUNTS:',
        'None',
        '----------------------------------------',
        'Thank you!',
        '',
        ''
      ];
      await this.printText(lines.join('\n'));
      // Add some spacing and cut line
      await this.printText('\n\n--- End of Receipt ---\n\n\n');
      console.log('✅ printReceiptSample completed');
    } catch (err) {
      console.error('❌ printReceiptSample error:', err);
    }
  }

  // -------------------------
  // Print Transaction Tickets (Official)
  // -------------------------
  async printTransactionTickets(transactionData) {
    console.log('🖨️ ===== PRINT TRANSACTION TICKETS CALLED =====');
    console.log('🖨️ Received data:', transactionData);
    console.log(`🖨️ Printer Name: ${this.printerName}`);
    console.log('🖨️ ===========================================');
    
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
      
      console.log('🖨️ Parsed transaction data:');
      console.log('🖨️ - Transaction ID:', transactionId);
      console.log('🖨️ - Promoter:', promoterName);
      console.log('🖨️ - Rate:', rateName);
      console.log('🖨️ - Quantity:', quantity);
      console.log('🖨️ - Total: ' + total);
      console.log('🖨️ - Tickets count:', tickets.length);
      console.log('🖨️ ===========================================');
      
      // Helper function to add delay
      const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
      
      // Print individual QR code tickets first
      console.log(`🖨️ ===== PRINTING ${tickets.length} QR CODE TICKETS =====`);
      
      for (let i = 0; i < tickets.length; i++) {
        const qrCode = tickets[i];
        console.log(`🖨️ ===== QR TICKET ${i + 1}/${tickets.length} =====`);
        console.log(`🖨️ QR Code: ${qrCode}`);
        console.log(`🖨️ Calling printQRCode...`);
        
        // Print QR code first
        this.printQRCode(qrCode);
        await delay(500);
        
        console.log(`🖨️ QR code printed, now printing ticket format...`);
        
        // Print ticket format
        const ticketBuffer = Buffer.concat([
          Buffer.from([0x1B, 0x70, 0x00, 0x19, 0xFA]), // Cash drawer trigger
          Buffer.from([0x1B, 0x40]),         // init
          Buffer.from([0x1B, 0x61, 0x01]),   // center align
          
          // Promoter name and rate
          Buffer.from(`${promoterName}\n`, 'ascii'),
          Buffer.from(`${rateName} (${parseFloat(total / quantity).toFixed(2)} each)\n`, 'ascii'),
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
        
        console.log(`🖨️ Ticket buffer created: ${ticketBuffer.length} bytes`);
        console.log(`🖨️ Calling printRaw for ticket format...`);
        
        this.printRaw(ticketBuffer);
        await delay(500);
        
        console.log(`🖨️ ===== QR TICKET ${i + 1} COMPLETED =====`);
      }
      
      // Now print the main receipt information
      console.log('🖨️ ===== PRINTING MAIN TRANSACTION RECEIPT =====');
      console.log('🖨️ Creating receipt buffer...');
      
      const receiptBuffer = Buffer.concat([
        Buffer.from([0x1B, 0x70, 0x00, 0x19, 0xFA]), // Cash drawer trigger
        Buffer.from([0x1B, 0x40]),         // init
        Buffer.from([0x1B, 0x61, 0x01]),   // center align
        
        // Header
        Buffer.from([0x1B, 0x45, 0x01]),   // bold ON
        Buffer.from([0x1D, 0x21, 0x11]),   // double width + height
        Buffer.from('RECEIPT\n', 'ascii'),
        Buffer.from([0x1B, 0x45, 0x00]),   // bold OFF
        Buffer.from([0x1D, 0x21, 0x00]),   // normal size
        
        // Promoter and Rate
        Buffer.from(`Promoter: ${promoterName}\n`, 'ascii'),
        Buffer.from(`Rate: ${rateName} (${parseFloat(total / quantity).toFixed(2)} each)\n`, 'ascii'),
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
        Buffer.from(`TOTAL: ${parseFloat(total).toFixed(2)}\n`, 'ascii'),
        Buffer.from(`PAID: ${parseFloat(paidAmount).toFixed(2)}\n`, 'ascii'),
        Buffer.from(`CHANGE: ${parseFloat(change).toFixed(2)}\n`, 'ascii'),
        Buffer.from(`CASHIER: ${cashierName}\n`, 'ascii'),
        Buffer.from(`SESSION: #${sessionId}\n`, 'ascii'),
        Buffer.from(`TXN ID: #${transactionId}\n`, 'ascii'),
        
        // Discounts section
        Buffer.from('DISCOUNTS:\n', 'ascii'),
        ...(discounts && discounts.length > 0 
          ? discounts.map(discount => 
              Buffer.from(`${discount.discount_name}: ${discount.discount_value_type === 'percentage' ? `${discount.discount_value}%` : `${discount.discount_value}`}\n`, 'ascii')
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
      
      console.log(`🖨️ Receipt buffer created: ${receiptBuffer.length} bytes`);
      console.log(`🖨️ Calling printRaw for main receipt...`);
      
      this.printRaw(receiptBuffer);
      
      console.log('🖨️ ===== TRANSACTION TICKETS PRINTING COMPLETED =====');
      console.log('✅ Transaction tickets printing completed');
      
    } catch (error) {
      console.error('❌ Error printing transaction tickets:', error);
    }
  }

  // -------------------------
  // Other convenience methods
  // -------------------------
  async printOpenCashReceipt(cashierName, cashOnHand, sessionId) {
    console.log(`🖨️ ===== PRINT OPEN CASH RECEIPT CALLED =====`);
    console.log(`🖨️ Cashier: ${cashierName}`);
    console.log(`🖨️ Amount: P${cashOnHand}`);
    console.log(`🖨️ Session: #${sessionId}`);
    console.log(`🖨️ Printer Name: ${this.printerName}`);
    console.log(`🖨️ ==========================================`);
    
    // Use the working format from the old file
    const buffer = Buffer.concat([
      Buffer.from([0x1B, 0x70, 0x00, 0x19, 0xFA]), // Cash drawer trigger
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
      Buffer.from(`Cash on Hand: ${parseFloat(cashOnHand).toFixed(2)}\n`, 'ascii'),
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
    
    console.log(`🖨️ Buffer created: ${buffer.length} bytes`);
    console.log(`🖨️ Calling printRaw...`);
    
    const result = await this.printRaw(buffer);
    
    console.log(`🖨️ printRaw result: ${result ? 'SUCCESS' : 'FAILED'}`);
    console.log(`🖨️ ===== END PRINT OPEN CASH RECEIPT =====`);
    
    return result;
  }

  async printCloseCashReceipt(cashierName, sessionId, openingCash, closingCash, dailyTransactions = [], dailyTotal = 0) {
    console.log('🖨️ ===== PRINT CLOSE CASH RECEIPT CALLED =====');
    console.log(`🖨️ Cashier: ${cashierName}`);
    console.log(`🖨️ Session: #${sessionId}`);
    console.log(`🖨️ Opening Cash: ${openingCash}`);
    console.log(`🖨️ Closing Cash: ${closingCash}`);
    console.log(`🖨️ Daily Transactions: ${dailyTransactions.length}`);
    console.log(`🖨️ Daily Total: ${dailyTotal}`);
    console.log(`🖨️ Printer Name: ${this.printerName}`);
    console.log('🖨️ ===========================================');
    
    try {
      const buffer = Buffer.concat([
      Buffer.from([0x1B, 0x70, 0x00, 0x19, 0xFA]), // Cash drawer trigger
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
              Buffer.from(`- ${discount.discount_name}               ${discount.discount_value_type === 'percentage' ? `${discount.discount_value}%` : `${discount.discount_value}`}\n`, 'ascii')
            )
          : []
        ),
        Buffer.from(`Total:                        ${parseFloat(transaction.total).toFixed(2)}\n`, 'ascii'),
        ...(idx < dailyTransactions.length - 1 ? [Buffer.from('--------------------------------\n', 'ascii')] : [])
      ]).flat(),
      
      // Summary Section
      Buffer.from([0x1B, 0x61, 0x01]),   // center align
      Buffer.from('*** SUMMARY ***\n', 'ascii'),
      Buffer.from([0x1B, 0x61, 0x00]),   // left align
      Buffer.from('\n', 'ascii'),
      
      Buffer.from(`Opening Cash:                 ${parseFloat(openingCash).toFixed(2)}\n`, 'ascii'),
      Buffer.from(`Total Transactions:            ${dailyTransactions.length}\n`, 'ascii'),
      Buffer.from(`Total Sales:                  ${parseFloat(dailyTotal).toFixed(2)}\n`, 'ascii'),
      Buffer.from(`Closing Cash:                 ${parseFloat(closingCash).toFixed(2)}\n`, 'ascii'),
      Buffer.from('--------------------------------\n', 'ascii'),
      
      // End of Report
      Buffer.from([0x1B, 0x61, 0x01]),   // center align
      Buffer.from('--- End of Report ---\n', 'ascii'),
      Buffer.from('\n\n', 'ascii'),
      
      // Feed and cut
      Buffer.from([0x1B, 0x64, 0x03]),   // feed 3 lines
      Buffer.from([0x1D, 0x56, 0x00])    // full cut
    ]);
    
      console.log(`🖨️ Close cash buffer created: ${buffer.length} bytes`);
      console.log(`🖨️ Calling printRaw for close cash report...`);
    
      const result = await this.printRaw(buffer);
      
      console.log(`🖨️ printRaw result: ${result ? 'SUCCESS' : 'FAILED'}`);
      console.log('🖨️ ===== CLOSE CASH RECEIPT PRINTING COMPLETED =====');
      console.log(`🖨️ Printing Close Cash Report - Cashier: ${cashierName}, Session: #${sessionId}, Closing Cash: ${closingCash}`);
      
      return result;
    } catch (error) {
      console.error('❌ Error printing close cash receipt:', error);
      return false;
    }
  }

  printCut() {
    return this.printRaw(Buffer.from([0x1B, 0x64, 0x03, 0x1D, 0x56, 0x00]));
  }

  printTest() {
    return this.printText('Hello from Star BSC10 Printer!\nTest completed successfully.\n\n');
  }
}

// -------------------------
// CLI — keep for backwards compatibility
// -------------------------
const printer = new StarBSC10Printer();
const command = process.argv[2];
const data = process.argv.slice(3).join(' ');

async function cli() {
switch (command) {
  case 'test':
      await printer.printTest();
    break;
  case 'bold':
      await printer.printBoldText(data || 'HELLO BIG WORLD');
    break;
  case 'qr':
      await printer.printQRCode(data || 'TEST123');
    break;
  case 'qrimg':
      await printer.printQRCodeAsImage(data || 'TEST123');
    break;
  case 'qrreceipt':
      await printer.printSingleQRReceipt(data || 'TEST123', 1);
    break;
  case 'multiqr':
      {
        const arr = data ? data.split(',') : ['TEST1','TEST2','TEST3'];
        await printer.printMultipleQRCodes(arr);
      }
    break;
  case 'receipt':
      await printer.printReceiptSample();
    break;
  case 'opencash':
      {
        const parts = data ? data.split(',') : ['sales','5000.00','16'];
        // Wait for printer initialization to complete
        await printer.initializePrinter();
        await printer.printOpenCashReceipt(parts[0], parts[1], parts[2]);
      }
    break;
  case 'closecash':
      {
        if (!data || data.trim() === '') {
         printer.printCloseCashSample();
        } else {
          try {
            const payload = data.endsWith('.json') ? JSON.parse(await fsPromises.readFile(data, 'utf8')) : JSON.parse(data);
            await printer.printCloseCashReceipt(
              payload.cashierName,
              payload.sessionId,
              payload.openingCash,
              payload.closingCash,
              payload.dailyTransactions,
              payload.dailyTotal
            );
          } catch (err) {
            console.error('❌ Error parsing close cash data:', err.message || err);
          }
        }
    }
    break;
  case 'transaction':
      {
    const jsonData = process.argv.slice(3).join(' ');
    let fixedJson = jsonData;
        fixedJson = fixedJson.replace(/(\w+):/g, '"$1":'); // best-effort fix
    fixedJson = fixedJson.replace(/:\s*([^",\{\}\[\]\d][^,\{\}\[\]]*[^",\{\}\[\]\d\s])/g, ':"$1"');
        try {
          await printer.printTransactionTickets(fixedJson);
        } catch (e) {
          console.error('❌ transaction error:', e);
        }
    }
    break;
  case 'transactionfile':
      {
        const filePath = process.argv[3];
        try {
          const content = await fsPromises.readFile(filePath, 'utf8');
          await printer.printTransactionTickets(content);
          try { await fsPromises.unlink(filePath); } catch {}
        } catch (err) {
          console.error('❌ transactionfile error:', err.message || err);
        }
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

  // cleanup any tracked temps (best-effort)
  try {
    for (const f of printer.tempFiles) {
      try { await fsPromises.unlink(f); } catch {}
    }
  } catch (e) {}
}

cli().catch(err => {
  console.error('❌ CLI runtime error:', err);
});
