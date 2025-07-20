<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('promoter_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('promoter_id')->constrained('promoters')->onDelete('cascade');
            $table->date('date');
            $table->boolean('is_manual')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('promoter_schedules');
    }
}; 