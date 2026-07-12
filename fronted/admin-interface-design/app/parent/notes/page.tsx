'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { BookOpen, Loader2, AlertCircle, TrendingUp, TrendingDown, Star, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const API = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/legacy`;

function getColorClass(note: number) {
  if (note >= 16) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (note >= 12) return 'bg-blue-50 text-blue-700 border-blue-200';
  if (note >= 10) return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-red-50 text-red-700 border-red-200';
}

function getScoreIcon(note: number) {
  if (note >= 16) return <Star className="w-4 h-4 text-emerald-500 fill-emerald-500" />;
  if (note >= 12) return <TrendingUp className="w-4 h-4 text-blue-500" />;
  if (note >= 10) return <TrendingUp className="w-4 h-4 text-amber-500" />;
  return <TrendingDown className="w-4 h-4 text-red-500" />;
}

function NotesContent() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [terms, setTerms] = useState<{idTrimes: number, libelle: string}[]>([
    {idTrimes: 1, libelle: '1er Trimestre'},
    {idTrimes: 2, libelle: '2ème Trimestre'},
    {idTrimes: 3, libelle: '3ème Trimestre'}
  ]);
  const [selectedTerm, setSelectedTerm] = useState<string>('');

  useEffect(() => {
    const urlId = searchParams.get('userId');
    if (urlId) localStorage.setItem('parent_user_id', urlId);
    const userId = urlId || localStorage.getItem('parent_user_id');
    if (!userId) { setLoading(false); return; }

    const fetchContext = async () => {
      try {
        setLoading(true);

        const dRes = await fetch(`${API}/parent/${userId}/notes?term_id=${selectedTerm}&t=${Date.now()}`);
        if (dRes.ok) {
          const res = await dRes.json();
          setData(res.data || []);
          if (res.data?.length > 0 && !selectedChild) setSelectedChild(res.data[0].child.id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchContext();
  }, [searchParams, selectedTerm]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );

  const currentChild = data.find(d => d.child.id === selectedChild);

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-5xl mx-auto">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Carnet de Notes</h1>
            <p className="text-slate-500 text-sm font-medium mt-0.5">Suivi continu des évaluations</p>
          </div>
        </div>
        <div className="flex-shrink-0 min-w-[200px]">
          <select 
            value={selectedTerm}
            onChange={e => setSelectedTerm(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-700 shadow-sm"
          >
            <option value="">Tous les trimestres</option>
            {terms.map(t => (
              <option key={t.idTrimes} value={t.idTrimes}>{t.libelle}</option>
            ))}
          </select>
        </div>
      </div>

      {!data.length ? (
        <div className="flex flex-col items-center justify-center h-[40vh] gap-4 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center border-4 border-amber-100">
            <AlertCircle className="w-10 h-10 text-amber-500" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-slate-800">Aucune note disponible</h2>
            <p className="text-slate-500 mt-1 max-w-md">Les notes et évaluations apparaîtront ici dès qu'elles seront publiées par les enseignants.</p>
          </div>
        </div>
      ) : (
        <>
          {/* Sélecteur d'enfant */}
      {data.length > 1 && (
        <div className="flex flex-wrap gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
          {data.map(d => (
            <button
              key={d.child.id}
              onClick={() => setSelectedChild(d.child.id)}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex-1 md:flex-none justify-center",
                selectedChild === d.child.id
                  ? "bg-white text-blue-700 shadow-sm border border-slate-200 ring-2 ring-blue-500/20"
                  : "bg-transparent text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200"
              )}
            >
              <Avatar className={cn(
                "h-7 w-7 border-2",
                selectedChild === d.child.id ? "border-blue-200" : "border-slate-200"
              )}>
                <AvatarFallback className={cn(
                  "text-xs",
                  selectedChild === d.child.id ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"
                )}>
                  {d.child.nom?.[0]}{d.child.prenom?.[0]}
                </AvatarFallback>
              </Avatar>
              {d.child.name}
            </button>
          ))}
        </div>
      )}

      {/* Liste des notes par matière */}
      {currentChild && (
        <div className="space-y-6">
          {currentChild.subjects.length === 0 ? (
             <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 shadow-sm">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="font-medium">Aucune note enregistrée pour {currentChild.child.name}</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {currentChild.subjects.map((sub: any, i: number) => {
                const globalColor = getColorClass(sub.average);
                return (
                  <div key={i} className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group flex flex-col">
                    {/* Header de la matière */}
                    <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-2xl flex items-center justify-center border shadow-sm",
                            globalColor
                          )}>
                            <BookOpen className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-extrabold text-slate-900 text-lg">{sub.subject}</h3>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Coeff {sub.coefficient}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Moyenne</p>
                          <div className={cn("px-3 py-1 rounded-xl border font-black text-lg inline-flex items-center gap-1.5", globalColor)}>
                            {sub.average}/20
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Liste des évaluations */}
                    <div className="p-4 flex-1">
                      <div className="space-y-2">
                        {sub.notes.map((n: any, j: number) => {
                           const noteColor = getColorClass(n.value);
                           return (
                             <div key={j} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                               <div className="flex items-start gap-3">
                                 <div className={cn("w-8 h-8 rounded-full flex items-center justify-center border shrink-0 mt-0.5", noteColor)}>
                                   {getScoreIcon(n.value)}
                                 </div>
                                 <div>
                                   <p className="text-sm font-bold text-slate-800 line-clamp-1">{n.label}</p>
                                   <div className="flex items-center gap-2 mt-0.5">
                                     <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                                       <Calendar className="w-3 h-3" /> {n.date}
                                     </span>
                                   </div>
                                 </div>
                               </div>
                               <div className={cn("px-2.5 py-1 rounded-lg border text-sm font-black shrink-0", noteColor)}>
                                 {n.value}/{n.max}
                               </div>
                             </div>
                           );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      </>
      )}
    </div>
  );
}

export default function NotesPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>}>
      <NotesContent />
    </Suspense>
  );
}
