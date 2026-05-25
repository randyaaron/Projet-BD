'use client';

import { cn } from '@/lib/utils';
import { format, isToday, isTomorrow, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { BookOpen, CheckCircle2, Clock, Users } from 'lucide-react';

interface Homework {
  id: string;
  title: string;
  class: string;
  dueDate: Date;
  submittedCount: number;
  totalStudents: number;
  type: 'exercise' | 'exam' | 'project';
}

const homeworkData: Homework[] = [];

const getDateLabel = (date: Date) => {
  if (isToday(date)) return "Aujourd'hui";
  if (isTomorrow(date)) return 'Demain';
  return format(date, 'EEEE d MMM', { locale: fr });
};

const getTypeStyles = (type: Homework['type']) => {
  const styles = {
    exercise: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Exercice' },
    exam: { bg: 'bg-rose-100', text: 'text-rose-700', label: 'Contrôle' },
    project: { bg: 'bg-violet-100', text: 'text-violet-700', label: 'Projet' },
  };
  return styles[type];
};

export function UpcomingHomework({ fullData }: { fullData?: any }) {
  // Use data from API or fallback to empty array
  const homeworkData: Homework[] = (fullData?.upcomingAssessments || []).map((assessment: any) => ({
    id: String(assessment.id),
    title: assessment.title,
    class: fullData?.classe || 'Classe',
    dueDate: new Date(assessment.date),
    submittedCount: 0, // Placeholder
    totalStudents: fullData?.stats?.eleves || 0,
    type: assessment.type === 'EXAMEN' ? 'exam' : 'exercise'
  }));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h3 className="font-semibold text-slate-900">Devoirs à venir</h3>
          <p className="text-sm text-slate-500">Échéances prochaines</p>
        </div>
        <button className="text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700">
          Gérer
        </button>
      </div>
      
      <div className="divide-y divide-slate-100">
        {homeworkData.length === 0 ? (
          <div className="px-5 py-10 text-center text-slate-500 italic">
            Aucun devoir à venir.
          </div>
        ) : (
          homeworkData.map((homework) => {
            const typeStyle = getTypeStyles(homework.type);
            const progress = homework.totalStudents > 0 
              ? (homework.submittedCount / homework.totalStudents) * 100 
              : 0;
            
            return (
              <div key={homework.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn('rounded-md px-2 py-0.5 text-xs font-medium', typeStyle.bg, typeStyle.text)}>
                        {typeStyle.label}
                      </span>
                      <span className="text-xs text-slate-400">{homework.class}</span>
                    </div>
                    <p className="mt-1.5 font-medium text-slate-900 truncate">{homework.title}</p>
                  </div>
                  
                  <div className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2 py-1 text-xs">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span className={cn(
                      'font-medium',
                      isToday(homework.dueDate) ? 'text-rose-600' : 'text-slate-600'
                    )}>
                      {getDateLabel(homework.dueDate)}
                    </span>
                  </div>
                </div>
                
                {/* Progress */}
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1">
                    <div className="h-1.5 rounded-full bg-slate-100">
                      <div 
                        className="h-1.5 rounded-full bg-emerald-500 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Users className="h-3.5 w-3.5" />
                    <span>{homework.submittedCount}/{homework.totalStudents}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
