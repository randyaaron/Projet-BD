<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pre_inscriptions', function (Blueprint $table) {
            if (!Schema::hasColumn('pre_inscriptions', 'id_classe')) {
                $table->unsignedInteger('id_classe')->nullable();
            }
        });
    }
    public function down(): void
    {
        Schema::table('pre_inscriptions', function (Blueprint $table) {
            $table->dropColumn('id_classe');
        });
    }
};
