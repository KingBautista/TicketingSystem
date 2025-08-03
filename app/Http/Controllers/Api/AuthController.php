<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\Auditable;
use Illuminate\Http\Request;
use App\Http\Requests\SignupRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\ForgotPasswordRequest;
use App\Helpers\PasswordHelper;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use App\Mail\VerifyEmail;
use App\Mail\ForgotPasswordEmail;
use Illuminate\Support\Facades\Auth; 
use App\Http\Resources\AuthResource;

use Hash;

class AuthController extends Controller
{
	use Auditable;

	/**
	 * Create a new user.
	 */
	public function signup(SignupRequest $request) 
	{
		$data = $request->validated();

		$salt = PasswordHelper::generateSalt();
		$password = PasswordHelper::generatePassword($salt, $request->password);
		$activation_key = PasswordHelper::generateSalt();

		$user = User::create([
			'user_login' => $data['username'],
			'user_email' => $data['email'],
			'user_salt' => $salt,
			'user_pass' => $password,
			'user_activation_key' => $activation_key,
		]);

		$user_key = $user->user_activation_key;

		// email sending code here
		$options = array(
			'verify_url'   => env('ADMIN_APP_URL')."/login/activate/".$user_key
		);

		$message = '';
		if(Mail::to($user->user_email)->send(new VerifyEmail($user, $options))) {
			$message = 'Aww yeah, you have successfuly registered. Verification email has been sent to your registered email.';
		}

		$this->logCreate("New user registration: {$user->user_login} ({$user->user_email})", $user);

		return response(compact('message'));
		
	}

	/**
	 * Activate registered user.
	 */
	public function activateUser(Request $request) 
	{
		$message = '';

		$user = User::where('user_activation_key', $request->activation_key)
		->where('user_status', 0)->first();
		
		if($user) {
			$user->update(['user_status' => 1]);
			$message = 'Your registered email address has been validated, you can login you account and enjoy.';
			
			$this->logUpdate("User account activated: {$user->user_login} ({$user->user_email})", null, $user->toArray());
		}

		return response(compact('message'));

	}

	/**
	 * Generate a temporary password.
	 */
	public function genTempPassword(ForgotPasswordRequest $request) 
	{
		$data = $request->validated();
		$message = '';

		$user = User::where('user_email', $data['email'])->first();

		if($user) {
			$salt = $user->user_salt;
			$new_password = PasswordHelper::generateSalt();
			$password = PasswordHelper::generatePassword($salt, $new_password);

			$user->update(['user_pass' => $password]);

			$options = array(
				'login_url' => env('ADMIN_APP_URL')."/login",
				'new_password' => $new_password
			);
	
			if(Mail::to($user->user_email)->send(new ForgotPasswordEmail($user, $options))) {
				$message = 'Your temporary password has been sent to your registered email.';
			}

			$this->logAudit('PASSWORD_RESET', "Password reset requested for user: {$user->user_login} ({$user->user_email})");
		}

		return response(compact('message'));
	}

	/**
	 * Login a user.
	 */
	public function login(LoginRequest $request) 
	{
		$credentials = $request->validated();

		$user = User::where('user_email', '=', $credentials['email'])->where('user_status', 1)->first();
		if (!Hash::check($user->user_salt.$credentials['password'].env("PEPPER_HASH"), $user->user_pass))
			return response([
				'errors' => ['Invalid email or password.'],
				'status' => false,
				'status_code' => 422,
			], 422);
		
		$user->tokens()->delete();

		Auth::login($user);
		$token = $user->createToken('admin')->plainTextToken;
		$user = new AuthResource($user);

		$this->logLogin("User logged in: {$user->user_login} ({$user->user_email})");

		return response(compact('user', 'token'));	

	}

	/**
	 * Logout a user.
	 */
	public function logout(Request $request) 
	{
		$user = $request->user();
		$user->currentAccessToken()->delete();
		
		$this->logLogout("User logged out: {$user->user_login} ({$user->user_email})");
		
		return response('', 204);
	}

	/**
	 * Validate password for the currently authenticated user.
	 */
	public function validatePassword(Request $request)
	{
		$request->validate([
			'password' => 'required|string',
		]);
		$user = $request->user();
		if (!$user) {
			return response(['message' => 'Unauthenticated.'], 401);
		}
		// Use the same password check as login
		if (!\Hash::check($user->user_salt.$request->password.env('PEPPER_HASH'), $user->user_pass)) {
			return response(['message' => 'Invalid password.'], 422);
		}
		
		$this->logAudit('PASSWORD_VALIDATION', "Password validation for user: {$user->user_login} - SUCCESS");
		
		return response(['message' => 'Password is valid.'], 200);
	}
}
