<?php

namespace App\Services;

use App\Models\Role;
use App\Models\Permission;
use App\Http\Resources\RoleResource;
use App\Http\Resources\PermissionResource;

class RoleService extends BaseService
{
  public function __construct()
  {
    // Pass the UserResource class to the parent constructor
    parent::__construct(new RoleResource(new Role), new Role());
  }

  /**
  * Retrieve all resources with paginate.
  */
  public function list($perPage = 10, $trash = false)
  {
    try {
      $perPage = request('per_page') ?? $perPage; // Default to 10 if not provided
      $allRoles = $this->getTotalCount();
      $trashedRoles = $this->getTrashedCount();

      $query = Role::query();
      
      // Apply onlyTrashed() first if we're in trash view
      if ($trash) {
        $query->onlyTrashed();
      }

      // Then apply search conditions
      if (request('search')) {
        $query->where('name', 'LIKE', '%' . request('search') . '%');
      }

      // Apply ordering
      if (request('order')) {
        $query->orderBy(request('order'), request('sort'));
      } else {
        $query->orderBy('id', 'desc');
      }

      return RoleResource::collection(
        $query->paginate($perPage)->withQueryString()
      )->additional(['meta' => ['all' => $allRoles, 'trashed' => $trashedRoles]]);
    } catch (\Exception $e) {
      throw new \Exception('Failed to fetch roles: ' . $e->getMessage());
    }
  }

  public function getRoles() 
  {
    return Role::query()->select('id', 'name', 'name as  label')->where('active', 1)->orderBy('id', 'asc')->get()->makeHidden(['permissions']);
  }
}