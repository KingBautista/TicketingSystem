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

  /**
   * Display a listing of users.
   * 
   * @OA\Get(
   *     path="/api/user-management/users",
   *     summary="Get list of users",
   *     tags={"User Management"},
   *     security={{"bearerAuth": {}}},
   *     @OA\Parameter(
   *         name="search",
   *         in="query",
   *         description="Search term",
   *         required=false,
   *         @OA\Schema(type="string")
   *     ),
   *     @OA\Parameter(
   *         name="per_page",
   *         in="query",
   *         description="Number of items per page",
   *         required=false,
   *         @OA\Schema(type="integer", default=10)
   *     ),
   *     @OA\Parameter(
   *         name="order",
   *         in="query",
   *         description="Order by field",
   *         required=false,
   *         @OA\Schema(type="string")
   *     ),
   *     @OA\Parameter(
   *         name="sort",
   *         in="query",
   *         description="Sort direction (asc/desc)",
   *         required=false,
   *         @OA\Schema(type="string", enum={"asc", "desc"})
   *     ),
   *     @OA\Response(
   *         response=200,
   *         description="Successful operation",
   *         @OA\JsonContent(
   *             @OA\Property(property="data", type="array", @OA\Items(type="object")),
   *             @OA\Property(property="meta", type="object")
   *         )
   *     ),
   *     @OA\Response(
   *         response=401,
   *         description="Unauthenticated"
   *     ),
   *     @OA\Response(
   *         response=500,
   *         description="Server error"
   *     )
   * )
   */
  public function index()
  {
    return parent::index();
  }

  /**
   * Display the specified user.
   * 
   * @OA\Get(
   *     path="/api/user-management/users/{id}",
   *     summary="Get a specific user",
   *     tags={"User Management"},
   *     security={{"bearerAuth": {}}},
   *     @OA\Parameter(
   *         name="id",
   *         in="path",
   *         description="User ID",
   *         required=true,
   *         @OA\Schema(type="integer")
   *     ),
   *     @OA\Response(
   *         response=200,
   *         description="Successful operation",
   *         @OA\JsonContent(type="object")
   *     ),
   *     @OA\Response(
   *         response=404,
   *         description="User not found"
   *     ),
   *     @OA\Response(
   *         response=401,
   *         description="Unauthenticated"
   *     )
   * )
   */
  public function show($id)
  {
    return parent::show($id);
  }

  /**
   * Remove the specified user from storage (soft delete).
   * 
   * @OA\Delete(
   *     path="/api/user-management/users/{id}",
   *     summary="Delete a user (soft delete)",
   *     tags={"User Management"},
   *     security={{"bearerAuth": {}}},
   *     @OA\Parameter(
   *         name="id",
   *         in="path",
   *         description="User ID",
   *         required=true,
   *         @OA\Schema(type="integer")
   *     ),
   *     @OA\Response(
   *         response=200,
   *         description="User moved to trash",
   *         @OA\JsonContent(
   *             @OA\Property(property="message", type="string", example="User has been moved to trash.")
   *         )
   *     ),
   *     @OA\Response(
   *         response=404,
   *         description="User not found"
   *     ),
   *     @OA\Response(
   *         response=401,
   *         description="Unauthenticated"
   *     )
   * )
   */
  public function destroy($id)
  {
    return parent::destroy($id);
  }

  /**
   * Get users for dropdown.
   * 
   * @OA\Get(
   *     path="/api/options/users",
   *     summary="Get users for dropdown",
   *     tags={"User Management"},
   *     security={{"bearerAuth": {}}},
   *     @OA\Response(
   *         response=200,
   *         description="List of users for dropdown",
   *         @OA\JsonContent(
   *             type="array",
   *             @OA\Items(
   *                 type="object",
   *                 @OA\Property(property="id", type="integer", example=1),
   *                 @OA\Property(property="user_login", type="string", example="john_doe"),
   *                 @OA\Property(property="user_email", type="string", example="john@example.com"),
   *                 @OA\Property(property="first_name", type="string", example="John"),
   *                 @OA\Property(property="last_name", type="string", example="Doe")
   *             )
   *         )
   *     ),
   *     @OA\Response(
   *         response=401,
   *         description="Unauthenticated"
   *     )
   * )
   */
  public function getUsersForDropdown()
  {
    try {
      $users = $this->service->getUsersForDropdown();
      return response()->json($users);
    } catch (\Exception $e) {
      return $this->messageService->responseError();
    }
  }

  /**
   * Store a newly created user in storage.
   * 
   * @OA\Post(
   *     path="/api/user-management/users",
   *     summary="Create a new user",
   *     tags={"Users"},
   *     security={{"bearerAuth": {}}},
   *     @OA\RequestBody(
   *         required=true,
   *         @OA\JsonContent(
   *             required={"user_login", "user_email", "user_pass", "user_role_id"},
   *             @OA\Property(property="user_login", type="string", example="john_doe", description="Username"),
   *             @OA\Property(property="user_email", type="string", format="email", example="john@example.com", description="Email address"),
   *             @OA\Property(property="user_pass", type="string", example="password123", description="Password"),
   *             @OA\Property(property="user_role_id", type="integer", example=2, description="Role ID"),
   *             @OA\Property(property="user_status", type="integer", example=1, description="User status (1=Active, 0=Inactive)"),
   *             @OA\Property(property="first_name", type="string", example="John", description="First name"),
   *             @OA\Property(property="last_name", type="string", example="Doe", description="Last name")
   *         )
   *     ),
   *     @OA\Response(
   *         response=201,
   *         description="User created successfully",
   *         @OA\JsonContent(type="object")
   *     ),
   *     @OA\Response(
   *         response=422,
   *         description="Validation error"
   *     ),
   *     @OA\Response(
   *         response=401,
   *         description="Unauthenticated"
   *     )
   * )
   */
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
        'user_role_id' => $data['user_role_id'],
      ];

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

  /**
   * Update the specified user in storage.
   * 
   * @OA\Put(
   *     path="/api/user-management/users/{id}",
   *     summary="Update an existing user",
   *     tags={"Users"},
   *     security={{"bearerAuth": {}}},
   *     @OA\Parameter(
   *         name="id",
   *         in="path",
   *         description="User ID",
   *         required=true,
   *         @OA\Schema(type="integer")
   *     ),
   *     @OA\RequestBody(
   *         required=true,
   *         @OA\JsonContent(
   *             required={"user_login", "user_email", "user_role_id"},
   *             @OA\Property(property="user_login", type="string", example="john_doe", description="Username"),
   *             @OA\Property(property="user_email", type="string", format="email", example="john@example.com", description="Email address"),
   *             @OA\Property(property="user_pass", type="string", example="newpassword123", description="New password (optional)"),
   *             @OA\Property(property="user_role_id", type="integer", example=2, description="Role ID"),
   *             @OA\Property(property="user_status", type="integer", example=1, description="User status (1=Active, 0=Inactive)"),
   *             @OA\Property(property="first_name", type="string", example="John", description="First name"),
   *             @OA\Property(property="last_name", type="string", example="Doe", description="Last name")
   *         )
   *     ),
   *     @OA\Response(
   *         response=201,
   *         description="User updated successfully",
   *         @OA\JsonContent(type="object")
   *     ),
   *     @OA\Response(
   *         response=404,
   *         description="User not found"
   *     ),
   *     @OA\Response(
   *         response=422,
   *         description="Validation error"
   *     ),
   *     @OA\Response(
   *         response=401,
   *         description="Unauthenticated"
   *     )
   * )
   */
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
        'user_role_id' => $request->user_role_id,
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

      $userResource = $this->service->updateWithMeta($upData, $meta_details, $user);

      $this->logUpdate("Updated user: {$user->user_login} ({$user->user_email})", $oldData, $user->toArray());

      return response($userResource, 201);
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

      if (isset($data['user_pass']) && !empty($data['user_pass'])) {
        $salt = $user->user_salt;
        $upData['user_pass'] = PasswordHelper::generatePassword($salt, request('user_pass'));
      }

      $meta_details = [];
      if(isset($request->first_name))
        $meta_details['first_name'] = $request->first_name;
        
      if(isset($request->last_name))
        $meta_details['last_name'] = $request->last_name;

      if(isset($request->nickname))
        $meta_details['nickname'] = $request->nickname;

      if(isset($request->biography))
        $meta_details['biography'] = $request->biography;

      if(isset($request->theme))
        $meta_details['theme'] = $request->theme;

      if(isset($request->attachment_file))
        $meta_details['attachment_file'] = $request->attachment_file;

      $userResource = $this->service->updateWithMeta($upData, $meta_details, $user);

      $this->logUpdate("Updated own profile: {$user->user_login} ({$user->user_email})", $oldData, $user);

      return response([
        'message' => 'Profile has been updated successfully.',
        'user' => $userResource
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
        'first_name' => $user->user_details['first_name'] ?? '',
        'last_name' => $user->user_details['last_name'] ?? '',
        'nickname' => $user->user_details['nickname'] ?? '',
        'biography' => $user->user_details['biography'] ?? '',
        'theme' => $user->user_details['theme'] ?? '',
        'attachment_file' => $user->user_details['attachment_file'] ?? '',
        'attachment_metadata' => $user->user_details['attachment_file'] ?? '',
        'created_at' => $user->created_at,
        'updated_at' => $user->updated_at,
      ];

      $this->logAudit('VIEW', 'Viewed own profile information');

      return response($userData, 200);
    } catch (\Exception $e) {
      return $this->messageService->responseError();
    }
  }

}
