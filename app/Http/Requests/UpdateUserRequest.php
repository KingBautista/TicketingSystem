<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
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
			"user_login" => "required|string|unique:users,user_login,".$this->id,
			"user_email" => "required|email|unique:users,user_email,".$this->id,
			'user_role_id' => [
				'required',
				'integer',
				'exists:roles,id',
				function ($attribute, $value, $fail) {
					// Optional: reject certain roles by ID
					if ($value == 1) {
						return $fail("The selected role is not allowed.");
					}
				}
			],
			"user_pass" => [
				'string',
			],
		];
	}

	public function messages(): array
	{
		return [
			"user_login.unique" => "The username has already been taken.",
			"user_email.email" => "The email field must be a valid email address.",
			"user_email.unique" => "The email has already been taken.",
			"user_pass.string" => "Password must be a valid text.",
			"user_role_id.exists" => "The selected role is invalid.",
		];
	}
}
