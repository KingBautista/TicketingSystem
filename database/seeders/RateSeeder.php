<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Rate;

class RateSeeder extends Seeder
{
    public function run(): void
    {
        Rate::insert([
            [
                'name' => 'Regular Ticket',
                'description' => 'Standard ticket rate',
                'price' => 100.00,
                'status' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'VIP Ticket',
                'description' => 'VIP access ticket',
                'price' => 250.00,
                'status' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Student Ticket',
                'description' => 'Discounted rate for students',
                'price' => 80.00,
                'status' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Senior Ticket',
                'description' => 'Discounted rate for seniors',
                'price' => 70.00,
                'status' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Child Ticket',
                'description' => 'Discounted rate for children',
                'price' => 50.00,
                'status' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
} 