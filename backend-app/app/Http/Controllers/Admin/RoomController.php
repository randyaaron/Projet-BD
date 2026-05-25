<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreRoomRequest;
use App\Models\Room;
use Illuminate\Http\Request;

class RoomController extends Controller
{
    public function index(Request $request)
    {
        $query = Room::query()->orderBy('name');
        if ($request->filled('q')) {
            $q = (string) $request->input('q');
            $query->where('name', 'ilike', "%{$q}%");
        }
        return response()->json($query->paginate(50));
    }

    public function store(StoreRoomRequest $request)
    {
        $room = Room::query()->create($request->validated());
        return response()->json(['room' => $room], 201);
    }

    public function update(StoreRoomRequest $request, Room $room)
    {
        $room->fill($request->validated())->save();
        return response()->json(['room' => $room]);
    }

    public function destroy(Room $room)
    {
        $room->delete();
        return response()->json(['message' => 'Deleted']);
    }
}

