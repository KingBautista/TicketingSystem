<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Rate;
use App\Models\Discount;
use App\Models\Promoter;
use App\Models\CashierSession;
use App\Models\CashierTransaction;
use App\Models\CashierTicket;
use App\Models\CashierTransactionDiscount;
use Carbon\Carbon;
use Illuminate\Support\Str;

class CashierTransactionSeeder extends Seeder
{
    public function run(): void
    {
        // Get all users with role_id = 4 (cashiers)
        $cashiers = User::where('user_role_id', 4)->get();
        $rates = Rate::all();
        $discounts = Discount::all();
        $promoters = Promoter::where('status', true)->get(); // Get active promoters
        
        foreach ($cashiers as $cashier) {
            // Create a session for each cashier
            $session = CashierSession::create([
                'cashier_id' => $cashier->id,
                'cash_on_hand' => 2500.00,
                'opened_at' => Carbon::now()->subHours(rand(1, 8)),
                'status' => 'open'
            ]);

            // Create 5-10 transactions for each cashier
            $numTransactions = rand(15, 40);
            $totalSales = 0;

            for ($i = 0; $i < $numTransactions; $i++) {
                // Random rate and quantity
                $rate = $rates->where('status', true)->random();
                $quantity = rand(1, 5);
                $baseTotal = $rate->price * $quantity;

                // Randomly apply 0-2 discounts
                $numDiscounts = rand(0, 2);
                $discountTotal = 0;
                $appliedDiscounts = collect();

                if ($numDiscounts > 0) {
                    $activeDiscounts = $discounts->where('status', true)->values();
                    if ($activeDiscounts->count() > 0) {
                        $appliedDiscounts = $activeDiscounts->random(min($numDiscounts, $activeDiscounts->count()));
                    }
                }

                // Calculate discounts before creating transaction
                foreach ($appliedDiscounts as $discount) {
                    $discountValue = $discount->discount_value_type === 'percentage' ?
                        ($baseTotal * $discount->discount_value) / 100 :
                        $discount->discount_value;
                    $discountTotal += $discountValue;
                }

                $total = max(0, $baseTotal - $discountTotal);
                $totalSales += $total;

                $paid_amount = $total + rand(0, 500); // Random excess payment
                // Randomly decide if this transaction has a promoter (70% chance)
                $hasPromoter = rand(1, 100) <= 70;
                $promoterId = $promoters->random()->id;

                // Create transaction
                $transaction = CashierTransaction::create([
                    'cashier_id' => $cashier->id,
                    'promoter_id' => $promoterId,
                    'rate_id' => $rate->id,
                    'quantity' => $quantity,
                    'total' => $total,
                    'paid_amount' => $paid_amount,
                    'change' => $paid_amount - $total,
                    'session_id' => $session->id,
                    'created_at' => Carbon::now()->subMinutes(rand(1, 480)) // Random time in last 8 hours
                ]);

                // Calculate and apply discounts
                foreach ($appliedDiscounts as $discount) {
                    $discountValue = $discount->discount_value_type === 'percentage' ?
                        ($baseTotal * $discount->discount_value) / 100 :
                        $discount->discount_value;
                    
                    $discountTotal += $discountValue;

                    // Create discount record
                    CashierTransactionDiscount::create([
                        'cashier_transaction_id' => $transaction->id,
                        'discount_id' => $discount->id,
                        'discount_value' => $discountValue
                    ]);
                }

                // Generate tickets
                for ($j = 0; $j < $quantity; $j++) {
                    CashierTicket::create([
                        'transaction_id' => $transaction->id,
                        'qr_code' => strtoupper(Str::random(20)),
                        'note' => 'Single use only'
                    ]);
                }
            }

            // Close the session with random additional cash
            $session->update([
                'closed_at' => Carbon::now(),
                'closing_cash' => 2500.00 + $totalSales,
                'status' => 'closed'
            ]);
        }
    }
}
