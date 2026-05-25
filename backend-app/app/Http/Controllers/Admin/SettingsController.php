<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SettingsController extends Controller
{
    private $settingsFile = 'settings.json';

    public function index()
    {
        if (!Storage::exists($this->settingsFile)) {
            return response()->json([
                'schoolName' => 'École Primaire Saint-Michel',
                'academicYear' => '2025-2026',
                'contactEmail' => 'contact@saint-michel.edu',
                'contactPhone' => '+33 1 23 45 67 89'
            ]);
        }

        $data = json_decode(Storage::get($this->settingsFile), true);
        return response()->json($data);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'schoolName' => 'required|string|max:255',
            'academicYear' => 'required|string|max:50',
            'contactEmail' => 'required|email|max:255',
            'contactPhone' => 'required|string|max:50',
        ]);

        Storage::put($this->settingsFile, json_encode($data, JSON_PRETTY_PRINT));

        return response()->json(['message' => 'Configuration sauvegardée', 'data' => $data]);
    }
}
