<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Carbon\Carbon;

class VIPSeeder extends Seeder
{
    public function run(): void
    {
        // Truncate the table before seeding
        \DB::table('vips')->truncate();

        $now = Carbon::now();
        $vips = [];
        for ($i = 1; $i <= 25; $i++) {
            $daysOffset = rand(-10, 10); // Some expired, some expiring, some good
            $validityStart = $now->copy()->subDays(rand(10, 30))->toDateString();
            $validityEnd = $now->copy()->addDays($daysOffset)->toDateString();
            $status = $daysOffset < 0 ? false : true;
            $vips[] = [
                'name' => 'VIP ' . $i,
                'address' => 'Address ' . $i,
                'contact_number' => '09' . rand(100000000, 999999999),
                'other_info' => $i % 2 === 0 ? 'VIP Customer' : '',
                'card_number' => 'CARD-' . (100000 + $i),
                'validity_start' => $validityStart,
                'validity_end' => $validityEnd,
                'status' => $status,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        foreach ($vips as $vip) {
            \DB::table('vips')->insert($vip);
        }
    }
} 