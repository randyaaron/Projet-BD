<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreTeacherAssignmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'teacher_id' => ['required', 'integer', 'exists:teachers,id'],
            'school_class_id' => ['required', 'integer', 'exists:school_classes,id'],
            'school_year_id' => ['required', 'integer', 'exists:school_years,id'],
        ];
    }
}

