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
    // \App\Models\User::factory(50)->create();

    // \App\Models\User::create([
    //     'name' => 'Test User',
    //     'email' => 'test@example.com',
    // ]);

    \App\Models\Permission::create([
      'name' => 'can_view',
      'label' => 'can_view',
    ]);

    \App\Models\Permission::create([
      'name' => 'can_create',
      'label' => 'can_create',
    ]);

    \App\Models\Permission::create([
      'name' => 'can_edit',
      'label' => 'can_edit',
    ]);

    \App\Models\Permission::create([
      'name' => 'can_delete',
      'label' => 'can_delete',
    ]);
  }
}
