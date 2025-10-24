<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CashierSession extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'cashier_id',
        'cash_on_hand',
        'opened_at',
        'closed_at',
        'closing_cash',
        'status',
    ];

    protected $casts = [
        'opened_at' => 'datetime',
        'closed_at' => 'datetime',
    ];

    public function cashier()
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }

    public function transactions()
    {
        return $this->hasMany(CashierTransaction::class, 'session_id');
    }
}
