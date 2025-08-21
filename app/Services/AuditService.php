<?php

namespace App\Services;

use App\Models\AuditTrail;
use App\Http\Resources\AuditTrailResource;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AuditService extends BaseService
{
    public function __construct()
    {
        // Pass the AuditTrailResource class to the parent constructor
        parent::__construct(new AuditTrailResource(new AuditTrail), new AuditTrail());
    }
    public function list($perPage = 10, $trash = false)
    {
        $perPage = request('per_page') ?? $perPage; // Default to 10 if not provided
        $allAuditTrails = $this->getTotalCount();
        $trashedAuditTrails = 0; // AuditTrail doesn't use soft deletes
        $query = $this->buildAuditQuery();
        
        // AuditTrail doesn't use soft deletes, so we ignore the trash parameter
        
        if (request('search')) {
            $search = request('search');
            $query->where(function($q) use ($search) {
                $q->where('audit_trails.description', 'like', "%{$search}%")
                  ->orWhere('audit_trails.module', 'like', "%{$search}%")
                  ->orWhere('audit_trails.action', 'like', "%{$search}%")
                  ->orWhere('users.user_login', 'like', "%{$search}%")
                  ->orWhere('user_meta_first_name.meta_value', 'like', "%{$search}%")
                  ->orWhere('user_meta_last_name.meta_value', 'like', "%{$search}%");
            });
        }
        
        if (request('order')) {
            $query->orderBy(request('order'), request('sort'));
        } else {
            $query->orderBy('audit_trails.id', 'desc');
        }
        
        return AuditTrailResource::collection(
            $query->paginate($perPage)->withQueryString()
        )->additional(['meta' => ['all' => $allAuditTrails, 'trashed' => $trashedAuditTrails]]);
    }

    /**
     * Build the audit query with filters.
     */
    private function buildAuditQuery()
    {
        $query = AuditTrail::with(['user'])
            ->select([
                'audit_trails.*',
                'users.user_login as user_login',
                'user_meta_first_name.meta_value as first_name',
                'user_meta_last_name.meta_value as last_name'
            ])
            ->leftJoin('users', 'audit_trails.user_id', '=', 'users.id')
            ->leftJoin('user_meta as user_meta_first_name', function($join) {
                $join->on('users.id', '=', 'user_meta_first_name.user_id')
                     ->where('user_meta_first_name.meta_key', '=', 'first_name');
            })
            ->leftJoin('user_meta as user_meta_last_name', function($join) {
                $join->on('users.id', '=', 'user_meta_last_name.user_id')
                     ->where('user_meta_last_name.meta_key', '=', 'last_name');
            });

        // Apply filters
        if (request('module')) {
            $query->where('audit_trails.module', request('module'));
        }

        if (request('action')) {
            $query->where('audit_trails.action', request('action'));
        }

        if (request('user_id')) {
            $query->where('audit_trails.user_id', request('user_id'));
        }

        if (request('start_date')) {
            $query->whereDate('audit_trails.created_at', '>=', request('start_date'));
        }

        if (request('end_date')) {
            $query->whereDate('audit_trails.created_at', '<=', request('end_date'));
        }

        return $query;
    }

    public function log($module, $action, $description, $oldValue = null, $newValue = null)
    {
        try {
            $audit = AuditTrail::create([
                'user_id' => Auth::id(),
                'module' => $module,
                'action' => $action,
                'description' => $description,
                'old_value' => $oldValue,
                'new_value' => $newValue,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent()
            ]);

            // Also log to file
            $logMessage = sprintf(
                "[%s] User %s performed %s in %s: %s",
                now()->format('Y-m-d H:i:s'),
                Auth::user()->name ?? 'Unknown',
                $action,
                $module,
                $description
            );

            Log::channel('audit')->info($logMessage, [
                'old_value' => $oldValue,
                'new_value' => $newValue,
                'ip' => request()->ip()
            ]);

            return $audit;
        } catch (\Exception $e) {
            Log::error('Failed to create audit log: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Get audit trail query (for backward compatibility).
     */
    public function getAuditTrails($filters = [])
    {
        return $this->buildAuditQuery($filters);
    }

    public function getAuditStatistics($filters = [])
    {
        $query = $this->buildAuditQuery();

        $stats = [
            'total_actions' => $query->count(),
            'actions_by_module' => $query->selectRaw('audit_trails.module, COUNT(*) as count')
                ->groupBy('audit_trails.module')
                ->get(),
            'actions_by_type' => $query->selectRaw('audit_trails.action, COUNT(*) as count')
                ->groupBy('audit_trails.action')
                ->get(),
            'actions_by_user' => $query->selectRaw('users.name, COUNT(*) as count')
                ->groupBy('users.name')
                ->get(),
            'actions_by_date' => $query->selectRaw('DATE(audit_trails.created_at) as date, COUNT(*) as count')
                ->groupBy('date')
                ->orderBy('date', 'desc')
                ->get(),
        ];

        return $stats;
    }

    public function getModules()
    {
        return AuditTrail::distinct()->pluck('module')->filter()->values();
    }

    public function getActions()
    {
        return AuditTrail::distinct()->pluck('action')->filter()->values();
    }

    public function exportAuditTrail($filters = [], $format = 'csv')
    {
        $query = $this->buildAuditQuery();
        $auditTrails = $query->get();

        if ($format === 'csv') {
            return $this->generateCsv($auditTrails);
        }

        if ($format === 'pdf') {
            return $this->generatePdf($auditTrails, $filters);
        }

        return null;
    }

    private function generateCsv($auditTrails)
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename=audit-trail-' . now()->format('Y-m-d-H-i-s') . '.csv',
        ];

        $handle = fopen('php://temp', 'w');
        
        // Add headers
        fputcsv($handle, [
            'Date/Time',
            'User',
            'Module',
            'Action',
            'Description',
            'IP Address',
            'User Agent'
        ]);

        // Add data
        foreach ($auditTrails as $auditTrail) {
            // Build full name from first and last name
            $firstName = $auditTrail->first_name ?? '';
            $lastName = $auditTrail->last_name ?? '';
            $fullName = trim($firstName . ' ' . $lastName);
            $userName = $fullName ?: ($auditTrail->user_login ?? 'Unknown');
            
            fputcsv($handle, [
                $auditTrail->created_at,
                $userName,
                $auditTrail->module,
                $auditTrail->action,
                $auditTrail->description,
                $auditTrail->ip_address,
                $auditTrail->user_agent
            ]);
        }

        rewind($handle);
        $csv = stream_get_contents($handle);
        fclose($handle);

        return response($csv, 200, $headers);
    }

    private function generatePdf($auditTrails, $filters)
    {
        $pdf = \PDF::loadView('exports.audit-trail', [
            'auditTrails' => $auditTrails,
            'filters' => $filters,
            'generated_at' => now()->format('Y-m-d H:i:s')
        ]);
        
        return $pdf->download('audit-trail-' . now()->format('Y-m-d-H-i-s') . '.pdf');
    }
}
