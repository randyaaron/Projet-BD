<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $table = 'Messages';
    protected $primaryKey = 'idMessages';
    public $timestamps = false; // We'll manage created_at manually if needed, or rely on DEFAULT_GENERATED

    protected $fillable = [
        'idExp_Pers',
        'idParent',
        'objet',
        'information',
        'type_message',
        'AnneeAcade',
        'created_at',
        'valider'
    ];
}
