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
			'user_role' => [
				'required'
			],
			'user_role.id' => [
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
				'min:8',              // must be at least 8 characters in length
				'regex:/[a-z]/',      // must contain at least one lowercase letter
				'regex:/[A-Z]/',      // must contain at least one uppercase letter
				'regex:/[0-9]/',      // must contain at least one digit
				'regex:/[@$!#?&]/', // must contain a special character
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
			"user_pass.min" => "Password must be at least 8 characters long.",
			"user_pass.regex" => "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
			"user_role.required" => "User role is required.",
			"user_role.id.required" => "Please select a valid role.",
			"user_role.id.integer" => "Role ID must be a valid number.",
			"user_role.id.exists" => "The selected role does not exist.",
		];
	}

	/**
	 * Prepare the data for validation.
	 */
	protected function prepareForValidation()
	{
		if (is_string($this->user_role)) {
			$decoded = json_decode($this->user_role, true);
			if (json_last_error() === JSON_ERROR_NONE) {
				$this->merge([
					'user_role' => $decoded
				]);
			}
		}
	}
}
