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

    public function messages(): array
    {
        return [
            'session_id.required' => 'Session ID is required.',
            'session_id.integer' => 'Session ID must be a valid number.',
            'session_id.exists' => 'The selected session does not exist.',
            'closing_cash.required' => 'Closing cash amount is required.',
            'closing_cash.numeric' => 'Closing cash must be a valid number.',
            'closing_cash.min' => 'Closing cash must be at least 0.',
        ];
    }
}
