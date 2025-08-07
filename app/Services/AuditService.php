<?php

namespace App\Services;

use App\Models\AuditTrail;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AuditService
{
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

    public function getAuditTrails($filters = [])
    {
        $query = AuditTrail::with('user')->latest();

        if (isset($filters['module']) && !empty($filters['module'])) {
            $query->where('module', $filters['module']);
        }

        if (isset($filters['action']) && !empty($filters['action'])) {
            $query->where('action', $filters['action']);
        }

        if (isset($filters['user_id']) && !empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (isset($filters['start_date']) && !empty($filters['start_date'])) {
            $query->whereDate('created_at', '>=', $filters['start_date']);
        }

        if (isset($filters['end_date']) && !empty($filters['end_date'])) {
            $query->whereDate('created_at', '<=', $filters['end_date']);
        }

        if (isset($filters['search']) && !empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('module', 'like', "%{$search}%")
                  ->orWhere('action', 'like', "%{$search}%");
            });
        }

        return $query->get();
    }

    public function getModules()
    {
        return AuditTrail::distinct()->pluck('module')->filter()->values();
    }

    public function getActions()
    {
        return AuditTrail::distinct()->pluck('action')->filter()->values();
    }
}
