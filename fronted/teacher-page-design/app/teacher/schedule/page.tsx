'use client';

import { useState, useEffect, useMemo } from 'react';
import { TeacherHeader } from '@/components/teacher/teacher-header';
import { Loader2, Clock } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
const CRENEAUX = ['07:30', '08:30', '09:30', '10:00', '11:00', '12:00', '13:30', '14:30', '15:30', '16:30'];

const COURS_COLORS = [
  'bg-blue-50 border-blue-200 text-blue-800',
  'bg-emerald-50 border-emerald-200 text-emerald-800',
  'bg-purple-50 border-purple-200 text-purple-800',
  'bg-amber-50 border-amber-200 text-amber-800',
  'bg-red-50 border-red-200 text-red-800',
  'bg-pink-50 border-pink-200 text-pink-800',
  'bg-indigo-50 border-indigo-200 text-indigo-800',
  'bg-teal-50 border-teal-200 text-teal-800',
  'bg-orange-50 border-orange-200 text-orange-800',
  'bg-cyan-50 border-cyan-200 text-cyan-800',
];

export default function SchedulePage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [scheduleData, setScheduleData] = useState<any[]>([]);
  const [teacherClass, setTeacherClass] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let userId = searchParams.get('userId');
    if (!userId && typeof window !== 'undefined') {
      userId = localStorage.getItem('user_id');
    }
    const uid = userId;
    
    if (uid && typeof window !== 'undefined') {
      localStorage.setItem('user_id', uid);
    }

    const fetchSchedule = async () => {
      if (!uid) {
        setErrorMsg('Aucun utilisateur identifié. Veuillez vous reconnecter.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:8000/api/legacy/teacher/dashboard/full/${uid}`);
        if (!res.ok) throw new Error('Erreur de réseau ou serveur.');
        const data = await res.json();
        setScheduleData(data.schedule || []);
        setTeacherClass(data.classe || '');
      } catch (err) {
        console.error(err);
        setErrorMsg('Impossible de charger l\'emploi du temps.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSchedule();
  }, [searchParams]);

  const { getSlot, coursColorMap } = useMemo(() => {
    if (!scheduleData.length) return { getSlot: () => null, coursColorMap: {} };

    const uniqueIds = Array.from(new Set(scheduleData.map((s: any) => s.idCours || s.subject)));
    
    const colorMap: Record<string, string> = {};
    uniqueIds.forEach((id, idx) => {
      colorMap[String(id)] = COURS_COLORS[idx % COURS_COLORS.length];
    });

    const getSlot = (jour: string, heure: string) => {
      return scheduleData.find(s => s.jour === jour && s.heure === heure);
    };

    return { getSlot, coursColorMap: colorMap };
  }, [scheduleData]);

  return (
    <main className="min-h-screen pb-10">
      <TeacherHeader 
        title={`Emploi du temps ${teacherClass ? `- ${teacherClass}` : ''}`}
        subtitle="Mon planning de la semaine"
      />
      
      <div className="p-6">
        {errorMsg && (
          <div className="mb-4 rounded-xl bg-red-50 p-4 text-red-600 text-sm font-medium border border-red-200">
            {errorMsg}
          </div>
        )}

        {loading ? (
          <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-20 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mb-4" />
            <p>Chargement de votre emploi du temps...</p>
          </div>
        ) : (
          <>
            {scheduleData.length === 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-6 text-amber-700 text-sm text-center">
                Aucun cours assigné. Contactez l'administration pour construire votre emploi du temps.
              </div>
            ) : (
              <>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
                  <table className="w-full text-sm min-w-[700px]">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50">
                        <th className="px-4 py-3 text-left text-slate-500 text-xs uppercase tracking-wide w-28" style={{ fontWeight: 600 }}>
                          <Clock className="w-3.5 h-3.5 inline mr-1" />Heure
                        </th>
                        {JOURS.map(j => (
                          <th key={j} className="px-3 py-3 text-center text-slate-700 text-xs uppercase tracking-wide" style={{ fontWeight: 600 }}>{j}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {CRENEAUX.map((heure, idx) => (
                        <tr key={heure} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-2.5 text-slate-400 text-[13px]" style={{ fontWeight: 600 }}>
                            {heure} – {CRENEAUX[idx + 1] || '17:30'}
                          </td>
                          {JOURS.map(jour => {
                            const slot = getSlot(jour, heure);
                            return (
                              <td key={jour} className="px-2 py-1.5">
                                {slot ? (
                                  <div className={`rounded-lg border px-2 py-2 min-h-[3.5rem] flex items-center justify-center text-center shadow-sm ${coursColorMap[slot.idCours || slot.subject] || COURS_COLORS[0]}`}>
                                    <p className="text-[13px]" style={{ fontWeight: 700 }}>{slot.subject || slot.coursLibelle}</p>
                                  </div>
                                ) : (
                                  <div className="min-h-[3.5rem] rounded-lg border border-dashed border-slate-200 bg-slate-50/30"></div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Légende */}
                <div className="mt-6 flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Légende :</span>
                  {Object.entries(coursColorMap).map(([id, cls]) => {
                    const slot = scheduleData.find(s => String(s.idCours || s.subject) === id);
                    return slot ? (
                      <span key={id} className={`px-2.5 py-1 rounded-md text-xs border ${cls}`} style={{ fontWeight: 600 }}>
                        {slot.subject || slot.coursLibelle}
                      </span>
                    ) : null;
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}
