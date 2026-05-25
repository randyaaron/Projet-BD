'use client';

import { cn } from '@/lib/utils';
import { Clock, MapPin, CalendarDays } from 'lucide-react';
import { useMemo } from 'react';

const COURS_COLORS = [
  'bg-blue-50 border-blue-200 text-blue-700 marker:bg-blue-500',
  'bg-indigo-50 border-indigo-200 text-indigo-700 marker:bg-indigo-500',
  'bg-purple-50 border-purple-200 text-purple-700 marker:bg-purple-500',
  'bg-pink-50 border-pink-200 text-pink-700 marker:bg-pink-500',
  'bg-rose-50 border-rose-200 text-rose-700 marker:bg-rose-500',
  'bg-orange-50 border-orange-200 text-orange-700 marker:bg-orange-500',
  'bg-amber-50 border-amber-200 text-amber-700 marker:bg-amber-500',
  'bg-emerald-50 border-emerald-200 text-emerald-700 marker:bg-emerald-500',
  'bg-teal-50 border-teal-200 text-teal-700 marker:bg-teal-500',
  'bg-cyan-50 border-cyan-200 text-cyan-700 marker:bg-cyan-500',
];

interface ScheduleItem {
  id: string;
  time: string;
  endTime: string;
  subject: string;
  class: string;
  room: string;
  colorClass: string;
  dotColor: string;
  isActive?: boolean;
  isPast?: boolean;
}

export function ScheduleWidget({ fullData }: { fullData?: any }) {
  const teacherClass = fullData?.classe || '';
  const salle = fullData?.salle || '';
  const scheduleData = fullData?.schedule || [];

  const formattedSchedule = useMemo(() => {
    if (!scheduleData.length) return [];

    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    let todayStr = days[new Date().getDay()];
    if (todayStr === 'Dimanche' || todayStr === 'Samedi') todayStr = 'Lundi';

    // Si on a pas de cours aujourd'hui, on prend le premier jour où on a cours (ex: si on est mardi et pas de cours)
    let slots = scheduleData.filter((s: any) => s.jour === todayStr);
    if (slots.length === 0) {
      slots = scheduleData.filter((s: any) => s.jour === 'Lundi');
      todayStr = 'Lundi';
    }

    const sorted = [...slots].sort((a: any, b: any) => a.heure.localeCompare(b.heure));

    // Assigner une couleur cohérente par cours
    const uniqueIds = Array.from(new Set(scheduleData.map((s: any) => s.idCours || s.subject)));
    
    return sorted.map((s: any, idx: number) => {
      const [h, m] = s.heure.split(':');
      const endH = (parseInt(h) + 1).toString().padStart(2, '0');
      const endTime = `${endH}:${m}`;
      
      const currentHour = new Date().getHours();
      const slotHour = parseInt(h);
      const isActive = todayStr === days[new Date().getDay()] && currentHour === slotHour;
      const isPast = todayStr === days[new Date().getDay()] && currentHour > slotHour;

      const colorIdx = uniqueIds.indexOf(s.idCours || s.subject) % COURS_COLORS.length;
      const colorScheme = COURS_COLORS[colorIdx] || COURS_COLORS[0];
      const dotColorClass = colorScheme.split(' ').find(c => c.startsWith('marker:'))?.replace('marker:', '') || 'bg-slate-300';

      return {
        id: String(idx),
        time: s.heure,
        endTime,
        subject: s.subject,
        class: teacherClass,
        room: salle,
        colorClass: colorScheme.replace(/marker:[^\s]+/g, ''), // remove marker class for container
        dotColor: dotColorClass,
        isActive,
        isPast
      };
    });
  }, [scheduleData, teacherClass, salle]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col h-full min-h-[450px]">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 bg-slate-50/50">
        <div>
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-slate-500" />
            Emploi du temps
          </h3>
          <p className="text-sm text-slate-500 mt-0.5">
            {teacherClass ? `Classe : ${teacherClass}` : 'Aucune classe'}
          </p>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
            Aujourd'hui
          </span>
        </div>
      </div>
      
      {!fullData ? (
        <div className="flex-1 flex justify-center items-center py-10">
           <p className="text-slate-400 text-sm">Chargement de l'emploi du temps...</p>
        </div>
      ) : formattedSchedule.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-400">
          <CalendarDays className="w-12 h-12 mb-3 text-slate-200" />
          <p className="text-sm font-medium">Aucun cours prévu</p>
          <p className="text-xs mt-1">Contactez l'administration si c'est une erreur.</p>
        </div>
      ) : (
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {formattedSchedule.map((item) => (
          <div
            key={item.id}
            className={cn(
              'group flex gap-4 rounded-xl border p-3 transition-all hover:shadow-md',
              item.colorClass,
              item.isActive && 'ring-2 ring-offset-1 ring-opacity-50 scale-[1.02] shadow-sm',
              item.isActive && item.colorClass.replace('bg-', 'ring-').split(' ')[0], // Dynamic ring color
              item.isPast && 'opacity-60 saturate-50 bg-slate-50 border-slate-200 text-slate-600'
            )}
          >
            {/* Time column */}
            <div className="flex w-16 shrink-0 flex-col items-center justify-center border-r border-current/10 pr-4">
              <span className="text-sm font-bold tracking-tight">
                {item.time}
              </span>
              <span className="text-[10px] uppercase font-semibold opacity-70">{item.endTime}</span>
            </div>
            
            {/* Content */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-sm">
                    {item.subject}
                  </p>
                  <p className="text-xs font-medium opacity-75 mt-0.5 flex items-center gap-1.5">
                    <span className={cn("w-1.5 h-1.5 rounded-full", item.dotColor)} />
                    {item.class}
                  </p>
                </div>
                {item.isActive && (
                  <span className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white",
                    item.dotColor
                  )}>
                    En cours
                  </span>
                )}
              </div>
              {item.room && (
                <div className="mt-2 flex items-center gap-1 text-[10px] font-medium opacity-70">
                  <MapPin className="h-3 w-3" />
                  <span>{item.room}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}

