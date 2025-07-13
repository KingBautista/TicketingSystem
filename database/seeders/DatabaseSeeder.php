<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
  /**
   * Seed the application's database.
   */
  public function run(): void
  {
    // Call PermissionSeeder
    $this->call(PermissionSeeder::class);

    // Call RoleSeeder
    $this->call(RoleSeeder::class);

    // Call UserSeeder
    $this->call(UserSeeder::class);

    // Call NavigationSeeder
    $this->call(NavigationSeeder::class);

    // Call RolePermissionSeeder
    $this->call(RolePermissionSeeder::class);
  }
}
