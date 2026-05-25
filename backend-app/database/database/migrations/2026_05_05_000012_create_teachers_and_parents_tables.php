<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('teachers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('person_id')->constrained('people')->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained('subjects')->restrictOnDelete(); // 1 enseignant = 1 matière
            $table->string('matricule')->nullable()->unique();
            $table->timestamps();

            $table->unique('user_id');
            $table->unique('person_id');
        });

        Schema::create('parents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('person_id')->constrained('people')->cascadeOnDelete();
            $table->timestamps();

            $table->unique('user_id');
            $table->unique('person_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('parents');
        Schema::dropIfExists('teachers');
    }
};

