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
				function (
					$attribute, $value, $fail
				) {
					if ($value == 1) {
						return $fail("The selected role is not allowed.");
					}
				},
			],
			"user_pass" => [
				'required',
				'string',
			],
		];
	}

	public function messages(): array
	{
		return [
			"user_login.required" => "Username is required.",
			"user_login.unique" => "This username has already been taken. Please choose a different one.",
			"user_login.string" => "Username must be a valid text.",
			"user_email.required" => "Email address is required.",
			"user_email.email" => "Please enter a valid email address.",
			"user_email.unique" => "This email address has already been registered. Please use a different one.",
			"user_pass.required" => "Password is required.",
			"user_pass.string" => "Password must be a valid text.",
			"user_role_id.required" => "User role is required.",
			"user_role_id.integer" => "Role ID must be a valid number.",
			"user_role_id.exists" => "The selected role does not exist.",
		];
	}

	/**
	 * Prepare the data for validation.
	 */
	protected function prepareForValidation()
	{
		// No longer needed since we're using user_role_id directly
	}
}
