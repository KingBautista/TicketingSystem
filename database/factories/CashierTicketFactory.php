<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use App\Models\CashierTransaction;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CashierTicket>
 */
class CashierTicketFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'transaction_id' => CashierTransaction::factory(),
            'qr_code' => Str::random(32),
            'is_used' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    /**
     * Indicate that the ticket is used.
     */
    public function used(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_used' => true,
        ]);
    }
}
