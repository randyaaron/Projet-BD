'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { 
  ClipboardList, 
  UserX, 
  Clock, 
  BookOpen, 
  MessageSquare,
  ArrowUpRight
} from 'lucide-react';

const actions = [
  {
    title: 'Saisir les notes',
    description: 'Ajouter ou modifier les notes',
    href: '/teacher/grades',
    icon: ClipboardList,
    color: 'bg-emerald-500',
  },
  {
    title: 'Marquer absence',
    description: 'Signaler une absence',
    href: '/teacher/absences',
    icon: UserX,
    color: 'bg-rose-500',
  },
  {
    title: 'Signaler retard',
    description: 'Enregistrer un retard',
    href: '/teacher/delays',
    icon: Clock,
    color: 'bg-amber-500',
  },
  {
    title: 'Nouveau devoir',
    description: 'Créer un devoir',
    href: '/teacher/homework/new',
    icon: BookOpen,
    color: 'bg-blue-500',
  },
  {
    title: 'Envoyer message',
    description: 'Contacter un parent',
    href: '/teacher/messages/new',
    icon: MessageSquare,
    color: 'bg-violet-500',
  },
];

export function QuickActions() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="font-semibold text-slate-900">Actions rapides</h3>
      <p className="mt-1 text-sm text-slate-500">Accès aux fonctions principales</p>
      
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {actions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className="group flex flex-col items-center rounded-xl border border-slate-100 bg-slate-50/50 p-4 text-center transition-all hover:border-emerald-200 hover:bg-emerald-50/50 hover:shadow-md"
          >
            <div className={cn(
              'flex h-12 w-12 items-center justify-center rounded-xl text-white transition-transform group-hover:scale-110',
              action.color
            )}>
              <action.icon className="h-6 w-6" />
            </div>
            <span className="mt-3 text-sm font-medium text-slate-900">{action.title}</span>
            <span className="mt-0.5 text-xs text-slate-500">{action.description}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
