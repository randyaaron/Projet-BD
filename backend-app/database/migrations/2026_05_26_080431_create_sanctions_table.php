<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('sanctions');

        Schema::create('sanctions', function (Blueprint $table) {
            $table->id();
            $table->string('student_id'); // maps to Eleve.matricule (string)
            $table->integer('points')->default(0); // points to deduct
            $table->string('motif');
            $table->date('date');
            $table->timestamps();
            $table->foreign('student_id')->references('matricule')->on('Eleve')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sanctions');
    }
};
