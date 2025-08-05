<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class VIPRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'address' => 'nullable|string|max:255',
            'contact_number' => 'nullable|string|max:32',
            'other_info' => 'nullable|string|max:255',
            'card_number' => [
                'required',
                'string',
                'max:255',
                Rule::unique('vips', 'card_number')->ignore($this->id),
            ],
            'validity_start' => 'required|date',
            'validity_end' => 'required|date|after_or_equal:validity_start',
            'status' => 'boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'VIP name is required.',
            'name.string' => 'VIP name must be a valid text.',
            'name.max' => 'VIP name cannot exceed 255 characters.',
            'address.string' => 'Address must be a valid text.',
            'address.max' => 'Address cannot exceed 255 characters.',
            'contact_number.string' => 'Contact number must be a valid text.',
            'contact_number.max' => 'Contact number cannot exceed 32 characters.',
            'other_info.string' => 'Other information must be a valid text.',
            'other_info.max' => 'Other information cannot exceed 255 characters.',
            'card_number.required' => 'Card number is required.',
            'card_number.string' => 'Card number must be a valid text.',
            'card_number.max' => 'Card number cannot exceed 255 characters.',
            'card_number.unique' => 'This card number is already enrolled. Please use a different one.',
            'validity_start.required' => 'Validity start date is required.',
            'validity_start.date' => 'Please enter a valid start date.',
            'validity_end.required' => 'Validity end date is required.',
            'validity_end.date' => 'Please enter a valid end date.',
            'validity_end.after_or_equal' => 'Validity end date must be after or equal to the start date.',
            'status.boolean' => 'Status must be either active or inactive.',
        ];
    }
} 