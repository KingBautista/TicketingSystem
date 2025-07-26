<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CashierTransactionDiscount extends Model
{
    protected $table = 'cashier_transaction_discount';

    protected $fillable = [
        'cashier_transaction_id',
        'discount_id',
        'discount_value',
    ];

    public function transaction()
    {
        return $this->belongsTo(CashierTransaction::class, 'cashier_transaction_id');
    }

    public function discount()
    {
        return $this->belongsTo(Discount::class, 'discount_id');
    }
}
