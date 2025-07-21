<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\UserMeta;
use App\Models\Role;
use App\Helpers\PasswordHelper;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::truncate();
        UserMeta::truncate();

        // Get Developer Account role
        $developerRole = Role::where('name', 'Developer Account')->first();
        
        if (!$developerRole) {
            throw new \Exception('Developer Account role not found. Please run RoleSeeder first.');
        }

        // Generate salt and password using PasswordHelper
        $salt = PasswordHelper::generateSalt();
        $password = PasswordHelper::generatePassword($salt, 'password123');

        // Create developer user
        $developerUser = User::create([
            'user_login' => 'developer',
            'user_email' => 'developer@example.com',
            'user_pass' => $password,
            'user_salt' => $salt,
            'user_status' => 1,
            'user_activation_key' => null,
            'remember_token' => null,
            'user_role_id' => $developerRole->id,
        ]);

        // Create user meta data
        $userMetaData = [
            'first_name' => 'Developer',
            'last_name' => 'Account',
            'nickname' => 'Dev',
            'biography' => 'Developer account with full system access.',
            'theme' => 'dark',
        ];

        // Save user meta data
        $developerUser->saveUserMeta($userMetaData);

        // Add sales user with role id = 4
        $salesSalt = PasswordHelper::generateSalt();
        $salesPassword = PasswordHelper::generatePassword($salesSalt, 'password123');
        $salesUser = User::create([
            'user_login' => 'sales',
            'user_email' => 'sales@example.com',
            'user_pass' => $salesPassword,
            'user_salt' => $salesSalt,
            'user_status' => 1,
            'user_activation_key' => null,
            'remember_token' => null,
            'user_role_id' => 4,
        ]);
        $salesMetaData = [
            'first_name' => 'Sales',
            'last_name' => 'User',
            'nickname' => 'Sales',
            'biography' => 'Sales account.',
            'theme' => 'light',
        ];
        $salesUser->saveUserMeta($salesMetaData);
    }
} 