<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Assessment extends Model
{
    protected $fillable = [
        'school_class_id',
        'teacher_id',
        'subject_id',
        'term_id',
        'title',
        'type',
        'date',
        'total_points',
    ];

    protected $casts = [
        'date' => 'date',
        'total_points' => 'decimal:2',
    ];

    public function schoolClass()
    {
        return $this->belongsTo(SchoolClass::class);
    }

    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function term()
    {
        return $this->belongsTo(Term::class);
    }

    public function grades()
    {
        return $this->hasMany(Grade::class);
    }
}

