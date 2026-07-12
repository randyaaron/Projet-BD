'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CreditCard, CheckCircle, Loader2, AlertCircle, Wallet, Bell, Clock, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const API = '${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/legacy';

// Hardcoded due dates for each tranche (day/month)
// Tranche 1: Oct 15, Tranche 2: Jan 15, Tranche 3: Apr 15
const TRANCHES = [
  { label: 'Tranche 1', dueDay: 15, dueMonth: 10 }, // octobre
  { label: 'Tranche 2', dueDay: 15, dueMonth: 1  }, // janvier
  { label: 'Tranche 3', dueDay: 15, dueMonth: 4  }, // avril
];

function getDaysUntil(dueDay: number, dueMonth: number): number {
  const now = new Date();
  const year = (dueMonth < now.getMonth() + 1) ? now.getFullYear() + 1 : now.getFullYear();
  const due = new Date(year, dueMonth - 1, dueDay);
  return Math.round((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function PaymentAlert({ paiements }: { paiements: any[] }) {
  const alerts: { label: string; daysLeft: number; overdue: boolean }[] = [];

  TRANCHES.forEach(t => {
    const alreadyPaid = paiements.some(p =>
      String(p.label || '').includes(t.label) || String(p.comentaire || '').includes(t.label)
    );
    if (alreadyPaid) return;

    const daysLeft = getDaysUntil(t.dueDay, t.dueMonth);
    // Warn if within 30 days or overdue
    if (daysLeft <= 30) {
      alerts.push({ label: t.label, daysLeft, overdue: daysLeft < 0 });
    }
  });

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3">
      {alerts.map(a => (
        <div
          key={a.label}
          className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${
            a.overdue
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}
        >
          <div className="flex-shrink-0 mt-0.5">
            {a.overdue ? <AlertTriangle className="w-5 h-5 text-red-500" /> : <Bell className="w-5 h-5 text-amber-500" />}
          </div>
          <div>
            <p className="font-bold text-sm">
              {a.overdue
                ? `⚠️ ${a.label} — En retard de ${Math.abs(a.daysLeft)} jour(s) !`
                : `🔔 ${a.label} — Échéance dans ${a.daysLeft} jour(s)`}
            </p>
            <p className="text-xs mt-0.5 opacity-80">
              {a.overdue
                ? 'Veuillez régulariser ce paiement au plus tôt auprès de l\'intendance.'
                : 'Pensez à effectuer ce paiement avant la date limite pour éviter des pénalités.'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function PaiementsContent() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<any>({ paiements: [], children: [] });
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const urlId = searchParams.get('userId');
    if (urlId) localStorage.setItem('parent_user_id', urlId);
    const userId = urlId || localStorage.getItem('parent_user_id');
    if (!userId) { setLoading(false); return; }

    fetch(`${API}/parent/${userId}/paiements`)
      .then(r => r.json())
      .then(res => {
        setData(res);
        const t = (res.paiements || []).reduce((s: number, p: any) => s + (p.amount || 0), 0);
        setTotal(t);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [searchParams]);

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;

  const { paiements, children } = data;

  const typeColor = (label: string) => {
    if (!label) return 'bg-slate-100 text-slate-600';
    if (label.includes('inscription')) return 'bg-violet-100 text-violet-700';
    if (label.includes('Tranche 1')) return 'bg-blue-100 text-blue-700';
    if (label.includes('Tranche 2')) return 'bg-amber-100 text-amber-700';
    if (label.includes('Tranche 3')) return 'bg-emerald-100 text-emerald-700';
    return 'bg-slate-100 text-slate-600';
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Paiements</h1>
        <p className="text-slate-500 text-sm mt-1">Historique des règlements de frais scolaires</p>
      </div>

      {/* Alertes d'échéance */}
      <PaymentAlert paiements={paiements} />

      {/* Résumé */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
            <CheckCircle className="h-6 w-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Paiements effectués</p>
            <p className="text-2xl font-bold text-slate-900">{paiements.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
            <Wallet className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Total versé</p>
            <p className="text-2xl font-bold text-slate-900">{total.toLocaleString()} FCFA</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
            <CreditCard className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Enfants suivis</p>
            <p className="text-2xl font-bold text-slate-900">{children.length}</p>
          </div>
        </div>
      </div>

      {/* Calendrier des tranches */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <h2 className="font-semibold text-slate-800">Calendrier des paiements 2025/2026</h2>
        </div>
        <div className="grid grid-cols-3 divide-x divide-slate-100">
          {[
            { label: 'Tranche 1', date: '15 Octobre 2025',  color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Tranche 2', date: '15 Janvier 2026',  color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Tranche 3', date: '15 Avril 2026',    color: 'text-emerald-600', bg: 'bg-emerald-50' },
          ].map(t => {
            const paid = paiements.some(p => String(p.label || '').includes(t.label));
            return (
              <div key={t.label} className="p-4 flex flex-col items-center text-center gap-2">
                <div className={`w-10 h-10 rounded-full ${t.bg} flex items-center justify-center`}>
                  {paid
                    ? <CheckCircle className={`w-5 h-5 ${t.color}`} />
                    : <AlertCircle className="w-5 h-5 text-slate-400" />}
                </div>
                <p className="font-semibold text-slate-900 text-sm">{t.label}</p>
                <p className="text-xs text-slate-500">{t.date}</p>
                <Badge className={paid ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}>
                  {paid ? 'Payé' : 'En attente'}
                </Badge>
              </div>
            );
          })}
        </div>
      </div>

      {/* Liste des paiements */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 bg-gradient-to-r from-amber-500 to-amber-600">
          <h2 className="font-semibold text-white">Historique des paiements</h2>
        </div>
        {paiements.length === 0 ? (
          <div className="p-8 flex flex-col items-center gap-3 text-slate-400">
            <AlertCircle className="w-10 h-10 text-amber-300" />
            <p>Aucun paiement enregistré</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {paiements.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{p.label}</p>
                    <p className="text-xs text-slate-400">{p.child} — {p.date} — {p.mode}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeColor(p.label)}`}>{
                    p.label?.includes('inscription') ? 'Inscription' :
                    p.label?.includes('Tranche') ? p.label.match(/Tranche \d/)?.[0] : 'Autre'
                  }</span>
                  <p className="text-sm font-bold text-slate-900">{p.amount.toLocaleString()} FCFA</p>
                  <Badge className="bg-emerald-100 text-emerald-700">Payé</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaiementsPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>}>
      <PaiementsContent />
    </Suspense>
  );
}
