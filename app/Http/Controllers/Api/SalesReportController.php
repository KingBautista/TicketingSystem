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

    /**
     * Export sales report data.
     * 
     * @OA\Post(
     *     path="/api/sales-report/export",
     *     summary="Export sales report data",
     *     tags={"Sales Report"},
     *     security={{"bearerAuth": {}}},
     *     @OA\RequestBody(
     *         required=false,
     *         @OA\JsonContent(
     *             @OA\Property(property="format", type="string", example="csv", description="Export format (csv, excel, pdf)"),
     *             @OA\Property(property="search", type="string", example="transaction", description="Search term"),
     *             @OA\Property(property="cashier", type="integer", example=1, description="Cashier ID filter"),
     *             @OA\Property(property="startDate", type="string", format="date", example="2024-01-01", description="Start date"),
     *             @OA\Property(property="endDate", type="string", format="date", example="2024-12-31", description="End date"),
     *             @OA\Property(property="promoter", type="integer", example=1, description="Promoter ID filter"),
     *             @OA\Property(property="rate", type="integer", example=1, description="Rate ID filter")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Sales report exported successfully",
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
                'search', 'cashier', 'startDate', 'endDate', 
                'promoter', 'rate'
            ]);

            $this->logExport("Exported sales report as {$format}", $format, 0);
            
            return $this->salesReportService->exportSalesReport($filters, $format);
        } catch (\Exception $e) {
            return $this->messageService->responseError();
        }
    }

    /**
     * Get sales report statistics.
     * 
     * @OA\Get(
     *     path="/api/sales-report/statistics",
     *     summary="Get sales report statistics",
     *     tags={"Sales Report"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="search",
     *         in="query",
     *         description="Search term",
     *         required=false,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="cashier",
     *         in="query",
     *         description="Cashier ID filter",
     *         required=false,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="startDate",
     *         in="query",
     *         description="Start date",
     *         required=false,
     *         @OA\Schema(type="string", format="date")
     *     ),
     *     @OA\Parameter(
     *         name="endDate",
     *         in="query",
     *         description="End date",
     *         required=false,
     *         @OA\Schema(type="string", format="date")
     *     ),
     *     @OA\Parameter(
     *         name="promoter",
     *         in="query",
     *         description="Promoter ID filter",
     *         required=false,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="rate",
     *         in="query",
     *         description="Rate ID filter",
     *         required=false,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Sales statistics",
     *         @OA\JsonContent(type="object")
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated"
     *     )
     * )
     */
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