<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Discount extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'discount_name',
        'discount_value',
        'discount_value_type',
        'status',
    ];

    public function transactions()
    {
        return $this->belongsToMany(CashierTransaction::class, 'cashier_transaction_discount')
            ->withPivot('discount_value')
            ->withTimestamps();
    }
} 