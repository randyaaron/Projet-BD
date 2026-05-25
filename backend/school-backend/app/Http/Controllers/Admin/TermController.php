<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreTermRequest;
use App\Models\Term;
use Illuminate\Http\Request;

class TermController extends Controller
{
    public function index(Request $request)
    {
        $query = Term::query()->with('schoolYear')->latest('id');
        if ($request->filled('school_year_id')) {
            $query->where('school_year_id', (int) $request->input('school_year_id'));
        }
        return response()->json($query->paginate(50));
    }

    public function store(StoreTermRequest $request)
    {
        $term = Term::query()->create($request->validated());
        return response()->json(['term' => $term], 201);
    }

    public function update(StoreTermRequest $request, Term $term)
    {
        $term->fill($request->validated())->save();
        return response()->json(['term' => $term]);
    }

    public function destroy(Term $term)
    {
        $term->delete();
        return response()->json(['message' => 'Deleted']);
    }
}

