<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Person extends Model
{
    protected $fillable = [
        'first_name',
        'last_name',
        'phone',
        'address',
        'birth_date',
        'sex',
        'photo_path',
    ];

    protected $casts = [
        'birth_date' => 'date',
    ];
}

