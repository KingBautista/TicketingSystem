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
}
