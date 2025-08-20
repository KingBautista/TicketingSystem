<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\Auditable;
use App\Services\SalesReportService;
use Illuminate\Http\Request;
use App\Http\Resources\SalesReportResource;
use App\Services\MessageService;


class SalesReportController extends BaseController
{
    use Auditable;

    protected $salesReportService;

    public function __construct(SalesReportService $salesReportService, MessageService $messageService)
    {
        $this->salesReportService = $salesReportService;
        parent::__construct($salesReportService, $messageService);
    }

    public function export(Request $request)
    {
        try {
            $format = $request->format ?? 'csv';
            $filters = $request->only([
                'search', 'cashier', 'startDate', 'endDate', 
                'promoter', 'rate'
            ]);

            $this->logExport("Exported sales report as {$format}", $format, 0);
            
            return $this->salesReportService->exportSalesReport($filters, $format);
        } catch (\Exception $e) {
            return $this->messageService->responseError();
        }
    }

    public function statistics(Request $request)
    {
        try {
            $filters = $request->only([
                'search', 'cashier', 'startDate', 'endDate', 
                'promoter', 'rate'
            ]);

            $stats = $this->salesReportService->getSalesStatistics($filters);
            
            $this->logAudit('VIEW', 'Viewed sales report statistics');
            
            return response()->json($stats);
        } catch (\Exception $e) {
            return $this->messageService->responseError();
        }
    }

    protected function getModuleName()
    {
        return 'Sales Report';
    }
} 