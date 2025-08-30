<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\VIP;
use Illuminate\Foundation\Testing\RefreshDatabase;

class VIPTest extends TestCase
{
    use RefreshDatabase;

    public function test_vip_can_be_created()
    {
        $vipData = [
            'name' => 'John Doe',
            'address' => '123 Main St',
            'contact_number' => '1234567890',
            'other_info' => 'VIP Member',
            'card_number' => 'VIP123456',
            'validity_start' => now()->toDateString(),
            'validity_end' => now()->addYear()->toDateString(),
            'status' => true
        ];

        $vip = VIP::create($vipData);

        $this->assertDatabaseHas('vips', [
            'name' => 'John Doe',
            'card_number' => 'VIP123456'
        ]);
        $this->assertEquals('John Doe', $vip->name);
        $this->assertEquals('VIP123456', $vip->card_number);
    }

    public function test_vip_factory()
    {
        $vip = VIP::factory()->create();

        $this->assertInstanceOf(VIP::class, $vip);
        $this->assertNotEmpty($vip->name);
        $this->assertNotEmpty($vip->card_number);
    }

    public function test_vip_expired_state()
    {
        $vip = VIP::factory()->expired()->create();

        $this->assertTrue($vip->validity_end < now());
        $this->assertEquals(false, $vip->status);
    }

    public function test_vip_expiring_soon_state()
    {
        $vip = VIP::factory()->expiringSoon()->create();

        $this->assertTrue($vip->validity_end > now());
        $this->assertTrue($vip->validity_end < now()->addDays(30));
        $this->assertEquals(true, $vip->status);
    }

    public function test_vip_soft_delete()
    {
        $vip = VIP::factory()->create();
        $vipId = $vip->id;

        $vip->delete();

        $this->assertSoftDeleted('vips', ['id' => $vipId]);
        $this->assertDatabaseHas('vips', ['id' => $vipId]);
    }
}
