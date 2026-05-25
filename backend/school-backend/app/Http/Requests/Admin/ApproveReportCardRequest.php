<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ApproveReportCardRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'director_stamp_path' => ['nullable', 'string', 'max:255'],
            'pdf_path' => ['nullable', 'string', 'max:255'],
        ];
    }
}

