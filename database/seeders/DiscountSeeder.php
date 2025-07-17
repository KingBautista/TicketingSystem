<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Discount;

class DiscountSeeder extends Seeder
{
    public function run(): void
    {
        Discount::insert([
            [
                'discount_name' => 'Student Discount',
                'discount_value' => 20.00,
                'status' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'discount_name' => 'Senior Discount',
                'discount_value' => 30.00,
                'status' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'discount_name' => 'Holiday Promo',
                'discount_value' => 15.00,
                'status' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'discount_name' => 'VIP Discount',
                'discount_value' => 25.00,
                'status' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'discount_name' => 'Child Discount',
                'discount_value' => 10.00,
                'status' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
} 