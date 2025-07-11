<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class CreateNavigationsTable extends Migration
{
  /**
   * Run the migrations.
   *
   * @return void
   */
  public function up()
  {
    // Create the 'navigations' table
    Schema::create('navigations', function (Blueprint $table) {
      $table->engine = 'InnoDB';
      $table->bigIncrements('id');
      $table->string('name'); // Name of the navigation item
      $table->string('slug'); // Slug for routing or identification
      $table->string('icon');
      $table->bigInteger('parent_id')->nullable()->unsigned(); // Parent ID for nesting
      $table->boolean('active')->default(true);
      $table->boolean('show_in_menu')->default(true);
      $table->timestamps();
      $table->softDeletes();

      // Foreign key reference to the same table (self-referencing)
      $table->foreign('parent_id')
            ->references('id')
            ->on('navigations')
            ->onDelete('cascade'); // Cascade delete for child records
    });
  }

  /**
   * Reverse the migrations.
   *
   * @return void
   */
  public function down()
  {
    // Disable foreign key checks temporarily
    DB::statement('SET foreign_key_checks = 0');

    // Drop the foreign key constraint by name if it exists
    Schema::table('navigations', function (Blueprint $table) {
      // Check if foreign key exists before attempting to drop it
      $foreignKeyExists = DB::select("SELECT CONSTRAINT_NAME
        FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_NAME = 'navigations' AND CONSTRAINT_NAME = 'navigations_parent_id_foreign'");

      if ($foreignKeyExists) {
        $table->dropForeign('navigations_parent_id_foreign');
      }
    });

    // Optionally delete all records from the 'navigations' table to avoid foreign key conflicts
    DB::table('navigations')->delete();

    // Drop the table if it exists
    Schema::dropIfExists('navigations');

    // Re-enable foreign key checks
    DB::statement('SET foreign_key_checks = 1');
  }
}
