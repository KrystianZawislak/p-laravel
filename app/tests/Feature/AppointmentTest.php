<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AppointmentTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Service $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user    = User::factory()->create();
        $this->service = Service::create(['name' => 'Terapia jąkania']);
    }

    public function test_user_can_create_appointment(): void
    {
        $response = $this->actingAs($this->user)->postJson('/api/appointments', [
            'service_id'   => $this->service->id,
            'patient_name' => 'Jan Kowalski',
            'date'         => '2026-08-01',
            'time'         => '09:00',
            'mode'         => 'stacjonarnie',
        ]);

        $response->assertStatus(201)
                 ->assertJsonPath('patient_name', 'Jan Kowalski')
                 ->assertJsonPath('user_id', $this->user->id);
    }

    public function test_user_sees_only_own_appointments(): void
    {
        $otherUser = User::factory()->create();

        Appointment::create([
            'user_id'      => $this->user->id,
            'service_id'   => $this->service->id,
            'patient_name' => 'Mój pacjent',
            'date'         => '2026-08-01',
            'time'         => '09:00',
            'mode'         => 'stacjonarnie',
        ]);

        Appointment::create([
            'user_id'      => $otherUser->id,
            'service_id'   => $this->service->id,
            'patient_name' => 'Cudzy pacjent',
            'date'         => '2026-08-01',
            'time'         => '10:00',
            'mode'         => 'online',
        ]);

        $response = $this->actingAs($this->user)->getJson('/api/appointments');

        $response->assertStatus(200)
                 ->assertJsonCount(1)
                 ->assertJsonPath('0.patient_name', 'Mój pacjent');
    }

    public function test_cannot_update_others_appointment(): void
    {
        $otherUser = User::factory()->create();

        $appointment = Appointment::create([
            'user_id'      => $otherUser->id,
            'service_id'   => $this->service->id,
            'patient_name' => 'Cudzy pacjent',
            'date'         => '2026-08-01',
            'time'         => '09:00',
            'mode'         => 'stacjonarnie',
        ]);

        $response = $this->actingAs($this->user)->putJson("/api/appointments/{$appointment->id}", [
            'patient_name' => 'HAKER BYL TU',
        ]);

        $response->assertStatus(403);
        $this->assertDatabaseHas('appointments', ['patient_name' => 'Cudzy pacjent']);
    }

    public function test_cannot_book_past_date(): void
    {
        $response = $this->actingAs($this->user)->postJson('/api/appointments', [
            'service_id'   => $this->service->id,
            'patient_name' => 'Jan Kowalski',
            'date'         => '2020-01-01',
            'time'         => '09:00',
            'mode'         => 'stacjonarnie',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['date']);
    }

    public function test_cannot_double_book_same_slot(): void
    {
        Appointment::create([
            'user_id'      => $this->user->id,
            'service_id'   => $this->service->id,
            'patient_name' => 'Pierwszy',
            'date'         => '2026-08-01',
            'time'         => '09:00',
            'mode'         => 'stacjonarnie',
        ]);

        $response = $this->actingAs($this->user)->postJson('/api/appointments', [
            'service_id'   => $this->service->id,
            'patient_name' => 'Drugi',
            'date'         => '2026-08-01',
            'time'         => '09:00',
            'mode'         => 'online',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['time']);
    }

    public function test_cannot_book_invalid_time(): void
    {
        $response = $this->actingAs($this->user)->postJson('/api/appointments', [
            'service_id'   => $this->service->id,
            'patient_name' => 'Jan Kowalski',
            'date'         => '2026-08-01',
            'time'         => '23:00',
            'mode'         => 'stacjonarnie',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['time']);
    }
}
