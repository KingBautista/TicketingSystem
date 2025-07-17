<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class VIP extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'vips';

    protected $fillable = [
        'name',
        'address',
        'contact_number',
        'other_info',
        'card_number',
        'validity_start',
        'validity_end',
        'status',
    ];
} 