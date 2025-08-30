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
}
