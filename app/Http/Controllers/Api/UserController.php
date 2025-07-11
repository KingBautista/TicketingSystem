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

class UserController extends BaseController
{
	public function __construct(UserService $userService, MessageService $messageService)
  {
    // Call the parent constructor to initialize services
    parent::__construct($userService, $messageService);
  }

  public function store(StoreUserRequest $request)
  {
    try {
      $data = $request->validated();

      $salt = PasswordHelper::generateSalt();
      $password = PasswordHelper::generatePassword($salt, $data['user_pass']);
      $activation_key = PasswordHelper::generateSalt();

      $data = [
        'user_login' => $data['user_login'],
        'user_email' => $data['user_email'],
        'user_salt' => $salt,
        'user_pass' => $password,
        'user_status' => 1,
        'user_activation_key' => $activation_key,
      ];

      $meta_details = [];
      if(isset($request->first_name))
        $meta_details['first_name'] = $request->first_name;
        
      if(isset($request->last_name))
        $meta_details['last_name'] = $request->last_name;
    
      if(isset($request->user_role))
        $meta_details['user_role'] = $request->user_role;

      $user = $this->service->storeWithMeta($data, $meta_details);
      
      return response($user, 201);
    } catch (\Exception $e) {
      return $this->messageService->responseError();
    }
  }

  public function update(UpdateUserRequest $request, Int $id)
  {
    try {
      $data = $request->validated();
      $user = User::findOrFail($id);

      $upData = [
        'user_login' => $request->user_login,
        'user_email' => $request->user_email,
        'user_status' => $request->user_status,
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
    
      if(isset($request->user_role))
        $meta_details['user_role'] = $request->user_role;

      $user = $this->service->updateWithMeta($upData, $meta_details, $user);

      return response($user, 201);
    } catch (\Exception $e) {
      return $this->messageService->responseError();
    }
  }

  public function bulkChangePassword(Request $request) 
  {
    try {
      $this->service->bulkChangePassword($request->ids);
      $message = 'Temporary password has been sent.';
      return response(compact('message'));
    } catch (\Exception $e) {
      return $this->messageService->responseError();
    }
  }

  public function bulkChangeRole(Request $request) 
  {
    try {
      $this->service->bulkChangeRole($request->ids, $request->role);
      $message = 'User/s role has been change.';
      return response(compact('message'));
    } catch (\Exception $e) {
      return $this->messageService->responseError();
    }
  }

  public function updateProfile(ProfileRequest $request) 
  {
    try {
      $data = $request->all();
      $user = Auth::user();

      $upData = [
        'user_login' => $data['user_login'],
        'user_email' => $data['user_email'],
      ];

      if (isset($data['user_pass'])) {
        $salt = $user->user_salt;
        $upData['user_pass'] = PasswordHelper::generatePassword($salt, $data['user_pass']);
      }

      $meta_details = [];
      if(isset($data['first_name']))
        $meta_details['first_name'] = $data['first_name'];
        
      if(isset($data['last_name']))
        $meta_details['last_name'] = $data['last_name'];
    
      if(isset($data['nickname']))
        $meta_details['nickname'] = $data['nickname'];

      if(isset($data['biography']))
        $meta_details['biography'] = $data['biography'];

      if(isset($data['theme']))
        $meta_details['theme'] = $data['theme'];

      if(isset($data['attachment_file'])) {
        $attachment_file = json_decode($data['attachment_file']);

        $meta_details['attachment_metadata'] = json_encode($attachment_file);
        $meta_details['attachment_file'] = $attachment_file->file_url;  
      }

      if(isset($data['user_role'])) {
        $user_role = json_decode($data['user_role']);
        $meta_details['user_role'] = json_encode($user_role);
      }

      $user = $this->service->updateWithMeta($upData, $meta_details, $user);

      return response($user, 201);
    } catch (\Exception $e) {
      return $this->messageService->responseError();
    }
  }

  public function getUser(Request $request) 
	{
    try {
      $user = $request->user();
      return new UserResource($user);
    } catch (\Exception $e) {
      return $this->messageService->responseError();
    }
	}
}
