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
     *             @OA\Property(property="message", type="string", example="Scan validated successfully"),
     *             @OA\Property(property="scan_type", type="string", example="cashier_ticket"),
     *             @OA\Property(property="code", type="string", example="313233343536")
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Invalid scan data",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Ticket already used"),
     *             @OA\Property(property="scan_type", type="string", example="cashier_ticket"),
     *             @OA\Property(property="code", type="string", example="313233343536")
     *         )
     *     )
     * )
     * 
     * @OA\Post(
     *     path="/api/kqt300/validate",
     *     summary="KQT300 device scan validation endpoint",
     *     description="Primary endpoint for KQT300 QR scanner device to validate scanned codes",
     *     tags={"KQT300 Device Integration"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="vgdecoderesult", type="string", example="313233343536", description="Hex encoded scan result from KQT300 device"),
     *             @OA\Property(property="devicenumber", type="string", example="001", description="KQT300 device number")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Scan validated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Scan validated successfully"),
     *             @OA\Property(property="scan_type", type="string", example="cashier_ticket"),
     *             @OA\Property(property="code", type="string", example="313233343536")
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Invalid scan or ticket already used",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Ticket already used"),
     *             @OA\Property(property="scan_type", type="string", example="cashier_ticket"),
     *             @OA\Property(property="code", type="string", example="313233343536")
     *         )
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
                    $vip = \App\Models\VIP::where('card_number', $convertedCode)->where('is_active', 1)->first();
                    
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
            // Success response format for KQT300 device
            $responseData = [
                'resultCode' => '0000', // 0000 = execute door opening command
                'wavFileName' => '1', // Play success sound (1.wav)
                'msg' => 'Access Granted - Welcome!',
                'msgTimeout' => 3000
            ];
            
            $response = 'code=0000&&desc=json&&' . json_encode($responseData);
            
            return response($response)
                ->header('Content-Type', 'text/plain');
        } else {
            // Failure response format for KQT300 device
            $responseData = [
                'resultCode' => '0001', // 0001 = do not open door
                'wavFileName' => '2', // Play error sound (2.wav)
                'msg' => $errorMessage ?: 'Access Denied',
                'msgTimeout' => 3000
            ];
            
            $response = 'code=0001&&desc=json&&' . json_encode($responseData);
            
            return response($response)
                ->header('Content-Type', 'text/plain');
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
     * 
     * @OA\Get(
     *     path="/api/kqt300/latest",
     *     summary="Get the latest scan data for KQT300 device",
     *     description="Returns the most recent scan data for KQT300 device monitoring",
     *     tags={"KQT300 Device Integration"},
     *     @OA\Response(
     *         response=200,
     *         description="Latest scan data",
     *         @OA\JsonContent(
     *             @OA\Property(property="code", type="string", example="313233343536", description="Decoded scan code"),
     *             @OA\Property(property="device", type="string", example="001", description="KQT300 device number"),
     *             @OA\Property(property="timestamp", type="string", format="date-time", example="2024-01-01T12:00:00", description="Scan timestamp"),
     *             @OA\Property(property="scan_type", type="string", example="cashier_ticket", description="Type of scan"),
     *             @OA\Property(property="is_valid", type="boolean", example=true, description="Whether scan was valid"),
     *             @OA\Property(property="error_message", type="string", example=null, description="Error message if any")
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
     * 
     * @OA\Get(
     *     path="/api/kqt300/stream",
     *     summary="KQT300 device real-time scan stream",
     *     description="Server-Sent Events stream for KQT300 device to receive real-time scan updates",
     *     tags={"KQT300 Device Integration"},
     *     @OA\Response(
     *         response=200,
     *         description="Server-Sent Events stream with scan updates",
     *         @OA\JsonContent(
     *             @OA\Property(property="type", type="string", example="scan_update", description="Event type"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="code", type="string", example="313233343536"),
     *                 @OA\Property(property="device", type="string", example="001"),
     *                 @OA\Property(property="timestamp", type="string", format="date-time", example="2024-01-01T12:00:00"),
     *                 @OA\Property(property="scan_type", type="string", example="cashier_ticket"),
     *                 @OA\Property(property="is_valid", type="boolean", example=true),
     *                 @OA\Property(property="error_message", type="string", example=null)
     *             )
     *         )
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
     * 
     * @OA\Get(
     *     path="/api/kqt300/poll",
     *     summary="KQT300 device polling endpoint",
     *     description="Simple polling endpoint for KQT300 device to check for latest scan data",
     *     tags={"KQT300 Device Integration"},
     *     @OA\Response(
     *         response=200,
     *         description="Latest scan data with timestamp",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="code", type="string", example="313233343536"),
     *                 @OA\Property(property="device", type="string", example="001"),
     *                 @OA\Property(property="timestamp", type="string", format="date-time", example="2024-01-01T12:00:00"),
     *                 @OA\Property(property="scan_type", type="string", example="cashier_ticket"),
     *                 @OA\Property(property="is_valid", type="boolean", example=true),
     *                 @OA\Property(property="error_message", type="string", example=null)
     *             ),
     *             @OA\Property(property="timestamp", type="string", format="date-time", example="2024-01-01T12:00:00")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="error", type="string", example="Database connection error")
     *         )
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
     * 
     * @OA\Post(
     *     path="/api/kqt300/test-scan",
     *     summary="KQT300 device test scan endpoint",
     *     description="Creates a test scan for KQT300 device testing and stream verification",
     *     tags={"KQT300 Device Integration"},
     *     @OA\Response(
     *         response=200,
     *         description="Test scan created successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Test scan created"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="code", type="string", example="TEST1234"),
     *                 @OA\Property(property="device", type="string", example="Test Device"),
     *                 @OA\Property(property="timestamp", type="string", format="date-time", example="2024-01-01T12:00:00"),
     *                 @OA\Property(property="scan_type", type="string", example="test"),
     *                 @OA\Property(property="is_valid", type="boolean", example=true),
     *                 @OA\Property(property="error_message", type="string", example=null)
     *             )
     *         )
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
     * 
     * @OA\Get(
     *     path="/api/kqt300/stream-test",
     *     summary="KQT300 device stream test endpoint",
     *     description="Simple test endpoint to verify KQT300 device streaming functionality",
     *     tags={"KQT300 Device Integration"},
     *     @OA\Response(
     *         response=200,
     *         description="Server-Sent Events test stream",
     *         @OA\JsonContent(
     *             @OA\Property(property="type", type="string", example="test", description="Event type"),
     *             @OA\Property(property="message", type="string", example="Test message 1", description="Test message"),
     *             @OA\Property(property="timestamp", type="string", format="date-time", example="2024-01-01T12:00:00")
     *         )
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
     * 
     * @OA\Post(
     *     path="/api/kqt300/check",
     *     summary="KQT300 device code validation check",
     *     description="Check if a code exists in the database without marking it as used for KQT300 device validation",
     *     tags={"KQT300 Device Integration"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="code", type="string", example="313233343536", description="Code to check for KQT300 device")
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
     *             @OA\Property(property="details", type="object",
     *                 @OA\Property(property="transaction_id", type="string", example="TXN123456"),
     *                 @OA\Property(property="is_used", type="boolean", example=false),
     *                 @OA\Property(property="created_at", type="string", format="date-time", example="2024-01-01T12:00:00"),
     *                 @OA\Property(property="note", type="string", example="VIP ticket")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error",
     *         @OA\JsonContent(
     *             @OA\Property(property="exists", type="boolean", example=false),
     *             @OA\Property(property="type", type="string", example=null),
     *             @OA\Property(property="is_valid", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Error checking code: Database connection failed"),
     *             @OA\Property(property="details", type="string", example=null)
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
                $isValid = !$cashierTicket->is_used;
                $message = $cashierTicket->is_used ? 'Ticket already used' : 'Ticket found and available';
                
                return response()->json([
                    'exists' => true,
                    'type' => 'cashier_ticket',
                    'is_valid' => $isValid,
                    'message' => $message,
                    'details' => [
                        'transaction_id' => $cashierTicket->transaction_id,
                        'qr_code' => $cashierTicket->qr_code,
                        'is_used' => $cashierTicket->is_used,
                        'created_at' => $cashierTicket->created_at,
                        'note' => $cashierTicket->note
                    ]
                ]);
            }

            // Not a cashier ticket, check if it's a VIP card
            // Convert from hex to decimal only if it's purely hex (no letters other than a-f)
            if (preg_match('/^[0-9a-fA-F]+$/', $code) && preg_match('/[a-fA-F]/', $code)) {
                $convertedCode = hexdec($code);
            } else {
                $convertedCode = is_numeric($code) ? (int)$code : $code;
            }
            
            // Check VIP table
            $vip = \App\Models\VIP::where('card_number', $convertedCode)->where('is_active', 1)->first();
            
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
                        'id' => $vip->id,
                        'name' => $vip->name,
                        'card_number' => $vip->card_number,
                        'original_code' => $code,
                        'converted_code' => $convertedCode,
                        'validity_start' => $vip->validity_start,
                        'validity_end' => $vip->validity_end,
                        'status' => $vip->status,
                        'is_active' => $vip->is_active,
                        'contact_number' => $vip->contact_number,
                        'address' => $vip->address,
                        'created_at' => $vip->created_at
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
     * 
     * @OA\Get(
     *     path="/api/kqt300/health",
     *     summary="KQT300 device health check endpoint",
     *     description="Health check endpoint for KQT300 device monitoring and Docker health checks",
     *     tags={"KQT300 Device Integration"},
     *     @OA\Response(
     *         response=200,
     *         description="System health status",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="healthy"),
     *             @OA\Property(property="timestamp", type="string", format="date-time", example="2024-01-01T12:00:00"),
     *             @OA\Property(property="service", type="string", example="ScanController"),
     *             @OA\Property(property="database_connection", type="boolean", example=true),
     *             @OA\Property(property="cache_connection", type="boolean", example=true),
     *             @OA\Property(property="last_scan_time", type="string", format="date-time", example="2024-01-01T12:00:00"),
     *             @OA\Property(property="active_devices", type="integer", example=2),
     *             @OA\Property(property="uptime", type="string", example="24h 30m 15s")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="System unhealthy",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="unhealthy"),
     *             @OA\Property(property="error", type="string", example="Database connection failed"),
     *             @OA\Property(property="timestamp", type="string", format="date-time", example="2024-01-01T12:00:00")
     *         )
     *     )
     * )
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

    /**
     * Test method to debug checkCode functionality
     * 
     * @OA\Post(
     *     path="/api/kqt300/debug-check",
     *     summary="Debug checkCode method",
     *     description="Test method to debug database connections and searches",
     *     tags={"KQT300 Device Integration"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="code", type="string", example="TEST123", description="Code to test")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Debug results",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="debug_info", type="object")
     *         )
     *     )
     * )
     */
    public function debugCheckCode(Request $request)
    {
        $code = $request->input('code', 'TEST123');
        $debugInfo = [
            'input_code' => $code,
            'timestamp' => now()->toISOString(),
            'database_connection' => false,
            'cashier_tickets_table' => [],
            'vip_table' => [],
            'cashier_ticket_search' => null,
            'vip_search' => null,
            'errors' => []
        ];

        try {
            // Test database connection
            \DB::connection()->getPdo();
            $debugInfo['database_connection'] = true;
            \Log::info('Database connection successful');

            // Test CashierTicket table
            try {
                $cashierTickets = \App\Models\CashierTicket::all();
                $debugInfo['cashier_tickets_table'] = [
                    'total_count' => $cashierTickets->count(),
                    'sample_records' => $cashierTickets->take(3)->map(function($ticket) {
                        return [
                            'id' => $ticket->id,
                            'qr_code' => $ticket->qr_code,
                            'is_used' => $ticket->is_used,
                            'transaction_id' => $ticket->transaction_id,
                            'created_at' => $ticket->created_at
                        ];
                    })->toArray()
                ];

                // Test search for the specific code
                $cashierTicket = \App\Models\CashierTicket::where('qr_code', $code)->first();
                $debugInfo['cashier_ticket_search'] = $cashierTicket ? [
                    'found' => true,
                    'id' => $cashierTicket->id,
                    'qr_code' => $cashierTicket->qr_code,
                    'is_used' => $cashierTicket->is_used,
                    'transaction_id' => $cashierTicket->transaction_id
                ] : ['found' => false];

                \Log::info('CashierTicket table test completed', $debugInfo['cashier_ticket_search']);

            } catch (\Exception $e) {
                $debugInfo['errors'][] = 'CashierTicket error: ' . $e->getMessage();
                \Log::error('CashierTicket table error:', ['error' => $e->getMessage()]);
            }

            // Test VIP table
            try {
                $vips = \App\Models\VIP::all();
                $debugInfo['vip_table'] = [
                    'total_count' => $vips->count(),
                    'sample_records' => $vips->take(3)->map(function($vip) {
                        return [
                            'id' => $vip->id,
                            'name' => $vip->name,
                            'card_number' => $vip->card_number,
                            'validity_start' => $vip->validity_start,
                            'validity_end' => $vip->validity_end,
                            'status' => $vip->status
                        ];
                    })->toArray()
                ];

                // Test search for the specific code (with hex conversion)
                $convertedCode = (preg_match('/^[0-9a-fA-F]+$/', $code) && preg_match('/[a-fA-F]/', $code)) ? hexdec($code) : (is_numeric($code) ? (int)$code : $code);
                $vip = \App\Models\VIP::where('card_number', $convertedCode)->where('is_active', 1)->first();
                $debugInfo['vip_search'] = $vip ? [
                    'found' => true,
                    'id' => $vip->id,
                    'name' => $vip->name,
                    'card_number' => $vip->card_number,
                    'original_code' => $code,
                    'converted_code' => $convertedCode,
                    'validity_start' => $vip->validity_start,
                    'validity_end' => $vip->validity_end,
                    'status' => $vip->status
                ] : [
                    'found' => false,
                    'original_code' => $code,
                    'converted_code' => $convertedCode
                ];

                \Log::info('VIP table test completed', $debugInfo['vip_search']);

            } catch (\Exception $e) {
                $debugInfo['errors'][] = 'VIP table error: ' . $e->getMessage();
                \Log::error('VIP table error:', ['error' => $e->getMessage()]);
            }

            // Test the actual checkCode logic
            try {
                $testResult = $this->testCheckCodeLogic($code);
                $debugInfo['check_code_result'] = $testResult;
            } catch (\Exception $e) {
                $debugInfo['errors'][] = 'checkCode logic error: ' . $e->getMessage();
                \Log::error('checkCode logic error:', ['error' => $e->getMessage()]);
            }

        } catch (\Exception $e) {
            $debugInfo['errors'][] = 'Database connection error: ' . $e->getMessage();
            \Log::error('Database connection error:', ['error' => $e->getMessage()]);
        }

        return response()->json([
            'success' => true,
            'debug_info' => $debugInfo
        ]);
    }

    /**
     * Test the checkCode logic without database calls
     */
    private function testCheckCodeLogic($code)
    {
        $result = [
            'code' => $code,
            'steps' => []
        ];

        // Step 1: Check if code is provided
        if (!$code) {
            $result['steps'][] = 'No code provided - would return error';
            return $result;
        }

        // Step 2: Search CashierTicket
        try {
            $cashierTicket = \App\Models\CashierTicket::where('qr_code', $code)->first();
            if ($cashierTicket) {
                $result['steps'][] = 'Found in CashierTicket table';
                $result['steps'][] = 'Ticket is_used: ' . ($cashierTicket->is_used ? 'true' : 'false');
                $result['steps'][] = 'Would return: ' . ($cashierTicket->is_used ? '0001 (already used)' : '0000 (valid)');
                return $result;
            } else {
                $result['steps'][] = 'Not found in CashierTicket table';
            }
        } catch (\Exception $e) {
            $result['steps'][] = 'CashierTicket search error: ' . $e->getMessage();
        }

        // Step 3: Convert and search VIP
        try {
            $convertedCode = (preg_match('/^[0-9a-fA-F]+$/', $code) && preg_match('/[a-fA-F]/', $code)) ? hexdec($code) : (is_numeric($code) ? (int)$code : $code);
            $result['steps'][] = 'Converted code: ' . $convertedCode;
            
            $vip = \App\Models\VIP::where('card_number', $convertedCode)->where('is_active', 1)->first();
            if ($vip) {
                $result['steps'][] = 'Found in VIP table';
                $result['steps'][] = 'VIP name: ' . $vip->name;
                $result['steps'][] = 'VIP validity_start: ' . $vip->validity_start;
                $result['steps'][] = 'VIP validity_end: ' . $vip->validity_end;
                
                // Check validity
                $now = now();
                $validityStart = $vip->validity_start ? \Carbon\Carbon::parse($vip->validity_start) : null;
                $validityEnd = $vip->validity_end ? \Carbon\Carbon::parse($vip->validity_end) : null;
                
                if ($validityStart && $validityEnd) {
                    if ($now->between($validityStart, $validityEnd)) {
                        $result['steps'][] = 'VIP card is valid - would return 0000';
                    } else {
                        $result['steps'][] = 'VIP card expired/not yet valid - would return 0001';
                    }
                } else {
                    $result['steps'][] = 'VIP card has no validity period - would return 0001';
                }
                return $result;
            } else {
                $result['steps'][] = 'Not found in VIP table';
            }
        } catch (\Exception $e) {
            $result['steps'][] = 'VIP search error: ' . $e->getMessage();
        }

        $result['steps'][] = 'Code not found anywhere - would return 0001';
        return $result;
    }
}
