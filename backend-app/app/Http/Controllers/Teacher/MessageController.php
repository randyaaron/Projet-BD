<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Message;
use App\Models\ParentModel; // Assuming ParentModel is mapped to the 'Parents' or 'parents' table. Let's check how it's named.

class MessageController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'idParent' => 'required|integer',
            'objet' => 'required|string|max:255',
            'information' => 'required|string',
        ]);

        $teacher = $request->user()->teacher;
        if (!$teacher) {
            return response()->json(['message' => 'Teacher profile missing'], 422);
        }

        $message = Message::create([
            'idExp_Pers' => $teacher->id, // Store the teacher's ID as the sender
            'idParent' => $request->idParent,
            'objet' => $request->objet,
            'information' => $request->information,
            'type_message' => 0,
            'AnneeAcade' => '2025-2026', // Ideally fetched dynamically, hardcoded for now or fetched from settings
            'created_at' => now(),
            'valider' => 1,
        ]);

        return response()->json(['message' => 'Message sent successfully!', 'data' => $message], 201);
    }
    
    // Optional: get list of parents to send message to
    public function parents()
    {
        $parents = \App\Models\ParentModel::with('person')->get()->map(function($p) {
            return [
                'id' => $p->id,
                'nom' => $p->person ? $p->person->first_name . ' ' . $p->person->last_name : 'Parent Inconnu'
            ];
        });
        return response()->json(['parents' => $parents]);
    }
}
