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
        Schema::create('media_libraries', function (Blueprint $table) {
            $table->engine = "InnoDB";

            $table->bigIncrements('id');
            $table->bigInteger('user_id')->nullable()->unsigned()->index();
            $table->string('file_name')->index();
            $table->string('file_type')->index();
            $table->string('file_size')->nullable();
            $table->integer('width')->unsigned()->default(0);
            $table->integer('height')->unsigned()->default(0);
            $table->string('file_dimensions')->nullable();
            $table->mediumText('file_url')->nullable();
            $table->mediumText('thumbnail_url')->nullable();
            $table->string('caption')->nullable();
            $table->string('short_descriptions')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('media_libraries');
    }
};
