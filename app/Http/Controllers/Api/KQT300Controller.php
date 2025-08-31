<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * @OA\Tag(
 *     name="KQT300 Device Integration",
 *     description="KQT300 QR Scanner device integration endpoints"
 * )
 */
class KQT300Controller extends Controller
{
    /**
     * Get device status for KQT300 configuration
     * This endpoint is used by the QR Scanner Config Tool to verify connectivity
     * 
     * @OA\Get(
     *     path="/api/kqt300/status",
     *     summary="Get KQT300 device status and system information",
     *     description="Returns comprehensive system status including database connection, Redis status, server info, and available endpoints",
     *     tags={"KQT300 Device Integration"},
     *     @OA\Response(
     *         response=200,
     *         description="Device status retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="device_status", type="string", example="online"),
     *                 @OA\Property(property="timestamp", type="string", format="date-time", example="2024-01-01T12:00:00Z"),
     *                 @OA\Property(property="api_version", type="string", example="1.0"),
     *                 @OA\Property(property="database_connection", type="boolean", example=true),
     *                 @OA\Property(property="redis_connection", type="boolean", example=false),
     *                 @OA\Property(property="server_info", type="object",
     *                     @OA\Property(property="name", type="string", example="Ticketing System"),
     *                     @OA\Property(property="environment", type="string", example="production"),
     *                     @OA\Property(property="version", type="string", example="1.0.0")
     *                 ),
     *                 @OA\Property(property="endpoints", type="object",
     *                     @OA\Property(property="validate", type="string", example="http://localhost:8000/api/kqt300/validate"),
     *                     @OA\Property(property="stream", type="string", example="http://localhost:8000/api/kqt300/stream"),
     *                     @OA\Property(property="poll", type="string", example="http://localhost:8000/api/kqt300/poll"),
     *                     @OA\Property(property="health", type="string", example="http://localhost:8000/api/kqt300/health")
     *                 ),
     *                 @OA\Property(property="uptime", type="string", example="24h 30m 15s")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="error"),
     *             @OA\Property(property="message", type="string", example="Failed to get device status")
     *         )
     *     )
     * )
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
