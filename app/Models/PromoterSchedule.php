<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PromoterSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'promoter_id',
        'date',
        'is_manual',
    ];

    public function promoter()
    {
        return $this->belongsTo(Promoter::class);
    }
} 