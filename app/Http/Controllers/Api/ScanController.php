<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ScanController extends BaseController
{
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

    public function showLatest()
    {
        return response()->json(Cache::get('latest_scan'));
    }
}
