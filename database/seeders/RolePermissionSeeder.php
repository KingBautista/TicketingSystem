<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\Permission;
use App\Models\Navigation;
use App\Models\RolePermission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Clear the table before seeding (using delete to avoid foreign key constraints)
        RolePermission::query()->delete();

        // Get Developer Account role
        $developerRole = Role::where('name', 'Developer Account')->first();
        
        if (!$developerRole) {
            throw new \Exception('Developer Account role not found. Please run RoleSeeder first.');
        }

        // Get all permissions
        $permissions = Permission::all();
        
        // Get all navigation items
        $navigations = Navigation::all();

        // Create role permissions for Developer Account
        // Give all permissions on all navigation items
        foreach ($navigations as $navigation) {
            foreach ($permissions as $permission) {
                RolePermission::create([
                    'role_id' => $developerRole->id,
                    'navigation_id' => $navigation->id,
                    'permission_id' => $permission->id,
                    'allowed' => 1,
                ]);
            }
        }
    }
} 