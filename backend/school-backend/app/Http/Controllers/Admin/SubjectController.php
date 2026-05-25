<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreSubjectRequest;
use App\Models\Subject;
use Illuminate\Http\Request;

class SubjectController extends Controller
{
    public function index(Request $request)
    {
        $query = Subject::query()->orderBy('name');
        if ($request->filled('q')) {
            $q = (string) $request->input('q');
            $query->where('name', 'ilike', "%{$q}%");
        }

        return response()->json($query->paginate(50));
    }

    public function store(StoreSubjectRequest $request)
    {
        $subject = Subject::query()->create([
            'name' => (string) $request->string('name'),
        ]);

        return response()->json(['subject' => $subject], 201);
    }

    public function update(StoreSubjectRequest $request, Subject $subject)
    {
        $subject->forceFill([
            'name' => (string) $request->string('name'),
        ])->save();

        return response()->json(['subject' => $subject]);
    }

    public function destroy(Subject $subject)
    {
        $subject->delete();
        return response()->json(['message' => 'Deleted']);
    }
}

