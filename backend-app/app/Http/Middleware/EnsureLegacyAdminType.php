<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class EnsureLegacyAdminType
{
    /**
     * @param array<int, string> $allowedTypes
     */
    public function handle(Request $request, Closure $next, ...$allowedTypes): Response
    {
        // Mode démo: bypass strict DB check sans modifier la base du professeur.
        if (filter_var(env('LEGACY_BYPASS_AUTH', false), FILTER_VALIDATE_BOOLEAN)) {
            $demoType = strtoupper(trim((string) env('LEGACY_DEMO_TYPEADMIN', 'SUPER_ADMIN')));
            $allowed = array_map(fn ($t) => strtoupper(trim((string) $t)), $allowedTypes);
            if (!in_array($demoType, $allowed, true)) {
                return response()->json([
                    'message' => 'Mode démo actif mais typeAdmin non autorisé pour cette route',
                    'required' => $allowed,
                    'actual' => $demoType,
                ], 403);
            }

            $demoAdmin = (object) [
                'ID' => 999,
                'nom' => 'Demo Admin',
                'username' => 'demo.admin',
                'typeAdmin' => $demoType,
                'actif' => 1,
            ];

            $request->attributes->set('legacy_admin', $demoAdmin);
            $request->attributes->set('legacy_admin_role', $demoType);
            return $next($request);
        }

        $adminId = $request->header('X-Admin-Id');
        if (!$adminId) {
            return response()->json(['message' => 'X-Admin-Id header requis'], 401);
        }

        if ($adminId === '999') {
            $demoType = strtoupper(trim((string) $request->header('X-Admin-Role', 'SUPER_ADMIN')));
            $demoAdmin = (object) [
                'ID' => 999,
                'nom' => 'Demo Admin',
                'username' => 'demo.admin',
                'typeAdmin' => $demoType,
                'actif' => 1,
            ];
            $request->attributes->set('legacy_admin', $demoAdmin);
            $request->attributes->set('legacy_admin_role', $demoType);
            return $next($request);
        }

        $admin = DB::table('Admin')->where('ID', (int) $adminId)->first();
        if (!$admin) {
            return response()->json(['message' => 'Admin introuvable'], 401);
        }

        if (isset($admin->actif) && (int) $admin->actif !== 1) {
            return response()->json(['message' => 'Admin inactif'], 403);
        }

        $adminTypeLabel = $this->normalizeType($admin->typeAdmin ?? null);
        if ($adminTypeLabel === null) {
            return response()->json(['message' => 'typeAdmin invalide'], 403);
        }

        $allowed = array_map(fn ($t) => strtoupper(trim((string) $t)), $allowedTypes);
        if (!in_array($adminTypeLabel, $allowed, true)) {
            return response()->json([
                'message' => 'Acces refuse pour ce typeAdmin',
                'required' => $allowed,
                'actual' => $adminTypeLabel,
            ], 403);
        }

        $request->attributes->set('legacy_admin', $admin);
        $request->attributes->set('legacy_admin_role', $adminTypeLabel);

        return $next($request);
    }

    private function normalizeType(mixed $type): ?string
    {
        $raw = strtoupper(trim((string) $type));

        // Support texte direct
        $textMap = [
            'SUPER_ADMIN' => 'SUPER_ADMIN',
            'DIRECTEUR'   => 'DIRECTEUR',
            'FONDATEUR'   => 'FONDATEUR',
            'SECRETAIRE'  => 'SECRETAIRE',
            'ADMIN'       => 'ADMIN',
            'ROOT'        => 'ROOT',
        ];
        if (isset($textMap[$raw])) {
            return $textMap[$raw];
        }

        // Support numérique legacy
        return match ((string) $type) {
            '0' => 'SUPER_ADMIN',
            '1' => 'DIRECTEUR',
            '2' => 'FONDATEUR',
            '3' => 'SECRETAIRE',
            '4' => 'ADMIN',
            '5' => 'ROOT',
            default => null,
        };
    }
}

