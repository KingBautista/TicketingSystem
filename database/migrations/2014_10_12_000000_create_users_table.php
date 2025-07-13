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
        Schema::create('users', function (Blueprint $table) {
            $table->engine = "InnoDB";

            $table->bigIncrements('id');
            $table->string('user_login')->index();
            $table->string('user_pass');
            $table->string('user_email')->unique()->index();
            $table->string('user_salt')->index();
            $table->boolean('user_status')->default(false);
            $table->string('user_activation_key')->nullable();
            $table->bigInteger('user_role_id')->unsigned()->nullable()->index();
            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('user_role_id')->references('id')->on('roles')->onDelete('set null');
        });

        Schema::create('user_meta', function (Blueprint $table) {
            $table->engine = "InnoDB";
            
            $table->bigIncrements('id');
            $table->bigInteger('user_id')->nullable()->unsigned()->index();
            $table->string('meta_key')->nullable()->index();
            $table->longText('meta_value')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_meta');
        Schema::dropIfExists('users');
    }
};
