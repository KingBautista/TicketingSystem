<?php

namespace App\Services;

use App\Models\CashierTransaction;
use App\Models\CashierSession;
use App\Models\VIP;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    /**
     * Get overall dashboard statistics
     */
    public function getStatistics()
    {
        $today = Carbon::today();
        
        return [
            'total_transactions' => CashierTransaction::count(),
            'total_sales' => CashierTransaction::sum('total'),
            'today_transactions' => CashierTransaction::whereDate('created_at', $today)->count(),
            'today_sales' => CashierTransaction::whereDate('created_at', $today)->sum('total'),
            'active_sessions' => CashierSession::where('status', 'open')->count(),
            'expiring_vips' => $this->getExpiringVIPsCount(),
        ];
    }

    /**
     * Get cashier performance data
     */
    public function getCashierPerformance()
    {
        $today = Carbon::today();
        
        $cashiers = User::whereHas('userRole', function($query) {
            $query->where('name', 'Cashier');
        })->get();
        
        $performance = [];
        
        foreach ($cashiers as $cashier) {
            // Get today's transactions
            $todayTransactions = $cashier->transactions()->whereDate('created_at', $today)->count();
            $todaySales = $cashier->transactions()->whereDate('created_at', $today)->sum('total');
            
            // Get all-time transactions
            $totalTransactions = $cashier->transactions()->count();
            $totalSales = $cashier->transactions()->sum('total');

            $performance[] = [
                'name' => $cashier->user_details['first_name'] ?? $cashier->user_login,
                'today_transactions' => $todayTransactions,
                'today_sales' => $todaySales,
                'total_transactions' => $totalTransactions,
                'total_sales' => $totalSales,
            ];
        }

        return $performance;
    }

    /**
     * Get today's transaction summary
     */
    public function getTodaySummary()
    {
        $today = Carbon::today();
        
        $summary = CashierTransaction::whereDate('created_at', $today)
            ->select(
                DB::raw('COUNT(*) as total_transactions'),
                DB::raw('SUM(total) as total_sales'),
                DB::raw('SUM(quantity) as total_quantity')
            )
            ->first();

        return [
            'total_transactions' => $summary->total_transactions ?? 0,
            'total_sales' => $summary->total_sales ?? 0,
            'total_quantity' => $summary->total_quantity ?? 0,
            'date' => $today->format('Y-m-d'),
        ];
    }

    /**
     * Get count of expiring VIPs (within 5 days)
     */
    private function getExpiringVIPsCount()
    {
        $fiveDaysFromNow = Carbon::now()->addDays(5);
        
        return VIP::where('validity_end', '<=', $fiveDaysFromNow)
            ->where('validity_end', '>=', Carbon::today())
            ->where('status', true)
            ->count();
    }
}