<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SalesReportResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this['id'],
            'cashier' => $this['cashier'],
            'transaction_id' => $this['transaction_id'],
            'date' => $this['date'],
            'amount' => $this['amount'],
        ];
    }
} 