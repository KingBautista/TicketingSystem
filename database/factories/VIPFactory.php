<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\VIP>
 */
class VIPFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'address' => fake()->address(),
            'contact_number' => fake()->phoneNumber(),
            'other_info' => fake()->sentence(),
            'card_number' => fake()->unique()->numerify('VIP########'),
            'validity_start' => now()->toDateString(),
            'validity_end' => now()->addYear()->toDateString(),
            'status' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    /**
     * Indicate that the VIP is expired.
     */
    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'validity_end' => now()->subYear()->toDateString(),
            'status' => false,
        ]);
    }

    /**
     * Indicate that the VIP is expiring soon.
     */
    public function expiringSoon(): static
    {
        return $this->state(fn (array $attributes) => [
            'validity_end' => now()->addDays(30)->toDateString(),
            'status' => true,
        ]);
    }
}
