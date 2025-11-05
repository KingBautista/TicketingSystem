<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\CashierSession;

class ResetSessionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * This seeder resets all cashier sessions.
     * 
     * WARNING: This will permanently delete all session data!
     * 
     * NOTE: Make sure to run ResetTransactionsSeeder first if you want to 
     * delete transactions as well, since transactions depend on sessions.
     */
    public function run(): void
    {
        // Disable foreign key checks temporarily to avoid constraint issues
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        try {
            // Delete all sessions (including soft-deleted)
            $sessionsDeleted = CashierSession::withTrashed()->forceDelete();
            $this->command->info("Deleted sessions (including soft-deleted): {$sessionsDeleted}");

            // Reset auto-increment counter
            DB::statement('ALTER TABLE cashier_sessions AUTO_INCREMENT = 1');

            $this->command->info('✓ All sessions have been reset successfully.');

        } catch (\Exception $e) {
            $this->command->error('Error resetting sessions: ' . $e->getMessage());
            throw $e;
        } finally {
            // Re-enable foreign key checks
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        }
    }
}

