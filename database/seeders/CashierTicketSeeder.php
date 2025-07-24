<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CashierTicket;
use Illuminate\Support\Str;

class CashierTicketSeeder extends Seeder
{
    public function run(): void
    {
        for ($i = 1; $i <= 10; $i++) {
            CashierTicket::create([
                'transaction_id' => 1,
                'qr_code' => strtoupper(Str::random(20)),
                'note' => 'Sample ticket',
            ]);
        }
    }
}
