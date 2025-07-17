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
            'name.required' => 'The VIP name is required.',
            'card_number.required' => 'The card number is required.',
            'card_number.unique' => 'This card number is already enrolled.',
            'validity_start.required' => 'The validity start date is required.',
            'validity_end.required' => 'The validity end date is required.',
            'validity_end.after_or_equal' => 'The validity end date must be after or equal to the start date.',
        ];
    }
} 