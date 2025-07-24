<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CashierSession;

class CashierSessionSeeder extends Seeder
{
    public function run(): void
    {
        CashierSession::create([
            'cashier_id' => 1,
            'cash_on_hand' => 1000.00,
            'opened_at' => now(),
            'status' => 'open',
        ]);
    }
}
