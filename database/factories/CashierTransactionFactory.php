<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\CashierSession;
use App\Models\Rate;
use App\Models\User;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CashierTransaction>
 */
class CashierTransactionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $quantity = fake()->numberBetween(1, 10);
        $total = fake()->randomFloat(2, 100, 2000);
        $paidAmount = $total + fake()->randomFloat(2, 0, 100);

        return [
            'cashier_id' => User::factory(),
            'promoter_id' => null,
            'rate_id' => Rate::factory(),
            'quantity' => $quantity,
            'total' => $total,
            'paid_amount' => $paidAmount,
            'change' => $paidAmount - $total,
            'session_id' => CashierSession::factory(),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
