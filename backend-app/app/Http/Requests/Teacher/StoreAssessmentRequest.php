<?php

namespace App\Http\Requests\Teacher;

use Illuminate\Foundation\Http\FormRequest;

class StoreAssessmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'school_class_id' => ['required', 'integer', 'exists:school_classes,id'],
            'term_id' => ['required', 'integer', 'exists:terms,id'],
            'title' => ['required', 'string', 'max:255'],
            'type' => ['nullable', 'string', 'max:50'],
            'date' => ['nullable', 'date'],
            'total_points' => ['nullable', 'numeric', 'min:1'],
        ];
    }
}

