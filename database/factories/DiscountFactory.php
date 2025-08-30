<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Discount>
 */
class DiscountFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'discount_name' => fake()->words(2, true),
            'discount_value' => fake()->numberBetween(5, 50),
            'discount_value_type' => 'percentage',
            'status' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
