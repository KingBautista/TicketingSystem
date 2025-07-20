<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PromoterScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'promoter_id' => 'required|exists:promoters,id',
            'date' => 'required|date',
            'is_manual' => 'sometimes|boolean',
        ];
    }
} 