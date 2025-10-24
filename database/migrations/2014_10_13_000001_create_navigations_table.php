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
      $table->string('icon')->nullable();
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
    // First, drop the foreign key constraint from role_permissions that references navigations
    if (Schema::hasTable('role_permissions')) {
      Schema::table('role_permissions', function (Blueprint $table) {
        $table->dropForeign(['navigation_id']);
      });
    }

    // Drop the foreign key constraint if it exists
    Schema::table('navigations', function (Blueprint $table) {
      $table->dropForeign(['parent_id']);
    });

    // Drop the table
    Schema::dropIfExists('navigations');
  }
  
}
