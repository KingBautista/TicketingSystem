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

        $scanData = [
            'code' => hexdec($parsed['vgdecoderesult']) ?? null,
            'device' => $parsed['devicenumber'] ?? null,
            'timestamp' => now()->toDateTimeString(),
        ];

        \Log::info('Parsed scan:', $scanData);

        Cache::put('latest_scan', $scanData, now()->addMinutes(10));

        return response()->json(['status' => true, 'message' => 'Scan received']);
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
