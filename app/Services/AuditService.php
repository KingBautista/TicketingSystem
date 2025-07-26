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
                Auth::user()->name,
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
}
