'use client';

import { useState, useEffect } from 'react';
import { TeacherHeader } from '@/components/teacher/teacher-header';
import { cn } from '@/lib/utils';
import { 
  Check,
  X,
  Clock,
  Loader2,
  CalendarDays,
  UserCircle
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Student {
  matricule: number;
  nom: string;
  prenom: string;
  sexe: string;
}

interface Attendance {
  id: number;
  student_id: number;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
}

export default function AbsencesPage() {
  const searchParams = useSearchParams();
  const [students, setStudents] = useState<Student[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  
  const [fetching, setFetching] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Date du jour par défaut
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [uid, setUid] = useState<string | null>(null);

  // Status de chargement pour chaque élève
  const [loadingMap, setLoadingMap] = useState<Record<number, boolean>>({});

  useEffect(() => {
    let userId = searchParams.get('userId');
    if (!userId && typeof window !== 'undefined') {
      userId = localStorage.getItem('user_id');
    }
    setUid(userId);
    
    if (userId && typeof window !== 'undefined') {
      localStorage.setItem('user_id', userId);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!uid) return;

    const fetchContext = async () => {
      try {
        setFetching(true);
        const res = await fetch(`http://localhost:8000/api/legacy/teacher/attendance/context/${uid}`);
        if (!res.ok) throw new Error('Erreur lors du chargement des données.');
        
        const data = await res.json();
        if (data.error) {
          setErrorMsg(data.error);
          return;
        }

        setStudents(data.students || []);
        setAttendances(data.attendances || []);
      } catch (err) {
        console.error(err);
        setErrorMsg('Impossible de charger la liste des élèves.');
      } finally {
        setFetching(false);
      }
    };

    fetchContext();
  }, [uid]);

  const handleStatusChange = async (matricule: number, newStatus: 'PRESENT' | 'ABSENT' | 'LATE') => {
    if (!uid) return;
    
    setLoadingMap(prev => ({ ...prev, [matricule]: true }));

    try {
      const res = await fetch(`http://localhost:8000/api/legacy/teacher/attendance/student/${matricule}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, date: selectedDate, status: newStatus })
      });

      if (!res.ok) throw new Error('Erreur de sauvegarde');
      
      // Update local state immediately
      setAttendances(prev => {
        const filtered = prev.filter(a => !(a.student_id === matricule && a.date === selectedDate));
        return [...filtered, { id: Date.now(), student_id: matricule, date: selectedDate, status: newStatus }];
      });

    } catch (err) {
      console.error(err);
      alert('Erreur lors de la mise à jour de la présence.');
    } finally {
      setLoadingMap(prev => ({ ...prev, [matricule]: false }));
    }
  };

  // Calculate stats for the selected date
  const dayAttendances = attendances.filter(a => a.date === selectedDate);
  const stats = {
    total: students.length,
    presents: students.length - dayAttendances.filter(a => a.status === 'ABSENT' || a.status === 'LATE').length, // By default present
    absents: dayAttendances.filter(a => a.status === 'ABSENT').length,
    retards: dayAttendances.filter(a => a.status === 'LATE').length,
  };

  return (
    <main className="min-h-screen bg-slate-50/50 pb-10">
      <TeacherHeader 
        title="Appel et Présences" 
        subtitle="Signaler les absences et les retards"
      />
      
      <div className="p-6 max-w-5xl mx-auto">
        
        {/* Date Selector & Stats */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Date de l'appel</p>
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="mt-1 font-bold text-slate-900 border-none p-0 focus:ring-0 cursor-pointer bg-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-4 sm:gap-8">
            <div className="text-center">
              <p className="text-sm text-slate-500">Effectif</p>
              <p className="text-xl font-bold text-slate-900">{stats.total}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-emerald-600">Présents</p>
              <p className="text-xl font-bold text-emerald-700">{stats.presents}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-rose-600">Absents</p>
              <p className="text-xl font-bold text-rose-700">{stats.absents}</p>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 border border-red-200 text-sm font-medium">
            {errorMsg}
          </div>
        )}

        {/* Students List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h2 className="font-bold text-slate-700">Liste des élèves</h2>
            <p className="text-xs text-slate-500 italic">L'enregistrement est automatique lors du clic</p>
          </div>

          {fetching ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
              <p>Chargement de la liste d'appel...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="py-16 text-center text-slate-500 italic">
              Aucun élève n'est assigné à votre classe.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {students.map((student, idx) => {
                // Determine current status
                const att = attendances.find(a => a.student_id === student.matricule && a.date === selectedDate);
                const status = att ? att.status : 'PRESENT';
                const isLoading = loadingMap[student.matricule];

                return (
                  <div key={student.matricule} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-8 text-center text-sm font-bold text-slate-400">
                        {idx + 1}.
                      </div>
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 border border-slate-200 shadow-sm">
                        {student.nom.charAt(0)}{student.prenom?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{student.nom} {student.prenom}</p>
                        <p className="text-xs text-slate-500">Matricule: {student.matricule}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pl-12 sm:pl-0">
                      {isLoading ? (
                        <div className="flex items-center gap-2 px-4 py-2 text-slate-400">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">Enregistrement...</span>
                        </div>
                      ) : (
                        <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
                          <button
                            onClick={() => handleStatusChange(student.matricule, 'PRESENT')}
                            className={cn(
                              "flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                              status === 'PRESENT' 
                                ? "bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-200" 
                                : "text-slate-500 hover:text-slate-700"
                            )}
                          >
                            <Check className={cn("w-4 h-4", status === 'PRESENT' ? "text-emerald-500" : "opacity-50")} />
                            Présent
                          </button>
                          <button
                            onClick={() => handleStatusChange(student.matricule, 'ABSENT')}
                            className={cn(
                              "flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                              status === 'ABSENT' 
                                ? "bg-white text-rose-700 shadow-sm ring-1 ring-rose-200" 
                                : "text-slate-500 hover:text-slate-700"
                            )}
                          >
                            <X className={cn("w-4 h-4", status === 'ABSENT' ? "text-rose-500" : "opacity-50")} />
                            Absent
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
