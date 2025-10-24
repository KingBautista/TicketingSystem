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
    this.printerName = options.printerName || 'Star BSC10';
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

    // Ensure ESC/POS width enforcement at start
    // Prepend init and width, only if not present
    let outBuffer = buffer;

    // If buffer doesn't start with init (0x1B 0x40), prepend it
    if (!(buffer[0] === 0x1B && buffer[1] === 0x40)) {
      outBuffer = Buffer.concat([Buffer.from([0x1B, 0x40]), this.esc80mmCommand, buffer]);
            } else {
      outBuffer = Buffer.concat([buffer.slice(0, 2), this.esc80mmCommand, buffer.slice(2)]);
    }

    // Add printer initialization sequence for Star BSC10
    const initSequence = Buffer.from([
      0x1B, 0x40,  // Initialize printer
      0x1B, 0x61, 0x01,  // Center align
      0x1B, 0x45, 0x00,  // Normal text
      0x1D, 0x21, 0x00,  // Normal size
    ]);
    
    outBuffer = Buffer.concat([initSequence, outBuffer]);

    // Try PowerShell byte printing (Out-Printer expects objects; we'll write bytes to file then send via PrintDocument)
    const tempFile = this._tempPath('raw_print.bin');
    try {
      await fsPromises.writeFile(tempFile, outBuffer, { encoding: 'binary' });

      const psPath = this._tempPath('print_raw_bytes.ps1');
      const psScript = `
Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Windows.Forms

$printer = "${this.printerName}"
$imageBytes = [System.IO.File]::ReadAllBytes("${tempFile.replace(/'/g, "''")}")

# We'll write bytes to a MemoryStream and render them as text using a fixed-width font on the page.
$ms = New-Object System.IO.MemoryStream(, $imageBytes)

# Convert to string (assume ascii/utf8 where printable)
try {
  $text = [System.Text.Encoding]::ASCII.GetString($imageBytes)
} catch {
  $text = [System.Text.Encoding]::UTF8.GetString($imageBytes)
}

$doc = New-Object System.Drawing.Printing.PrintDocument
$doc.PrinterSettings.PrinterName = $printer
$doc.PrintController = New-Object System.Drawing.Printing.StandardPrintController

$font = New-Object System.Drawing.Font("Consolas",8)

$doc.add_PrintPage({
  param($sender, $e)
  # Set margins for 80mm paper (3.15 inches)
  $e.PageSettings.Margins.Left = 0.1
  $e.PageSettings.Margins.Right = 0.1
  $e.PageSettings.Margins.Top = 0.1
  $e.PageSettings.Margins.Bottom = 0.1
  $bounds = $e.MarginBounds
  # center text for 80mm paper
  $pageWidth = $bounds.Width
  $textWidth = $e.Graphics.MeasureString($text, $font).Width
  $x = [int](($pageWidth - $textWidth) / 2)
  $point = New-Object System.Drawing.PointF($x, $bounds.Y)
  $e.Graphics.DrawString($text, $font, [System.Drawing.Brushes]::Black, $point)
  $null
})

try {
  $doc.Print()
} catch {
  Write-Error $_.Exception.Message
  exit 1
}
`;

      await fsPromises.writeFile(psPath, psScript, 'utf8');

      const cmd = `powershell -ExecutionPolicy Bypass -File "${psPath}"`;
      console.log('📤 Executing PowerShell raw byte print...');
    const psSuccess = await new Promise((resolve) => {
        exec(cmd, { windowsHide: true }, (error, stdout, stderr) => {
          if (error) {
            console.log('⚠️ PowerShell raw print failed:', error.message);
            resolve(false);
          } else {
            console.log('✅ PowerShell raw print likely succeeded');
            resolve(true);
          }
        });
      });
      
      // cleanup
      await this._cleanupTemp(tempFile);
      await this._cleanupTemp(psPath);

      if (psSuccess) return true;
    } catch (error) {
      console.warn('⚠️ printRaw PowerShell attempt failed:', error?.message || error);
      try { await this._cleanupTemp(tempFile); } catch {}
    }

    // Fallback: try copying to known USB ports or printer share
    const fallbackTemp = this._tempPath('raw_print_fallback.bin');
    await fsPromises.writeFile(fallbackTemp, outBuffer, 'binary');

    // Use the working port first if available
    if (this.workingPort) {
      try {
        const copyCmd = `copy /B "${fallbackTemp}" "${this.workingPort}"`;
        console.log(`🔄 Using working port: ${this.workingPort}`);
        console.log(`📤 Executing: ${copyCmd}`);
        const ok = await new Promise((resolve) => {
          exec(copyCmd, { windowsHide: true }, (error, stdout, stderr) => {
            if (!error) {
              console.log(`✅ Raw data sent to printer via ${this.workingPort}`);
          resolve(true);
            } else {
              console.log(`❌ Working port ${this.workingPort} failed: ${error.message}`);
              resolve(false);
        }
      });
    });
        if (ok) {
          console.log(`🎯 Print job completed successfully!`);
          await this._cleanupTemp(fallbackTemp);
          return true;
        }
      } catch (e) {
        console.log(`❌ Working port ${this.workingPort} error: ${e.message}`);
      }
    }

    // Try other USB ports as fallback
    const usbPorts = ['USB001','USB002','USB003','USB004','USB005','USB006','USB007','USB008'];
    for (const port of usbPorts) {
      try {
        const copyCmd = `copy /B "${fallbackTemp}" "${port}"`;
        console.log(`🔄 Trying copy to ${port} ...`);
        const ok = await new Promise((resolve) => {
          exec(copyCmd, { windowsHide: true }, (error, stdout, stderr) => {
            if (!error) {
              console.log(`✅ copy to ${port} succeeded`);
              resolve(true);
            } else {
              // console.log(`❌ ${port} failed: ${error.message}`);
              resolve(false);
            }
          });
        });
        if (ok) {
          console.log(`🎯 Print job completed successfully!`);
          await this._cleanupTemp(fallbackTemp);
          return true;
        }
      } catch (e) {
        // continue
      }
    }

    // Final fallback: try share
    try {
      const shareCmd = `copy /B "${fallbackTemp}" "\\\\localhost\\${this.printerName}"`;
      console.log('🔄 Trying printer share copy ...');
      const shareOk = await new Promise((resolve) => {
        exec(shareCmd, { windowsHide: true }, (error, stdout, stderr) => {
            if (!error) {
            console.log('✅ copy to share succeeded');
          resolve(true);
            } else {
            console.log('❌ printer share failed:', error?.message || stderr);
              resolve(false);
        }
      });
    });
      await this._cleanupTemp(fallbackTemp);
      return shareOk;
    } catch (e) {
      console.error('❌ All fallback methods failed:', e?.message || e);
      try { await this._cleanupTemp(fallbackTemp); } catch {}
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
        $fontSize = 9
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
        
        # Split text into lines and draw each line centered within the width
        $lines = $text -split [Environment]::NewLine
        foreach ($line in $lines) {
          $rect = New-Object System.Drawing.RectangleF($bounds.X, $y, $bounds.Width, $lineHeight)
          $e.Graphics.DrawString($line, $workingFont, [System.Drawing.Brushes]::Black, $rect, $sf)
          $y += $lineHeight
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
    console.log('🖨️ printQRCode (esc/pos) fallback:', data);
    // Desktop printers sometimes won't accept these in non-RAW modes; kept for compatibility
    const payload = Buffer.concat([
      Buffer.from([0x1B, 0x40]),         // init
      this.esc80mmCommand,
      Buffer.from([0x1B, 0x61, 0x01]),   // center align
      
      // QR code setup: store data then print
      // Model and size
      Buffer.from([0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x43, 0x02]), // size 2 (smallest for 80mm)
      Buffer.from([0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x45, 0x30]), // error correction L

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
        'TOTAL: P100.00',
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
  // Print transaction tickets (main entry used by your service)
  // -------------------------
  async printTransactionTickets(transactionData) {
    console.log('🖨️ printTransactionTickets invoked');
    try {
      let data = transactionData;
      if (typeof transactionData === 'string') {
        data = JSON.parse(transactionData);
      }

      const {
        transactionId,
        promoterName = 'Promoter',
        rateName = 'Rate',
        quantity = 1,
        total = 0,
        paidAmount = 0,
        change = 0,
        cashierName = 'cashier',
        sessionId = '0',
        discounts = [],
        tickets = [],
        createdAt = new Date().toISOString()
      } = data;
      
      // print QR tickets first (image-based)
      for (let i = 0; i < tickets.length; i++) {
        const qr = tickets[i];
        console.log(`🖨️ printing QR ticket ${i + 1} / ${tickets.length}`);
        const ok = await this.printQRCodeAsImage(qr);
        if (!ok) {
          console.log('⚠️ QR image print failed — trying ESC/POS fallback');
          await this.printQRCode(qr);
        }

        await new Promise(r => setTimeout(r, 300));

        // print the ticket text below the QR
        const ticketText = [
          promoterName,
          new Date(createdAt).toLocaleString(),
          `Code: ${qr}`,
          '',
          'Single use only',
          ''
        ].join('\n');

        await this.printText(ticketText);
        await new Promise(r => setTimeout(r, 200));
      }

      // Now print main receipt
      const receiptLines = [
        'RECEIPT',
        '',
        `Promoter: ${promoterName}`,
        new Date(createdAt).toLocaleString(),
        'Single use only',
        '----------------------------------------',
        `PROMOTER: ${promoterName}`,
        `DATE: ${new Date(createdAt).toLocaleString()}`,
        `RATE: ${rateName}`,
        `QTY: ${quantity}`,
        `TOTAL: P${parseFloat(total).toFixed(2)}`,
        `PAID: P${parseFloat(paidAmount).toFixed(2)}`,
        `CHANGE: P${parseFloat(change).toFixed(2)}`,
        `CASHIER: ${cashierName}`,
        `SESSION: #${sessionId}`,
        `TXN ID: #${transactionId}`,
        'DISCOUNTS:',
        ...(discounts && discounts.length > 0 ? discounts.map(d => `${d.discount_name}: ${d.discount_value}`) : ['None']),
        '----------------------------------------',
        'Thank you!',
        '',
        ''
      ];

      await this.printText(receiptLines.join('\n'));
      // Add some spacing and cut line
      await this.printText('\n\n--- End of Receipt ---\n\n\n');
      console.log('✅ Transaction printed successfully');
    } catch (error) {
      console.error('❌ Error printing transaction tickets:', error?.message || error);
      // try to log raw input for debugging
      console.error('📄 Raw input:', transactionData);
    }
  }

  // -------------------------
  // Other convenience methods
  // -------------------------
  async printOpenCashReceipt(cashierName, cashOnHand, sessionId) {
    const buf = Buffer.concat([
      Buffer.from([0x1B, 0x40]), this.esc80mmCommand,
      Buffer.from([0x1B, 0x61, 0x01]),
      Buffer.from('OPEN CASH RECEIPT\n', 'ascii'),
      Buffer.from(`Cashier: ${cashierName}\n\n`, 'ascii'),
      Buffer.from(`Date: ${new Date().toLocaleString()}\n\n`, 'ascii'),
      Buffer.from(`Cash on Hand: P${parseFloat(cashOnHand).toFixed(2)}\n\n`, 'ascii'),
      Buffer.from('--- End of Receipt ---\n\n', 'ascii'),
      Buffer.from([0x1B, 0x64, 0x03, 0x1D, 0x56, 0x00])
    ]);
    return await this.printRaw(buf);
  }

  async printCloseCashReceipt(cashierName, sessionId, openingCash, closingCash, dailyTransactions = [], dailyTotal = 0) {
    const header = Buffer.concat([
      Buffer.from([0x1B, 0x40]), this.esc80mmCommand,
      Buffer.from([0x1B, 0x61, 0x01]),
      Buffer.from('CLOSE CASH REPORT\n', 'ascii'),
      Buffer.from('\n', 'ascii')
    ]);
    // reduce complexity: print report as text (PowerShell printText will use margins)
    const lines = [
      'CLOSE CASH REPORT',
      `Date: ${new Date().toLocaleString()}`,
      `Cashier: ${cashierName}`,
      `Session: #${sessionId}`,
      '----------------------------------------',
      `Opening Cash: P${parseFloat(openingCash).toFixed(2)}`,
      `Closing Cash: P${parseFloat(closingCash).toFixed(2)}`,
      `Total Transactions: ${dailyTransactions.length}`,
      `Total Sales: P${parseFloat(dailyTotal).toFixed(2)}`,
      '----------------------------------------',
      '',
      '--- End of Report ---',
      '',
      ''
    ];
    await this.printText(lines.join('\n'));
    await this.printRaw(Buffer.from([0x1B, 0x64, 0x03, 0x1D, 0x56, 0x00]));
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
