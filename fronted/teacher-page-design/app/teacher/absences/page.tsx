'use client';

import { useState } from 'react';
import { TeacherHeader } from '@/components/teacher/teacher-header';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Filter, 
  Plus,
  Check,
  X,
  Clock,
  FileText,
  ChevronDown
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Absence {
  id: string;
  student: {
    name: string;
    class: string;
  };
  date: Date;
  period: string;
  subject: string;
  status: 'pending' | 'justified' | 'unjustified';
  justification?: string;
}

const absences: Absence[] = [
  { 
    id: '1', 
    student: { name: 'Nathan Robert', class: 'CE2 A' }, 
    date: new Date(), 
    period: '08:00 - 10:00',
    subject: 'Mathématiques',
    status: 'pending'
  },
  { 
    id: '2', 
    student: { name: 'Hugo Petit', class: 'CM1 B' }, 
    date: new Date(), 
    period: '10:00 - 12:00',
    subject: 'Sciences',
    status: 'unjustified'
  },
  { 
    id: '3', 
    student: { name: 'Emma Bernard', class: 'CM2 A' }, 
    date: new Date(Date.now() - 86400000), 
    period: '14:00 - 16:00',
    subject: 'Géométrie',
    status: 'justified',
    justification: 'Rendez-vous médical'
  },
  { 
    id: '4', 
    student: { name: 'Lucas Martin', class: 'CM2 A' }, 
    date: new Date(Date.now() - 86400000 * 2), 
    period: '08:00 - 09:00',
    subject: 'Mathématiques',
    status: 'justified',
    justification: 'Maladie - certificat fourni'
  },
  { 
    id: '5', 
    student: { name: 'Camille Moreau', class: 'CM2 C' }, 
    date: new Date(Date.now() - 86400000 * 3), 
    period: '10:00 - 11:00',
    subject: 'Géométrie',
    status: 'unjustified'
  },
];

const statusConfig = {
  pending: { label: 'En attente', bg: 'bg-amber-50', text: 'text-amber-700', icon: Clock },
  justified: { label: 'Justifiée', bg: 'bg-emerald-50', text: 'text-emerald-700', icon: Check },
  unjustified: { label: 'Non justifiée', bg: 'bg-rose-50', text: 'text-rose-700', icon: X },
};

export default function AbsencesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');

  const classes = ['CM2 A', 'CM1 B', 'CM2 C', 'CE2 A', 'CE1 D'];

  const filteredAbsences = absences.filter(absence => {
    const matchesSearch = absence.student.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || absence.status === selectedStatus;
    const matchesClass = selectedClass === 'all' || absence.student.class === selectedClass;
    return matchesSearch && matchesStatus && matchesClass;
  });

  const stats = {
    total: absences.length,
    pending: absences.filter(a => a.status === 'pending').length,
    justified: absences.filter(a => a.status === 'justified').length,
    unjustified: absences.filter(a => a.status === 'unjustified').length,
  };

  return (
    <main className="min-h-screen">
      <TeacherHeader 
        title="Gestion des absences" 
        subtitle="Suivre et gérer les absences de vos élèves"
      />
      
      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Total absences</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{stats.total}</p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-700">En attente</p>
            <p className="mt-1 text-2xl font-semibold text-amber-900">{stats.pending}</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm text-emerald-700">Justifiées</p>
            <p className="mt-1 text-2xl font-semibold text-emerald-900">{stats.justified}</p>
          </div>
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
            <p className="text-sm text-rose-700">Non justifiées</p>
            <p className="mt-1 text-2xl font-semibold text-rose-900">{stats.unjustified}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="search"
                placeholder="Rechercher un élève..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 border-slate-200 bg-slate-50 pl-9 text-sm focus:bg-white"
              />
            </div>

            <div className="relative">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="h-10 appearance-none rounded-lg border border-slate-200 bg-white pl-4 pr-10 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="all">Toutes les classes</option>
                {classes.map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-10 appearance-none rounded-lg border border-slate-200 bg-white pl-4 pr-10 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="justified">Justifiées</option>
                <option value="unjustified">Non justifiées</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4" />
            Signaler une absence
          </Button>
        </div>

        {/* Absences List */}
        <div className="mt-6 space-y-3">
          {filteredAbsences.map((absence) => {
            const status = statusConfig[absence.status];
            const StatusIcon = status.icon;

            return (
              <div
                key={absence.id}
                className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:shadow-md"
              >
                <Avatar className="h-12 w-12 border-2 border-slate-100">
                  <AvatarFallback className="bg-slate-100 text-slate-600">
                    {absence.student.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-slate-900">{absence.student.name}</p>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                      {absence.student.class}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-4 text-sm text-slate-500">
                    <span>{format(absence.date, 'EEEE d MMMM', { locale: fr })}</span>
                    <span>•</span>
                    <span>{absence.period}</span>
                    <span>•</span>
                    <span>{absence.subject}</span>
                  </div>
                  {absence.justification && (
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      <FileText className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-slate-600">{absence.justification}</span>
                    </div>
                  )}
                </div>

                <div className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-1.5',
                  status.bg
                )}>
                  <StatusIcon className={cn('h-4 w-4', status.text)} />
                  <span className={cn('text-sm font-medium', status.text)}>
                    {status.label}
                  </span>
                </div>

                {absence.status === 'pending' && (
                  <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition-colors hover:bg-emerald-100">
                      <Check className="h-4 w-4" />
                    </button>
                    <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600 transition-colors hover:bg-rose-100">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
