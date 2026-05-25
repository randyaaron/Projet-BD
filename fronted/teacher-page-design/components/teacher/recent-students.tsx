'use client';

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  class: string;
  avatar?: string;
  lastGrade: number;
  trend: 'up' | 'down' | 'stable';
  status: 'present' | 'absent' | 'late';
}

const students: Student[] = [
  { id: '1', name: 'Lucas Martin', class: 'CM2 A', lastGrade: 16, trend: 'up', status: 'present' },
  { id: '2', name: 'Emma Bernard', class: 'CM2 A', lastGrade: 14, trend: 'stable', status: 'present' },
  { id: '3', name: 'Hugo Petit', class: 'CM1 B', lastGrade: 12, trend: 'down', status: 'late' },
  { id: '4', name: 'Léa Dubois', class: 'CM2 C', lastGrade: 18, trend: 'up', status: 'present' },
  { id: '5', name: 'Nathan Robert', class: 'CE2 A', lastGrade: 11, trend: 'down', status: 'absent' },
];

const getTrendIcon = (trend: Student['trend']) => {
  switch (trend) {
    case 'up':
      return <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />;
    case 'down':
      return <TrendingDown className="h-3.5 w-3.5 text-rose-500" />;
    default:
      return <Minus className="h-3.5 w-3.5 text-slate-400" />;
  }
};

const getStatusBadge = (status: Student['status']) => {
  const styles = {
    present: 'bg-emerald-100 text-emerald-700',
    absent: 'bg-rose-100 text-rose-700',
    late: 'bg-amber-100 text-amber-700',
  };
  const labels = {
    present: 'Présent',
    absent: 'Absent',
    late: 'Retard',
  };
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', styles[status])}>
      {labels[status]}
    </span>
  );
};

export function RecentStudents() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h3 className="font-semibold text-slate-900">Élèves récents</h3>
          <p className="text-sm text-slate-500">Dernières interactions</p>
        </div>
        <button className="text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700">
          Voir tous
        </button>
      </div>
      
      <div className="divide-y divide-slate-100">
        {students.map((student) => (
          <div
            key={student.id}
            className="group flex items-center gap-4 px-5 py-3 transition-colors hover:bg-slate-50"
          >
            <Avatar className="h-10 w-10 border border-slate-200">
              <AvatarImage src={student.avatar} alt={student.name} />
              <AvatarFallback className="bg-slate-100 text-slate-600 text-sm">
                {student.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 truncate">{student.name}</p>
              <p className="text-sm text-slate-500">{student.class}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2 py-1">
                <span className="text-sm font-semibold text-slate-900">{student.lastGrade}/20</span>
                {getTrendIcon(student.trend)}
              </div>
              
              {getStatusBadge(student.status)}
              
              <ChevronRight className="h-4 w-4 text-slate-300 transition-colors group-hover:text-slate-500" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
