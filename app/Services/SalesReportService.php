<?php

namespace App\Services;

use App\Models\CashierTransaction;
use App\Models\User;
use App\Models\Rate;
use App\Models\Promoter;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SalesReportService
{
    public function getSalesReport($filters = [])
    {
        $query = CashierTransaction::with(['cashier', 'rate', 'promoter'])
            ->select([
                'cashier_transactions.*',
                'users.user_login as cashier_name',
                'rates.name as rate_name',
                'promoters.name as promoter_name'
            ])
            ->leftJoin('users', 'cashier_transactions.cashier_id', '=', 'users.id')
            ->leftJoin('rates', 'cashier_transactions.rate_id', '=', 'rates.id')
            ->leftJoin('promoters', 'cashier_transactions.promoter_id', '=', 'promoters.id');

        // Apply filters
        if (isset($filters['cashier']) && !empty($filters['cashier'])) {
            $query->where('users.user_login', 'like', "%{$filters['cashier']}%");
        }

        if (isset($filters['startDate']) && !empty($filters['startDate'])) {
            $query->whereDate('cashier_transactions.created_at', '>=', $filters['startDate']);
        }

        if (isset($filters['endDate']) && !empty($filters['endDate'])) {
            $query->whereDate('cashier_transactions.created_at', '<=', $filters['endDate']);
        }

        if (isset($filters['promoter']) && !empty($filters['promoter'])) {
            $query->where('promoters.name', 'like', "%{$filters['promoter']}%");
        }

        if (isset($filters['rate']) && !empty($filters['rate'])) {
            $query->where('rates.name', 'like', "%{$filters['rate']}%");
        }

        if (isset($filters['search']) && !empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function($q) use ($search) {
                $q->where('cashier_transactions.transaction_id', 'like', "%{$search}%")
                  ->orWhere('users.user_login', 'like', "%{$search}%")
                  ->orWhere('rates.name', 'like', "%{$search}%")
                  ->orWhere('promoters.name', 'like', "%{$search}%");
            });
        }

        return $query->orderBy('cashier_transactions.created_at', 'desc');
    }

    public function getSalesStatistics($filters = [])
    {
        $query = $this->getSalesReport($filters);

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
        $query = $this->getSalesReport($filters);
        $transactions = $query->get();

        if ($format === 'csv') {
            return $this->generateCsv($transactions);
        }

        if ($format === 'pdf') {
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
        
        // Add headers
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

        // Add data
        foreach ($transactions as $transaction) {
            fputcsv($handle, [
                $transaction->id,
                $transaction->cashier_name ?? 'Unknown',
                $transaction->promoter_name ?? 'N/A',
                $transaction->rate_name ?? 'N/A',
                $transaction->quantity,
                $transaction->total,
                $transaction->paid_amount,
                $transaction->change,
                $transaction->created_at
            ]);
        }

        rewind($handle);
        $csv = stream_get_contents($handle);
        fclose($handle);

        return response($csv, 200, $headers);
    }

    private function generatePdf($transactions, $filters)
    {
        $pdf = \PDF::loadView('exports.sales-report', [
            'transactions' => $transactions,
            'filters' => $filters,
            'generated_at' => now()->format('Y-m-d H:i:s')
        ]);
        
        return $pdf->download('sales-report-' . now()->format('Y-m-d-H-i-s') . '.pdf');
    }
} 