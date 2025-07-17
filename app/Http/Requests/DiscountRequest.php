<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DiscountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'discount_name' => 'required|string|max:255',
            'discount_value' => 'required|numeric|min:0',
            'status' => 'required|boolean',
        ];
    }
} 