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
        $driver = DB::getDriverName();
        
        // Disable foreign key checks temporarily to avoid constraint issues
        if ($driver === 'mysql') {
            DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        } elseif ($driver === 'pgsql') {
            DB::statement('SET session_replication_role = \'replica\';');
        }

        try {
            // Delete all sessions (including soft-deleted)
            $sessionsDeleted = CashierSession::withTrashed()->forceDelete();
            $this->command->info("Deleted sessions (including soft-deleted): {$sessionsDeleted}");

            // Reset auto-increment/sequence counter
            if ($driver === 'mysql') {
                DB::statement('ALTER TABLE cashier_sessions AUTO_INCREMENT = 1');
            } elseif ($driver === 'pgsql') {
                // Reset sequence if it exists (ignore errors if sequence doesn't exist)
                try {
                    $sequence = DB::selectOne("SELECT pg_get_serial_sequence('cashier_sessions', 'id') as seq");
                    if ($sequence && $sequence->seq) {
                        DB::statement("SELECT setval('{$sequence->seq}', 1, false)");
                    }
                } catch (\Exception $e) {
                    // Ignore if sequence doesn't exist
                }
            }

            $this->command->info('✓ All sessions have been reset successfully.');

        } catch (\Exception $e) {
            $this->command->error('Error resetting sessions: ' . $e->getMessage());
            throw $e;
        } finally {
            // Re-enable foreign key checks
            if ($driver === 'mysql') {
                DB::statement('SET FOREIGN_KEY_CHECKS=1;');
            } elseif ($driver === 'pgsql') {
                DB::statement('SET session_replication_role = \'origin\';');
            }
        }
    }
}

