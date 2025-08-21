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
