<!DOCTYPE html>
<html>
<head>
     <title>Live Scan Viewer</title>
   <meta charset="UTF-8" />
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <meta name="csrf-token" content="{{ csrf_token() }}">
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

     .tabs {
       display: flex;
       background: #f8f9fa;
       border-bottom: 1px solid #e9ecef;
     }

     .tab {
       flex: 1;
       padding: 15px 20px;
       background: #e9ecef;
       border: none;
       cursor: pointer;
       font-weight: 600;
       transition: all 0.3s ease;
       border-bottom: 3px solid transparent;
     }

     .tab.active {
       background: white;
       border-bottom-color: #667eea;
       color: #667eea;
     }

     .tab:hover {
       background: #dee2e6;
     }

     .tab-content {
       display: none;
     }

     .tab-content.active {
       display: block;
     }

     .check-form {
       padding: 20px;
       background: white;
     }

     .form-group {
       margin-bottom: 15px;
     }

     .form-label {
       display: block;
       margin-bottom: 5px;
       font-weight: 600;
       color: #495057;
     }

     .form-input {
       width: 100%;
       padding: 10px;
       border: 1px solid #ced4da;
       border-radius: 4px;
       font-size: 1rem;
       font-family: 'Courier New', monospace;
     }

     .form-input:focus {
       outline: none;
       border-color: #667eea;
       box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.25);
     }

     .check-result {
       margin-top: 20px;
       padding: 15px;
       border-radius: 8px;
       border-left: 4px solid #28a745;
       background: #f8f9fa;
       display: none;
     }

     .check-result.error {
       border-left-color: #dc3545;
       background: #f8d7da;
     }

     .check-result.warning {
       border-left-color: #ffc107;
       background: #fff3cd;
     }

     .check-result.success {
       border-left-color: #28a745;
       background: #d4edda;
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
    // Get the base URL dynamically from the current page
    const baseUrl = window.location.protocol + '//' + window.location.host;
    
    let scanHistory = [];
    let lastScanCode = null;
    let scanCount = 0;
    let eventSource = null;

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
      const scanTypeText = scanType === 'cashier_ticket' ? 'Cashier Ticket' : scanType === 'vip_card' ? 'VIP Card' : 'Unknown';
      
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

    function startEventStream() {
        if (eventSource) {
          eventSource.close();
        }

        // Try the main stream first
        eventSource = new EventSource(baseUrl + '/api/kqt300/stream');
        
        eventSource.onopen = function(event) {
          console.log('Event stream connected');
          document.getElementById('status').textContent = '🟢 Live Streaming Connected';
          document.getElementById('status').style.color = '#28a745';
        };

        eventSource.onmessage = function(event) {
          try {
            const data = JSON.parse(event.data);
            console.log('Received event:', data.type);
            
            if (data.type === 'connected') {
              console.log('Stream connected:', data.message);
            } else if (data.type === 'scan_update' && data.data) {
              const scanData = data.data;
              
              if (scanData.timestamp && scanData.timestamp !== lastScanCode) {
                lastScanCode = scanData.timestamp;
                
                // Add new scan to the beginning of the array
                const newScan = {
                  data: scanData,
                  html: createScanItem(scanData, true)
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
                if (scanData.timestamp) {
                  document.getElementById('last-scan-time').textContent = formatTime(scanData.timestamp);
                }
                
                // Remove the 'new' class after animation
                setTimeout(() => {
                  const newItems = document.querySelectorAll('.scan-item.new');
                  newItems.forEach(item => item.classList.remove('new'));
                }, 1000);
              }
            } else if (data.type === 'ping') {
              // Keep-alive ping received
              console.log('Ping received:', data.timestamp);
            } else if (data.type === 'error') {
              console.error('Stream error:', data.message);
              document.getElementById('status').textContent = '⚠️ Stream Error: ' + data.message;
              document.getElementById('status').style.color = '#ffc107';
            } else if (data.type === 'disconnected') {
              console.log('Stream disconnected:', data.message);
              document.getElementById('status').textContent = '🔴 Stream Disconnected';
              document.getElementById('status').style.color = '#dc3545';
            }
          } catch (error) {
            console.error('Error parsing event data:', error);
          }
        };

        eventSource.onerror = function(event) {
          console.error('Event stream error:', event);
          document.getElementById('status').textContent = '❌ Stream Error - Falling back to polling...';
          document.getElementById('status').style.color = '#dc3545';
          
          // Close the event source
          eventSource.close();
          eventSource = null;
          
          // Fall back to polling after 2 seconds
          setTimeout(() => {
            startPolling();
          }, 2000);
        };
      }

      function stopEventStream() {
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
      }

      let pollingInterval = null;

      function startPolling() {
        if (pollingInterval) {
          clearInterval(pollingInterval);
        }
         
        document.getElementById('status').textContent = '🔄 Polling Mode Active';
        document.getElementById('status').style.color = '#ffc107';
        
        // Start polling every 2 seconds
        pollingInterval = setInterval(async function() {
          try {
            const res = await fetch(baseUrl + "/api/kqt300/poll");
            const response = await res.json();
            
            if (response.success && response.data && response.data.timestamp && response.data.timestamp !== lastScanCode) {
              lastScanCode = response.data.timestamp;
              
              // Add new scan to the beginning of the array
              const newScan = {
                data: response.data,
                html: createScanItem(response.data, true)
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
              if (response.data.timestamp) {
                document.getElementById('last-scan-time').textContent = formatTime(response.data.timestamp);
              }
              
              // Remove the 'new' class after animation
              setTimeout(() => {
                const newItems = document.querySelectorAll('.scan-item.new');
                newItems.forEach(item => item.classList.remove('new'));
              }, 1000);
            }
          } catch (e) {
            console.error("Error fetching scan", e);
            document.getElementById('status').textContent = '❌ Polling Error';
            document.getElementById('status').style.color = '#dc3545';
          }
        }, 2000);
      }

      function stopPolling() {
        if (pollingInterval) {
          clearInterval(pollingInterval);
          pollingInterval = null;
        }
      }

      function restartStream() {
        document.getElementById('status').textContent = '🔄 Restarting Stream...';
        document.getElementById('status').style.color = '#ffc107';
        stopEventStream();
        stopPolling();
        setTimeout(() => {
          startEventStream();
        }, 1000);
      }

      async function testScan() {
        try {
            const response = await fetch(baseUrl + '/api/kqt300/test-scan', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
            }
          });
          
          const data = await response.json();
          console.log('Test scan created:', data);
          
          // Show a brief success message
          const originalStatus = document.getElementById('status').textContent;
          document.getElementById('status').textContent = '✅ Test scan sent!';
          document.getElementById('status').style.color = '#28a745';
          
          setTimeout(() => {
            document.getElementById('status').textContent = originalStatus;
            document.getElementById('status').style.color = originalStatus.includes('🟢') ? '#28a745' : 
                                                          originalStatus.includes('🔄') ? '#ffc107' : '#dc3545';
          }, 2000);
          
        } catch (error) {
          console.error('Error creating test scan:', error);
        }
      }

      function testSimpleStream() {
        console.log('Testing simple stream...');
        
        const testEventSource = new EventSource(baseUrl + '/api/kqt300/stream-test');
        
        testEventSource.onopen = function(event) {
          console.log('Simple stream test connected');
        };

        testEventSource.onmessage = function(event) {
          try {
            const data = JSON.parse(event.data);
            console.log('Simple stream test received:', data);
            
            if (data.type === 'end') {
              console.log('Simple stream test completed');
              testEventSource.close();
            }
          } catch (error) {
            console.error('Error parsing simple stream data:', error);
          }
        };

        testEventSource.onerror = function(event) {
          console.error('Simple stream test error:', event);
          testEventSource.close();
        };
      }

      async function testPolling() {
        console.log('Testing polling endpoint...');
        
        try {
          const response = await fetch(baseUrl + '/api/kqt300/poll');
          const data = await response.json();
          console.log('Polling test response:', data);
          
          if (data.success) {
            console.log('Polling endpoint working correctly');
            alert('✅ Polling endpoint is working! Latest scan: ' + (data.data ? data.data.code : 'None'));
          } else {
            console.error('Polling endpoint error:', data.error);
            alert('❌ Polling endpoint error: ' + data.error);
          }
        } catch (error) {
          console.error('Error testing polling:', error);
          alert('❌ Error testing polling: ' + error.message);
        }
      }

         // Initialize
     document.addEventListener('DOMContentLoaded', function() {
       updateScanHistory();
       updateStats();
       
       // Start live streaming
       startEventStream();
     });

      // Clean up on page unload
      window.addEventListener('beforeunload', function() {
        stopEventStream();
        stopPolling();
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

     function switchTab(tabName) {
       // Hide all tab contents
       document.querySelectorAll('.tab-content').forEach(content => {
         content.classList.remove('active');
       });
       
       // Remove active class from all tabs
       document.querySelectorAll('.tab').forEach(tab => {
         tab.classList.remove('active');
       });
       
       // Show selected tab content
       document.getElementById(tabName + '-tab').classList.add('active');
       
       // Add active class to clicked tab
       event.target.classList.add('active');
     }

     function handleCheckKeyPress(event) {
       if (event.key === 'Enter') {
         checkCode();
       }
     }

     async function checkCode() {
       const code = document.getElementById('check-code').value.trim();
       const resultDiv = document.getElementById('check-result');
       const messageDiv = document.getElementById('check-message');
       const detailsDiv = document.getElementById('check-details');
       
       if (!code) {
         alert('Please enter a code to check');
         return;
       }
       
       try {
        const response = await fetch(baseUrl + '/api/kqt300/check', {
           method: 'POST',
           headers: {
             'Content-Type': 'application/json',
             'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
           },
           body: JSON.stringify({ code: code })
         });
         
         const data = await response.json();
         
         // Show result
         resultDiv.style.display = 'block';
         resultDiv.className = 'check-result';
         
         if (data.exists) {
           if (data.is_valid) {
             resultDiv.classList.add('success');
             messageDiv.innerHTML = `<strong>✅ ${data.message}</strong>`;
           } else {
             resultDiv.classList.add('warning');
             messageDiv.innerHTML = `<strong>⚠️ ${data.message}</strong>`;
           }
         } else {
           resultDiv.classList.add('error');
           messageDiv.innerHTML = `<strong>❌ ${data.message}</strong>`;
         }
         
         // Show details
         if (data.details) {
           let detailsHtml = '<div style="margin-top: 10px;"><strong>Details:</strong><br>';
           
           if (data.type === 'cashier_ticket') {
             detailsHtml += `
               <div style="margin-top: 5px;">
                 <strong>Transaction ID:</strong> ${data.details.transaction_id}<br>
                 <strong>Used:</strong> ${data.details.is_used ? 'Yes' : 'No'}<br>
                 <strong>Created:</strong> ${new Date(data.details.created_at).toLocaleString()}<br>
                 ${data.details.note ? `<strong>Note:</strong> ${data.details.note}` : ''}
               </div>
             `;
           } else if (data.type === 'vip_card') {
             detailsHtml += `
               <div style="margin-top: 5px;">
                 <strong>Name:</strong> ${data.details.name}<br>
                 <strong>Card Number:</strong> ${data.details.card_number}<br>
                 <strong>Status:</strong> ${data.details.status}<br>
                 <strong>Validity Start:</strong> ${data.details.validity_start ? new Date(data.details.validity_start).toLocaleDateString() : 'Not set'}<br>
                 <strong>Validity End:</strong> ${data.details.validity_end ? new Date(data.details.validity_end).toLocaleDateString() : 'Not set'}<br>
                 ${data.details.contact_number ? `<strong>Contact:</strong> ${data.details.contact_number}` : ''}
               </div>
             `;
           }
           
           detailsHtml += '</div>';
           detailsDiv.innerHTML = detailsHtml;
         } else {
           detailsDiv.innerHTML = '';
         }
         
       } catch (error) {
         console.error('Error checking code:', error);
         resultDiv.style.display = 'block';
         resultDiv.className = 'check-result error';
         messageDiv.innerHTML = '<strong>❌ Error checking code. Please try again.</strong>';
         detailsDiv.innerHTML = '';
       }
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
            <button class="btn btn-primary" onclick="restartStream()">🔄 Restart Stream</button>
            <button class="btn btn-primary" onclick="testScan()">🧪 Test Scan</button>
            <button class="btn btn-primary" onclick="testSimpleStream()">🔬 Test Stream</button>
            <button class="btn btn-primary" onclick="testPolling()">📡 Test Polling</button>
            <button class="btn btn-danger" onclick="clearHistory()">🗑️ Clear History</button>
          </div>
     </div>

     <div class="tabs">
       <button class="tab active" onclick="switchTab('live')">📱 Live Scans</button>
       <button class="tab" onclick="switchTab('check')">🔍 Check Code</button>
     </div>
     
     <div class="tab-content active" id="live-tab">
       <div class="scan-history" id="scan-history">
         <!-- Scan items will be dynamically added here -->
       </div>
     </div>

     <div class="tab-content" id="check-tab">
       <div class="check-form">
         <div class="form-group">
           <label class="form-label">Enter QR Code or Card Number:</label>
           <input type="text" class="form-input" id="check-code" placeholder="Enter code to check..." onkeypress="handleCheckKeyPress(event)">
         </div>
         <button class="btn btn-primary" onclick="checkCode()">🔍 Check Code</button>
         
         <div class="check-result" id="check-result">
           <div id="check-message"></div>
           <div id="check-details" style="margin-top: 10px; font-size: 0.9rem;"></div>
         </div>
       </div>
     </div>
  </div>
</body>
</html>
