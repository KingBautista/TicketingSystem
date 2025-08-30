<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CashierSession>
 */
class CashierSessionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'cashier_id' => User::factory(),
            'cash_on_hand' => fake()->randomFloat(2, 500, 5000),
            'opened_at' => now(),
            'closed_at' => null,
            'closing_cash' => null,
            'status' => 'open',
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    /**
     * Indicate that the session is closed.
     */
    public function closed(): static
    {
        return $this->state(fn (array $attributes) => [
            'closing_cash' => fake()->randomFloat(2, 500, 5000),
            'closed_at' => now(),
            'status' => 'closed',
        ]);
    }
}
