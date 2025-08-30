<!DOCTYPE html>
<html>
<head>
  <title>Live Scan Viewer</title>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

         body {
       font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
       background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
       min-height: 100vh;
       padding: 15px;
     }

     .container {
       max-width: 1000px;
       margin: 0 auto;
       background: rgba(255, 255, 255, 0.95);
       border-radius: 12px;
       box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
       overflow: hidden;
     }

         .header {
       background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
       color: white;
       padding: 20px;
       text-align: center;
     }

     .header h1 {
       font-size: 2rem;
       margin-bottom: 8px;
       text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
     }

     .header .status {
       font-size: 1rem;
       opacity: 0.9;
     }

     .controls {
       padding: 15px 20px;
       background: #f8f9fa;
       border-bottom: 1px solid #e9ecef;
       display: flex;
       justify-content: space-between;
       align-items: center;
       flex-wrap: wrap;
       gap: 10px;
     }

         .stats {
       display: flex;
       gap: 15px;
       flex-wrap: wrap;
     }

     .stat-item {
       background: white;
       padding: 8px 15px;
       border-radius: 6px;
       box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
       border-left: 3px solid #667eea;
     }

     .stat-label {
       font-size: 0.7rem;
       color: #6c757d;
       text-transform: uppercase;
       font-weight: 600;
     }

     .stat-value {
       font-size: 1rem;
       font-weight: bold;
       color: #495057;
     }

     .btn {
       padding: 8px 16px;
       border: none;
       border-radius: 6px;
       cursor: pointer;
       font-weight: 600;
       transition: all 0.3s ease;
       text-decoration: none;
       display: inline-block;
       font-size: 0.85rem;
     }

    .btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-primary:hover {
      background: #5a6fd8;
      transform: translateY(-2px);
    }

    .btn-danger {
      background: #dc3545;
      color: white;
    }

    .btn-danger:hover {
      background: #c82333;
      transform: translateY(-2px);
    }

         .scan-history {
       max-height: 400px;
       overflow-y: auto;
       padding: 15px;
     }

     .scan-item {
       background: white;
       margin-bottom: 8px;
       border-radius: 8px;
       box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
       border-left: 4px solid #28a745;
       transition: all 0.3s ease;
       animation: slideIn 0.5s ease-out;
     }

     .scan-item:hover {
       transform: translateY(-1px);
       box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
     }

     .scan-item.new {
       border-left-color: #ffc107;
       animation: highlight 1s ease-out;
     }

     .scan-header {
       padding: 8px 12px;
       background: #f8f9fa;
       border-bottom: 1px solid #e9ecef;
       border-radius: 8px 8px 0 0;
       display: flex;
       justify-content: space-between;
       align-items: center;
     }

     .scan-time {
       font-size: 0.75rem;
       color: #6c757d;
       font-weight: 500;
     }

     .scan-number {
       background: #667eea;
       color: white;
       padding: 3px 8px;
       border-radius: 12px;
       font-size: 0.7rem;
       font-weight: 600;
     }

     .scan-content {
       padding: 10px 12px;
     }

     .scan-row {
       display: flex;
       justify-content: space-between;
       align-items: center;
       margin-bottom: 5px;
       padding: 3px 0;
       border-bottom: 1px solid #f1f3f4;
     }

     .scan-row:last-child {
       border-bottom: none;
       margin-bottom: 0;
     }

     .scan-label {
       font-weight: 600;
       color: #495057;
       min-width: 60px;
       font-size: 0.8rem;
     }

     .scan-value {
       font-family: 'Courier New', monospace;
       background: #f8f9fa;
       padding: 3px 8px;
       border-radius: 4px;
       font-weight: 600;
       color: #212529;
       border: 1px solid #e9ecef;
       font-size: 0.8rem;
       word-break: break-word;
     }

     .scan-value.error {
       background: #f8d7da;
       border-color: #f5c6cb;
       color: #721c24;
     }

    .no-scans {
      text-align: center;
      padding: 60px 20px;
      color: #6c757d;
      font-size: 1.1rem;
    }

    .no-scans .icon {
      font-size: 3rem;
      margin-bottom: 20px;
      opacity: 0.5;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes highlight {
      0% {
        background-color: #fff3cd;
        transform: scale(1.02);
      }
      100% {
        background-color: white;
        transform: scale(1);
      }
    }

    .pulse {
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7);
      }
      70% {
        box-shadow: 0 0 0 10px rgba(102, 126, 234, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(102, 126, 234, 0);
      }
    }

    @media (max-width: 768px) {
      .header h1 {
        font-size: 2rem;
      }
      
      .controls {
        flex-direction: column;
        align-items: stretch;
      }
      
      .stats {
        justify-content: center;
      }
      
      .scan-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 5px;
      }
    }
  </style>
  <script>
    let scanHistory = [];
    let lastScanCode = null;
    let scanCount = 0;

    function formatTime(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    }

    function createScanItem(scanData, isNew = false) {
      const scanNumber = ++scanCount;
      const scanTime = formatTime(scanData.timestamp);
      
      // Determine status styling based on validation
      const isValid = scanData.is_valid;
      const statusColor = isValid ? '#28a745' : '#dc3545';
      const statusIcon = isValid ? '✓' : '✗';
      const statusText = isValid ? 'Valid' : 'Invalid';
      const borderColor = isValid ? '#28a745' : '#dc3545';
      
      // Create scan type display
      const scanType = scanData.scan_type || 'Unknown';
      const scanTypeText = scanType === 'cashier_ticket' ? 'Cashier Ticket' : 
                          scanType === 'vip_card' ? 'VIP Card' : 'Unknown';
      
      return `
        <div class="scan-item ${isNew ? 'new' : ''}" data-code="${scanData.code}" style="border-left-color: ${borderColor};">
          <div class="scan-header">
            <span class="scan-time">${scanTime}</span>
            <span class="scan-number">#${scanNumber}</span>
          </div>
          <div class="scan-content">
            <div class="scan-row">
              <span class="scan-label">Code:</span>
              <span class="scan-value">${scanData.code || 'N/A'}</span>
            </div>
            <div class="scan-row">
              <span class="scan-label">Device:</span>
              <span class="scan-value">${scanData.device || 'N/A'}</span>
            </div>
            <div class="scan-row">
              <span class="scan-label">Type:</span>
              <span class="scan-value">${scanTypeText}</span>
            </div>
            <div class="scan-row">
              <span class="scan-label">Status:</span>
              <span class="scan-value" style="color: ${statusColor}; font-weight: bold;">${statusIcon} ${statusText}</span>
            </div>
            ${scanData.error_message ? `
            <div class="scan-row">
              <span class="scan-label">Error:</span>
              <span class="scan-value error">${scanData.error_message}</span>
            </div>
            ` : ''}
          </div>
        </div>
      `;
    }

    function updateScanHistory() {
      const historyContainer = document.getElementById('scan-history');
      
      if (scanHistory.length === 0) {
        historyContainer.innerHTML = `
          <div class="no-scans">
            <div class="icon">📱</div>
            <div>Waiting for scans...</div>
            <div style="font-size: 0.9rem; margin-top: 10px; opacity: 0.7;">
              New scans will appear here automatically
            </div>
          </div>
        `;
        return;
      }

      historyContainer.innerHTML = scanHistory.map(scan => scan.html).join('');
    }

    function updateStats() {
      document.getElementById('total-scans').textContent = scanCount;
      document.getElementById('today-scans').textContent = scanHistory.filter(scan => {
        const scanDate = new Date(scan.data.timestamp).toDateString();
        const today = new Date().toDateString();
        return scanDate === today;
      }).length;
    }

    async function pollScan() {
      try {
        const res = await fetch("api/access/latest");
        const data = await res.json();
        
        if (data && data.timestamp && data.timestamp !== lastScanCode) {
          lastScanCode = data.timestamp;
          
          // Add new scan to the beginning of the array
          const newScan = {
            data: data,
            html: createScanItem(data, true)
          };
          
          scanHistory.unshift(newScan);
          
          // Keep only the last 50 scans to prevent memory issues
          if (scanHistory.length > 50) {
            scanHistory = scanHistory.slice(0, 50);
          }
          
          // Update the display
          updateScanHistory();
          updateStats();
          
          // Update last scan time
          if (data.timestamp) {
            document.getElementById('last-scan-time').textContent = formatTime(data.timestamp);
          }
          
          // Remove the 'new' class after animation
          setTimeout(() => {
            const newItems = document.querySelectorAll('.scan-item.new');
            newItems.forEach(item => item.classList.remove('new'));
          }, 1000);
        }
      } catch (e) {
        console.error("Error fetching scan", e);
        document.getElementById('status').textContent = '❌ Connection Error';
        document.getElementById('status').style.color = '#dc3545';
      }
    }

    // Initialize
    document.addEventListener('DOMContentLoaded', function() {
      updateScanHistory();
      updateStats();
      
      // Start polling
      setInterval(pollScan, 1000);
    });

    function clearHistory() {
      if (confirm('Are you sure you want to clear all scan history?')) {
        scanHistory = [];
        scanCount = 0;
        updateScanHistory();
        updateStats();
      }
    }

    function exportHistory() {
      if (scanHistory.length === 0) {
        alert('No scans to export');
        return;
      }
      
      const csvContent = [
        ['Scan #', 'Code', 'Device', 'Type', 'Status', 'Error Message', 'Timestamp'],
        ...scanHistory.map((scan, index) => [
          index + 1,
          scan.data.code || 'N/A',
          scan.data.device || 'N/A',
          scan.data.scan_type || 'Unknown',
          scan.data.is_valid ? 'Valid' : 'Invalid',
          scan.data.error_message || '',
          scan.data.timestamp
        ])
      ].map(row => row.join(',')).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scan_history_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  </script>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🧾 Live Scan Viewer</h1>
      <div class="status" id="status">🟢 Connected & Monitoring</div>
    </div>
    
    <div class="controls">
      <div class="stats">
        <div class="stat-item">
          <div class="stat-label">Total Scans</div>
          <div class="stat-value" id="total-scans">0</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Today</div>
          <div class="stat-value" id="today-scans">0</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Last Scan</div>
          <div class="stat-value" id="last-scan-time">--</div>
        </div>
      </div>
      
      <div>
        <button class="btn btn-primary" onclick="exportHistory()">📊 Export CSV</button>
        <button class="btn btn-danger" onclick="clearHistory()">🗑️ Clear History</button>
      </div>
    </div>
    
    <div class="scan-history" id="scan-history">
      <!-- Scan items will be dynamically added here -->
    </div>
  </div>
</body>
</html>
