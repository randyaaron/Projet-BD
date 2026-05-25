'use client';

import { useState } from 'react';
import { TeacherHeader } from '@/components/teacher/teacher-header';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { format, addWeeks, subWeeks, startOfWeek, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';

const timeSlots = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];

interface CourseEvent {
  id: string;
  subject: string;
  class: string;
  room: string;
  day: number; // 0-4 (Mon-Fri)
  startTime: string;
  endTime: string;
  color: string;
}

const courses: CourseEvent[] = [
  { id: '1', subject: 'Mathématiques', class: 'CM2 A', room: '201', day: 0, startTime: '08:00', endTime: '10:00', color: 'bg-emerald-500' },
  { id: '2', subject: 'Sciences', class: 'CM2 C', room: '305', day: 0, startTime: '10:00', endTime: '11:00', color: 'bg-emerald-400' },
  { id: '3', subject: 'Géométrie', class: 'CE2 A', room: '201', day: 0, startTime: '14:00', endTime: '16:00', color: 'bg-teal-500' },
  { id: '4', subject: 'Mathématiques', class: 'CM1 B', room: '201', day: 1, startTime: '09:00', endTime: '11:00', color: 'bg-emerald-500' },
  { id: '5', subject: 'Géométrie', class: 'CM2 A', room: '201', day: 1, startTime: '14:00', endTime: '15:00', color: 'bg-cyan-500' },
  { id: '6', subject: 'Mathématiques', class: 'CE1 D', room: '102', day: 2, startTime: '08:00', endTime: '09:00', color: 'bg-emerald-500' },
  { id: '7', subject: 'Sciences', class: 'CM2 A', room: '201', day: 2, startTime: '10:00', endTime: '12:00', color: 'bg-emerald-400' },
  { id: '8', subject: 'Géométrie', class: 'CM1 B', room: '305', day: 2, startTime: '15:00', endTime: '17:00', color: 'bg-teal-500' },
  { id: '9', subject: 'Mathématiques', class: 'CM2 C', room: '201', day: 3, startTime: '08:00', endTime: '10:00', color: 'bg-emerald-500' },
  { id: '10', subject: 'Géométrie', class: 'CE2 A', room: '102', day: 3, startTime: '11:00', endTime: '12:00', color: 'bg-cyan-500' },
  { id: '11', subject: 'Mathématiques', class: 'CM2 A', room: '201', day: 4, startTime: '08:00', endTime: '10:00', color: 'bg-emerald-500' },
  { id: '12', subject: 'Révisions', class: 'CM2 C', room: '305', day: 4, startTime: '14:00', endTime: '16:00', color: 'bg-violet-500' },
];

const getTimePosition = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours - 8) * 60 + minutes;
};

export default function SchedulePage() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  
  const weekDays = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i));

  return (
    <main className="min-h-screen">
      <TeacherHeader 
        title="Emploi du temps" 
        subtitle="Semaine du {format(weekStart, 'd MMMM yyyy', { locale: fr })}"
      />
      
      <div className="p-6">
        {/* Navigation */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
          <button
            onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Semaine du {format(weekStart, 'd MMMM', { locale: fr })}
            </h2>
            <button
              onClick={() => setCurrentWeek(new Date())}
              className="rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
            >
              {"Aujourd'hui"}
            </button>
          </div>
          
          <button
            onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="grid grid-cols-[80px_repeat(5,1fr)]">
            {/* Header */}
            <div className="border-b border-slate-100 bg-slate-50/50 p-3" />
            {weekDays.map((day, index) => {
              const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
              return (
                <div
                  key={index}
                  className={cn(
                    'border-b border-l border-slate-100 p-3 text-center',
                    isToday && 'bg-emerald-50/50'
                  )}
                >
                  <p className={cn(
                    'text-sm font-medium',
                    isToday ? 'text-emerald-700' : 'text-slate-500'
                  )}>
                    {format(day, 'EEEE', { locale: fr })}
                  </p>
                  <p className={cn(
                    'mt-1 text-2xl font-semibold',
                    isToday ? 'text-emerald-700' : 'text-slate-900'
                  )}>
                    {format(day, 'd')}
                  </p>
                </div>
              );
            })}

            {/* Time slots */}
            {timeSlots.map((time, timeIndex) => (
              <>
                <div
                  key={`time-${time}`}
                  className="border-b border-slate-100 p-3 text-right"
                >
                  <span className="text-sm text-slate-400">{time}</span>
                </div>
                {weekDays.map((day, dayIndex) => {
                  const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                  return (
                    <div
                      key={`cell-${dayIndex}-${timeIndex}`}
                      className={cn(
                        'relative h-16 border-b border-l border-slate-100',
                        isToday && 'bg-emerald-50/30'
                      )}
                    >
                      {/* Render courses */}
                      {courses
                        .filter(course => course.day === dayIndex && course.startTime === time)
                        .map(course => {
                          const startPos = getTimePosition(course.startTime);
                          const endPos = getTimePosition(course.endTime);
                          const duration = endPos - startPos;
                          const height = (duration / 60) * 64; // 64px per hour

                          return (
                            <div
                              key={course.id}
                              className={cn(
                                'absolute inset-x-1 z-10 overflow-hidden rounded-lg p-2 text-white shadow-sm transition-all hover:shadow-md',
                                course.color
                              )}
                              style={{ height: `${height - 4}px` }}
                            >
                              <p className="text-xs font-semibold truncate">{course.subject}</p>
                              <p className="text-xs opacity-90 truncate">{course.class}</p>
                              {height > 50 && (
                                <div className="mt-1 flex items-center gap-1 text-xs opacity-80">
                                  <MapPin className="h-3 w-3" />
                                  <span>Salle {course.room}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  );
                })}
              </>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white p-4">
          <span className="text-sm font-medium text-slate-500">Légende :</span>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-emerald-500" />
            <span className="text-sm text-slate-600">Mathématiques</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-emerald-400" />
            <span className="text-sm text-slate-600">Sciences</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-teal-500" />
            <span className="text-sm text-slate-600">Géométrie</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-cyan-500" />
            <span className="text-sm text-slate-600">Géométrie</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-violet-500" />
            <span className="text-sm text-slate-600">Révisions</span>
          </div>
        </div>
      </div>
    </main>
  );
}
