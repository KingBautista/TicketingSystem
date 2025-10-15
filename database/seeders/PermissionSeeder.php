<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Permission;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Clear the table before seeding (using delete to avoid foreign key constraints)
        Permission::query()->delete();

        // Data from user and roles.sql (id, name, label)
        $permissions = [
            [1, 'can_view', 'can_view'],
            [2, 'can_create', 'can_create'],
            [3, 'can_edit', 'can_edit'],
            [4, 'can_delete', 'can_delete'],
        ];

        foreach ($permissions as $permission) {
            [$id, $name, $description] = $permission;
            Permission::create([
                'name' => $name,
                'description' => $description,
            ]);
        }
    }
} 