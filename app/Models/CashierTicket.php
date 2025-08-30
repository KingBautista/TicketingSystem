<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CashierTicket extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'transaction_id',
        'qr_code',
        'note',
        'is_used',
    ];

    public function transaction()
    {
        return $this->belongsTo(CashierTransaction::class, 'transaction_id');
    }
}
