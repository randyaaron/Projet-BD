'use client';

import { useState } from 'react';
import { TeacherHeader } from '@/components/teacher/teacher-header';
import { cn } from '@/lib/utils';
import { 
  Search, 
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  MessageSquare,
  MoreHorizontal,
  Users,
  GraduationCap
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Student {
  id: string;
  name: string;
  class: string;
  average: number;
  trend: 'up' | 'down' | 'stable';
  absences: number;
  delays: number;
  lastNote: { value: number; subject: string };
  parentEmail: string;
}

const students: Student[] = [
  { id: '1', name: 'Martin Lucas', class: 'CM2 A', average: 15.4, trend: 'up', absences: 2, delays: 1, lastNote: { value: 16, subject: 'Contrôle' }, parentEmail: 'martin@email.com' },
  { id: '2', name: 'Bernard Emma', class: 'CM2 A', average: 14.3, trend: 'stable', absences: 0, delays: 0, lastNote: { value: 14, subject: 'DM' }, parentEmail: 'bernard@email.com' },
  { id: '3', name: 'Petit Hugo', class: 'CM1 B', average: 11.0, trend: 'down', absences: 5, delays: 3, lastNote: { value: 10, subject: 'Interro' }, parentEmail: 'petit@email.com' },
  { id: '4', name: 'Dubois Léa', class: 'CM2 A', average: 18.2, trend: 'up', absences: 0, delays: 0, lastNote: { value: 19, subject: 'Contrôle' }, parentEmail: 'dubois@email.com' },
  { id: '5', name: 'Robert Nathan', class: 'CE2 A', average: 10.0, trend: 'down', absences: 8, delays: 4, lastNote: { value: 8, subject: 'DM' }, parentEmail: 'robert@email.com' },
  { id: '6', name: 'Richard Julie', class: 'CM2 C', average: 15.1, trend: 'stable', absences: 1, delays: 2, lastNote: { value: 15, subject: 'Interro' }, parentEmail: 'richard@email.com' },
  { id: '7', name: 'Durand Thomas', class: 'CM1 B', average: 13.1, trend: 'up', absences: 3, delays: 1, lastNote: { value: 14, subject: 'Contrôle' }, parentEmail: 'durand@email.com' },
  { id: '8', name: 'Moreau Camille', class: 'CM2 C', average: 16.9, trend: 'stable', absences: 1, delays: 0, lastNote: { value: 17, subject: 'DM' }, parentEmail: 'moreau@email.com' },
  { id: '9', name: 'Simon Antoine', class: 'CE2 A', average: 12.5, trend: 'up', absences: 2, delays: 2, lastNote: { value: 13, subject: 'Interro' }, parentEmail: 'simon@email.com' },
  { id: '10', name: 'Laurent Marie', class: 'CE1 D', average: 14.8, trend: 'stable', absences: 0, delays: 1, lastNote: { value: 15, subject: 'Contrôle' }, parentEmail: 'laurent@email.com' },
];

const classes = ['Toutes', 'CM2 A', 'CM2 C', 'CM1 B', 'CE2 A', 'CE1 D'];

const getTrendIcon = (trend: Student['trend']) => {
  switch (trend) {
    case 'up':
      return <TrendingUp className="h-4 w-4 text-emerald-600" />;
    case 'down':
      return <TrendingDown className="h-4 w-4 text-rose-500" />;
    default:
      return <Minus className="h-4 w-4 text-slate-400" />;
  }
};

const getAverageColor = (average: number) => {
  if (average >= 16) return 'text-emerald-600 bg-emerald-50';
  if (average >= 12) return 'text-slate-900 bg-slate-100';
  if (average >= 10) return 'text-amber-600 bg-amber-50';
  return 'text-rose-600 bg-rose-50';
};

export default function StudentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('Toutes');
  const [sortBy, setSortBy] = useState<'name' | 'average' | 'absences'>('name');

  const filteredStudents = students
    .filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesClass = selectedClass === 'Toutes' || student.class === selectedClass;
      return matchesSearch && matchesClass;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'average') return b.average - a.average;
      return b.absences - a.absences;
    });

  const classStats = {
    total: filteredStudents.length,
    avgGrade: filteredStudents.reduce((acc, s) => acc + s.average, 0) / filteredStudents.length || 0,
    totalAbsences: filteredStudents.reduce((acc, s) => acc + s.absences, 0),
  };

  return (
    <main className="min-h-screen">
      <TeacherHeader 
        title="Profils élèves" 
        subtitle="Consultez et suivez vos élèves"
      />
      
      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
              <Users className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total élèves</p>
              <p className="text-2xl font-semibold text-slate-900">{classStats.total}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
              <GraduationCap className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Moyenne générale</p>
              <p className="text-2xl font-semibold text-slate-900">{classStats.avgGrade.toFixed(1)}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
              <span className="text-lg font-bold text-amber-600">!</span>
            </div>
            <div>
              <p className="text-sm text-slate-500">Total absences</p>
              <p className="text-2xl font-semibold text-slate-900">{classStats.totalAbsences}</p>
            </div>
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
                {classes.map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Trier par :</span>
            <div className="flex rounded-lg border border-slate-200 p-1">
              {[
                { id: 'name', label: 'Nom' },
                { id: 'average', label: 'Moyenne' },
                { id: 'absences', label: 'Absences' },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSortBy(option.id as typeof sortBy)}
                  className={cn(
                    'rounded-md px-3 py-1 text-sm font-medium transition-colors',
                    sortBy === option.id 
                      ? 'bg-emerald-600 text-white' 
                      : 'text-slate-600 hover:bg-slate-100'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Students Grid */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="group rounded-xl border border-slate-200 bg-white p-5 transition-all hover:shadow-lg hover:shadow-slate-200/50"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-slate-100">
                    <AvatarFallback className="bg-emerald-100 text-emerald-700">
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-slate-900">{student.name}</p>
                    <p className="text-sm text-slate-500">{student.class}</p>
                  </div>
                </div>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 opacity-0 transition-all hover:bg-slate-100 hover:text-slate-600 group-hover:opacity-100">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-slate-50 p-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span className={cn(
                      'text-lg font-semibold rounded-md px-2',
                      getAverageColor(student.average)
                    )}>
                      {student.average.toFixed(1)}
                    </span>
                    {getTrendIcon(student.trend)}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Moyenne</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 text-center">
                  <p className={cn(
                    'text-lg font-semibold',
                    student.absences > 3 ? 'text-rose-600' : 'text-slate-900'
                  )}>
                    {student.absences}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Absences</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 text-center">
                  <p className={cn(
                    'text-lg font-semibold',
                    student.delays > 2 ? 'text-amber-600' : 'text-slate-900'
                  )}>
                    {student.delays}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Retards</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-3">
                <div>
                  <p className="text-xs text-slate-500">Dernière note</p>
                  <p className="font-medium text-slate-900">
                    <span className={cn(
                      student.lastNote.value >= 12 ? 'text-emerald-600' : 'text-rose-600'
                    )}>
                      {student.lastNote.value}/20
                    </span>
                    {' · '}
                    <span className="text-slate-500">{student.lastNote.subject}</span>
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
                  <Eye className="h-4 w-4" />
                  Voir profil
                </button>
                <button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700">
                  <MessageSquare className="h-4 w-4" />
                  Contacter
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
