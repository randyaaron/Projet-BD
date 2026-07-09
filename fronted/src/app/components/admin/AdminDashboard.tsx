import { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  Users, GraduationCap, BookOpen, TrendingUp, TrendingDown,
  UserPlus, CreditCard, ChevronRight, AlertCircle, CheckCircle2,
  Clock, CalendarCheck,
} from 'lucide-react';
import { legacyFetch } from '../../lib/legacyApi';

const statuts: Record<string, { label: string; cls: string }> = {
  nouveau:    { label: 'Nouveau',     cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  transfert:  { label: 'Transfert',   cls: 'bg-purple-50 text-purple-700 border-purple-200' },
  redoublant: { label: 'Redoublant',  cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  attente:    { label: 'En attente',  cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  payé:       { label: 'Payé',        cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  partiel:    { label: 'Partiel',     cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  impayé:     { label: 'Impayé',      cls: 'bg-red-50 text-red-700 border-red-200' },
};

interface KpiCardProps {
  label: string;
  value: string | number;
  sub: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

function KpiCard({ label, value, sub, trend, icon: Icon, iconBg, iconColor }: KpiCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4 shadow-sm">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-slate-500 text-xs uppercase tracking-wide">{label}</p>
        <p className="text-slate-900 mt-0.5" style={{ fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.1 }}>
          {value}
        </p>
        <div className="flex items-center gap-1 mt-1">
          {trend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />}
          {trend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-red-500" />}
          <p className={`text-xs ${trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-500' : 'text-slate-400'}`}>
            {sub}
          </p>
        </div>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-lg text-sm">
      <p className="text-slate-500 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-700" style={{ fontWeight: 600 }}>{p.value}</span>
          <span className="text-slate-400">{p.name}</span>
        </div>
      ))}
    </div>
  );
}

export function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    legacyFetch<any>('http://localhost:8000/api/legacy/dashboard-stats')
      .then((res: any) => {
        setData(res);
        setLoading(false);
      })
      .catch((err: any) => {
        console.error("Erreur chargement dashboard", err);
        setLoading(false);
      });
  }, []);

  const today = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date());

  if (loading) {
    return <div className="p-6">Chargement des statistiques du tableau de bord...</div>;
  }

  const rawRole = (localStorage.getItem('legacy_admin_type_label') || '').toLowerCase();
  const hideRecentPayments = ['root', 'directeur'].includes(rawRole);

  const { stats, recentInscriptions, recentPaiements, weeklyAttendance, cycleData, totalsGender } = data || {};

  return (
    <div className="p-6 space-y-6 overflow-y-auto">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900" style={{ fontSize: '1.375rem', fontWeight: 700, lineHeight: 1.3 }}>
            Tableau de bord
          </h1>
          <p className="text-slate-500 text-sm mt-0.5 capitalize">{today}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm hover:bg-slate-50 transition-colors shadow-sm">
            <CalendarCheck className="w-4 h-4" />
            Semestre 1 — 2025/2026
          </button>
        </div>

      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          label="Élèves inscrits"
          value={stats?.totalEleves || 0}
          sub="Total enregistré"
          trend="up"
          icon={Users}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <KpiCard
          label="Enseignants actifs"
          value={stats?.totalEnseignants || 0}
          sub="Équipe pédagogique"
          trend="neutral"
          icon={GraduationCap}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
        />
        <KpiCard
          label="Classes actives"
          value={stats?.totalClasses || 0}
          sub="Réparties en cycles"
          trend="neutral"
          icon={BookOpen}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <KpiCard
          label="Taux de présence estimé"
          value={stats?.tauxPresence || '0%'}
          sub="Calculé aujourd'hui"
          trend="up"
          icon={CheckCircle2}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <div className="xl:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-slate-900 text-sm" style={{ fontWeight: 700 }}>Présences — Semaine en cours</h2>
              <p className="text-slate-400 text-xs mt-0.5">Élèves présents vs absents</p>
            </div>
            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-lg border border-blue-200" style={{ fontWeight: 600 }}>
              Semestre 1
            </span>
          </div>
          {(!weeklyAttendance || weeklyAttendance.length === 0 || weeklyAttendance.every((d: any) => d.presents === 0 && d.absents === 0)) ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-300">
              <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              <p className="text-sm font-medium text-slate-400">Aucune présence enregistrée</p>
              <p className="text-xs text-slate-300 mt-1">Les données apparaîtront dès que les enseignants enregistreront les présences</p>
            </div>
          ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weeklyAttendance} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="presentsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="absentsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="jour" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="presents" name="Présents" stroke="#2563EB" strokeWidth={2} fill="url(#presentsGrad)" />
              <Area type="monotone" dataKey="absents"  name="Absents"  stroke="#EF4444" strokeWidth={2} fill="url(#absentsGrad)" />
            </AreaChart>
          </ResponsiveContainer>
          )}

        </div>

        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="mb-4">
            <h2 className="text-slate-900 text-sm" style={{ fontWeight: 700 }}>Répartition par cycle</h2>
            <p className="text-slate-400 text-xs mt-0.5">Filles / Garçons</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={cycleData || []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={10}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="cycle" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="filles"  name="Filles"   fill="#818CF8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="garçons" name="Garçons"  fill="#2563EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
              <span className="text-xs text-slate-500">Filles · {totalsGender?.filles || 0}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <span className="text-xs text-slate-500">Garçons · {totalsGender?.garcons || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <h2 className="text-slate-900 text-sm" style={{ fontWeight: 700 }}>Dernières inscriptions</h2>
              <p className="text-slate-400 text-xs mt-0.5">5 récentes de la Base de données</p>
            </div>
            <button className="flex items-center gap-1 text-blue-600 text-xs hover:text-blue-700 transition-colors" style={{ fontWeight: 600 }}>
              Voir tout <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {recentInscriptions?.map((el: any) => (
              <div key={el.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-700 text-xs" style={{ fontWeight: 700 }}>
                  {el.nom.split(' ').map((n:string) => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-800 text-sm truncate" style={{ fontWeight: 600 }}>{el.nom}</p>
                  <p className="text-slate-400 text-xs">{el.classe} · {el.date}</p>
                </div>
                {statuts[el.statut] && (
                <span className={`px-2 py-0.5 rounded-full text-xs border ${statuts[el.statut].cls}`} style={{ fontWeight: 600 }}>
                  {statuts[el.statut].label}
                </span>
                )}
              </div>
            ))}
            {!recentInscriptions?.length && (
              <div className="px-5 py-4 text-center text-sm text-slate-500">Aucune inscription trouvée.</div>
            )}
          </div>
        </div>

        {!hideRecentPayments && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-slate-900 text-sm" style={{ fontWeight: 700 }}>Paiements récents</h2>
                <p className="text-slate-400 text-xs mt-0.5">Historique de la table Paiement</p>
              </div>
              <button className="flex items-center gap-1 text-blue-600 text-xs hover:text-blue-700 transition-colors" style={{ fontWeight: 600 }}>
                Voir tout <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="divide-y divide-slate-50">
              {recentPaiements?.map((p: any) => (
                <div key={p.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    p.statut === 'payé' ? 'bg-emerald-50' : p.statut === 'partiel' ? 'bg-amber-50' : 'bg-red-50'
                  }`}>
                    {p.statut === 'payé'
                      ? <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      : p.statut === 'partiel'
                      ? <Clock className="w-4 h-4 text-amber-600" />
                      : <AlertCircle className="w-4 h-4 text-red-500" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-800 text-sm truncate" style={{ fontWeight: 600 }}>{p.eleve}</p>
                    <p className="text-slate-400 text-xs">{p.parent} · {p.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-800 text-sm" style={{ fontWeight: 700 }}>{p.montant}</p>
                    {statuts[p.statut] && (
                    <span className={`text-xs ${statuts[p.statut].cls} px-2 py-0.5 rounded-full border`} style={{ fontWeight: 600 }}>
                      {statuts[p.statut].label}
                    </span>
                    )}
                  </div>
                </div>
              ))}
              {!recentPaiements?.length && (
                <div className="px-5 py-4 text-center text-sm text-slate-500">Aucun paiement récent.</div>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
