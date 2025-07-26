<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class FixCashierTransactionsDropOrder extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // No changes needed in up() as tables already exist
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::disableForeignKeyConstraints();

        // Drop the pivot table first since it depends on cashier_transactions
        Schema::dropIfExists('cashier_transaction_discount');
        
        // Now we can safely drop the main table
        Schema::dropIfExists('cashier_transactions');

        Schema::enableForeignKeyConstraints();
    }
}
