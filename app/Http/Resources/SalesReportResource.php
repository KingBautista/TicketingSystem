<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SalesReportResource extends JsonResource
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

        return [
            'id' => $this->id,
            'transaction_id' => str_pad($this->id, 10, '0', STR_PAD_LEFT),
            'cashier' => $cashierName,
            'promoter' => $this->promoter_name ?? 'N/A',
            'rate' => $this->rate_name ?? 'N/A',
            'quantity' => $this->quantity,
            'total' => $this->total,
            'paid_amount' => $this->paid_amount,
            'change' => $this->change,
            'date' => $this->created_at->format('Y-m-d'),
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
        ];
    }
} 