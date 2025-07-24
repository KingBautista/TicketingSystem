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
}
