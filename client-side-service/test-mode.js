#!/usr/bin/env node

/**
 * Test Mode Printer - For development and testing
 * This class provides test mode functionality for the printer service
 */

export class TestModePrinter {
    constructor() {
    this.testMode = true;
    this.printHistory = [];
    console.log('🧪 Test Mode Printer initialized');
  }

  /**
   * Simulate printing in test mode
   */
  async printTest(content, type = 'text') {
    const printRecord = {
      timestamp: new Date().toISOString(),
      type: type,
      content: content,
      success: true
    };
    
    this.printHistory.push(printRecord);
    
    console.log('🧪 TEST MODE - Would print:', {
      type: type,
      content: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
      timestamp: printRecord.timestamp
    });
    
    return { success: true, testMode: true, record: printRecord };
  }

  /**
   * Get print history
   */
  getPrintHistory() {
    return this.printHistory;
  }

  /**
   * Clear print history
   */
  clearHistory() {
    this.printHistory = [];
    console.log('🧪 Test mode history cleared');
  }

  /**
   * Get test mode status
   */
  getStatus() {
    return {
            testMode: this.testMode,
      totalPrints: this.printHistory.length,
      lastPrint: this.printHistory[this.printHistory.length - 1] || null
    };
  }
}

// Command line interface for testing
if (import.meta.url === `file://${process.argv[1]}`) {
    const testPrinter = new TestModePrinter();
  
    const command = process.argv[2];
    const data = process.argv[3] || '';
    
    switch (command) {
    case 'test':
      testPrinter.printTest('Hello from Test Mode!', 'text');
      break;
        case 'status':
      console.log('Test Mode Status:', testPrinter.getStatus());
      break;
    case 'history':
      console.log('Print History:', testPrinter.getPrintHistory());
            break;
        case 'clear':
      testPrinter.clearHistory();
            break;
        default:
      console.log('Test Mode Printer Commands:');
      console.log('  node test-mode.js test');
      console.log('  node test-mode.js status');
      console.log('  node test-mode.js history');
      console.log('  node test-mode.js clear');
            break;
    }
}
