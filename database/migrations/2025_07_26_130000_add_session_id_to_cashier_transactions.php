<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('cashier_transactions', function (Blueprint $table) {
            $table->unsignedBigInteger('session_id')->after('change');
            $table->foreign('session_id')->references('id')->on('cashier_sessions');
        });
    }

    public function down(): void
    {
        Schema::table('cashier_transactions', function (Blueprint $table) {
            $table->dropForeign(['session_id']);
            $table->dropColumn('session_id');
        });
    }
};
