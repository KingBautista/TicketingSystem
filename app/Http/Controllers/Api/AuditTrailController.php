<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditTrail;
use App\Services\AuditService;
use App\Traits\Auditable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf;

class AuditTrailController extends Controller
{
    use Auditable;

    protected $auditService;

    public function __construct(AuditService $auditService)
    {
        $this->auditService = $auditService;
    }

    public function index(Request $request)
    {
        try {
            $filters = $request->only([
                'module', 'action', 'user_id', 'start_date', 
                'end_date', 'search'
            ]);

            $query = $this->auditService->getAuditTrails($filters);
            $auditTrails = $query->get();
            
            $this->logAudit('VIEW', 'Viewed audit trail with filters: ' . json_encode($filters));
            
            return response()->json([
                'data' => $auditTrails
            ]);
        } catch (\Exception $e) {
            Log::error('Audit trail index error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch audit trail'], 500);
        }
    }

    public function export(Request $request)
    {
        try {
            $format = $request->format ?? 'pdf';
            $filters = $request->only([
                'module', 'action', 'user_id', 'start_date', 
                'end_date', 'search'
            ]);

            // Get data based on filters
            $data = $this->auditService->getAuditTrails($filters);
            $auditTrails = $data->items();

            if ($format === 'pdf') {
                $pdf = PDF::loadView('exports.audit-trail', [
                    'data' => $auditTrails,
                    'filters' => $filters,
                    'generated_at' => now()->format('Y-m-d H:i:s')
                ]);
                
                $this->logExport('Exported audit trail as PDF', 'PDF', count($auditTrails));
                
                return $pdf->download('audit-trail-' . now()->format('Y-m-d-H-i-s') . '.pdf');
            }

            if ($format === 'csv') {
                $headers = [
                    'Content-Type' => 'text/csv',
                    'Content-Disposition' => 'attachment; filename=audit-trail-' . now()->format('Y-m-d-H-i-s') . '.csv',
                ];

                $handle = fopen('php://temp', 'w');
                
                // Add headers
                fputcsv($handle, ['Date/Time', 'User', 'Module', 'Action', 'Description', 'IP Address', 'User Agent']);

                // Add data
                foreach ($auditTrails as $row) {
                    fputcsv($handle, [
                        $row['created_at'],
                        $row['user']['name'] ?? 'Unknown',
                        $row['module'],
                        $row['action'],
                        $row['description'],
                        $row['ip_address'],
                        $row['user_agent']
                    ]);
                }

                rewind($handle);
                $csv = stream_get_contents($handle);
                fclose($handle);

                $this->logExport('Exported audit trail as CSV', 'CSV', count($auditTrails));

                return response($csv, 200, $headers);
            }

            return response()->json(['error' => 'Invalid format'], 400);
        } catch (\Exception $e) {
            Log::error('Audit trail export error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to export audit trail'], 500);
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

    public function getStats(Request $request)
    {
        try {
            $filters = $request->only([
                'start_date', 'end_date', 'module', 'action'
            ]);

            $query = AuditTrail::query();

            if (isset($filters['start_date'])) {
                $query->whereDate('created_at', '>=', $filters['start_date']);
            }

            if (isset($filters['end_date'])) {
                $query->whereDate('created_at', '<=', $filters['end_date']);
            }

            if (isset($filters['module'])) {
                $query->where('module', $filters['module']);
            }

            if (isset($filters['action'])) {
                $query->where('action', $filters['action']);
            }

            $stats = [
                'total_actions' => $query->count(),
                'actions_by_module' => $query->selectRaw('module, COUNT(*) as count')
                    ->groupBy('module')
                    ->get(),
                'actions_by_type' => $query->selectRaw('action, COUNT(*) as count')
                    ->groupBy('action')
                    ->get(),
                'actions_by_user' => $query->with('user')
                    ->selectRaw('user_id, COUNT(*) as count')
                    ->groupBy('user_id')
                    ->get()
            ];

            $this->logAudit('VIEW', 'Viewed audit trail statistics');

            return response()->json($stats);
        } catch (\Exception $e) {
            Log::error('Audit stats error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch audit statistics'], 500);
        }
    }
}
