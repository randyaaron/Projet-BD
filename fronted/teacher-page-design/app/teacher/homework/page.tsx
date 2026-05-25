'use client';

import { useState } from 'react';
import { TeacherHeader } from '@/components/teacher/teacher-header';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Plus,
  ChevronDown,
  Calendar,
  Users,
  FileText,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { format, addDays, isPast, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Homework {
  id: string;
  title: string;
  description: string;
  class: string;
  type: 'exercise' | 'exam' | 'project' | 'dm';
  dueDate: Date;
  submittedCount: number;
  totalStudents: number;
  status: 'active' | 'closed' | 'draft';
}

const homeworkList: Homework[] = [
  {
    id: '1',
    title: 'Exercices chapitre 5 - Équations',
    description: 'Exercices 12 à 18 page 85',
    class: 'CM2 A',
    type: 'exercise',
    dueDate: new Date(),
    submittedCount: 18,
    totalStudents: 25,
    status: 'active',
  },
  {
    id: '2',
    title: 'Contrôle - Fonctions affines',
    description: 'Chapitres 4 et 5',
    class: 'CM1 B',
    type: 'exam',
    dueDate: addDays(new Date(), 1),
    submittedCount: 0,
    totalStudents: 28,
    status: 'active',
  },
  {
    id: '3',
    title: 'Projet géométrie dans l\'espace',
    description: 'Construction de solides - travail en groupe',
    class: 'CM2 C',
    type: 'project',
    dueDate: addDays(new Date(), 3),
    submittedCount: 12,
    totalStudents: 24,
    status: 'active',
  },
  {
    id: '4',
    title: 'DM - Géométrie et probabilités',
    description: 'Exercices de synthèse',
    class: 'CE2 A',
    type: 'dm',
    dueDate: addDays(new Date(), 5),
    submittedCount: 5,
    totalStudents: 26,
    status: 'active',
  },
  {
    id: '5',
    title: 'Exercices fractions',
    description: 'Révisions trimestrielles',
    class: 'CE1 D',
    type: 'exercise',
    dueDate: addDays(new Date(), -3),
    submittedCount: 22,
    totalStudents: 24,
    status: 'closed',
  },
  {
    id: '6',
    title: 'Contrôle trigonométrie',
    description: 'Brouillon à compléter',
    class: 'CM2 A',
    type: 'exam',
    dueDate: addDays(new Date(), 10),
    submittedCount: 0,
    totalStudents: 25,
    status: 'draft',
  },
];

const typeConfig = {
  exercise: { label: 'Exercice', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  exam: { label: 'Contrôle', bg: 'bg-rose-100', text: 'text-rose-700' },
  project: { label: 'Projet', bg: 'bg-violet-100', text: 'text-violet-700' },
  dm: { label: 'DM', bg: 'bg-blue-100', text: 'text-blue-700' },
};

const statusConfig = {
  active: { label: 'Actif', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  closed: { label: 'Terminé', bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200' },
  draft: { label: 'Brouillon', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
};

export default function HomeworkPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('Toutes');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  const classes = ['Toutes', 'CM2 A', 'CM2 C', 'CM1 B', 'CE2 A', 'CE1 D'];

  const filteredHomework = homeworkList.filter(hw => {
    const matchesSearch = hw.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClass === 'Toutes' || hw.class === selectedClass;
    const matchesStatus = selectedStatus === 'all' || hw.status === selectedStatus;
    return matchesSearch && matchesClass && matchesStatus;
  });

  const stats = {
    active: homeworkList.filter(hw => hw.status === 'active').length,
    dueToday: homeworkList.filter(hw => isToday(hw.dueDate)).length,
    toGrade: homeworkList.filter(hw => hw.status === 'closed' && hw.submittedCount > 0).length,
  };

  return (
    <main className="min-h-screen">
      <TeacherHeader 
        title="Gestion des devoirs" 
        subtitle="Créez et suivez les devoirs de vos classes"
      />
      
      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm text-emerald-700">Devoirs actifs</p>
            <p className="mt-1 text-2xl font-semibold text-emerald-900">{stats.active}</p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-700">{"Échéance aujourd'hui"}</p>
            <p className="mt-1 text-2xl font-semibold text-amber-900">{stats.dueToday}</p>
          </div>
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-blue-700">À corriger</p>
            <p className="mt-1 text-2xl font-semibold text-blue-900">{stats.toGrade}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="search"
                placeholder="Rechercher un devoir..."
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
                <option value="active">Actifs</option>
                <option value="closed">Terminés</option>
                <option value="draft">Brouillons</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4" />
            Nouveau devoir
          </Button>
        </div>

        {/* Homework List */}
        <div className="mt-6 space-y-4">
          {filteredHomework.map((homework) => {
            const type = typeConfig[homework.type];
            const status = statusConfig[homework.status];
            const progress = (homework.submittedCount / homework.totalStudents) * 100;
            const isOverdue = isPast(homework.dueDate) && homework.status === 'active';

            return (
              <div
                key={homework.id}
                className={cn(
                  'group rounded-xl border bg-white p-5 transition-all hover:shadow-md',
                  status.border
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cn('rounded-md px-2 py-0.5 text-xs font-medium', type.bg, type.text)}>
                        {type.label}
                      </span>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                        {homework.class}
                      </span>
                      <span className={cn('rounded-md px-2 py-0.5 text-xs font-medium', status.bg, status.text)}>
                        {status.label}
                      </span>
                    </div>
                    
                    <h3 className="mt-2 font-semibold text-slate-900">{homework.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">{homework.description}</p>
                    
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                      <div className={cn(
                        'flex items-center gap-1.5',
                        isOverdue && 'text-rose-600'
                      )}>
                        <Calendar className="h-4 w-4" />
                        <span>
                          {isToday(homework.dueDate) 
                            ? "Aujourd'hui" 
                            : format(homework.dueDate, 'EEEE d MMMM', { locale: fr })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="h-4 w-4" />
                        <span>{homework.submittedCount}/{homework.totalStudents} rendus</span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    {homework.status !== 'draft' && (
                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex-1 h-2 rounded-full bg-slate-100">
                          <div 
                            className={cn(
                              'h-2 rounded-full transition-all',
                              progress === 100 ? 'bg-emerald-500' : 'bg-emerald-400'
                            )}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-slate-600">
                          {Math.round(progress)}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <button className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-100 hover:text-rose-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
