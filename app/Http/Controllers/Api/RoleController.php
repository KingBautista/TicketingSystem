<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Requests\RoleRequest;
use App\Services\MessageService;
use App\Services\RoleService;
use App\Models\Role;
use App\Models\Permission;
use App\Models\RolePermission;
use App\Traits\Auditable;

class RoleController extends BaseController
{
  use Auditable;

  	public function __construct(RoleService $roleService, MessageService $messageService)
  {
    // Call the parent constructor to initialize services
    parent::__construct($roleService, $messageService);
  }

  /**
   * Display a listing of roles.
   * 
   * @OA\Get(
   *     path="/api/user-management/roles",
   *     summary="Get list of roles",
   *     tags={"Role Management"},
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
   * Display the specified role.
   * 
   * @OA\Get(
   *     path="/api/user-management/roles/{id}",
   *     summary="Get a specific role",
   *     tags={"Role Management"},
   *     security={{"bearerAuth": {}}},
   *     @OA\Parameter(
   *         name="id",
   *         in="path",
   *         description="Role ID",
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
   *         description="Role not found"
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
   * Remove the specified role from storage (soft delete).
   * 
   * @OA\Delete(
   *     path="/api/user-management/roles/{id}",
   *     summary="Delete a role (soft delete)",
   *     tags={"Role Management"},
   *     security={{"bearerAuth": {}}},
   *     @OA\Parameter(
   *         name="id",
   *         in="path",
   *         description="Role ID",
   *         required=true,
   *         @OA\Schema(type="integer")
   *     ),
   *     @OA\Response(
   *         response=200,
   *         description="Role moved to trash",
   *         @OA\JsonContent(
   *             @OA\Property(property="message", type="string", example="Role has been moved to trash.")
   *         )
   *     ),
   *     @OA\Response(
   *         response=404,
   *         description="Role not found"
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
   * Store a newly created role in storage.
   * 
   * @OA\Post(
   *     path="/api/user-management/roles",
   *     summary="Create a new role",
   *     tags={"Role Management"},
   *     security={{"bearerAuth": {}}},
   *     @OA\RequestBody(
   *         required=true,
   *         @OA\JsonContent(
   *             required={"name", "permissions"},
   *             @OA\Property(property="name", type="string", example="Admin", description="Role name"),
   *             @OA\Property(property="active", type="boolean", example=true, description="Role status"),
   *             @OA\Property(property="is_super_admin", type="boolean", example=false, description="Super admin flag"),
   *             @OA\Property(
   *                 property="permissions",
   *                 type="object",
   *                 description="Role permissions structure",
   *                 example={
   *                     "1": {
   *                         "1": {
   *                             "can_view": true,
   *                             "can_create": true,
   *                             "can_edit": true,
   *                             "can_delete": true
   *                         }
   *                     }
   *                 }
   *             )
   *         )
   *     ),
   *     @OA\Response(
   *         response=201,
   *         description="Role created successfully",
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
  public function store(RoleRequest $request)
  {
    try {
      $resource = '';
      $data = $request->all();
      // Save the role
      $role = new Role();
      $role->name = $data['name'];
      $role->active = $data['active'] ?? true;
      $role->is_super_admin = $data['is_super_admin'] ?? true;
      $role->save();

      // Fetch permissions once to optimize lookup
      $permissions = Permission::pluck('id', 'name')->toArray();

      $dataToInsert = [];

      // Iterate over the permissions data
      foreach ($data['permissions'] as $parent_navigation_id => $navigations) {
        $role_id = $role->id; // Use the newly created role's ID

        foreach ($navigations as $navigation_id => $permissions_data) {
          foreach ($permissions_data as $permission_name => $allowed) {
            if ($allowed && isset($permissions[$permission_name])) {
              $permission_id = $permissions[$permission_name];

              $dataToInsert[] = [
                'role_id' => $role_id,
                'navigation_id' => $navigation_id,
                'permission_id' => $permission_id,
                'allowed' => true,
                'created_at' => now(),
                'updated_at' => now(),
              ];
            }
          }
        }
      }

      // Insert all records at once if any data to insert
      if (!empty($dataToInsert)) {
        $resource = RolePermission::insert($dataToInsert);
      }
    
      $this->logCreate("Created new role: {$role->name}", $role);
    
      return response($resource, 201);
    } catch (\Exception $e) {
      return $this->messageService->responseError();
    }
  }

  /**
   * Update the specified role in storage.
   * 
   * @OA\Put(
   *     path="/api/user-management/roles/{id}",
   *     summary="Update an existing role",
   *     tags={"Role Management"},
   *     security={{"bearerAuth": {}}},
   *     @OA\Parameter(
   *         name="id",
   *         in="path",
   *         description="Role ID",
   *         required=true,
   *         @OA\Schema(type="integer")
   *     ),
   *     @OA\RequestBody(
   *         required=true,
   *         @OA\JsonContent(
   *             required={"name", "permissions"},
   *             @OA\Property(property="name", type="string", example="Admin", description="Role name"),
   *             @OA\Property(property="active", type="boolean", example=true, description="Role status"),
   *             @OA\Property(property="is_super_admin", type="boolean", example=false, description="Super admin flag"),
   *             @OA\Property(
   *                 property="permissions",
   *                 type="object",
   *                 description="Role permissions structure",
   *                 example={
   *                     "1": {
   *                         "1": {
   *                             "can_view": true,
   *                             "can_create": true,
   *                             "can_edit": true,
   *                             "can_delete": true
   *                         }
   *                     }
   *                 }
   *             )
   *         )
   *     ),
   *     @OA\Response(
   *         response=200,
   *         description="Role updated successfully",
   *         @OA\JsonContent(type="object")
   *     ),
   *     @OA\Response(
   *         response=404,
   *         description="Role not found"
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
  public function update(RoleRequest $request, $id)
  {
    try {
      $data = $request->all();

      // Find the existing role by ID
      $role = Role::findOrFail($id);
      $oldData = $role->toArray();

      // Update the role's basic information
      $role->name = $data['name'];
      $role->active = $data['active'] ?? true;
      $role->is_super_admin = $data['is_super_admin'] ?? true;
      $role->save();

      // Fetch the existing permissions
      $permissions = Permission::pluck('id', 'name')->toArray();

      // Remove any existing permissions for the role
      RolePermission::where('role_id', $id)->delete();

      // Prepare new permissions data for insertion
      $dataToInsert = [];

      foreach ($data['permissions'] as $parent_navigation_id => $navigations) {
        $role_id = $role->id; // Use the updated role's ID

        foreach ($navigations as $navigation_id => $permissions_data) {
          foreach ($permissions_data as $permission_name => $allowed) {
            // Only insert if the permission is allowed and exists in the database
            if ($allowed && isset($permissions[$permission_name])) {
              $permission_id = $permissions[$permission_name];

              $dataToInsert[] = [
                'role_id' => $role_id,
                'navigation_id' => $navigation_id,
                'permission_id' => $permission_id,
                'allowed' => true,
                'created_at' => now(),
                'updated_at' => now(),
              ];
            }
          }
        }
      }

      // Insert new permissions data if there is any
      if (!empty($dataToInsert)) {
        RolePermission::insert($dataToInsert);
      }

      $this->logUpdate("Updated role: {$role->name}", $oldData, $role->toArray());

      // Return the updated resource (role)
      return response($role, 200);
    } catch (\Exception $e) {
      // Handle exception and return error response
      return $this->messageService->responseError();
    }
  }

  /**
   * Get all roles for dropdown selection.
   * 
   * @OA\Get(
   *     path="/api/options/roles",
   *     summary="Get all active roles for dropdown",
   *     tags={"Role Management"},
   *     security={{"bearerAuth": {}}},
   *     @OA\Response(
   *         response=200,
   *         description="List of active roles",
   *         @OA\JsonContent(
   *             type="array",
   *             @OA\Items(
   *                 @OA\Property(property="id", type="integer", example=1),
   *                 @OA\Property(property="name", type="string", example="Admin"),
   *                 @OA\Property(property="label", type="string", example="Admin")
   *             )
   *         )
   *     ),
   *     @OA\Response(
   *         response=401,
   *         description="Unauthenticated"
   *     )
   * )
   */
  public function getRoles() 
  {
    try {
      $roles = $this->service->getRoles();
      
      $this->logAudit('VIEW', 'Viewed roles list');
      
      return $roles;
    } catch (\Exception $e) {
      return $this->messageService->responseError();
    }
  }
}
