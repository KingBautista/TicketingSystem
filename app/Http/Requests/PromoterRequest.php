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

    public function messages(): array
    {
        return [
            'name.required' => 'Promoter name is required.',
            'name.string' => 'Promoter name must be a valid text.',
            'name.max' => 'Promoter name cannot exceed 255 characters.',
            'description.string' => 'Description must be a valid text.',
            'status.required' => 'Status is required.',
            'status.boolean' => 'Status must be either active or inactive.',
        ];
    }
} 