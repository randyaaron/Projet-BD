'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, AlertCircle, ShieldAlert } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const API = '${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/legacy';

function DisciplineContent() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);

  useEffect(() => {
    const urlId = searchParams.get('userId');
    if (urlId) localStorage.setItem('parent_user_id', urlId);
    const userId = urlId || localStorage.getItem('parent_user_id');
    if (!userId) { setLoading(false); return; }

    fetch(`${API}/parent/${userId}/discipline`)
      .then(r => r.json())
      .then(res => {
        setData(res.data || []);
        if (res.data?.length > 0) setSelectedChild(res.data[0].child.id);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [searchParams]);

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;

  const currentChild = data.find(d => d.child.id === selectedChild);

  if (!data.length) return (
    <div className="p-6 flex flex-col items-center justify-center h-64 gap-3 text-slate-500">
      <AlertCircle className="w-10 h-10 text-amber-300" />
      <p className="font-medium">Aucun dossier disciplinaire disponible</p>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Discipline & Absences</h1>
        <p className="text-slate-500 text-sm mt-1">Dossier disciplinaire de vos enfants</p>
      </div>

      {data.length > 1 && (
        <div className="flex gap-3">
          {data.map(d => (
            <button
              key={d.child.id}
              onClick={() => setSelectedChild(d.child.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                selectedChild === d.child.id
                  ? 'bg-amber-500 text-white border-amber-500 shadow'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300'
              }`}
            >
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs bg-amber-100 text-amber-700">
                  {d.child.nom?.[0]}{d.child.prenom?.[0]}
                </AvatarFallback>
              </Avatar>
              {d.child.name}
            </button>
          ))}
        </div>
      )}

      {currentChild && (
        <div className="space-y-4">
          {currentChild.sanctions.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400">
              Aucune sanction ou absence enregistrée pour {currentChild.child.name}. Tout va bien !
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100">
                    <ShieldAlert className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Sanctions récentes</p>
                    <p className="text-xs text-slate-500">Historique disciplinaire</p>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-slate-50">
                {currentChild.sanctions.map((s: any, j: number) => (
                  <div key={j} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{s.motif}</p>
                      <p className="text-xs text-slate-400 mt-1">{s.date}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                        -{s.points} points
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DisciplinePage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>}>
      <DisciplineContent />
    </Suspense>
  );
}
