<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

class AuthControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_registration()
    {
        $userData = [
            'username' => 'newuser',
            'email' => 'newuser@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123'
        ];

        $response = $this->postJson('/api/auth/signup', $userData);

        $response->assertStatus(200)
                ->assertJsonStructure(['message']);

        $this->assertDatabaseHas('users', [
            'user_login' => 'newuser',
            'user_email' => 'newuser@example.com'
        ]);
    }

    public function test_user_registration_validation()
    {
        $userData = [
            'username' => '',
            'email' => 'invalid-email',
            'password' => '123',
            'password_confirmation' => '456'
        ];

        $response = $this->postJson('/api/auth/signup', $userData);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['username', 'email', 'password']);
    }

    public function test_user_login()
    {
        $role = Role::factory()->create();
        $user = User::factory()->create([
            'user_status' => 1,
            'user_role_id' => $role->id
        ]);

        $loginData = [
            'email' => $user->user_email,
            'password' => 'password'
        ];

        $response = $this->postJson('/api/auth/login', $loginData);

        $response->assertStatus(200)
                ->assertJsonStructure(['token', 'user']);
    }

    public function test_user_login_invalid_credentials()
    {
        $user = User::factory()->create(['user_status' => 1]);

        $loginData = [
            'email' => $user->user_email,
            'password' => 'wrongpassword'
        ];

        $response = $this->postJson('/api/auth/login', $loginData);

        $response->assertStatus(401);
    }

    public function test_user_activation()
    {
        $user = User::factory()->create(['user_status' => 0]);

        $response = $this->postJson('/api/auth/activate', [
            'activation_key' => $user->user_activation_key
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'user_status' => 1
        ]);
    }

    public function test_forgot_password()
    {
        $user = User::factory()->create(['user_status' => 1]);

        $response = $this->postJson('/api/auth/forgot-password', [
            'email' => $user->user_email
        ]);

        $response->assertStatus(200)
                ->assertJsonStructure(['message']);
    }

    public function test_logout()
    {
        $user = User::factory()->create(['user_status' => 1]);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token
        ])->postJson('/api/logout');

        $response->assertStatus(200);
    }
}
