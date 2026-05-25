<?php

namespace App\Enums;

enum UserRole: string
{
    case ADMIN      = 'ADMIN';
    case SECRETAIRE = 'SECRETAIRE';
    case DIRECTEUR  = 'DIRECTEUR';
    case FONDATEUR  = 'FONDATEUR';
    case ENSEIGNANT = 'ENSEIGNANT';
    case PARENT     = 'PARENT';
}

