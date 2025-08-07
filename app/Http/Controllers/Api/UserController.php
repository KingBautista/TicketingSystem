<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Requests\ProfileRequest;
use App\Helpers\PasswordHelper;
use App\Services\UserService;
use App\Services\MessageService;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\UserResource;
use App\Traits\Auditable;

class UserController extends BaseController
{
	use Auditable;

	public function __construct(UserService $userService, MessageService $messageService)
  {
    // Call the parent constructor to initialize services
    parent::__construct($userService, $messageService);
  }

  public function store(StoreUserRequest $request)
  {
    // try {
      $data = $request->validated();

      $salt = PasswordHelper::generateSalt();
      $password = PasswordHelper::generatePassword($salt, $data['user_pass']);
      $activation_key = PasswordHelper::generateSalt();

      $userData = [
        'user_login' => $data['user_login'],
        'user_email' => $data['user_email'],
        'user_salt' => $salt,
        'user_pass' => $password,
        'user_status' => 1,
        'user_activation_key' => $activation_key,
      ];

      // Handle user_role_id if provided
      if (isset($data['user_role']['id'])) {
        $userData['user_role_id'] = $data['user_role']['id'];
      }

      $meta_details = [];
      if(isset($request->first_name))
        $meta_details['first_name'] = $request->first_name;
        
      if(isset($request->last_name))
        $meta_details['last_name'] = $request->last_name;

      $user = $this->service->storeWithMeta($userData, $meta_details);
      
      $this->logCreate("Created new user: {$userData['user_login']} ({$userData['user_email']})", $user);
      
      return response($user, 201);
    // } catch (\Exception $e) {
    //   return $this->messageService->responseError();
    // }
  }

  public function update(UpdateUserRequest $request, Int $id)
  {
    try {
      $data = $request->validated();
      $user = User::findOrFail($id);
      $oldData = $user->toArray();

      $upData = [
        'user_login' => $request->user_login,
        'user_email' => $request->user_email,
        'user_status' => $request->user_status,
      ];

      // Handle user_role_id if provided
      if (isset($data['user_role']['id'])) {
        $upData['user_role_id'] = $data['user_role']['id'];
      }

      if (isset($data['user_pass'])) {
        $salt = $user->user_salt;
        $upData['user_pass'] = PasswordHelper::generatePassword($salt, request('user_pass'));
      }

      $meta_details = [];
      if(isset($request->first_name))
        $meta_details['first_name'] = $request->first_name;
        
      if(isset($request->last_name))
        $meta_details['last_name'] = $request->last_name;

      $user = $this->service->updateWithMeta($upData, $meta_details, $user);

      $this->logUpdate("Updated user: {$user->user_login} ({$user->user_email})", $oldData, $user->toArray());

      return response($user, 201);
    } catch (\Exception $e) {
      return $this->messageService->responseError();
    }
  }

  public function bulkChangePassword(Request $request) 
  {
    try {
      $userIds = $request->user_ids;
      $newPassword = $request->new_password;
      $count = count($userIds);

      foreach ($userIds as $userId) {
        $user = User::find($userId);
        if ($user) {
          $salt = $user->user_salt;
          $user->user_pass = PasswordHelper::generatePassword($salt, $newPassword);
          $user->save();
        }
      }

      $this->logBulkAction('PASSWORD_CHANGE', "Bulk changed password for {$count} users", $count);

      return response(['message' => 'Passwords have been changed successfully.'], 200);
    } catch (\Exception $e) {
      return $this->messageService->responseError();
    }
  }

  public function bulkChangeRole(Request $request) 
  {
    try {
      $userIds = $request->user_ids;
      $roleId = $request->role_id;
      $count = count($userIds);

      User::whereIn('id', $userIds)->update(['user_role_id' => $roleId]);

      $this->logBulkAction('ROLE_CHANGE', "Bulk changed role for {$count} users to role ID: {$roleId}", $count);

      return response(['message' => 'Roles have been changed successfully.'], 200);
    } catch (\Exception $e) {
      return $this->messageService->responseError();
    }
  }

  public function updateProfile(ProfileRequest $request) 
  {
    try {
      $data = $request->validated();
      $user = Auth::user();
      $oldData = $user->toArray();

      $upData = [
        'user_login' => $request->user_login,
        'user_email' => $request->user_email,
      ];

      if (isset($data['user_pass'])) {
        $salt = $user->user_salt;
        $upData['user_pass'] = PasswordHelper::generatePassword($salt, request('user_pass'));
      }

      $meta_details = [];
      if(isset($request->first_name))
        $meta_details['first_name'] = $request->first_name;
        
      if(isset($request->last_name))
        $meta_details['last_name'] = $request->last_name;

      $user = $this->service->updateWithMeta($upData, $meta_details, $user);

      $this->logUpdate("Updated own profile: {$user->user_login} ({$user->user_email})", $oldData, $user);

      return response([
        'message' => 'Profile has been updated successfully.',
        'user' => $user
      ], 200);
    } catch (\Exception $e) {
      return $this->messageService->responseError();
    }
  }

  public function getUser(Request $request) 
  {
    try {
      $user = Auth::user();
      $userData = [
        'id' => $user->id,
        'user_login' => $user->user_login,
        'user_email' => $user->user_email,
        'user_status' => $user->user_status,
        'user_role' => $user->userRole,
        'user_details' => $user->user_details,
        'created_at' => $user->created_at,
        'updated_at' => $user->updated_at,
      ];

      $this->logAudit('VIEW', 'Viewed own profile information');

      return response($userData, 200);
    } catch (\Exception $e) {
      return $this->messageService->responseError();
    }
  }

  public function getUsersForDropdown()
  {
    try {
      $users = User::select('id', 'user_login', 'user_email')
        ->where('user_status', 1)
        ->orderBy('user_login')
        ->get();
      
      return response()->json($users);
    } catch (\Exception $e) {
      return response()->json(['error' => 'Failed to fetch users'], 500);
    }
  }
}
