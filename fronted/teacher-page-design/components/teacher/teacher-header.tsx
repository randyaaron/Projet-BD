'use client';

import { Bell, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TeacherHeaderProps {
  title: string;
  subtitle?: string;
}

export function TeacherHeader({ title, subtitle }: TeacherHeaderProps) {
  const today = new Date();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-sm">
      <div className="flex flex-col">
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">


        {/* Date */}
        <div className="hidden items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 lg:flex">
          <span className="text-sm font-medium text-emerald-700">
            {format(today, 'EEEE d MMMM', { locale: fr })}
          </span>
        </div>

        {/* Notifications */}
        <button className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900">
          <Bell className="h-5 w-5" />
          <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 p-0 text-[10px] text-white">
            3
          </Badge>
        </button>
      </div>
    </header>
  );
}
