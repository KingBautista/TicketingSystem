<?php

namespace App\Traits;

use App\Services\AuditService;

trait Auditable
{
    protected function logAudit($action, $description, $oldValue = null, $newValue = null)
    {
        $auditService = app(AuditService::class);
        $module = $this->getModuleName();
        
        return $auditService->log(
            $module,
            $action,
            $description,
            $oldValue,
            $newValue
        );
    }

    protected function getModuleName()
    {
        // Get the class name without namespace and 'Controller' suffix
        $className = class_basename($this);
        $moduleName = str_replace('Controller', '', $className);
        
        // Convert camelCase to space-separated words
        return preg_replace('/(?<!^)[A-Z]/', ' $0', $moduleName);
    }

    protected function logCreate($description, $newValue = null)
    {
        return $this->logAudit('CREATE', $description, null, $newValue);
    }

    protected function logUpdate($description, $oldValue = null, $newValue = null)
    {
        return $this->logAudit('UPDATE', $description, $oldValue, $newValue);
    }

    protected function logDelete($description, $oldValue = null)
    {
        return $this->logAudit('DELETE', $description, $oldValue, null);
    }

    protected function logRestore($description, $oldValue = null)
    {
        return $this->logAudit('RESTORE', $description, $oldValue, null);
    }

    protected function logBulkAction($action, $description, $count = 0)
    {
        return $this->logAudit('BULK_' . strtoupper($action), $description . " ({$count} items)", null, ['count' => $count]);
    }

    protected function logLogin($description)
    {
        return $this->logAudit('LOGIN', $description);
    }

    protected function logLogout($description)
    {
        return $this->logAudit('LOGOUT', $description);
    }

    protected function logExport($description, $format, $count = 0)
    {
        return $this->logAudit('EXPORT', $description . " ({$count} items as {$format})", null, ['format' => $format, 'count' => $count]);
    }
}
