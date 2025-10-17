@echo off
echo Testing All Services
echo ===================

echo.
echo 1. Testing Client Service (port 3001)...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3001/health' -UseBasicParsing; Write-Host 'Status:' $response.StatusCode; Write-Host 'Response:' $response.Content } catch { Write-Host 'Error:' $_.Exception.Message }"

echo.
echo 2. Testing API Service (port 8000)...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:8000/api/health' -UseBasicParsing; Write-Host 'Status:' $response.StatusCode; Write-Host 'Response:' $response.Content } catch { Write-Host 'Error:' $_.Exception.Message }"

echo.
echo 3. Testing Admin Panel (port 4000)...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:4000' -UseBasicParsing; Write-Host 'Status:' $response.StatusCode } catch { Write-Host 'Error:' $_.Exception.Message }"

echo.
echo 4. Testing Print Function...
powershell -Command "try { $body = @{ content = 'Test Print'; type = 'test' } | ConvertTo-Json; $response = Invoke-WebRequest -Uri 'http://localhost:3001/print' -Method POST -Body $body -ContentType 'application/json' -UseBasicParsing; Write-Host 'Print Status:' $response.StatusCode; Write-Host 'Print Response:' $response.Content } catch { Write-Host 'Print Error:' $_.Exception.Message }"

echo.
echo Services test completed.
pause
