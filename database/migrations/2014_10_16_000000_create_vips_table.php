<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vips', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('name');
            $table->string('address')->nullable();
            $table->string('contact_number')->nullable();
            $table->string('other_info')->nullable();
            $table->string('card_number')->unique();
            $table->date('validity_start');
            $table->date('validity_end');
            $table->boolean('status')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vips');
    }
}; 