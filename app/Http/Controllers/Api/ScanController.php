<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\MessageService;
use Illuminate\Support\Facades\Cache;

class ScanController extends BaseController
{
    public function __construct(MessageService $messageService)
    {
        parent::__construct(null, $messageService);
    }

    /**
     * Store scan data from barcode scanner.
     * 
     * @OA\Post(
     *     path="/api/scan",
     *     summary="Store scan data from barcode scanner",
     *     tags={"Scan Management"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="vgdecoderesult", type="string", example="313233343536", description="Hex encoded scan result"),
     *             @OA\Property(property="devicenumber", type="string", example="001", description="Device number")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Scan data stored successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Scan received")
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Invalid scan data"
     *     )
     * )
     */
    public function store(Request $request)
    {
        $rawBody = $request->getContent();

        // Convert && to &, then parse like a query string
        parse_str(str_replace('&&', '&', $rawBody), $parsed);

        // Validate and conditionally convert the scan result
        $vgdecoderesult = $parsed['vgdecoderesult'] ?? null;
        $code = null;
        $scanType = null;
        $isValid = false;
        $errorMessage = null;

        // add 1st $scanData here for audit trail
        $scanData = [
            'code' => $vgdecoderesult,
            'device' => $parsed['devicenumber'] ?? null,
            'timestamp' => now()->toDateTimeString(),
            'scan_type' => '1st scan audit',
            'is_valid' => $isValid,
            'error_message' => $errorMessage,
        ];
        \Log::info('Parsed scan:', $scanData);

        if ($vgdecoderesult) {
            try {
                // First, check if it's a cashier ticket QR code
                $cashierTicket = \App\Models\CashierTicket::where('qr_code', $vgdecoderesult)->first();
                
                if ($cashierTicket) {
                    // Found cashier ticket
                    if ($cashierTicket->is_used) {
                        $errorMessage = 'Ticket already used';
                        \Log::warning('Ticket already used:', ['qr_code' => $vgdecoderesult]);
                    } else {
                        // Mark ticket as used
                        $cashierTicket->update(['is_used' => true]);
                        
                        $code = $vgdecoderesult;
                        $scanType = 'cashier_ticket';
                        $isValid = true;
                        
                        \Log::info('Cashier ticket used successfully:', [
                            'qr_code' => $vgdecoderesult,
                            'transaction_id' => $cashierTicket->transaction_id
                        ]);
                    }
                } else {
                    // Not a cashier ticket, check if it's a VIP card
                    // Convert from hex to decimal if it contains hex characters
                    if (preg_match('/[a-fA-F]/', $vgdecoderesult)) {
                        $convertedCode = hexdec($vgdecoderesult);
                    } else {
                        $convertedCode = is_numeric($vgdecoderesult) ? (int)$vgdecoderesult : $vgdecoderesult;
                    }
                    
                    // Check VIP table
                    $vip = \App\Models\VIP::where('card_number', $convertedCode)->first();
                    
                    if ($vip) {
                        // Check validity period
                        $now = now();
                        $validityStart = $vip->validity_start ? \Carbon\Carbon::parse($vip->validity_start) : null;
                        $validityEnd = $vip->validity_end ? \Carbon\Carbon::parse($vip->validity_end) : null;
                        
                        if ($validityStart && $validityEnd) {
                            if ($now->between($validityStart, $validityEnd)) {
                                $code = $convertedCode;
                                $scanType = 'vip_card';
                                $isValid = true;
                                
                                \Log::info('VIP card validated successfully:', [
                                    'card_number' => $convertedCode,
                                    'vip_name' => $vip->name,
                                    'validity_start' => $validityStart,
                                    'validity_end' => $validityEnd
                                ]);
                            } else {
                                $errorMessage = 'VIP card expired or not yet valid';
                                \Log::warning('VIP card validity check failed:', [
                                    'card_number' => $convertedCode,
                                    'vip_name' => $vip->name,
                                    'current_time' => $now,
                                    'validity_start' => $validityStart,
                                    'validity_end' => $validityEnd
                                ]);
                            }
                        } else {
                            $errorMessage = 'VIP card has no validity period set';
                            \Log::warning('VIP card has no validity period:', [
                                'card_number' => $convertedCode,
                                'vip_name' => $vip->name
                            ]);
                        }
                    } else {
                        $errorMessage = 'Invalid code - not found in tickets or VIP cards';
                        \Log::warning('Invalid scan code:', [
                            'original_code' => $vgdecoderesult,
                            'converted_code' => $convertedCode
                        ]);
                    }
                }
            } catch (\Exception $e) {
                $errorMessage = 'Scanner error: ' . $e->getMessage();
                \Log::error('Scanner error:', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'vgdecoderesult' => $vgdecoderesult
                ]);
            }
        } else {
            $errorMessage = 'No scan data received';
            \Log::warning('No scan data received');
        }

        $scanData = [
            'code' => $code,
            'device' => $parsed['devicenumber'] ?? null,
            'timestamp' => now()->toDateTimeString(),
            'scan_type' => $scanType,
            'is_valid' => $isValid,
            'error_message' => $errorMessage,
        ];

        \Log::info('Parsed scan:', $scanData);

        Cache::put('latest_scan', $scanData, now()->addMinutes(10));

        if ($isValid) {
            return response()->json([
                'status' => true, 
                'message' => 'Scan validated successfully',
                'scan_type' => $scanType,
                'code' => $code
            ]);
        } else {
            return response()->json([
                'status' => false, 
                'message' => $errorMessage,
                'scan_type' => $scanType,
                'code' => $code
            ], 400);
        }
    }

    /**
     * Get the latest scan data.
     * 
     * @OA\Get(
     *     path="/api/scan/latest",
     *     summary="Get the latest scan data",
     *     tags={"Scan Management"},
     *     @OA\Response(
     *         response=200,
     *         description="Latest scan data",
     *         @OA\JsonContent(
     *             @OA\Property(property="code", type="string", example="123456", description="Decoded scan code"),
     *             @OA\Property(property="device", type="string", example="001", description="Device number"),
     *             @OA\Property(property="timestamp", type="string", format="date-time", example="2024-01-01T12:00:00", description="Scan timestamp")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="No scan data available"
     *     )
     * )
     */
    public function showLatest()
    {
        return response()->json(Cache::get('latest_scan'));
    }

    /**
     * Stream live scan updates using Server-Sent Events.
     * 
     * @OA\Get(
     *     path="/api/access/stream",
     *     summary="Stream live scan updates",
     *     tags={"Scan Management"},
     *     @OA\Response(
     *         response=200,
     *         description="Server-Sent Events stream"
     *     )
     * )
     */
    public function stream()
    {
        // Set headers for SSE
        header('Content-Type: text/event-stream');
        header('Cache-Control: no-cache');
        header('Connection: keep-alive');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Headers: Cache-Control');
        header('X-Accel-Buffering: no'); // Disable nginx buffering

        // Disable output buffering
        if (ob_get_level()) {
            ob_end_clean();
        }

        // Send initial connection message
        echo "data: " . json_encode(['type' => 'connected', 'message' => 'Stream connected']) . "\n\n";
        if (ob_get_level()) {
            ob_flush();
        }
        flush();

        $lastScanData = null;
        $pingCounter = 0;
        $maxIterations = 3600; // 1 hour max
        $iteration = 0;

        // Simple polling approach - check cache every 1 second
        while ($iteration < $maxIterations) {
            // Check if client is still connected
            if (connection_aborted()) {
                break;
            }

            try {
                // Get latest scan data from cache
                $latestScan = Cache::get('latest_scan');
                
                // If we have new scan data, send it
                if ($latestScan && $latestScan !== $lastScanData) {
                    echo "data: " . json_encode([
                        'type' => 'scan_update',
                        'data' => $latestScan
                    ]) . "\n\n";
                    $lastScanData = $latestScan;
                    if (ob_get_level()) {
                        ob_flush();
                    }
                    flush();
                }

                // Send keep-alive ping every 30 seconds
                $pingCounter++;
                if ($pingCounter >= 30) {
                    echo "data: " . json_encode(['type' => 'ping', 'timestamp' => now()->toISOString()]) . "\n\n";
                    if (ob_get_level()) {
                        ob_flush();
                    }
                    flush();
                    $pingCounter = 0;
                }

            } catch (Exception $e) {
                echo "data: " . json_encode(['type' => 'error', 'message' => 'Error: ' . $e->getMessage()]) . "\n\n";
                if (ob_get_level()) {
                    ob_flush();
                }
                flush();
            }

            $iteration++;
            // Sleep for 1 second
            sleep(1);
        }

        // Send disconnect message
        echo "data: " . json_encode(['type' => 'disconnected', 'message' => 'Stream ended']) . "\n\n";
        if (ob_get_level()) {
            ob_flush();
        }
        flush();
    }

    /**
     * Simple polling endpoint that returns latest scan data.
     * 
     * @OA\Get(
     *     path="/api/access/poll",
     *     summary="Poll for latest scan data",
     *     tags={"Scan Management"},
     *     @OA\Response(
     *         response=200,
     *         description="Latest scan data"
     *     )
     * )
     */
    public function poll()
    {
        try {
            $latestScan = Cache::get('latest_scan');
            
            return response()->json([
                'success' => true,
                'data' => $latestScan,
                'timestamp' => now()->toISOString()
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Test endpoint to simulate a scan for testing the stream.
     * 
     * @OA\Post(
     *     path="/api/access/test-scan",
     *     summary="Test scan endpoint",
     *     tags={"Scan Management"},
     *     @OA\Response(
     *         response=200,
     *         description="Test scan created"
     *     )
     * )
     */
    public function testScan()
    {
        $testData = [
            'code' => 'TEST' . rand(1000, 9999),
            'device' => 'Test Device',
            'timestamp' => now()->toDateTimeString(),
            'scan_type' => 'test',
            'is_valid' => true,
            'error_message' => null
        ];

        // Store in cache to trigger stream update
        Cache::put('latest_scan', $testData, 300); // 5 minutes

        return response()->json([
            'message' => 'Test scan created',
            'data' => $testData
        ]);
    }

    /**
     * Simple test endpoint to verify streaming works.
     * 
     * @OA\Get(
     *     path="/api/access/stream-test",
     *     summary="Test streaming endpoint",
     *     tags={"Scan Management"},
     *     @OA\Response(
     *         response=200,
     *         description="Simple stream test"
     *     )
     * )
     */
    public function streamTest()
    {
        header('Content-Type: text/event-stream');
        header('Cache-Control: no-cache');
        header('Connection: keep-alive');
        header('Access-Control-Allow-Origin: *');

        // Disable output buffering
        if (ob_get_level()) {
            ob_end_clean();
        }

        // Send a simple message every second for 10 seconds
        for ($i = 1; $i <= 10; $i++) {
            echo "data: " . json_encode([
                'type' => 'test',
                'message' => "Test message {$i}",
                'timestamp' => now()->toISOString()
            ]) . "\n\n";
            
            if (ob_get_level()) {
                ob_flush();
            }
            flush();
            
            sleep(1);
        }

        echo "data: " . json_encode(['type' => 'end', 'message' => 'Test completed']) . "\n\n";
        if (ob_get_level()) {
            ob_flush();
        }
        flush();
    }

    /**
     * Check if a code exists in the database without marking it as used.
     * 
     * @OA\Post(
     *     path="/api/access/check",
     *     summary="Check if a code exists in the database",
     *     tags={"Scan Management"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="code", type="string", example="313233343536", description="Code to check")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Code check result",
     *         @OA\JsonContent(
     *             @OA\Property(property="exists", type="boolean", example=true),
     *             @OA\Property(property="type", type="string", example="cashier_ticket"),
     *             @OA\Property(property="is_valid", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Code found and valid"),
     *             @OA\Property(property="details", type="object")
     *         )
     *     )
     * )
     */
    public function checkCode(Request $request)
    {
        $code = $request->input('code');
        
        if (!$code) {
            return response()->json([
                'exists' => false,
                'type' => null,
                'is_valid' => false,
                'message' => 'No code provided',
                'details' => null
            ]);
        }

        try {
            // First, check if it's a cashier ticket QR code
            $cashierTicket = \App\Models\CashierTicket::where('qr_code', $code)->first();
            
            if ($cashierTicket) {
                return response()->json([
                    'exists' => true,
                    'type' => 'cashier_ticket',
                    'is_valid' => !$cashierTicket->is_used,
                    'message' => $cashierTicket->is_used ? 'Ticket already used' : 'Ticket found and available',
                    'details' => [
                        'transaction_id' => $cashierTicket->transaction_id,
                        'is_used' => $cashierTicket->is_used,
                        'created_at' => $cashierTicket->created_at,
                        'note' => $cashierTicket->note
                    ]
                ]);
            }

            // Not a cashier ticket, check if it's a VIP card
            // Convert from hex to decimal if it contains hex characters
            if (preg_match('/[a-fA-F]/', $code)) {
                $convertedCode = hexdec($code);
            } else {
                $convertedCode = is_numeric($code) ? (int)$code : $code;
            }
            
            // Check VIP table
            $vip = \App\Models\VIP::where('card_number', $convertedCode)->first();
            
            if ($vip) {
                // Check validity period
                $now = now();
                $validityStart = $vip->validity_start ? \Carbon\Carbon::parse($vip->validity_start) : null;
                $validityEnd = $vip->validity_end ? \Carbon\Carbon::parse($vip->validity_end) : null;
                
                $isValid = false;
                $message = '';
                
                if ($validityStart && $validityEnd) {
                    if ($now->between($validityStart, $validityEnd)) {
                        $isValid = true;
                        $message = 'VIP card found and valid';
                    } else {
                        $isValid = false;
                        $message = 'VIP card expired or not yet valid';
                    }
                } else {
                    $isValid = false;
                    $message = 'VIP card has no validity period set';
                }

                return response()->json([
                    'exists' => true,
                    'type' => 'vip_card',
                    'is_valid' => $isValid,
                    'message' => $message,
                    'details' => [
                        'name' => $vip->name,
                        'card_number' => $convertedCode,
                        'validity_start' => $validityStart,
                        'validity_end' => $validityEnd,
                        'status' => $vip->status,
                        'contact_number' => $vip->contact_number
                    ]
                ]);
            }

            // Code not found
            return response()->json([
                'exists' => false,
                'type' => null,
                'is_valid' => false,
                'message' => 'Code not found in tickets or VIP cards',
                'details' => null
            ]);

        } catch (\Exception $e) {
            \Log::error('Error checking code:', [
                'error' => $e->getMessage(),
                'code' => $code
            ]);

            return response()->json([
                'exists' => false,
                'type' => null,
                'is_valid' => false,
                'message' => 'Error checking code: ' . $e->getMessage(),
                'details' => null
            ], 500);
        }
    }

    /**
     * Health check endpoint for Docker monitoring
     */
    public function health()
    {
        try {
            $healthData = [
                'status' => 'healthy',
                'timestamp' => now()->toISOString(),
                'service' => 'ScanController',
                'database_connection' => $this->checkDatabaseConnection(),
                'cache_connection' => $this->checkCacheConnection(),
                'last_scan_time' => $this->getLastScanTime(),
                'active_devices' => $this->getActiveDeviceCount(),
                'uptime' => $this->getSystemUptime(),
            ];

            return response()->json($healthData);
        } catch (\Exception $e) {
            \Log::error('ScanController Health Check Error: ' . $e->getMessage());
            return response()->json([
                'status' => 'unhealthy',
                'error' => $e->getMessage(),
                'timestamp' => now()->toISOString()
            ], 500);
        }
    }

    /**
     * Check database connection
     */
    private function checkDatabaseConnection(): bool
    {
        try {
            \DB::connection()->getPdo();
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Check cache connection
     */
    private function checkCacheConnection(): bool
    {
        try {
            Cache::has('health_check');
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Get last scan time
     */
    private function getLastScanTime(): ?string
    {
        $lastScan = Cache::get('last_scan_time');
        return $lastScan ?: null;
    }

    /**
     * Get active device count
     */
    private function getActiveDeviceCount(): int
    {
        // Count active devices in cache
        $devices = Cache::get('active_devices', []);
        return count($devices);
    }

    /**
     * Get system uptime
     */
    private function getSystemUptime(): string
    {
        // Calculate system uptime (placeholder)
        return '24h 30m 15s';
    }
}
