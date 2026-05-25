<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreSchoolClassRequest;
use App\Models\SchoolClass;
use Illuminate\Http\Request;

class SchoolClassController extends Controller
{
    public function index(Request $request)
    {
        $query = SchoolClass::query()->with(['room', 'schoolYear'])->orderBy('name');
        if ($request->filled('school_year_id')) {
            $query->where('school_year_id', (int) $request->input('school_year_id'));
        }
        if ($request->filled('q')) {
            $q = (string) $request->input('q');
            $query->where('name', 'ilike', "%{$q}%");
        }
        return response()->json($query->paginate(50));
    }

    public function store(StoreSchoolClassRequest $request)
    {
        $class = SchoolClass::query()->create($request->validated());
        return response()->json(['school_class' => $class->load(['room', 'schoolYear'])], 201);
    }

    public function update(StoreSchoolClassRequest $request, SchoolClass $schoolClass)
    {
        $schoolClass->fill($request->validated())->save();
        return response()->json(['school_class' => $schoolClass->load(['room', 'schoolYear'])]);
    }

    public function destroy(SchoolClass $schoolClass)
    {
        $schoolClass->delete();
        return response()->json(['message' => 'Deleted']);
    }
}

