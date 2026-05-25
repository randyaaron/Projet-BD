<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    protected $fillable = [
        'school_class_id',
        'student_id',
        'date',
        'status',
    ];

    public function schoolClass()
    {
        return $this->belongsTo(SchoolClass::class);
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
