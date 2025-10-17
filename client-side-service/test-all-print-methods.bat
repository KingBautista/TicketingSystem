@echo off
echo Testing All Print Methods
echo =========================

echo.
echo 1. Testing simple text print...
node star-final-printer.js test

echo.
echo 2. Testing bold text print...
node star-final-printer.js bold "BOLD TEST MESSAGE"

echo.
echo 3. Testing QR code print...
node star-final-printer.js qr "TEST-QR-CODE-123"

echo.
echo 4. Testing open cash receipt...
node star-final-printer.js opencash "TestCashier,1000.00,12345"

echo.
echo 5. Testing close cash receipt...
node star-final-printer.js closecash "{\"cashierName\":\"TestCashier\",\"sessionId\":\"12345\",\"openingCash\":1000,\"closingCash\":1500,\"dailyTransactions\":[],\"dailyTotal\":500}"

echo.
echo 6. Testing transaction receipt...
node star-final-printer.js transaction "{\"transactionId\":\"TEST-123\",\"promoterName\":\"Test Promoter\",\"rateName\":\"Test Rate\",\"quantity\":1,\"total\":100,\"paidAmount\":100,\"change\":0,\"cashierName\":\"TestCashier\",\"sessionId\":\"12345\",\"discounts\":[],\"tickets\":[\"QR-TEST-1\",\"QR-TEST-2\"],\"createdAt\":\"2025-01-16T10:00:00.000Z\"}"

echo.
echo All print tests completed. Check if paper came out of the printer for each test.
pause
