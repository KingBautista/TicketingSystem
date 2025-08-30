<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use App\Models\CashierSession;
use App\Models\CashierTransaction;
use App\Models\Rate;
use App\Models\CashierTicket;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CashierControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $token;

    protected function setUp(): void
    {
        parent::setUp();
        
        $role = Role::factory()->create();
        $this->user = User::factory()->create([
            'user_status' => 1,
            'user_role_id' => $role->id
        ]);
        $this->token = $this->user->createToken('test-token')->plainTextToken;
    }

    public function test_open_cashier_session()
    {
        $sessionData = [
            'cash_on_hand' => 1000.00,
            'notes' => 'Morning shift'
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->postJson('/api/cashier/open-session', $sessionData);

        $response->assertStatus(201)
                ->assertJsonStructure(['data']);

        $this->assertDatabaseHas('cashier_sessions', [
            'user_id' => $this->user->id,
            'cash_on_hand' => 1000.00,
            'status' => 'open'
        ]);
    }

    public function test_close_cashier_session()
    {
        $session = CashierSession::factory()->create([
            'user_id' => $this->user->id,
            'status' => 'open'
        ]);

        $closeData = [
            'closing_cash' => 1500.00,
            'notes' => 'End of shift'
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->postJson('/api/cashier/close-session', $closeData);

        $response->assertStatus(200);

        $this->assertDatabaseHas('cashier_sessions', [
            'id' => $session->id,
            'closing_cash' => 1500.00,
            'status' => 'closed'
        ]);
    }

    public function test_create_transaction()
    {
        $session = CashierSession::factory()->create([
            'user_id' => $this->user->id,
            'status' => 'open'
        ]);
        $rate = Rate::factory()->create();

        $transactionData = [
            'session_id' => $session->id,
            'rate_id' => $rate->id,
            'quantity' => 2,
            'amount' => 200.00,
            'payment_method' => 'cash'
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->postJson('/api/cashier/transactions', $transactionData);

        $response->assertStatus(201)
                ->assertJsonStructure(['data']);

        $this->assertDatabaseHas('cashier_transactions', [
            'session_id' => $session->id,
            'rate_id' => $rate->id,
            'quantity' => 2,
            'amount' => 200.00
        ]);
    }

    public function test_get_transaction_tickets()
    {
        $session = CashierSession::factory()->create();
        $rate = Rate::factory()->create();
        $transaction = CashierTransaction::factory()->create([
            'session_id' => $session->id,
            'rate_id' => $rate->id,
            'quantity' => 3
        ]);

        // Create tickets for the transaction
        CashierTicket::factory()->count(3)->create([
            'transaction_id' => $transaction->id
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->getJson("/api/cashier/tickets/{$transaction->id}");

        $response->assertStatus(200)
                ->assertJsonStructure(['data']);
    }

    public function test_get_daily_transactions()
    {
        $session = CashierSession::factory()->create();
        CashierTransaction::factory()->count(5)->create([
            'session_id' => $session->id
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->getJson('/api/cashier/transactions/daily');

        $response->assertStatus(200)
                ->assertJsonStructure(['data']);
    }

    public function test_get_today_transactions()
    {
        $session = CashierSession::factory()->create();
        CashierTransaction::factory()->count(3)->create([
            'session_id' => $session->id
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->getJson('/api/cashier/transactions/today');

        $response->assertStatus(200)
                ->assertJsonStructure(['data']);
    }

    public function test_get_session_details()
    {
        $session = CashierSession::factory()->create([
            'user_id' => $this->user->id
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->getJson("/api/cashier/sessions/{$session->id}");

        $response->assertStatus(200)
                ->assertJsonStructure(['data']);
    }

    public function test_send_to_display()
    {
        $session = CashierSession::factory()->create();
        $transaction = CashierTransaction::factory()->create([
            'session_id' => $session->id
        ]);

        $displayData = [
            'transaction_id' => $transaction->id,
            'message' => 'Transaction completed'
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->postJson('/api/cashier/send-to-display', $displayData);

        $response->assertStatus(200);
    }
}
