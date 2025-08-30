<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use App\Models\UserMeta;
use Illuminate\Foundation\Testing\RefreshDatabase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_be_created()
    {
        $userData = [
            'user_login' => 'testuser',
            'user_email' => 'test@example.com',
            'user_pass' => 'password123',
            'user_salt' => 'salt123',
            'user_status' => 1
        ];

        $user = User::create($userData);

        $this->assertDatabaseHas('users', [
            'user_login' => 'testuser',
            'user_email' => 'test@example.com'
        ]);
        $this->assertEquals('testuser', $user->user_login);
        $this->assertEquals('test@example.com', $user->user_email);
    }

    public function test_user_relationships()
    {
        $user = User::factory()->create();
        $role = Role::factory()->create();
        
        $user->user_role_id = $role->id;
        $user->save();

        $this->assertInstanceOf(Role::class, $user->userRole);
        $this->assertEquals($role->id, $user->userRole->id);
    }

    public function test_user_meta_relationship()
    {
        $user = User::factory()->create();
        $userMeta = UserMeta::create([
            'user_id' => $user->id,
            'meta_key' => 'phone',
            'meta_value' => '1234567890'
        ]);

        $this->assertTrue($user->getUserMetas->contains($userMeta));
    }

    public function test_save_user_meta()
    {
        $user = User::factory()->create();
        $metaData = [
            'phone' => '1234567890',
            'address' => 'Test Address'
        ];

        $user->saveUserMeta($metaData);

        $this->assertDatabaseHas('user_meta', [
            'user_id' => $user->id,
            'meta_key' => 'phone',
            'meta_value' => '1234567890'
        ]);

        $this->assertDatabaseHas('user_meta', [
            'user_id' => $user->id,
            'meta_key' => 'address',
            'meta_value' => 'Test Address'
        ]);
    }

    public function test_user_factory()
    {
        $user = User::factory()->create();

        $this->assertInstanceOf(User::class, $user);
        $this->assertNotEmpty($user->user_login);
        $this->assertNotEmpty($user->user_email);
        $this->assertNotEmpty($user->user_salt);
    }
}
