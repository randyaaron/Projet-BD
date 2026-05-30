'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CreditCard, CheckCircle, Loader2, AlertCircle, Wallet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const API = 'http://localhost:8000/api/legacy';

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

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Paiements</h1>
        <p className="text-slate-500 text-sm mt-1">Historique des règlements de frais scolaires</p>
      </div>

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
