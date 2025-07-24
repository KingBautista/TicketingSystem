<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CashierSessionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'cashier_id' => $this->cashier_id,
            'cash_on_hand' => $this->cash_on_hand,
            'opened_at' => $this->opened_at,
            'closed_at' => $this->closed_at,
            'closing_cash' => $this->closing_cash,
            'status' => $this->status,
        ];
    }
}
