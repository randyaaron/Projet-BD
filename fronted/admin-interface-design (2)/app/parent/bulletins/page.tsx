'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { FileText, Loader2, AlertCircle, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const API = 'http://localhost:8000/api/legacy';

function BulletinsContent() {
  const searchParams = useSearchParams();
  const [bulletins, setBulletins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const urlId = searchParams.get('userId');
    if (urlId) localStorage.setItem('parent_user_id', urlId);
    const userId = urlId || localStorage.getItem('parent_user_id');
    if (!userId) { setLoading(false); return; }

    fetch(`${API}/parent/${userId}/bulletins`)
      .then(r => r.json())
      .then(res => setBulletins(res.bulletins || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [searchParams]);

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;

  function avgColor(avg: number) {
    if (avg >= 15) return 'bg-emerald-100 text-emerald-700';
    if (avg >= 10) return 'bg-amber-100 text-amber-700';
    return 'bg-red-100 text-red-700';
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Bulletins scolaires</h1>
        <p className="text-slate-500 text-sm mt-1">Relevés de notes par trimestre</p>
      </div>

      {bulletins.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 flex flex-col items-center gap-3 text-slate-400">
          <AlertCircle className="w-12 h-12 text-amber-200" />
          <p className="font-medium">Aucun bulletin disponible pour le moment</p>
          <p className="text-sm">Les bulletins apparaîtront ici à la fin de chaque trimestre</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {bulletins.map((b: any) => (
            <div key={b.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all hover:border-amber-200">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12 border-2 border-amber-200">
                  <AvatarFallback className="bg-amber-100 text-amber-700 font-bold">
                    {b.child?.nom?.[0]}{b.child?.prenom?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{b.child?.name}</p>
                      <p className="text-xs text-slate-500">{b.child?.class} — {b.annee}</p>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700">Disponible</Badge>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="text-center p-2 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-400">Trimestre</p>
                      <p className="text-sm font-semibold text-slate-700">{b.trimestre}</p>
                    </div>
                    <div className={`text-center p-2 rounded-lg ${avgColor(b.average)}`}>
                      <p className="text-xs opacity-70">Moyenne</p>
                      <p className="text-lg font-bold">{b.average}/20</p>
                    </div>
                    <div className="text-center p-2 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-400">Matières</p>
                      <p className="text-sm font-semibold text-slate-700">{b.totalMatières}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BulletinsPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>}>
      <BulletinsContent />
    </Suspense>
  );
}
