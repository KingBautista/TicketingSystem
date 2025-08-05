<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RateRequest extends FormRequest
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
            'price' => 'required|numeric|min:0',
            'status' => 'required|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Rate name is required.',
            'name.string' => 'Rate name must be a valid text.',
            'name.max' => 'Rate name cannot exceed 255 characters.',
            'description.string' => 'Description must be a valid text.',
            'price.required' => 'Price is required.',
            'price.numeric' => 'Price must be a valid number.',
            'price.min' => 'Price cannot be negative.',
            'status.required' => 'Status is required.',
            'status.boolean' => 'Status must be either active or inactive.',
        ];
    }
} 