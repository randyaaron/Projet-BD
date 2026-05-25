'use client';

import { useState } from 'react';
import { TeacherHeader } from '@/components/teacher/teacher-header';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Plus,
  Clock,
  ChevronDown,
  AlertTriangle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Delay {
  id: string;
  student: {
    name: string;
    class: string;
  };
  date: Date;
  arrivalTime: string;
  expectedTime: string;
  duration: number; // in minutes
  reason?: string;
  justified: boolean;
}

const delays: Delay[] = [
  { 
    id: '1', 
    student: { name: 'Hugo Petit', class: 'CM1 B' }, 
    date: new Date(), 
    arrivalTime: '08:15',
    expectedTime: '08:00',
    duration: 15,
    reason: 'Bus en retard',
    justified: true
  },
  { 
    id: '2', 
    student: { name: 'Nathan Robert', class: 'CE2 A' }, 
    date: new Date(), 
    arrivalTime: '09:20',
    expectedTime: '09:00',
    duration: 20,
    justified: false
  },
  { 
    id: '3', 
    student: { name: 'Lucas Martin', class: 'CM2 A' }, 
    date: new Date(Date.now() - 86400000), 
    arrivalTime: '10:05',
    expectedTime: '10:00',
    duration: 5,
    reason: 'Entretien avec CPE',
    justified: true
  },
  { 
    id: '4', 
    student: { name: 'Thomas Durand', class: 'CM1 B' }, 
    date: new Date(Date.now() - 86400000 * 2), 
    arrivalTime: '14:10',
    expectedTime: '14:00',
    duration: 10,
    justified: false
  },
  { 
    id: '5', 
    student: { name: 'Emma Bernard', class: 'CM2 A' }, 
    date: new Date(Date.now() - 86400000 * 3), 
    arrivalTime: '08:08',
    expectedTime: '08:00',
    duration: 8,
    reason: 'Rendez-vous médical',
    justified: true
  },
];

export default function DelaysPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');

  const classes = ['CM2 A', 'CM2 C', 'CM1 B', 'CE2 A', 'CE1 D'];

  const filteredDelays = delays.filter(delay => {
    const matchesSearch = delay.student.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClass === 'all' || delay.student.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  const stats = {
    total: delays.length,
    today: delays.filter(d => format(d.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')).length,
    justified: delays.filter(d => d.justified).length,
    unjustified: delays.filter(d => !d.justified).length,
  };

  const getDurationColor = (duration: number) => {
    if (duration <= 5) return 'text-slate-600 bg-slate-100';
    if (duration <= 15) return 'text-amber-600 bg-amber-50';
    return 'text-rose-600 bg-rose-50';
  };

  return (
    <main className="min-h-screen">
      <TeacherHeader 
        title="Gestion des retards" 
        subtitle="Suivre et enregistrer les retards"
      />
      
      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Total retards</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{stats.total}</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm text-emerald-700">{"Aujourd'hui"}</p>
            <p className="mt-1 text-2xl font-semibold text-emerald-900">{stats.today}</p>
          </div>
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-blue-700">Justifiés</p>
            <p className="mt-1 text-2xl font-semibold text-blue-900">{stats.justified}</p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-700">Non justifiés</p>
            <p className="mt-1 text-2xl font-semibold text-amber-900">{stats.unjustified}</p>
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
          </div>

          <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4" />
            Signaler un retard
          </Button>
        </div>

        {/* Delays List */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-5 py-3 text-left text-sm font-semibold text-slate-900">Élève</th>
                <th className="px-5 py-3 text-left text-sm font-semibold text-slate-900">Date</th>
                <th className="px-5 py-3 text-center text-sm font-semibold text-slate-900">Heure prévue</th>
                <th className="px-5 py-3 text-center text-sm font-semibold text-slate-900">Arrivée</th>
                <th className="px-5 py-3 text-center text-sm font-semibold text-slate-900">Durée</th>
                <th className="px-5 py-3 text-left text-sm font-semibold text-slate-900">Motif</th>
                <th className="px-5 py-3 text-center text-sm font-semibold text-slate-900">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDelays.map((delay) => (
                <tr key={delay.id} className="group transition-colors hover:bg-slate-50/50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-slate-200">
                        <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                          {delay.student.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-slate-900">{delay.student.name}</p>
                        <p className="text-sm text-slate-500">{delay.student.class}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-slate-600">
                      {format(delay.date, 'EEEE d MMM', { locale: fr })}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="text-sm text-slate-600">{delay.expectedTime}</span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="text-sm font-medium text-slate-900">{delay.arrivalTime}</span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={cn(
                      'inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium',
                      getDurationColor(delay.duration)
                    )}>
                      <Clock className="h-3.5 w-3.5" />
                      +{delay.duration} min
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-slate-600">
                      {delay.reason || '—'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={cn(
                      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                      delay.justified 
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    )}>
                      {delay.justified ? 'Justifié' : 'Non justifié'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Récidivistes */}
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-900">Attention : retards récurrents</h3>
              <p className="mt-1 text-sm text-amber-700">
                Certains élèves cumulent plusieurs retards ce mois-ci : <span className="font-medium">Hugo Petit (CM1 B)</span> - 3 retards, <span className="font-medium">Nathan Robert (CE2 A)</span> - 4 retards.
              </p>
              <button className="mt-2 text-sm font-medium text-amber-800 underline underline-offset-2 hover:text-amber-900">
                Voir le détail →
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
