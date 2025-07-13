<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreUserRequest extends FormRequest
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
			"user_login" => "required|string|unique:users,user_login",
			"user_email" => "required|email|unique:users,user_email",
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
				'required',
				'string',
				'min:8',              // must be at least 8 characters in length
				'regex:/[a-z]/',      // must contain at least one lowercase letter
				'regex:/[A-Z]/',      // must contain at least one uppercase letter
				'regex:/[0-9]/',      // must contain at least one digit
				'regex:/[@$!%*#?&]/', // must contain a special character
			],
		];
	}

	public function messages(): array
	{
		return [
			"user_login.unique" => "The username has already been taken.",
			"user_email.email" => "The email field must be a valid email address.",
			"user_email.unique" => "The email has already been taken.",
			"user_pass.required" => "The password field is required.",
			"user_role_id.required" => "The role field is required.",
			"user_role_id.exists" => "The selected role is invalid.",
		];
	}
}
