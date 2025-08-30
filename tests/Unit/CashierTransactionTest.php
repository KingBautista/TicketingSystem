<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\CashierTransaction;
use App\Models\CashierSession;
use App\Models\Rate;
use App\Models\CashierTicket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

class CashierTransactionTest extends TestCase
{
    use RefreshDatabase;

    public function test_cashier_transaction_can_be_created()
    {
        $session = CashierSession::factory()->create();
        $rate = Rate::factory()->create();

        $transactionData = [
            'cashier_id' => User::factory()->create()->id,
            'session_id' => $session->id,
            'rate_id' => $rate->id,
            'quantity' => 2,
            'total' => 200.00,
            'paid_amount' => 250.00,
            'change' => 50.00
        ];

        $transaction = CashierTransaction::create($transactionData);

        $this->assertDatabaseHas('cashier_transactions', [
            'session_id' => $session->id,
            'rate_id' => $rate->id,
            'quantity' => 2,
            'total' => 200.00
        ]);
        $this->assertEquals(2, $transaction->quantity);
        $this->assertEquals(200.00, $transaction->total);
    }

    public function test_cashier_transaction_relationships()
    {
        $transaction = CashierTransaction::factory()->create();

        $this->assertInstanceOf(CashierSession::class, $transaction->session);
        $this->assertInstanceOf(Rate::class, $transaction->rate);
    }

    public function test_cashier_transaction_factory()
    {
        $transaction = CashierTransaction::factory()->create();

        $this->assertInstanceOf(CashierTransaction::class, $transaction);
        $this->assertGreaterThan(0, $transaction->quantity);
        $this->assertGreaterThan(0, $transaction->total);
    }

    public function test_complete_transaction_flow()
    {
        DB::beginTransaction();
        
        try {
            // Create test data
            $session = CashierSession::factory()->create();
            $rate = Rate::factory()->create();

            // Process transaction
            $transactionData = [
                'cashier_id' => User::factory()->create()->id,
                'session_id' => $session->id,
                'rate_id' => $rate->id,
                'quantity' => 3,
                'total' => 300.00,
                'paid_amount' => 350.00,
                'change' => 50.00
            ];

            $transaction = CashierTransaction::create($transactionData);

            // Generate tickets
            $tickets = [];
            for ($i = 0; $i < $transactionData['quantity']; $i++) {
                $tickets[] = CashierTicket::create([
                    'transaction_id' => $transaction->id,
                    'qr_code' => \Illuminate\Support\Str::random(20)
                ]);
            }

            // Assertions
            $this->assertCount(3, $tickets);
            $this->assertEquals(300.00, $transaction->total);
            $this->assertEquals($session->id, $transaction->session_id);

            DB::commit();
        } catch (\Exception $e) {
            DB::rollback();
            throw $e;
        }
    }

    public function test_transaction_with_discount()
    {
        $session = CashierSession::factory()->create();
        $rate = Rate::factory()->create();

        $transaction = CashierTransaction::factory()->create([
            'session_id' => $session->id,
            'rate_id' => $rate->id,
            'quantity' => 1,
            'total' => 100.00
        ]);

        // Add discount
        $discount = \App\Models\CashierTransactionDiscount::create([
            'cashier_transaction_id' => $transaction->id,
            'discount_id' => \App\Models\Discount::factory()->create()->id,
            'discount_value' => 10.00
        ]);

        $this->assertDatabaseHas('cashier_transaction_discount', [
            'cashier_transaction_id' => $transaction->id,
            'discount_value' => 10.00
        ]);
    }
}
