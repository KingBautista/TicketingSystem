<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\CashierTicket;
use App\Models\VIP;
use App\Models\CashierTransaction;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ScanControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_scan_cashier_ticket()
    {
        $transaction = \App\Models\CashierTransaction::factory()->create();
        $ticket = CashierTicket::factory()->create([
            'transaction_id' => $transaction->id,
            'qr_code' => 'test123456',
            'is_used' => false
        ]);

        $scanData = [
            'vgdecoderesult' => 'test123456',
            'devicenumber' => '001'
        ];

        $response = $this->postJson('/api/access/validate', $scanData);

        $response->assertStatus(200)
                ->assertJsonStructure(['status', 'message']);

        $this->assertDatabaseHas('cashier_tickets', [
            'id' => $ticket->id,
            'is_used' => true
        ]);
    }

    public function test_scan_used_ticket()
    {
        $transaction = \App\Models\CashierTransaction::factory()->create();
        $ticket = CashierTicket::factory()->create([
            'transaction_id' => $transaction->id,
            'qr_code' => 'used123456',
            'is_used' => true
        ]);

        $scanData = [
            'vgdecoderesult' => 'used123456',
            'devicenumber' => '001'
        ];

        $response = $this->postJson('/api/access/validate', $scanData);

        $response->assertStatus(400);
    }

    public function test_scan_vip_card()
    {
        $vip = VIP::factory()->create([
            'card_number' => '123456',
            'validity_end' => now()->addYear(),
            'status' => 'active'
        ]);

        $scanData = [
            'vgdecoderesult' => '123456',
            'devicenumber' => '001'
        ];

        $response = $this->postJson('/api/access/validate', $scanData);

        $response->assertStatus(200);
    }

    public function test_scan_expired_vip()
    {
        $vip = VIP::factory()->create([
            'card_number' => 'expired123',
            'validity_end' => now()->subYear(),
            'status' => 'expired'
        ]);

        $scanData = [
            'vgdecoderesult' => 'expired123',
            'devicenumber' => '001'
        ];

        $response = $this->postJson('/api/access/validate', $scanData);

        $response->assertStatus(400);
    }

    public function test_scan_invalid_code()
    {
        $scanData = [
            'vgdecoderesult' => 'invalid123',
            'devicenumber' => '001'
        ];

        $response = $this->postJson('/api/access/validate', $scanData);

        $response->assertStatus(400);
    }

    public function test_get_latest_scan()
    {
        $response = $this->getJson('/api/access/latest');

        $response->assertStatus(200)
                ->assertJsonStructure(['data']);
    }

    public function test_check_code()
    {
        $transaction = \App\Models\CashierTransaction::factory()->create();
        $ticket = CashierTicket::factory()->create([
            'transaction_id' => $transaction->id,
            'qr_code' => 'check123456',
            'is_used' => false
        ]);

        $checkData = [
            'code' => 'check123456'
        ];

        $response = $this->postJson('/api/access/check', $checkData);

        $response->assertStatus(200);
    }

    public function test_hex_to_decimal_conversion()
    {
        $vip = VIP::factory()->create([
            'card_number' => '123456',
            'validity_end' => now()->addYear(),
            'status' => 'active'
        ]);

        // Test hex to decimal conversion
        $hexCode = '1E240'; // 123456 in decimal
        $scanData = [
            'vgdecoderesult' => $hexCode,
            'devicenumber' => '001'
        ];

        $response = $this->postJson('/api/access/validate', $scanData);

        $response->assertStatus(200);
    }
}
