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
   * Store a newly created resource in storage.
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
   * Update a resource in storage.
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
   * Get all roles resource.
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
