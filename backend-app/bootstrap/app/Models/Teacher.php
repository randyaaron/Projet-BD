<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Teacher extends Model
{
    protected $fillable = [
        'user_id',
        'person_id',
        'subject_id',
        'matricule',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function person()
    {
        return $this->belongsTo(Person::class);
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function classAssignments()
    {
        return $this->hasMany(TeacherClassAssignment::class);
    }
}

