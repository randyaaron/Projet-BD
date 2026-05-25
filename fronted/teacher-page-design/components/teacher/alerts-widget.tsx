'use client';

import { cn } from '@/lib/utils';
import { AlertTriangle, UserX, Clock, MessageSquare, X } from 'lucide-react';

interface Alert {
  id: string;
  type: 'absence' | 'delay' | 'message' | 'warning';
  title: string;
  description: string;
  time: string;
  isNew: boolean;
}

const alerts: Alert[] = [
  {
    id: '1',
    type: 'absence',
    title: 'Absence non justifiée',
    description: 'Nathan Robert - CE2 A',
    time: 'Il y a 15 min',
    isNew: true,
  },
  {
    id: '2',
    type: 'message',
    title: 'Nouveau message',
    description: 'Parent de Lucas Martin',
    time: 'Il y a 1h',
    isNew: true,
  },
  {
    id: '3',
    type: 'delay',
    title: 'Retard signalé',
    description: 'Hugo Petit - CM1 B (+15 min)',
    time: 'Il y a 2h',
    isNew: false,
  },
  {
    id: '4',
    type: 'warning',
    title: 'Note en attente',
    description: 'Contrôle CM2 A du 08/01',
    time: 'Hier',
    isNew: false,
  },
];

const getAlertIcon = (type: Alert['type']) => {
  const iconMap = {
    absence: UserX,
    delay: Clock,
    message: MessageSquare,
    warning: AlertTriangle,
  };
  return iconMap[type];
};

const getAlertStyles = (type: Alert['type']) => {
  const styles = {
    absence: { bg: 'bg-rose-50', icon: 'text-rose-500', border: 'border-rose-100' },
    delay: { bg: 'bg-amber-50', icon: 'text-amber-500', border: 'border-amber-100' },
    message: { bg: 'bg-blue-50', icon: 'text-blue-500', border: 'border-blue-100' },
    warning: { bg: 'bg-orange-50', icon: 'text-orange-500', border: 'border-orange-100' },
  };
  return styles[type];
};

export function AlertsWidget() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-slate-900">Alertes</h3>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-xs font-medium text-white">
            2
          </span>
        </div>
        <button className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-700">
          Tout marquer lu
        </button>
      </div>
      
      <div className="divide-y divide-slate-100">
        {alerts.map((alert) => {
          const Icon = getAlertIcon(alert.type);
          const styles = getAlertStyles(alert.type);
          
          return (
            <div
              key={alert.id}
              className={cn(
                'group flex items-start gap-3 px-5 py-3 transition-colors',
                alert.isNew && 'bg-slate-50/50'
              )}
            >
              <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', styles.bg)}>
                <Icon className={cn('h-4 w-4', styles.icon)} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-slate-900">{alert.title}</p>
                  {alert.isNew && (
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  )}
                </div>
                <p className="text-sm text-slate-500">{alert.description}</p>
                <p className="mt-1 text-xs text-slate-400">{alert.time}</p>
              </div>
              
              <button className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 opacity-0 transition-all hover:bg-slate-100 hover:text-slate-600 group-hover:opacity-100">
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
