'use client';

import { TeacherHeader } from '@/components/teacher/teacher-header';
import { StatCard } from '@/components/teacher/stat-card';
import { QuickActions } from '@/components/teacher/quick-actions';
import { Users, UserX, BookOpen, Loader2, RefreshCw } from 'lucide-react';
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

  // Auto-refresh stats every 30 seconds to pick up new absences
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

  return (
    <main className="min-h-screen pb-10">
      <TeacherHeader 
        title="Tableau de bord" 
        subtitle={`Bienvenue, ${teacherName}`}
      />
      
      <div className="p-6">
        {/* Stats header with refresh */}
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

        {/* Stats Grid */}
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

        {/* Quick Actions */}
        <div className="mt-6">
          <QuickActions />
        </div>
      </div>
    </main>
  );
}

export default function TeacherDashboard() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Chargement...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
