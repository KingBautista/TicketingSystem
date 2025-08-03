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
        return [
            'id' => $this->id,
            'transaction_id' => $this->id,
            'cashier' => $this->cashier_name ?? 'Unknown',
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