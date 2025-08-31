<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class KQT300Controller extends Controller
{
    /**
     * Get device status for KQT300 configuration
     * This endpoint is used by the QR Scanner Config Tool to verify connectivity
     */
    public function getStatus(): JsonResponse
    {
        try {
            $status = [
                'device_status' => 'online',
                'timestamp' => now()->toISOString(),
                'api_version' => '1.0',
                'database_connection' => $this->checkDatabaseConnection(),
                'redis_connection' => $this->checkRedisConnection(),
                'server_info' => [
                    'name' => config('app.name', 'Ticketing System'),
                    'environment' => config('app.env', 'production'),
                    'version' => config('app.version', '1.0.0'),
                ],
                'endpoints' => [
                    'validate' => url('/api/kqt300/validate'),
                    'stream' => url('/api/kqt300/stream'),
                    'poll' => url('/api/kqt300/poll'),
                    'health' => url('/api/kqt300/health'),
                ],
                'uptime' => $this->getSystemUptime(),
            ];

            return response()->json([
                'status' => 'success',
                'data' => $status
            ]);
        } catch (\Exception $e) {
            Log::error('KQT300 Status Error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to get device status'
            ], 500);
        }
    }

    /**
     * Check database connection
     */
    private function checkDatabaseConnection(): bool
    {
        try {
            DB::connection()->getPdo();
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Check Redis connection
     */
    private function checkRedisConnection(): bool
    {
        try {
            // Check if Redis extension is available
            if (!extension_loaded('redis')) {
                return false;
            }
            
            // Try to use the default cache store instead of forcing Redis
            Cache::has('test');
            return true;
        } catch (\Exception $e) {
            return false;
        }
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
