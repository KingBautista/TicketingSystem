<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PromoterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|boolean',
        ];
    }
} 