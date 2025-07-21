<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CashierTransactionDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'discount' => new DiscountResource($this->whenLoaded('discount')),
            'discount_value' => $this->discount_value,
        ];
    }
} 