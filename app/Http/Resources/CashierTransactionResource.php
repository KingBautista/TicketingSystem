<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CashierTransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'cashier' => new UserResource($this->whenLoaded('cashier')),
            'promoter' => new PromoterResource($this->whenLoaded('promoter')),
            'rate' => new RateResource($this->whenLoaded('rate')),
            'quantity' => $this->quantity,
            'total' => $this->total,
            'paid_amount' => $this->paid_amount,
            'change' => $this->change,
            'details' => CashierTransactionDetailResource::collection($this->whenLoaded('details')),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
        ];
    }
} 