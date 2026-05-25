'use client';

import { useState, useEffect } from 'react';
import { TeacherHeader } from '@/components/teacher/teacher-header';
import { cn } from '@/lib/utils';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  Clock,
  CalendarDays,
  FileText,
  Loader2,
  X
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Subject {
  id: number;
  libelle: string;
}

interface Assessment {
  id: number;
  title: string;
  type: string;
  date: string;
  total_points: number;
  subject_id: number;
}

export default function HomeworkPage() {
  const searchParams = useSearchParams();
  const [uid, setUid] = useState<string | null>(null);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);

  const [fetching, setFetching] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newAss, setNewAss] = useState({
    title: '',
    subject_id: '',
    type: 'Devoir',
    total_points: '20',
    date: '',
    duration: '' // Kept for UI completeness, backend ignores it
  });

  useEffect(() => {
    let userId = searchParams.get('userId');
    if (!userId && typeof window !== 'undefined') {
      userId = localStorage.getItem('user_id');
    }
    setUid(userId);
  }, [searchParams]);

  useEffect(() => {
    if (!uid) return;

    const fetchContext = async () => {
      try {
        setFetching(true);
        const res = await fetch(`http://localhost:8000/api/legacy/teacher/assessments/context/${uid}`);
        if (!res.ok) throw new Error('Erreur de chargement');
        const data = await res.json();

        if (data.error) {
          setErrorMsg(data.error);
          return;
        }

        setSubjects(data.subjects || []);
        setAssessments(data.assessments || []);
      } catch (err) {
        console.error(err);
        setErrorMsg('Impossible de charger les données.');
      } finally {
        setFetching(false);
      }
    };

    fetchContext();
  }, [uid]);

  const handleCreate = async () => {
    if (!uid) return;
    if (!newAss.title || !newAss.subject_id || !newAss.date) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`http://localhost:8000/api/legacy/teacher/assessments/${uid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAss)
      });
      if (!res.ok) throw new Error('Erreur création');

      const data = await res.json();

      // Update local list
      setAssessments(prev => [{
        id: data.id,
        title: newAss.title,
        type: newAss.type,
        date: newAss.date,
        total_points: parseFloat(newAss.total_points),
        subject_id: parseInt(newAss.subject_id)
      }, ...prev]);

      setShowModal(false);
      setNewAss({ title: '', subject_id: '', type: 'Devoir', total_points: '20', date: '', duration: '' });
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la création.');
    } finally {
      setSaving(false);
    }
  };

  const getSubjectName = (id: number) => {
    const s = subjects.find(s => s.id === id);
    return s ? s.libelle : 'Matière inconnue';
  };

  const getTypeStyle = (type: string) => {
    switch (type.toLowerCase()) {
      case 'devoir': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'contrôle': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'examen': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <main className="min-h-screen bg-slate-50/50 pb-10">
      <TeacherHeader
        title="Devoirs et Évaluations"
        subtitle="Gérez les épreuves de votre classe"
      />

      <div className="p-6 max-w-7xl mx-auto">

        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 min-w-[200px]">
              <p className="text-sm text-slate-500">Total épreuves</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{assessments.length}</p>
            </div>
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 min-w-[200px]">
              <p className="text-sm text-blue-700">Devoirs</p>
              <p className="mt-1 text-2xl font-bold text-blue-900">
                {assessments.filter(a => a.type.toLowerCase() === 'devoir').length}
              </p>
            </div>
          </div>

          <Button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-sm rounded-xl py-6"
          >
            <Plus className="h-5 w-5" />
            Créer une épreuve
          </Button>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 border border-red-200 text-sm font-medium">
            {errorMsg}
          </div>
        )}

        {/* List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Épreuve</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Barème</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fetching ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-slate-400">
                      <div className="flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
                      <p className="mt-2">Chargement...</p>
                    </td>
                  </tr>
                ) : assessments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-slate-400 italic">
                      Aucune épreuve créée pour l'instant.
                    </td>
                  </tr>
                ) : (
                  assessments.map(ass => (
                    <tr key={ass.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{ass.title}</p>
                            <p className="text-xs text-slate-500">{getSubjectName(ass.subject_id)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn("px-2.5 py-1 rounded-md text-xs font-semibold border", getTypeStyle(ass.type))}>
                          {ass.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-600 font-medium">
                          <CalendarDays className="w-4 h-4 text-slate-400" />
                          {ass.date ? format(new Date(ass.date), 'dd MMM yyyy', { locale: fr }) : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-700">/ {ass.total_points}</div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Créer une épreuve</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-2 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Titre de l'épreuve *</label>
                <Input
                  placeholder="Ex : Devoir de Mathématiques N°2"
                  value={newAss.title}
                  onChange={e => setNewAss({ ...newAss, title: e.target.value })}
                  className="bg-slate-50 border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Matière *</label>
                  <select
                    value={newAss.subject_id}
                    onChange={e => setNewAss({ ...newAss, subject_id: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-slate-200 bg-slate-50 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Sélectionner...</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.libelle}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Type *</label>
                  <select
                    value={newAss.type}
                    onChange={e => setNewAss({ ...newAss, type: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-slate-200 bg-slate-50 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  >
                    <option value="Devoir">Devoir</option>
                    <option value="Contrôle">Contrôle</option>
                    <option value="Examen">Examen</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Date *</label>
                  <Input
                    type="date"
                    value={newAss.date}
                    onChange={e => setNewAss({ ...newAss, date: e.target.value })}
                    className="bg-slate-50 border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Durée (optionnel)</label>
                  <Input
                    placeholder="Ex : 2h"
                    value={newAss.duration}
                    onChange={e => setNewAss({ ...newAss, duration: e.target.value })}
                    className="bg-slate-50 border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Barème (/)</label>
                <Input
                  type="number"
                  min="1"
                  value={newAss.total_points}
                  onChange={e => setNewAss({ ...newAss, total_points: e.target.value })}
                  className="bg-slate-50 border-slate-200 w-1/3"
                />
              </div>

            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowModal(false)} className="text-slate-600 hover:bg-slate-200">
                Annuler
              </Button>
              <Button onClick={handleCreate} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px]">
                {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Création...</> : "Créer l'épreuve"}
              </Button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
