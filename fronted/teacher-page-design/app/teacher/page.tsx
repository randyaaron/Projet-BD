'use client';

import { TeacherHeader } from '@/components/teacher/teacher-header';
import { StatCard } from '@/components/teacher/stat-card';
import { QuickActions } from '@/components/teacher/quick-actions';
import {
  Users, UserX, BookOpen, Loader2, RefreshCw,
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle2,
  BarChart3, Calendar
} from 'lucide-react';
import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function DashboardContent() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uid, setUid] = useState<string | null>(null);

  const fetchDashboard = useCallback(async (userId: string, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await fetch(`http://localhost:8000/api/legacy/teacher/dashboard/full/${userId}`);
      const resData = await res.json();
      setData(resData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let userId = searchParams.get('userId');
    if (!userId && typeof window !== 'undefined') {
      userId = localStorage.getItem('user_id');
    }

    if (userId) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_id', userId);
      }
      setUid(userId);
      fetchDashboard(userId);
    } else {
      setLoading(false);
    }
  }, [searchParams, fetchDashboard]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!uid) return;
    const interval = setInterval(() => {
      fetchDashboard(uid, true);
    }, 30000);
    return () => clearInterval(interval);
  }, [uid, fetchDashboard]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </main>
    );
  }

  const teacherName = data?.teacherName || 'Enseignant';
  const stats = data?.stats || { eleves: 0, notes: 0, absences: 0, devoirs: 0 };
  const classeName = data?.classe || 'Aucune classe';

  // Derived statistics
  const totalEleves = stats.eleves || 0;
  const absencesToday = stats.absences || 0;
  const presentToday = Math.max(0, totalEleves - absencesToday);
  const tauxPresence = totalEleves > 0 ? Math.round((presentToday / totalEleves) * 100) : 0;
  const devoirsEncours = stats.devoirs || 0;
  const moyenneClasse = data?.stats?.moyenne || null;

  return (
    <main className="min-h-screen pb-10">
      <TeacherHeader
        title="Tableau de bord"
        subtitle={`Bienvenue, ${teacherName}`}
      />

      <div className="p-6">
        {/* ── En-tête refresh ── */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Vue d'ensemble</h2>
            <p className="text-sm text-slate-500">Statistiques du jour</p>
          </div>
          <button
            onClick={() => uid && fetchDashboard(uid, true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 transition-all hover:bg-slate-50 hover:text-emerald-600 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-emerald-500' : ''}`} />
            {refreshing ? 'Mise à jour...' : 'Actualiser'}
          </button>
        </div>

        {/* ── StatCards originales ── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            title="Élèves inscrits"
            value={stats.eleves}
            subtitle={`Classe: ${classeName}`}
            icon={Users}
            trend={{ value: 0, positive: true }}
          />
          <StatCard
            title="Absences du jour"
            value={stats.absences}
            subtitle="Aujourd'hui"
            icon={UserX}
          />
          <StatCard
            title="Devoirs en cours"
            value={stats.devoirs}
            subtitle="Total créés"
            icon={BookOpen}
          />
        </div>

        {/* ── Quick Actions ── */}
        <div className="mt-6">
          <QuickActions />
        </div>

        {/* ══════════════════════════════════════════
            STATISTIQUES DÉTAILLÉES (en bas, grandes)
        ══════════════════════════════════════════ */}
        <div className="mt-10 space-y-6">
          <h2 className="text-base font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1 h-5 bg-emerald-500 rounded-full" />
            Statistiques détaillées
          </h2>

          {/* ── Grille principale ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Barre de présence (occupe 2 colonnes) */}
            <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Présences du jour</h3>
                    <p className="text-sm text-slate-400">{presentToday} présents sur {totalEleves} élèves</p>
                  </div>
                </div>
                <span className={`text-2xl font-extrabold ${
                  tauxPresence >= 90 ? 'text-emerald-600' :
                  tauxPresence >= 75 ? 'text-amber-600' : 'text-red-600'
                }`}>{tauxPresence}%</span>
              </div>

              {/* Grande barre */}
              <div className="mb-6">
                <div className="w-full h-6 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      tauxPresence >= 90 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' :
                      tauxPresence >= 75 ? 'bg-gradient-to-r from-amber-500 to-amber-400' :
                      'bg-gradient-to-r from-red-500 to-red-400'
                    }`}
                    style={{ width: `${tauxPresence}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-400 mt-2">
                  <span>0%</span>
                  <span className="font-bold text-slate-600">{tauxPresence}% de présence</span>
                  <span>100%</span>
                </div>
              </div>

              {/* 3 compteurs */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Présents', val: presentToday, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: CheckCircle2 },
                  { label: 'Absents', val: absencesToday, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', icon: UserX },
                  { label: 'Taux', val: `${tauxPresence}%`, color: tauxPresence >= 90 ? 'text-emerald-600' : tauxPresence >= 75 ? 'text-amber-600' : 'text-red-600', bg: tauxPresence >= 90 ? 'bg-emerald-50' : tauxPresence >= 75 ? 'bg-amber-50' : 'bg-red-50', border: tauxPresence >= 90 ? 'border-emerald-200' : tauxPresence >= 75 ? 'border-amber-200' : 'border-red-200', icon: TrendingUp },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className={`${item.bg} border ${item.border} rounded-2xl p-5 text-center`}>
                      <Icon className={`w-6 h-6 ${item.color} mx-auto mb-2`} />
                      <p className={`text-3xl font-extrabold ${item.color}`}>{item.val}</p>
                      <p className="text-xs text-slate-500 font-semibold mt-1 uppercase tracking-wide">{item.label}</p>
                    </div>
                  );
                })}
              </div>

              {absencesToday > 3 && (
                <div className="mt-5 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-700 font-semibold">
                    Taux d'absence élevé aujourd'hui. Pensez à informer l'administration et à contacter les parents concernés.
                  </p>
                </div>
              )}
            </div>

            {/* Fiche classe (1 colonne) */}
            <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm flex flex-col gap-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Ma classe</h3>
                  <p className="text-sm text-slate-400">Informations générales</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 flex-1">
                {[
                  { label: 'Classe assignée', val: classeName },
                  { label: 'Effectif total', val: `${totalEleves} élèves` },
                  { label: 'Garçons', val: `${data?.stats?.garcons ?? '—'}` },
                  { label: 'Filles', val: `${data?.stats?.filles ?? '—'}` },
                  { label: 'Épreuves créées', val: `${devoirsEncours}` },
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl">
                    <span className="text-sm text-slate-500 font-medium">{row.label}</span>
                    <span className="font-bold text-slate-900 text-sm">{row.val}</span>
                  </div>
                ))}

                {moyenneClasse !== null && (
                  <div className="flex items-center justify-between px-4 py-4 bg-emerald-50 border border-emerald-200 rounded-xl mt-1">
                    <span className="text-sm text-emerald-700 font-bold">Moyenne de la classe</span>
                    <span className="text-2xl font-extrabold text-emerald-700">{moyenneClasse}<span className="text-sm font-semibold">/20</span></span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}

export default function TeacherDashboard() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}
