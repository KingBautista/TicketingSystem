<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\Auditable;
use App\Services\AuditService;
use Illuminate\Http\Request;
use App\Http\Resources\AuditTrailResource;
use App\Services\MessageService;

class AuditTrailController extends BaseController
{
    use Auditable;

    protected $auditService;

    public function __construct(AuditService $auditService, MessageService $messageService)
    {
        $this->auditService = $auditService;
        parent::__construct($auditService, $messageService);
    }

    /**
     * Export audit trail data.
     * 
     * @OA\Post(
     *     path="/api/audit-trail/export",
     *     summary="Export audit trail data",
     *     tags={"Audit Trail"},
     *     security={{"bearerAuth": {}}},
     *     @OA\RequestBody(
     *         required=false,
     *         @OA\JsonContent(
     *             @OA\Property(property="format", type="string", example="csv", description="Export format (csv, excel, pdf)"),
     *             @OA\Property(property="search", type="string", example="user login", description="Search term"),
     *             @OA\Property(property="module", type="string", example="User Management", description="Module filter"),
     *             @OA\Property(property="action", type="string", example="CREATE", description="Action filter"),
     *             @OA\Property(property="user_id", type="integer", example=1, description="User ID filter"),
     *             @OA\Property(property="start_date", type="string", format="date", example="2024-01-01", description="Start date"),
     *             @OA\Property(property="end_date", type="string", format="date", example="2024-12-31", description="End date")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Audit trail exported successfully",
     *         @OA\JsonContent(type="object")
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated"
     *     )
     * )
     */
    public function export(Request $request)
    {
        try {
            $format = $request->format ?? 'csv';
            $filters = $request->only([
                'search', 'module', 'action', 'user_id', 
                'start_date', 'end_date'
            ]);

            $this->logExport("Exported audit trail as {$format}", $format, 0);
            
            return $this->auditService->exportAuditTrail($filters, $format);
        } catch (\Exception $e) {
            return $this->messageService->responseError();
        }
    }

    public function downloadLogFile(Request $request)
    {
        try {
            $date = $request->date ?? now()->format('Y-m-d');
            $logPath = storage_path("logs/audit-{$date}.log");

            if (!file_exists($logPath)) {
                return response()->json(['error' => 'Log file not found'], 404);
            }

            $this->logAudit('DOWNLOAD', "Downloaded audit log file for date: {$date}");

            return response()->download($logPath);
        } catch (\Exception $e) {
            Log::error('Log file download error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to download log file'], 500);
        }
    }

    /**
     * Get available audit trail modules.
     * 
     * @OA\Get(
     *     path="/api/audit-trail/modules",
     *     summary="Get available audit trail modules",
     *     tags={"Audit Trail"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="List of available modules",
     *         @OA\JsonContent(
     *             type="array",
     *             @OA\Items(type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated"
     *     )
     * )
     */
    public function getModules()
    {
        try {
            $modules = $this->auditService->getModules();
            return response()->json($modules);
        } catch (\Exception $e) {
            Log::error('Get modules error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch modules'], 500);
        }
    }

    public function getActions()
    {
        try {
            $actions = $this->auditService->getActions();
            return response()->json($actions);
        } catch (\Exception $e) {
            Log::error('Get actions error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch actions'], 500);
        }
    }

    public function statistics(Request $request)
    {
        try {
            $filters = $request->only([
                'search', 'module', 'action', 'user_id', 
                'start_date', 'end_date'
            ]);

            $stats = $this->auditService->getAuditStatistics($filters);
            
            $this->logAudit('VIEW', 'Viewed audit trail statistics');
            
            return response()->json($stats);
        } catch (\Exception $e) {
            return $this->messageService->responseError();
        }
    }

    protected function getModuleName()
    {
        return 'Audit Trail';
    }
}
