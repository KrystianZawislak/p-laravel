<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register(): void
    {
        $response = $this->withHeader('Origin', 'http://localhost')
            ->postJson('/api/register', [
                'email'    => 'test@test.com',
                'password' => 'Artikula!2026',
            ]);

        $response->assertStatus(201)
                 ->assertJsonPath('user.email', 'test@test.com')
                 ->assertJsonMissingPath('user.password');
    }

    public function test_register_requires_strong_password(): void
    {
        $response = $this->withHeader('Origin', 'http://localhost')
            ->postJson('/api/register', [
                'email'    => 'test@test.com',
                'password' => '123',
            ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['password']);
    }

    public function test_register_requires_unique_email(): void
    {
        User::factory()->create(['email' => 'test@test.com']);

        $response = $this->withHeader('Origin', 'http://localhost')
            ->postJson('/api/register', [
                'email'    => 'test@test.com',
                'password' => 'Artikula!2026',
            ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['email']);
    }

    public function test_user_can_login(): void
    {
        User::factory()->create([
            'email'    => 'test@test.com',
            'password' => bcrypt('Artikula!2026'),
        ]);

        $response = $this->withHeader('Origin', 'http://localhost')
            ->postJson('/api/login', [
                'email'    => 'test@test.com',
                'password' => 'Artikula!2026',
            ]);

        $response->assertStatus(200)
                 ->assertJsonPath('user.email', 'test@test.com');
    }

    public function test_login_fails_with_wrong_password(): void
    {
        User::factory()->create([
            'email'    => 'test@test.com',
            'password' => bcrypt('Artikula!2026'),
        ]);

        $response = $this->withHeader('Origin', 'http://localhost')
            ->postJson('/api/login', [
                'email'    => 'test@test.com',
                'password' => 'zlehaslo',
            ]);

        $response->assertStatus(401)
                 ->assertJsonPath('message', 'Nieprawidłowe dane logowania.');
    }

    public function test_unauthenticated_cannot_access_appointments(): void
    {
        $response = $this->getJson('/api/appointments');

        $response->assertStatus(401);
    }
}
