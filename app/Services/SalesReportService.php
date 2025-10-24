<?php

namespace App\Services;

use App\Models\CashierTransaction;
use App\Models\User;
use App\Models\Rate;
use App\Models\Promoter;
use App\Http\Resources\SalesReportResource;
use App\Http\Resources\ClosingReportResource;
use App\Models\CashierSession;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SalesReportService extends BaseService
{
    public function __construct()
    {
        // Pass the SalesReportResource class to the parent constructor
        parent::__construct(new SalesReportResource(new CashierTransaction), new CashierTransaction());
    }

    public function list($perPage = 10, $trash = false)
    {
        $perPage = request('per_page') ?? $perPage; // Default to 10 if not provided
        $allTransactions = $this->getTotalCount();
        $trashedTransactions = $this->getTrashedCount();
        $query = $this->buildSalesQuery();
        
        if ($trash) {
            $query->onlyTrashed();
        }
        
        if (request('order')) {
            $query->orderBy(request('order'), request('sort'));
        } else {
            $query->orderBy('cashier_transactions.id', 'desc');
        }
        
        return SalesReportResource::collection(
            $query->paginate($perPage)->withQueryString()
        )->additional(['meta' => ['all' => $allTransactions, 'trashed' => $trashedTransactions]]);
    }

    /**
     * Build the sales query with filters.
     */
    private function buildSalesQuery($filters = [])
    {
        // Debug: Log the filters being processed
        \Log::info('SalesReportService::buildSalesQuery - Processing filters:', $filters);
        
        $query = CashierTransaction::with(['cashier.userMetas', 'rate', 'promoter'])
            ->select([
                'cashier_transactions.*',
                'users.user_login as cashier_login',
                'rates.name as rate_name',
                'promoters.name as promoter_name'
            ])
            ->leftJoin('users', 'cashier_transactions.cashier_id', '=', 'users.id')
            ->leftJoin('rates', 'cashier_transactions.rate_id', '=', 'rates.id')
            ->leftJoin('promoters', 'cashier_transactions.promoter_id', '=', 'promoters.id');

        // Apply filters - use provided filters or fallback to request parameters
        $cashier = $filters['cashier'] ?? request('cashier');
        $startDate = $filters['startDate'] ?? request('startDate');
        $endDate = $filters['endDate'] ?? request('endDate');
        $promoter = $filters['promoter'] ?? request('promoter');
        $rate = $filters['rate'] ?? request('rate');
        $search = $filters['search'] ?? request('search');
        
        // Debug: Log the extracted filter values
        \Log::info('SalesReportService::buildSalesQuery - Extracted filter values:', [
            'cashier' => $cashier,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'promoter' => $promoter,
            'rate' => $rate,
            'search' => $search
        ]);

        if ($cashier) {
            $query->where('users.user_login', $cashier);
        }

        if ($startDate) {
            $query->whereDate('cashier_transactions.created_at', '>=', $startDate);
        }

        if ($endDate) {
            $query->whereDate('cashier_transactions.created_at', '<=', $endDate);
        }

        if ($promoter) {
            $query->where('cashier_transactions.promoter_id', $promoter);
        }

        if ($rate) {
            $query->where('cashier_transactions.rate_id', $rate);
        }

        // Apply search
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('cashier_transactions.id', 'like', "%{$search}%")
                  ->orWhere('users.user_login', 'like', "%{$search}%")
                  ->orWhere('rates.name', 'like', "%{$search}%")
                  ->orWhere('promoters.name', 'like', "%{$search}%");
            });
        }

        return $query;
    }

    /**
     * Get sales report query (for backward compatibility).
     */
    public function getSalesReport($filters = [])
    {
        return $this->buildSalesQuery($filters);
    }

    public function getSalesStatistics($filters = [])
    {
        $query = $this->buildSalesQuery($filters);

        $stats = [
            'total_transactions' => $query->count(),
            'total_amount' => $query->sum('total'),
            'total_quantity' => $query->sum('quantity'),
            'average_amount' => $query->avg('total'),
            'transactions_by_cashier' => $query->selectRaw('users.user_login, COUNT(*) as count, SUM(total) as total_amount')
                ->groupBy('users.user_login')
                ->get(),
            'transactions_by_rate' => $query->selectRaw('rates.name, COUNT(*) as count, SUM(total) as total_amount')
                ->groupBy('rates.name')
                ->get(),
            'transactions_by_date' => $query->selectRaw('DATE(created_at) as date, COUNT(*) as count, SUM(total) as total_amount')
                ->groupBy('date')
                ->orderBy('date', 'desc')
                ->get(),
        ];

        return $stats;
    }

    public function exportSalesReport($filters = [], $format = 'csv')
    {
        // Debug: Log the filters being received
        \Log::info('SalesReportService::exportSalesReport - Filters received:', $filters);
        
        $query = $this->buildSalesQuery($filters);
        
        // Debug: Log the SQL query being generated
        \Log::info('SalesReportService::exportSalesReport - SQL Query:', [
            'sql' => $query->toSql(),
            'bindings' => $query->getBindings()
        ]);

        if ($format === 'csv') {
            $transactions = $query->get();
            \Log::info('SalesReportService::exportSalesReport - CSV records count:', ['count' => $transactions->count()]);
            return $this->generateCsv($transactions);
        }

        if ($format === 'pdf') {
            // For PDF, limit to 100 records to prevent memory issues
            $transactions = $query->limit(100)->get();
            \Log::info('SalesReportService::exportSalesReport - PDF records count:', ['count' => $transactions->count()]);
            return $this->generatePdf($transactions, $filters);
        }

        return null;
    }

    private function generateCsv($transactions)
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename=sales-report-' . now()->format('Y-m-d-H-i-s') . '.csv',
        ];

        $handle = fopen('php://temp', 'w');
        
        // Add headers (matching frontend table exactly)
        fputcsv($handle, [
            'Transaction ID',
            'Cashier',
            'Promoter',
            'Rate',
            'Quantity',
            'Total Amount',
            'Paid Amount',
            'Change',
            'Date'
        ]);

        // Add data (matching frontend table format exactly)
        foreach ($transactions as $transaction) {
            // Get cashier full name (matching SalesReportResource logic)
            $cashierName = 'Unknown';
            if ($transaction->cashier) {
                $userDetails = $transaction->cashier->user_details;
                if (isset($userDetails['first_name']) || isset($userDetails['last_name'])) {
                    $firstName = $userDetails['first_name'] ?? '';
                    $lastName = $userDetails['last_name'] ?? '';
                    $cashierName = trim($firstName . ' ' . $lastName);
                }
                
                // Fallback to user_login if no name is set
                if (empty($cashierName)) {
                    $cashierName = $transaction->cashier->user_login;
                }
            }

            fputcsv($handle, [
                str_pad($transaction->id, 10, '0', STR_PAD_LEFT), // Transaction ID with leading zeros
                $cashierName, // Full cashier name
                $transaction->promoter_name ?? 'N/A', // Promoter name
                $transaction->rate_name ?? 'N/A', // Rate name
                $transaction->quantity, // Quantity
                number_format($transaction->total, 2), // Total Amount (formatted)
                number_format($transaction->paid_amount, 2), // Paid Amount (formatted)
                number_format($transaction->change, 2), // Change (formatted)
                $transaction->created_at->format('Y-m-d') // Date (formatted as Y-m-d)
            ]);
        }

        rewind($handle);
        $csv = stream_get_contents($handle);
        fclose($handle);

        return response($csv, 200, $headers);
    }

    private function generatePdf($transactions, $filters)
    {
        // Set memory limit for PDF generation
        ini_set('memory_limit', '256M');
        
        $pdf = \PDF::loadView('exports.sales-report', [
            'transactions' => $transactions,
            'filters' => $filters,
            'generated_at' => now()->format('Y-m-d H:i:s')
        ]);
        
        // Set PDF options for better performance
        $pdf->setOptions([
            'isHtml5ParserEnabled' => true,
            'isRemoteEnabled' => false,
            'isPhpEnabled' => false,
            'defaultFont' => 'Arial'
        ]);
        
        return $pdf->download('sales-report-' . now()->format('Y-m-d-H-i-s') . '.pdf');
    }

    /**
     * Get closing report data with filters.
     */
    public function getClosingReport($filters = [])
    {
        $perPage = request('per_page') ?? 10;
        $query = $this->buildClosingQuery($filters);
        
        if (request('order')) {
            $query->orderBy(request('order'), request('sort'));
        } else {
            $query->orderBy('cashier_sessions.id', 'desc');
        }
        
        return ClosingReportResource::collection(
            $query->paginate($perPage)->withQueryString()
        );
    }

    /**
     * Build the closing report query with filters.
     */
    private function buildClosingQuery($filters = [])
    {
        // Debug: Log the filters being processed
        \Log::info('SalesReportService::buildClosingQuery - Processing filters:', $filters);
        
        $query = CashierSession::with(['cashier.userMetas', 'transactions'])
            ->select([
                'cashier_sessions.*',
                'users.user_login as cashier_login'
            ])
            ->leftJoin('users', 'cashier_sessions.cashier_id', '=', 'users.id');

        // Apply filters - use provided filters or fallback to request parameters
        $cashier = $filters['cashier'] ?? request('cashier');
        $startDate = $filters['startDate'] ?? request('startDate');
        $endDate = $filters['endDate'] ?? request('endDate');
        $status = $filters['status'] ?? request('status');
        $search = $filters['search'] ?? request('search');
        
        // Debug: Log the extracted filter values
        \Log::info('SalesReportService::buildClosingQuery - Extracted filter values:', [
            'cashier' => $cashier,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'status' => $status,
            'search' => $search
        ]);

        if ($cashier) {
            $query->where('users.user_login', $cashier);
        }

        if ($startDate) {
            $query->whereDate('cashier_sessions.opened_at', '>=', $startDate);
        }

        if ($endDate) {
            $query->whereDate('cashier_sessions.opened_at', '<=', $endDate);
        }

        if ($status) {
            $query->where('cashier_sessions.status', $status);
        }

        // Apply search
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('cashier_sessions.id', 'like', "%{$search}%")
                  ->orWhere('users.user_login', 'like', "%{$search}%");
            });
        }

        return $query;
    }

    /**
     * Export closing report data.
     */
    public function exportClosingReport($filters = [], $format = 'csv')
    {
        // Debug: Log the filters being received
        \Log::info('SalesReportService::exportClosingReport - Filters received:', $filters);
        
        $query = $this->buildClosingQuery($filters);
        
        // Debug: Log the SQL query being generated
        \Log::info('SalesReportService::exportClosingReport - SQL Query:', [
            'sql' => $query->toSql(),
            'bindings' => $query->getBindings()
        ]);

        if ($format === 'csv') {
            $sessions = $query->get();
            \Log::info('SalesReportService::exportClosingReport - CSV records count:', ['count' => $sessions->count()]);
            return $this->generateClosingCsv($sessions);
        }

        if ($format === 'pdf') {
            // For PDF, limit to 100 records to prevent memory issues
            $sessions = $query->limit(100)->get();
            \Log::info('SalesReportService::exportClosingReport - PDF records count:', ['count' => $sessions->count()]);
            return $this->generateClosingPdf($sessions, $filters);
        }

        return null;
    }

    /**
     * Generate CSV for closing report.
     */
    private function generateClosingCsv($sessions)
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename=closing-report-' . now()->format('Y-m-d-H-i-s') . '.csv',
        ];

        $handle = fopen('php://temp', 'w');
        
        // Add headers (matching frontend table exactly)
        fputcsv($handle, [
            'Session ID',
            'Cashier',
            'Opened At',
            'Closed At',
            'Opening Cash',
            'Closing Cash',
            'Total Sales',
            'Transactions',
            'Status'
        ]);

        // Add data (matching frontend table format exactly)
        foreach ($sessions as $session) {
            // Get cashier full name (matching ClosingReportResource logic)
            $cashierName = 'Unknown';
            if ($session->cashier) {
                $userDetails = $session->cashier->user_details;
                if (isset($userDetails['first_name']) || isset($userDetails['last_name'])) {
                    $firstName = $userDetails['first_name'] ?? '';
                    $lastName = $userDetails['last_name'] ?? '';
                    $cashierName = trim($firstName . ' ' . $lastName);
                }
                
                // Fallback to user_login if no name is set
                if (empty($cashierName)) {
                    $cashierName = $session->cashier->user_login;
                }
            }

            $totalSales = $session->transactions->sum('total');
            $totalTransactions = $session->transactions->count();

            fputcsv($handle, [
                str_pad($session->id, 10, '0', STR_PAD_LEFT), // Session ID with leading zeros
                $cashierName, // Full cashier name
                $session->opened_at ? $session->opened_at->format('Y-m-d H:i:s') : '', // Opened At
                $session->closed_at ? $session->closed_at->format('Y-m-d H:i:s') : '', // Closed At
                number_format($session->cash_on_hand, 2), // Opening Cash (formatted)
                number_format($session->closing_cash ?? 0, 2), // Closing Cash (formatted)
                number_format($totalSales, 2), // Total Sales (formatted)
                $totalTransactions, // Transactions count
                ucfirst($session->status) // Status (capitalized)
            ]);
        }

        rewind($handle);
        $csv = stream_get_contents($handle);
        fclose($handle);

        return response($csv, 200, $headers);
    }

    /**
     * Generate PDF for closing report.
     */
    private function generateClosingPdf($sessions, $filters)
    {
        // Set memory limit for PDF generation
        ini_set('memory_limit', '256M');
        
        $pdf = \PDF::loadView('exports.closing-report', [
            'sessions' => $sessions,
            'filters' => $filters,
            'generated_at' => now()->format('Y-m-d H:i:s')
        ]);
        
        // Set PDF options for better performance
        $pdf->setOptions([
            'isHtml5ParserEnabled' => true,
            'isRemoteEnabled' => false,
            'isPhpEnabled' => false,
            'defaultFont' => 'Arial'
        ]);
        
        return $pdf->download('closing-report-' . now()->format('Y-m-d-H-i-s') . '.pdf');
    }
} 