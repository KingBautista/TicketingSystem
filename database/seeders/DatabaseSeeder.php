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
    // Basic Settings Seeders
    $this->call(PermissionSeeder::class);
    $this->call(RoleSeeder::class);
    $this->call(UserSeeder::class);
    $this->call(NavigationSeeder::class);
    $this->call(RolePermissionSeeder::class);
    $this->call(RateSeeder::class);
    $this->call(DiscountSeeder::class);
    $this->call(CashierTransactionSeeder::class);

    // Business Logic Seeders
    $this->call(RateSeeder::class);
    $this->call(DiscountSeeder::class);
    $this->call(VIPSeeder::class);
    $this->call(PromoterSeeder::class);
    $this->call(PromoterScheduleSeeder::class);
    // $this->call(MediaLibrarySeeder::class);
  }
}
