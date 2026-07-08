<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pre_inscriptions', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('prenom');
            $table->date('date_naissance')->nullable();
            $table->string('lieu_naissance')->nullable();
            $table->tinyInteger('sexe')->default(1); // 1=garçon, 2=fille
            $table->string('parent_nom')->nullable();
            $table->float('montant_verse')->default(0);
            $table->unsignedInteger('id_mode')->default(1);
            $table->string('commentaire')->default('Frais d\'inscription');
            $table->date('date_paiement');
            $table->enum('statut', ['en_attente', 'validee', 'rejetee'])->default('en_attente');
            $table->unsignedInteger('matricule_attribue')->nullable(); // filled by admin
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pre_inscriptions');
    }
};
