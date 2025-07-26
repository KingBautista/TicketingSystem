<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('cashier_transaction_discount', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cashier_transaction_id')->constrained('cashier_transactions')->onDelete('cascade');
            $table->foreignId('discount_id')->constrained('discounts')->onDelete('cascade');
            $table->decimal('discount_value', 10, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cashier_transaction_discount');
    }
};
