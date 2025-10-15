<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // Clear the table before seeding (using delete to avoid foreign key constraints)
        Role::query()->delete();

        // Data from user and roles.sql (id, name, active, is_super_admin)
        $roles = [
            [1, 'Developer Account', 1, 1],
            [2, 'Administrator', 1, 0],
            [3, 'Promoter', 1, 0],
            [4, 'Cashier', 1, 0],
        ];

        foreach ($roles as $role) {
            [$id, $name, $active, $isSuperAdmin] = $role;
            Role::create([
                'name' => $name,
                'active' => $active,
                'is_super_admin' => $isSuperAdmin,
            ]);
        }
    }
} 