'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  UserX,
  Clock,
  BookOpen,
  MessageSquare,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  GraduationCap,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const navigation = [
  { name: 'Tableau de bord', href: '/teacher', icon: LayoutDashboard },
  { name: 'Emploi du temps', href: '/teacher/schedule', icon: Calendar },
  { name: 'Saisie des notes', href: '/teacher/grades', icon: ClipboardList },
  { name: 'Appel et Présences', href: '/teacher/absences', icon: UserX },
  { name: 'Devoirs', href: '/teacher/homework', icon: BookOpen },
  { name: 'Messagerie', href: '/teacher/messages', icon: MessageSquare },
  { name: 'Profils élèves', href: '/teacher/students', icon: Users },
];

const bottomNav = [
  { name: 'Paramètres', href: '/teacher/settings', icon: Settings },
];

export function TeacherSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 flex h-screen flex-col bg-emerald-900 transition-all duration-300',
          collapsed ? 'w-[72px]' : 'w-64'
        )}
      >
        {/* Header */}
        <div className={cn(
          'flex h-16 items-center border-b border-emerald-800/50 px-4',
          collapsed ? 'justify-center' : 'justify-between'
        )}>
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white p-0.5">
                <img src="/logo_les_genies.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">Les Genies</span>
                <span className="text-xs text-emerald-300">Espace Enseignant</span>
                <span className="text-[10px] font-bold text-emerald-100 bg-emerald-800/50 w-fit px-1.5 py-0.5 rounded mt-0.5">2025/2026</span>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white p-0.5">
              <img src="/logo_les_genies.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-md text-emerald-300 transition-colors hover:bg-emerald-800 hover:text-white',
              collapsed && 'absolute -right-3 top-6 h-6 w-6 rounded-full border border-emerald-700 bg-emerald-900'
            )}
          >
            <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const NavLink = (
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50'
                      : 'text-emerald-200 hover:bg-emerald-800/50 hover:text-white',
                    collapsed && 'justify-center px-0'
                  )}
                >
                  <item.icon className={cn('h-5 w-5 shrink-0', isActive && 'text-white')} />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              );

              return (
                <li key={item.name}>
                  {collapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>{NavLink}</TooltipTrigger>
                      <TooltipContent side="right" className="bg-emerald-900 text-white border-emerald-700">
                        {item.name}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    NavLink
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-emerald-800/50 px-3 py-4">
          <ul className="space-y-1">
            {bottomNav.map((item) => {
              const isActive = pathname === item.href;
              const NavLink = (
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-emerald-600 text-white'
                      : 'text-emerald-200 hover:bg-emerald-800/50 hover:text-white',
                    collapsed && 'justify-center px-0'
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              );

              return (
                <li key={item.name}>
                  {collapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>{NavLink}</TooltipTrigger>
                      <TooltipContent side="right" className="bg-emerald-900 text-white border-emerald-700">
                        {item.name}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    NavLink
                  )}
                </li>
              );
            })}
          </ul>

          {/* User Profile */}
          <div className={cn(
            'mt-4 flex items-center gap-3 rounded-lg bg-emerald-800/30 p-3',
            collapsed && 'justify-center p-2'
          )}>
            <Avatar className="h-9 w-9 border-2 border-emerald-600">
              <AvatarImage src="/placeholder-user.jpg" alt="User" />
              <AvatarFallback className="bg-emerald-600 text-white text-xs">EC</AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-white">Mon Compte</p>
                <p className="truncate text-xs text-emerald-300">Enseignant</p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={() => window.location.href = 'http://localhost:5173'}
                className="flex h-8 w-8 items-center justify-center rounded-md text-emerald-300 transition-colors hover:bg-emerald-700 hover:text-white"
                title="Déconnexion"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
          {/* Language Switcher */}
          {!collapsed && (
            <div className="mt-3">
              <LanguageSwitcher variant="dark" />
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
