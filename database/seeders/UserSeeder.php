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
        // Clear the tables before seeding (using delete to avoid foreign key constraints)
        User::query()->delete();
        UserMeta::query()->delete();

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
            'user_email' => 'king@gmail.com',
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

        // Add cashier1 user with role id = 4
        $cashier1Salt = PasswordHelper::generateSalt();
        $cashier1Password = PasswordHelper::generatePassword($cashier1Salt, 'password123');
        $cashier1User = User::create([
            'user_login' => 'cashier1',
            'user_email' => 'cashier1@example.com',
            'user_pass' => $cashier1Password,
            'user_salt' => $cashier1Salt,
            'user_status' => 1,
            'user_activation_key' => null,
            'remember_token' => null,
            'user_role_id' => 4,
        ]);
        $cashier1MetaData = [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'nickname' => 'Cashier1',
            'biography' => 'Cashier account.',
            'theme' => 'light',
        ];
        $cashier1User->saveUserMeta($cashier1MetaData);

        // Add cashier2 user with role id = 4
        $cashier2Salt = PasswordHelper::generateSalt();
        $cashier2Password = PasswordHelper::generatePassword($cashier2Salt, 'password123');
        $cashier2User = User::create([
            'user_login' => 'cashier2',
            'user_email' => 'cashier2@example.com',
            'user_pass' => $cashier2Password,
            'user_salt' => $cashier2Salt,
            'user_status' => 1,
            'user_activation_key' => null,
            'remember_token' => null,
            'user_role_id' => 4,
        ]);
        $cashier2MetaData = [
            'first_name' => 'Jane',
            'last_name' => 'Smith',
            'nickname' => 'Cashier2',
            'biography' => 'Cashier account.',
            'theme' => 'light',
        ];
        $cashier2User->saveUserMeta($cashier2MetaData);

        // Add promoter1 user with role id = 4
        $promoter1Salt = PasswordHelper::generateSalt();
        $promoter1Password = PasswordHelper::generatePassword($promoter1Salt, 'password123');
        $promoter1User = User::create([
            'user_login' => 'promoter1',
            'user_email' => 'promoter1@example.com',
            'user_pass' => $promoter1Password,
            'user_salt' => $promoter1Salt,
            'user_status' => 1,
            'user_activation_key' => null,
            'remember_token' => null,
            'user_role_id' => 4,
        ]);
        $promoter1MetaData = [
            'first_name' => 'Alice',
            'last_name' => 'Johnson',
            'nickname' => 'Promoter1',
            'biography' => 'Promoter account.',
            'theme' => 'light',
        ];
        $promoter1User->saveUserMeta($promoter1MetaData);

        // Add promoter2 user with role id = 4
        $promoter2Salt = PasswordHelper::generateSalt();
        $promoter2Password = PasswordHelper::generatePassword($promoter2Salt, 'password123');
        $promoter2User = User::create([
            'user_login' => 'promoter2',
            'user_email' => 'promoter2@example.com',
            'user_pass' => $promoter2Password,
            'user_salt' => $promoter2Salt,
            'user_status' => 1,
            'user_activation_key' => null,
            'remember_token' => null,
            'user_role_id' => 4,
        ]);
        $promoter2MetaData = [
            'first_name' => 'Bob',
            'last_name' => 'Wilson',
            'nickname' => 'Promoter2',
            'biography' => 'Promoter account.',
            'theme' => 'light',
        ];
        $promoter2User->saveUserMeta($promoter2MetaData);
    }
} 