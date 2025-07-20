<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PromoterSchedule;

class PromoterScheduleSeeder extends Seeder
{
    public function run(): void
    {
        $schedules = [];
        for ($i = 1; $i <= 30; $i++) {
            $schedules[] = [
                'promoter_id' => $i,
                'date' => now()->addDays($i - 1)->toDateString(),
                'is_manual' => $i % 2 === 0,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        PromoterSchedule::insert($schedules);
    }
} 