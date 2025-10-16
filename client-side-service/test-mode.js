#!/usr/bin/env node

/**
 * Test Mode for TicketingSystem Printer
 * Simulates printer operations without requiring physical hardware
 * Useful for development, testing, and remote access scenarios
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class TestModePrinter {
    constructor() {
        this.testMode = process.env.PRINTER_TEST_MODE === 'true' || process.argv.includes('--test-mode');
        this.logFile = path.join(__dirname, 'test-prints.log');
        this.outputDir = path.join(__dirname, 'test-output');
        
        // Create output directory if it doesn't exist
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
        
        console.log(`🧪 Test Mode Printer initialized: ${this.testMode ? 'ENABLED' : 'DISABLED'}`);
    }

    /**
     * Log print operations to file
     */
    logPrintOperation(type, content, result) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            type,
            content: typeof content === 'string' ? content.substring(0, 100) : 'Object data',
            result,
            success: result.success || false
        };
        
        const logLine = `${timestamp} [${type.toUpperCase()}] ${result.success ? '✅' : '❌'} ${logEntry.content}\n`;
        
        try {
            fs.appendFileSync(this.logFile, logLine);
        } catch (error) {
            console.error('Failed to write to log file:', error);
        }
    }

    /**
     * Format content for test mode display (mimics actual printer output)
     */
    formatPrintContent(type, content) {
        try {
            switch (type) {
                case 'transaction':
                    return this.formatTransactionReceipt(content);
                case 'opencash':
                    return this.formatOpenCashReceipt(content);
                case 'closecash':
                    return this.formatCloseCashReceipt(content);
                case 'qr':
                    return this.formatQRCode(content);
                case 'bold':
                    return `**${content}**`;
                default:
                    return typeof content === 'object' ? 
                        JSON.stringify(content, null, 2) : 
                        content;
            }
        } catch (error) {
            console.error('Failed to format content:', error);
            return typeof content === 'object' ? 
                JSON.stringify(content, null, 2) : 
                content;
        }
    }

    /**
     * Format transaction receipt (mimics ESC/POS output)
     */
    formatTransactionReceipt(content) {
        try {
            const data = typeof content === 'string' ? JSON.parse(content) : content;
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
                discounts = [],
                tickets = [],
                createdAt
            } = data;

            let formatted = '';
            
            // Individual QR Code Tickets
            tickets.forEach((qrCode, index) => {
                formatted += `╔══════════════════════════════════════╗\n`;
                formatted += `║              QR TICKET ${index + 1}              ║\n`;
                formatted += `╠══════════════════════════════════════╣\n`;
                formatted += `║                                      ║\n`;
                formatted += `║           [QR CODE: ${qrCode}]           ║\n`;
                formatted += `║                                      ║\n`;
                formatted += `║  Promoter: ${promoterName.padEnd(20)} ║\n`;
                formatted += `║  Date: ${new Date(createdAt).toLocaleString().padEnd(25)} ║\n`;
                formatted += `║  Code: ${qrCode.padEnd(26)} ║\n`;
                formatted += `║                                      ║\n`;
                formatted += `║         Single use only              ║\n`;
                formatted += `║                                      ║\n`;
                formatted += `╚══════════════════════════════════════╝\n\n`;
            });

            // Main Receipt
            formatted += `╔══════════════════════════════════════╗\n`;
            formatted += `║              RECEIPT                 ║\n`;
            formatted += `╠══════════════════════════════════════╣\n`;
            formatted += `║                                      ║\n`;
            formatted += `║  Promoter: ${promoterName.padEnd(20)} ║\n`;
            formatted += `║                                      ║\n`;
            formatted += `║  ${new Date(createdAt).toLocaleString().padEnd(32)} ║\n`;
            formatted += `║         Single use only              ║\n`;
            formatted += `║                                      ║\n`;
            formatted += `╠══════════════════════════════════════╣\n`;
            formatted += `║                                      ║\n`;
            formatted += `║  PROMOTER: ${promoterName.padEnd(20)} ║\n`;
            formatted += `║  DATE: ${new Date(createdAt).toLocaleString().padEnd(25)} ║\n`;
            formatted += `║  RATE: ${rateName.padEnd(26)} ║\n`;
            formatted += `║  QTY: ${quantity.toString().padEnd(28)} ║\n`;
            formatted += `║  TOTAL: ₱${parseFloat(total).toFixed(2).padEnd(25)} ║\n`;
            formatted += `║  PAID: ₱${parseFloat(paidAmount).toFixed(2).padEnd(26)} ║\n`;
            
            if (parseFloat(change) > 0) {
                formatted += `║  CHANGE: ₱${parseFloat(change).toFixed(2).padEnd(23)} ║\n`;
            }
            
            if (discounts && discounts.length > 0) {
                formatted += `║                                      ║\n`;
                formatted += `║  DISCOUNTS:                          ║\n`;
                discounts.forEach(discount => {
                    formatted += `║    - ${discount.name}: ₱${parseFloat(discount.amount).toFixed(2).padEnd(20)} ║\n`;
                });
            }
            
            formatted += `║                                      ║\n`;
            formatted += `║  Cashier: ${cashierName.padEnd(22)} ║\n`;
            formatted += `║  Session: ${sessionId.padEnd(22)} ║\n`;
            formatted += `║                                      ║\n`;
            formatted += `║           Thank you!                  ║\n`;
            formatted += `║                                      ║\n`;
            formatted += `╚══════════════════════════════════════╝\n`;

            return formatted;
        } catch (error) {
            console.error('Failed to format transaction receipt:', error);
            return `Transaction Data:\n${JSON.stringify(content, null, 2)}`;
        }
    }

    /**
     * Format open cash receipt
     */
    formatOpenCashReceipt(content) {
        try {
            const data = typeof content === 'string' ? content.split(',') : content;
            const [cashierName, cashOnHand, sessionId] = data;
            const now = new Date().toLocaleString();

            return `╔══════════════════════════════════════╗\n` +
                   `║           OPEN CASH RECEIPT          ║\n` +
                   `╠══════════════════════════════════════╣\n` +
                   `║                                      ║\n` +
                   `║  Cashier: ${(cashierName || 'Unknown').padEnd(22)} ║\n` +
                   `║  Session: ${(sessionId || 'N/A').padEnd(22)} ║\n` +
                   `║  Date: ${now.padEnd(26)} ║\n` +
                   `║                                      ║\n` +
                   `║  Opening Cash: ₱${parseFloat(cashOnHand || 0).toFixed(2).padEnd(20)} ║\n` +
                   `║                                      ║\n` +
                   `║         Session Started              ║\n` +
                   `║                                      ║\n` +
                   `╚══════════════════════════════════════╝\n`;
        } catch (error) {
            console.error('Failed to format open cash receipt:', error);
            return `Open Cash Data:\n${content}`;
        }
    }

    /**
     * Format close cash receipt
     */
    formatCloseCashReceipt(content) {
        try {
            const data = typeof content === 'string' ? JSON.parse(content) : content;
            const {
                cashierName,
                sessionId,
                openingCash,
                closingCash,
                dailyTransactions = [],
                dailyTotal
            } = data;

            let formatted = `╔══════════════════════════════════════╗\n` +
                           `║          CLOSE CASH REPORT           ║\n` +
                           `╠══════════════════════════════════════╣\n` +
                           `║                                      ║\n` +
                           `║  Cashier: ${(cashierName || 'Unknown').padEnd(22)} ║\n` +
                           `║  Session: ${(sessionId || 'N/A').padEnd(22)} ║\n` +
                           `║  Date: ${new Date().toLocaleString().padEnd(26)} ║\n` +
                           `║                                      ║\n` +
                           `╠══════════════════════════════════════╣\n` +
                           `║                                      ║\n` +
                           `║  Opening Cash: ₱${parseFloat(openingCash || 0).toFixed(2).padEnd(20)} ║\n` +
                           `║  Closing Cash: ₱${parseFloat(closingCash || 0).toFixed(2).padEnd(19)} ║\n` +
                           `║  Daily Total: ₱${parseFloat(dailyTotal || 0).toFixed(2).padEnd(20)} ║\n` +
                           `║                                      ║\n`;

            if (dailyTransactions && dailyTransactions.length > 0) {
                formatted += `║  Transactions: ${dailyTransactions.length.toString().padEnd(18)} ║\n`;
                formatted += `║                                      ║\n`;
            }

            formatted += `║         Session Ended                 ║\n` +
                        `║                                      ║\n` +
                        `╚══════════════════════════════════════╝\n`;

            return formatted;
        } catch (error) {
            console.error('Failed to format close cash receipt:', error);
            return `Close Cash Data:\n${JSON.stringify(content, null, 2)}`;
        }
    }

    /**
     * Format QR code content
     */
    formatQRCode(content) {
        return `╔══════════════════════════════════════╗\n` +
               `║              QR CODE                 ║\n` +
               `╠══════════════════════════════════════╣\n` +
               `║                                      ║\n` +
               `║           [QR CODE]                  ║\n` +
               `║                                      ║\n` +
               `║  Content: ${content.padEnd(20)} ║\n` +
               `║                                      ║\n` +
               `╚══════════════════════════════════════╝\n`;
    }

    /**
     * Save print content to file for inspection
     */
    savePrintContent(type, content) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${type}_${timestamp}.txt`;
        const filepath = path.join(this.outputDir, filename);
        
        try {
            // Format the content to look like actual printer output
            const formattedContent = this.formatPrintContent(type, content);
            
            // Save both formatted and raw content
            const fullContent = `🧪 TEST MODE PRINT OUTPUT\n` +
                               `═══════════════════════════════════════\n` +
                               `Type: ${type.toUpperCase()}\n` +
                               `Timestamp: ${new Date().toISOString()}\n` +
                               `═══════════════════════════════════════\n\n` +
                               `FORMATTED OUTPUT (as it would appear on printer):\n` +
                               `${formattedContent}\n\n` +
                               `═══════════════════════════════════════\n` +
                               `RAW DATA:\n` +
                               `${typeof content === 'object' ? JSON.stringify(content, null, 2) : content}\n`;
            
            fs.writeFileSync(filepath, fullContent, 'utf8');
            console.log(`📄 Print content saved to: ${filename}`);
            return filename;
        } catch (error) {
            console.error('Failed to save print content:', error);
            return null;
        }
    }

    /**
     * Simulate print operation
     */
    async simulatePrint(type, content) {
        console.log(`🧪 [TEST MODE] Simulating ${type} print operation`);
        
        // Show formatted preview in console
        const formattedContent = this.formatPrintContent(type, content);
        console.log(`\n📄 FORMATTED OUTPUT PREVIEW:`);
        console.log(`═══════════════════════════════════════`);
        console.log(formattedContent);
        console.log(`═══════════════════════════════════════\n`);
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const result = {
            method: `test_${type}`,
            success: true,
            testMode: true,
            timestamp: new Date().toISOString(),
            savedFile: this.savePrintContent(type, content)
        };
        
        this.logPrintOperation(type, content, result);
        
        console.log(`✅ [TEST MODE] Print simulation completed successfully`);
        return result;
    }

    /**
     * Test mode wrapper for print operations
     */
    async print(type, content) {
        if (this.testMode) {
            return await this.simulatePrint(type, content);
        } else {
            // In production mode, this would call the actual printer
            throw new Error('Test mode disabled - use actual printer implementation');
        }
    }

    /**
     * Get test mode status and statistics
     */
    getTestModeStatus() {
        const stats = {
            testMode: this.testMode,
            logFile: this.logFile,
            outputDir: this.outputDir,
            logFileExists: fs.existsSync(this.logFile),
            outputDirExists: fs.existsSync(this.outputDir)
        };
        
        if (stats.logFileExists) {
            try {
                const logContent = fs.readFileSync(this.logFile, 'utf8');
                const lines = logContent.split('\n').filter(line => line.trim());
                stats.totalOperations = lines.length;
                stats.successfulOperations = lines.filter(line => line.includes('✅')).length;
                stats.failedOperations = lines.filter(line => line.includes('❌')).length;
            } catch (error) {
                stats.logError = error.message;
            }
        }
        
        if (stats.outputDirExists) {
            try {
                const files = fs.readdirSync(this.outputDir);
                stats.savedFiles = files.length;
                stats.recentFiles = files.slice(-5); // Last 5 files
            } catch (error) {
                stats.outputError = error.message;
            }
        }
        
        return stats;
    }

    /**
     * Clear test data
     */
    clearTestData() {
        try {
            if (fs.existsSync(this.logFile)) {
                fs.unlinkSync(this.logFile);
                console.log('🧹 Test log file cleared');
            }
            
            if (fs.existsSync(this.outputDir)) {
                const files = fs.readdirSync(this.outputDir);
                files.forEach(file => {
                    fs.unlinkSync(path.join(this.outputDir, file));
                });
                console.log(`🧹 Cleared ${files.length} test output files`);
            }
            
            return { success: true, message: 'Test data cleared successfully' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// Command line interface for test mode
if (import.meta.url === `file://${process.argv[1]}`) {
    const testPrinter = new TestModePrinter();
    const command = process.argv[2];
    const data = process.argv[3] || '';
    
    switch (command) {
        case 'status':
            console.log('🧪 Test Mode Status:');
            console.log(JSON.stringify(testPrinter.getTestModeStatus(), null, 2));
            break;
            
        case 'clear':
            const result = testPrinter.clearTestData();
            console.log(result.success ? '✅' : '❌', result.message || result.error);
            break;
            
        case 'test':
            testPrinter.simulatePrint('test', data || 'Test print content');
            break;
            
        default:
            console.log('Test Mode Printer Usage:');
            console.log('  node test-mode.js status          - Show test mode status');
            console.log('  node test-mode.js clear           - Clear test data');
            console.log('  node test-mode.js test "content"  - Simulate test print');
            console.log('');
            console.log('Environment Variables:');
            console.log('  PRINTER_TEST_MODE=true           - Enable test mode');
            break;
    }
}
