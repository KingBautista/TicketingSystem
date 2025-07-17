<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class NavigationRequest extends FormRequest
{
  /**
   * Determine if the user is authorized to make this request.
   */
  public function authorize(): bool
  {
    return true;
  }

  /**
   * Get the validation rules that apply to the request.
   *
   * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
   */
  public function rules(): array
  {
    return [
      "name" => [
        "required",
        "regex:/^[a-zA-Z0-9,&\-\_\s]+$/",
        Rule::unique('navigations', 'name')->ignore($this->id),
      ],
      "slug" => "string|regex:/^[a-zA-Z0-9,&\-\_\/\s]+$/",
    ];
  }

  public function messages(): array
  {
    return [
      'name.required' => 'The navigation name is required.',
      'name.regex' => 'The navigation name can only contain letters, numbers, and special characters (, & - _).',
      'name.unique' => 'This navigation name is already taken.',
      'slug.regex' => 'The slug can only contain letters, numbers, and special characters (, & - _).'
    ];
  }
}
