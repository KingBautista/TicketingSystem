<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClosingReportResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Get full name from cashier relationship
        $cashierName = 'Unknown';
        if ($this->cashier) {
            $userDetails = $this->cashier->user_details;
            if (isset($userDetails['first_name']) || isset($userDetails['last_name'])) {
                $firstName = $userDetails['first_name'] ?? '';
                $lastName = $userDetails['last_name'] ?? '';
                $cashierName = trim($firstName . ' ' . $lastName);
            }
            
            // Fallback to user_login if no name is set
            if (empty($cashierName)) {
                $cashierName = $this->cashier->user_login;
            }
        }

        // Calculate session statistics
        $totalSales = $this->transactions->sum('total');
        $totalTransactions = $this->transactions->count();
        $sessionDuration = null;
        
        if ($this->opened_at && $this->closed_at) {
            $opened = \Carbon\Carbon::parse($this->opened_at);
            $closed = \Carbon\Carbon::parse($this->closed_at);
            $sessionDuration = $opened->diffForHumans($closed, true);
        }

        return [
            'id' => $this->id,
            'session_id' => str_pad($this->id, 10, '0', STR_PAD_LEFT),
            'cashier' => $cashierName,
            'opened_at' => $this->opened_at ? \Carbon\Carbon::parse($this->opened_at)->format('Y-m-d H:i:s') : null,
            'closed_at' => $this->closed_at ? \Carbon\Carbon::parse($this->closed_at)->format('Y-m-d H:i:s') : null,
            'cash_on_hand' => $this->cash_on_hand,
            'closing_cash' => $this->closing_cash,
            'total_sales' => $totalSales,
            'total_transactions' => $totalTransactions,
            'status' => $this->status,
            'session_duration' => $sessionDuration,
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
        ];
    }
}
