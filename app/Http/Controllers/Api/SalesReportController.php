<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\Auditable;
use App\Services\SalesReportService;
use Illuminate\Http\Request;
use App\Http\Resources\SalesReportResource;

class SalesReportController extends Controller
{
    use Auditable;

    protected $salesReportService;

    public function __construct(SalesReportService $salesReportService)
    {
        $this->salesReportService = $salesReportService;
    }

    public function index(Request $request)
    {
        try {
            $filters = $request->only([
                'search', 'cashier', 'startDate', 'endDate', 
                'promoter', 'rate', 'per_page', 'page'
            ]);

            $query = $this->salesReportService->getSalesReport($filters);
            
            // Pagination
            $perPage = $request->get('per_page', 15);
            $transactions = $query->paginate($perPage);
            
            $this->logAudit('VIEW', "Viewed sales report with filters: " . json_encode($filters));
            
            return response()->json([
                'data' => SalesReportResource::collection($transactions->items()),
                'meta' => [
                    'total' => $transactions->total(),
                    'page' => $transactions->currentPage(),
                    'per_page' => $transactions->perPage(),
                    'last_page' => $transactions->lastPage(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch sales report'], 500);
        }
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
            return response()->json(['error' => 'Failed to export sales report'], 500);
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
            return response()->json(['error' => 'Failed to fetch sales statistics'], 500);
        }
    }
} 