<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Promoter;

class PromoterSeeder extends Seeder
{
    public function run(): void
    {
        $promoters = [];
        for ($i = 1; $i <= 30; $i++) {
            $promoters[] = [
                'name' => 'Promoter ' . $i,
                'description' => 'Sample promoter description for Promoter ' . $i,
                'status' => $i % 2 === 0,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        Promoter::insert($promoters);
    }
} 