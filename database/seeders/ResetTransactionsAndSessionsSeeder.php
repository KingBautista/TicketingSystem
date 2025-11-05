<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class ResetTransactionsAndSessionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * This seeder resets both transactions and sessions in the correct order.
     * 
     * WARNING: This will permanently delete all transaction and session data!
     * 
     * This seeder calls:
     * 1. ResetTransactionsSeeder (deletes tickets, discounts, and transactions)
     * 2. ResetSessionsSeeder (deletes sessions)
     */
    public function run(): void
    {
        $this->command->info('Starting reset of transactions and sessions...');
        $this->command->warn('WARNING: This will delete all transaction and session data!');
        
        // First reset transactions (and related data)
        $this->call(ResetTransactionsSeeder::class);
        
        // Then reset sessions
        $this->call(ResetSessionsSeeder::class);
        
        $this->command->info('✓ All transactions and sessions have been reset successfully.');
    }
}

