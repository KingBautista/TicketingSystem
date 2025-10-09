<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CashierOpenRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'cashier_id' => 'required|integer|exists:users,id',
            'cash_on_hand' => 'required|numeric|min:0',
        ];
    }

    public function messages(): array
    {
        return [
            'cashier_id.required' => 'Cashier ID is required.',
            'cashier_id.integer' => 'Cashier ID must be a valid number.',
            'cashier_id.exists' => 'The selected cashier does not exist.',
            'cash_on_hand.required' => 'Cash on hand amount is required.',
            'cash_on_hand.numeric' => 'Cash on hand must be a valid number.',
            'cash_on_hand.min' => 'Cash on hand must be at least 0.',
        ];
    }
}
