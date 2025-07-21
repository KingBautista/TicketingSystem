<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CashierTransaction extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'cashier_id',
        'promoter_id',
        'rate_id',
        'quantity',
        'total',
        'paid_amount',
        'change',
    ];

    public function cashier()
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }

    public function promoter()
    {
        return $this->belongsTo(Promoter::class, 'promoter_id');
    }

    public function rate()
    {
        return $this->belongsTo(Rate::class, 'rate_id');
    }

    public function details()
    {
        return $this->hasMany(CashierTransactionDetail::class, 'transaction_id');
    }
} 