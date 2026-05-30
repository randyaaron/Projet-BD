'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { BookOpen, TrendingUp, TrendingDown, Loader2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const API = 'http://localhost:8000/api/legacy';

function getColor(note: number) {
  if (note >= 16) return 'bg-emerald-100 text-emerald-700';
  if (note >= 12) return 'bg-amber-100 text-amber-700';
  if (note >= 8)  return 'bg-orange-100 text-orange-700';
  return 'bg-red-100 text-red-700';
}

function NotesContent() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);

  useEffect(() => {
    const urlId = searchParams.get('userId');
    if (urlId) localStorage.setItem('parent_user_id', urlId);
    const userId = urlId || localStorage.getItem('parent_user_id');
    if (!userId) { setLoading(false); return; }

    fetch(`${API}/parent/${userId}/notes`)
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
      <p className="font-medium">Aucune note disponible pour le moment</p>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Notes & Évaluations</h1>
        <p className="text-slate-500 text-sm mt-1">Résultats scolaires de vos enfants</p>
      </div>

      {/* Sélecteur d'enfant */}
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

      {/* Notes par matière */}
      {currentChild && (
        <div className="space-y-4">
          {currentChild.subjects.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400">
              Aucune note enregistrée pour {currentChild.child.name}
            </div>
          ) : (
            currentChild.subjects.map((sub: any, i: number) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100">
                      <BookOpen className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{sub.subject}</p>
                      <p className="text-xs text-slate-500">Coeff. {sub.coefficient}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Moyenne</p>
                    <p className={`text-lg font-bold px-2 py-0.5 rounded-lg inline-block ${getColor(sub.average)}`}>
                      {sub.average}/20
                    </p>
                  </div>
                </div>
                <div className="divide-y divide-slate-50">
                  {sub.notes.map((n: any, j: number) => (
                    <div key={j} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{n.label}</p>
                        <p className="text-xs text-slate-400">{n.date} — {n.teacher}</p>
                      </div>
                      <Badge className={getColor(n.value)}>
                        {n.value}/{n.max}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function NotesPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>}>
      <NotesContent />
    </Suspense>
  );
}
