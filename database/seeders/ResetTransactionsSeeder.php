<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\CashierTicket;
use App\Models\CashierTransactionDiscount;
use App\Models\CashierTransaction;

class ResetTransactionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * This seeder resets all cashier transactions and related data.
     * 
     * WARNING: This will permanently delete all transaction data!
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
            // Delete in order: child tables first, then parent table
            
            // 1. Delete all tickets (they depend on transactions)
            $ticketsDeleted = CashierTicket::withTrashed()->forceDelete();
            $this->command->info("Deleted tickets (including soft-deleted)");

            // 2. Delete all transaction discounts (they depend on transactions)
            $discountsDeleted = CashierTransactionDiscount::query()->delete();
            $this->command->info("Deleted transaction discounts");

            // 3. Delete all transactions (including soft-deleted)
            $transactionsDeleted = CashierTransaction::withTrashed()->forceDelete();
            $this->command->info("Deleted transactions (including soft-deleted): {$transactionsDeleted}");

            // Reset auto-increment/sequence counters
            if ($driver === 'mysql') {
                DB::statement('ALTER TABLE cashier_tickets AUTO_INCREMENT = 1');
                DB::statement('ALTER TABLE cashier_transaction_discount AUTO_INCREMENT = 1');
                DB::statement('ALTER TABLE cashier_transactions AUTO_INCREMENT = 1');
            } elseif ($driver === 'pgsql') {
                // Reset sequences if they exist (ignore errors if sequence doesn't exist)
                try {
                    $sequence = DB::selectOne("SELECT pg_get_serial_sequence('cashier_tickets', 'id') as seq");
                    if ($sequence && $sequence->seq) {
                        DB::statement("SELECT setval('{$sequence->seq}', 1, false)");
                    }
                } catch (\Exception $e) {
                    // Ignore if sequence doesn't exist
                }
                
                try {
                    $sequence = DB::selectOne("SELECT pg_get_serial_sequence('cashier_transaction_discount', 'id') as seq");
                    if ($sequence && $sequence->seq) {
                        DB::statement("SELECT setval('{$sequence->seq}', 1, false)");
                    }
                } catch (\Exception $e) {
                    // Ignore if sequence doesn't exist
                }
                
                try {
                    $sequence = DB::selectOne("SELECT pg_get_serial_sequence('cashier_transactions', 'id') as seq");
                    if ($sequence && $sequence->seq) {
                        DB::statement("SELECT setval('{$sequence->seq}', 1, false)");
                    }
                } catch (\Exception $e) {
                    // Ignore if sequence doesn't exist
                }
            }

            $this->command->info('✓ All transactions and related data have been reset successfully.');

        } catch (\Exception $e) {
            $this->command->error('Error resetting transactions: ' . $e->getMessage());
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

