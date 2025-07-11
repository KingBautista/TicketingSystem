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
    // Create the roles table
    Schema::create('roles', function (Blueprint $table) {
      $table->engine = 'InnoDB'; // Ensure InnoDB is used for foreign keys
      $table->bigIncrements('id');
      $table->string('name');
      $table->boolean('active')->default(true);
      $table->boolean('is_super_admin')->default(true);
      $table->timestamps();
      $table->softDeletes();
    });

    // Add foreign key on users table
    // Schema::table('users', function (Blueprint $table) {
    //   $table->unsignedBigInteger('role_id')->nullable()->after('user_status');
    //   $table->foreign('role_id')->references('id')->on('roles')->onDelete('set null');
    // });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    // Step 1: Disable foreign key checks temporarily to avoid constraint violations
    // DB::statement('SET FOREIGN_KEY_CHECKS = 0;');

    // // Step 2: Drop the foreign key constraint if it exists
    // $foreignKeyExists = DB::select("SELECT CONSTRAINT_NAME
    //   FROM information_schema.KEY_COLUMN_USAGE
    //   WHERE TABLE_NAME = 'users'
    //   AND CONSTRAINT_NAME = 'users_role_id_foreign'");

    // if ($foreignKeyExists) {
    //   Schema::table('users', function (Blueprint $table) {
    //       $table->dropForeign('users_role_id_foreign'); // Adjust the constraint name if necessary
    //   });
    // }

    // // Step 3: Check if role_id column exists before setting it to NULL
    // if (Schema::hasColumn('users', 'role_id')) {
    //   DB::table('users')->update(['role_id' => null]); // Set role_id to NULL to avoid foreign key violation
    // }

    // // Step 4: Drop the role_id column from users table (if it exists)
    // if (Schema::hasColumn('users', 'role_id')) {
    //   Schema::table('users', function (Blueprint $table) {
    //     $table->dropColumn('role_id');
    //   });
    // }

    // Step 5: Drop the roles table
    Schema::dropIfExists('roles');

    // Step 6: Re-enable foreign key checks after dropping tables and constraints
    // DB::statement('SET FOREIGN_KEY_CHECKS = 1;');
  }
};
