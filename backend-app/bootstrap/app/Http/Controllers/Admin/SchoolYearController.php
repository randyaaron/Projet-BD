<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreSchoolYearRequest;
use App\Models\SchoolYear;
use Illuminate\Support\Facades\DB;

class SchoolYearController extends Controller
{
    public function index()
    {
        $years = SchoolYear::query()->latest('id')->paginate(20);
        return response()->json($years);
    }

    public function store(StoreSchoolYearRequest $request)
    {
        $year = SchoolYear::query()->create($request->validated());

        if ($request->boolean('is_active')) {
            $this->activate($year->id);
            $year->refresh();
        }

        return response()->json(['school_year' => $year], 201);
    }

    public function update(StoreSchoolYearRequest $request, SchoolYear $schoolYear)
    {
        $schoolYear->fill($request->validated())->save();

        if ($request->has('is_active') && $request->boolean('is_active')) {
            $this->activate($schoolYear->id);
            $schoolYear->refresh();
        }

        return response()->json(['school_year' => $schoolYear]);
    }

    public function destroy(SchoolYear $schoolYear)
    {
        $schoolYear->delete();
        return response()->json(['message' => 'Deleted']);
    }

    public function activateYear(SchoolYear $schoolYear)
    {
        $this->activate($schoolYear->id);
        $schoolYear->refresh();
        return response()->json(['school_year' => $schoolYear]);
    }

    private function activate(int $yearId): void
    {
        DB::transaction(function () use ($yearId) {
            SchoolYear::query()->where('id', '!=', $yearId)->update(['is_active' => false]);
            SchoolYear::query()->where('id', $yearId)->update(['is_active' => true]);
        });
    }
}

