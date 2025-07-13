<?php

namespace App\Services;

use App\Models\User;
use App\Http\Resources\UserResource;
use Illuminate\Support\Facades\Mail;
use App\Mail\ForgotPasswordEmail;
use App\Mail\VerifyEmail;
use App\Helpers\PasswordHelper;

class UserService extends BaseService
{
  public function __construct()
  {
      // Pass the UserResource class to the parent constructor
      parent::__construct(new UserResource(new User), new User());
  }
  /**
  * Retrieve all resources with paginate.
  */
  public function list($perPage = 10, $trash = false)
  {
    $allUsers = $this->getTotalCount();
    $trashedUsers = $this->getTrashedCount();

    return UserResource::collection(User::query()
    ->with('userRole') // Load the role relationship
    ->where('user_role_id', '!=', 1) // Exclude Developer Account
    ->when($trash, function ($query) {
      return $query->onlyTrashed();
    })
    ->when(request('search'), function ($query) {
      return $query->where('user_login', 'LIKE', '%' . request('search') . '%')
                   ->orWhere('user_email', 'LIKE', '%' . request('search') . '%');
    })
    ->when(request('order'), function ($query) {
        return $query->orderBy(request('order'), request('sort'));
    })
    ->when(!request('order'), function ($query) {
      return $query->orderBy('id', 'desc');
    })
    ->paginate($perPage)->withQueryString()
    )->additional(['meta' => ['all' => $allUsers, 'trashed' => $trashedUsers]]);
  }

  /**
  * Store a newly created resource in storage.
  */
  public function storeWithMeta(array $data, array $metaData)
  {
    $user = parent::store($data); // Call the parent method
    if(count($metaData))
      $user->saveUserMeta($metaData);

    $user_key = $user->user_activation_key;
    $this->sendVerifyEmail($user, $user_key);

    return new UserResource($user);
  }

  /**
  * Update the specified resource in storage.
  */
  public function updateWithMeta(array $data, array $metaData, User $user)
  {
    $user->update($data);
    if(count($metaData))
      $user->saveUserMeta($metaData);

    $this->sendForgotPasswordEmail($user);

    return new UserResource($user);
  }

  /**
  * Bulk restore a soft-deleted user.
  */
  public function bulkChangePassword($ids) 
  {
    if(count($ids) > 0) {
      foreach ($ids as $id) {
        $user = User::findOrFail($id);
        $this->genTempPassword($user);
      }
    }
  }

  public function genTempPassword(User $user) 
	{
		if($user) {
			$salt = $user->user_salt;
			$new_password = PasswordHelper::generateSalt();
			$password = PasswordHelper::generatePassword($salt, $new_password);

			$user->update(['user_pass' => $password]);

			$this->sendForgotPasswordEmail($user, $new_password);
		}
	}

  /**
  * Bulk change user role.
  */
  public function bulkChangeRole($ids, $user_role_id) 
  {
    if(count($ids) > 0) {
      foreach ($ids as $id) {
        $user = User::findOrFail($id);
        $user->update(['user_role_id' => $user_role_id]);
      }
    }
  }

  /**
  * Send verify email.
  */
  public function sendVerifyEmail($user, $user_key)
  {
    $options = array(
      'verify_url'   => env('ADMIN_APP_URL')."/login/activate/".$user_key,
      'password'   => request('user_pass')
    );

    Mail::to($user->user_email)->send(new VerifyEmail($user, $options));
  }

  /**
  * Send temporary password.
  */
  public function sendForgotPasswordEmail($user, $new_password = '') 
  {
    $user_pass = ($new_password) ? $new_password : request('user_pass');
    $options = array(
      'login_url' => env('ADMIN_APP_URL')."/login",
      'new_password' => $user_pass
    );

    if($user_pass)
      Mail::to($user->user_email)->send(new ForgotPasswordEmail($user, $options));
  }
}