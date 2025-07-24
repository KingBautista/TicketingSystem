<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CashierCloseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'session_id' => 'required|integer|exists:cashier_sessions,id',
            'closing_cash' => 'required|numeric|min:0',
        ];
    }
}
