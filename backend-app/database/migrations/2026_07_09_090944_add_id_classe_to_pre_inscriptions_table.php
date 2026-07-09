<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pre_inscriptions', function (Blueprint $table) {
            $table->unsignedInteger('id_classe')->nullable()->after('id_salle');
        });
    }

    public function down(): void
    {
        Schema::table('pre_inscriptions', function (Blueprint $table) {
            $table->dropColumn('id_classe');
        });
    }
};
