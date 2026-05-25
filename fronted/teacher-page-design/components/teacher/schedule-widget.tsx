'use client';

import { cn } from '@/lib/utils';
import { Clock, MapPin } from 'lucide-react';

interface ScheduleItem {
  id: string;
  time: string;
  endTime: string;
  subject: string;
  class: string;
  room: string;
  isActive?: boolean;
  isPast?: boolean;
}

const scheduleData: ScheduleItem[] = [
  { id: '1', time: '08:00', endTime: '09:00', subject: 'Mathématiques', class: 'CM2 A', room: 'Salle 201', isPast: true },
  { id: '2', time: '09:00', endTime: '10:00', subject: 'Mathématiques', class: 'CM1 B', room: 'Salle 201', isPast: true },
  { id: '3', time: '10:15', endTime: '11:15', subject: 'Sciences', class: 'CM2 C', room: 'Salle 305', isActive: true },
  { id: '4', time: '11:15', endTime: '12:15', subject: 'Géométrie', class: 'CE2 A', room: 'Salle 201', isPast: false },
  { id: '5', time: '14:00', endTime: '15:00', subject: 'Mathématiques', class: 'CE1 D', room: 'Salle 102', isPast: false },
  { id: '6', time: '15:00', endTime: '16:00', subject: 'Géométrie', class: 'CM2 A', room: 'Salle 201', isPast: false },
];

export function ScheduleWidget() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h3 className="font-semibold text-slate-900">{"Emploi du temps"}</h3>
          <p className="text-sm text-slate-500">{"Aujourd'hui"}</p>
        </div>
        <button className="text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700">
          Voir tout
        </button>
      </div>
      
      <div className="divide-y divide-slate-100">
        {scheduleData.map((item) => (
          <div
            key={item.id}
            className={cn(
              'group flex gap-4 px-5 py-3 transition-colors',
              item.isActive && 'bg-emerald-50/50',
              item.isPast && 'opacity-50'
            )}
          >
            {/* Time column */}
            <div className="flex w-16 shrink-0 flex-col items-end">
              <span className={cn(
                'text-sm font-semibold',
                item.isActive ? 'text-emerald-700' : 'text-slate-900'
              )}>
                {item.time}
              </span>
              <span className="text-xs text-slate-400">{item.endTime}</span>
            </div>
            
            {/* Indicator */}
            <div className="relative flex flex-col items-center">
              <div className={cn(
                'h-3 w-3 rounded-full border-2',
                item.isActive 
                  ? 'border-emerald-600 bg-emerald-600 shadow-lg shadow-emerald-200' 
                  : item.isPast 
                    ? 'border-slate-300 bg-slate-300' 
                    : 'border-slate-300 bg-white'
              )} />
              <div className={cn(
                'flex-1 w-0.5',
                item.isPast ? 'bg-slate-200' : 'bg-slate-100'
              )} />
            </div>
            
            {/* Content */}
            <div className="flex-1 pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className={cn(
                    'font-medium',
                    item.isActive ? 'text-emerald-700' : 'text-slate-900'
                  )}>
                    {item.subject}
                  </p>
                  <p className="text-sm text-slate-500">{item.class}</p>
                </div>
                {item.isActive && (
                  <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-medium text-white">
                    En cours
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                <MapPin className="h-3 w-3" />
                <span>{item.room}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
