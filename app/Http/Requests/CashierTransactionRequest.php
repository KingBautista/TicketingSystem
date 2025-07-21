<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CashierTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'cashier_id' => 'required|integer|exists:users,id',
            'promoter_id' => 'nullable|integer|exists:promoters,id',
            'rate_id' => 'required|integer|exists:rates,id',
            'quantity' => 'required|integer|min:1',
            'total' => 'required|numeric|min:0',
            'paid_amount' => 'required|numeric|min:0',
            'change' => 'required|numeric|min:0',
            'discounts' => 'array',
            'discounts.*.discount_id' => 'nullable|integer|exists:discounts,id',
            'discounts.*.discount_value' => 'nullable|numeric|min:0',
        ];
    }
} 