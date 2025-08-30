<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\VIP;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;

class VIPControllerTest extends TestCase
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

    public function test_get_vips_list()
    {
        VIP::factory()->count(3)->create();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->getJson('/api/vip-management/vips');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data' => [
                        '*' => [
                            'id',
                            'name',
                            'email',
                            'phone',
                            'card_number',
                            'expiry_date',
                            'status'
                        ]
                    ]
                ]);
    }

    public function test_create_vip()
    {
        $vipData = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'phone' => '1234567890',
            'card_number' => 'VIP123456',
            'expiry_date' => '2024-12-31',
            'status' => 'active'
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->postJson('/api/vip-management/vips', $vipData);

        $response->assertStatus(201)
                ->assertJsonStructure(['data']);

        $this->assertDatabaseHas('vips', [
            'name' => 'John Doe',
            'card_number' => 'VIP123456'
        ]);
    }

    public function test_get_vip_details()
    {
        $vip = VIP::factory()->create();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->getJson("/api/vip-management/vips/{$vip->id}");

        $response->assertStatus(200)
                ->assertJsonStructure(['data']);
    }

    public function test_update_vip()
    {
        $vip = VIP::factory()->create();
        $updateData = [
            'name' => 'Updated Name',
            'email' => 'updated@example.com'
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->putJson("/api/vip-management/vips/{$vip->id}", $updateData);

        $response->assertStatus(200);

        $this->assertDatabaseHas('vips', [
            'id' => $vip->id,
            'name' => 'Updated Name',
            'email' => 'updated@example.com'
        ]);
    }

    public function test_delete_vip()
    {
        $vip = VIP::factory()->create();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->deleteJson("/api/vip-management/vips/{$vip->id}");

        $response->assertStatus(200);

        $this->assertSoftDeleted('vips', ['id' => $vip->id]);
    }

    public function test_get_expiring_vips()
    {
        VIP::factory()->expiringSoon()->count(2)->create();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->getJson('/api/vip-management/vips/expiring');

        $response->assertStatus(200)
                ->assertJsonStructure(['data']);
    }

    public function test_bulk_delete_vips()
    {
        $vips = VIP::factory()->count(3)->create();
        $vipIds = $vips->pluck('id')->toArray();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->postJson('/api/vip-management/vips/bulk/delete', [
            'ids' => $vipIds
        ]);

        $response->assertStatus(200);

        foreach ($vipIds as $id) {
            $this->assertSoftDeleted('vips', ['id' => $id]);
        }
    }

    public function test_restore_vip()
    {
        $vip = VIP::factory()->create();
        $vip->delete();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->patchJson("/api/vip-management/archived/vips/restore/{$vip->id}");

        $response->assertStatus(200);

        $this->assertDatabaseHas('vips', ['id' => $vip->id]);
    }
}
