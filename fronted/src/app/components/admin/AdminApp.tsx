import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, Users, BookOpen, GraduationCap, ClipboardCheck,
  School, UserCheck, CalendarDays, CalendarRange, UserPlus,
  Clock, FileText, BarChart2, FileOutput, ShieldAlert,
  CreditCard, AlertCircle, MessageSquare, Settings, LogOut,
  Bell, Search, ChevronDown, ChevronRight, Menu, X,
} from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import { AdminDashboard } from './AdminDashboard';
import { ClassesView } from './views/ClassesView';
import { SallesView } from './views/SallesView';
import { TitulairesView } from './views/TitulairesView';
import { ElevesView } from './views/ElevesView';
import { InscriptionsView } from './views/InscriptionsView';
import { MatieresView } from './views/MatieresView';
import { EmploiDuTempsView } from './views/EmploiDuTempsView';
import { EpreuvesView } from './views/EpreuvesView';
import { PaiementsView } from './views/PaiementsView';
import { PresencesView } from './views/PresencesView';
import { NotesView } from './views/NotesView';
import { BulletinsView } from './views/BulletinsView';
import { DisciplineView } from './views/DisciplineView';
import { ImpayesView } from './views/ImpayesView';
import { MessagerieView } from './views/MessagerieView';
import { UtilisateursView } from './views/UtilisateursView';
import { ConfigurationView } from './views/ConfigurationView';
import { LanguageSwitcher } from '../LanguageSwitcher';

// ── Types ─────────────────────────────────────────────────────
export type AdminView =
  | 'dashboard'
  | 'classes' | 'salles' | 'titulaires'
  | 'eleves' | 'inscriptions'
  | 'matieres' | 'emploi-du-temps' | 'epreuves' | 'notes' | 'bulletins'
  | 'presences' | 'discipline'
  | 'paiements' | 'impayes'
  | 'messagerie' | 'utilisateurs' | 'configuration';

interface NavItem {
  id: AdminView;
  label: string;
  icon: React.ElementType;
}

interface NavGroup {
  label?: string;
  items: NavItem[];
}

interface AdminAppProps {
  onLogout: () => void;
}

// ── Nav structure ─────────────────────────────────────────────
const navGroups: NavGroup[] = [
  {
    items: [
      { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Gestion académique',
    items: [
      { id: 'classes', label: 'Cycles & Classes', icon: School },
      { id: 'salles', label: 'Salles', icon: BookOpen },
      { id: 'titulaires', label: 'Titulaires', icon: UserCheck },
    ],
  },
  {
    label: 'Élèves',
    items: [
      { id: 'eleves', label: 'Liste des élèves', icon: Users },
      { id: 'inscriptions', label: 'Inscriptions', icon: UserPlus },
    ],
  },
  {
    label: 'Pédagogie',
    items: [
      { id: 'matieres', label: 'Cours & Matières', icon: BookOpen },
      { id: 'emploi-du-temps', label: 'Emploi du temps', icon: Clock },
      { id: 'epreuves', label: 'Épreuves', icon: FileText },
      { id: 'notes', label: 'Notes & Moyennes', icon: BarChart2 },
      { id: 'bulletins', label: 'Bulletins PDF', icon: FileOutput },
    ],
  },
  {
    label: 'Suivi',
    items: [
      { id: 'presences', label: 'Présences', icon: ClipboardCheck },
      { id: 'discipline', label: 'Discipline', icon: ShieldAlert },
    ],
  },
  {
    label: 'Financier',
    items: [
      { id: 'paiements', label: 'Paiements', icon: CreditCard },
      { id: 'impayes', label: 'Impayés', icon: AlertCircle },
    ],
  },
  {
    label: 'Système',
    items: [
      { id: 'messagerie', label: 'Messagerie', icon: MessageSquare },
      { id: 'utilisateurs', label: 'Utilisateurs', icon: GraduationCap },
      { id: 'configuration', label: 'Configuration', icon: Settings },
    ],
  },
];

// ── Placeholder view ──────────────────────────────────────────
function PlaceholderView({ id, label, icon: Icon }: { id: string; label: string; icon: React.ElementType }) {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-slate-900" style={{ fontSize: '1.375rem', fontWeight: 700 }}>{label}</h1>
        <p className="text-slate-500 text-sm mt-0.5">Module en cours de développement</p>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
          <Icon className="w-8 h-8 text-blue-600" />
        </div>
        <div className="text-center">
          <p className="text-slate-800 text-sm" style={{ fontWeight: 600 }}>Section « {label} »</p>
          <p className="text-slate-400 text-sm mt-1">Ce module sera disponible prochainement.</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors mt-2" style={{ fontWeight: 600 }}>
          Revenir au tableau de bord
        </button>
      </div>
    </div>
  );
}

// ── Sidebar Group ─────────────────────────────────────────────
function SidebarGroup({
  group, activeView, onSelect, defaultOpen = true,
}: {
  group: NavGroup;
  activeView: AdminView;
  onSelect: (v: AdminView) => void;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const hasActive = group.items.some(i => i.id === activeView);

  return (
    <div>
      {group.label && (
        <button
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between px-3 py-1.5 mt-2 mb-0.5 group"
        >
          <span className="text-slate-500 text-xs uppercase tracking-wider" style={{ fontWeight: 600 }}>
            {group.label}
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-600 transition-transform duration-200 ${open ? '' : '-rotate-90'}`}
          />
        </button>
      )}
      {open && (
        <div className="space-y-0.5">
          {group.items.map(item => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150
                  ${isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/8'
                  }`}
                style={{ fontWeight: isActive ? 600 : 400 }}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span className="truncate">{item.label}</span>
                {isActive && <ChevronRight className="w-3 h-3 ml-auto opacity-60" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main AdminApp ─────────────────────────────────────────────
export function AdminApp({ onLogout }: AdminAppProps) {
  const { t } = useTranslation();
  const { settings } = useSettings();
  
  // Determine role
  const rawRole = (localStorage.getItem('legacy_admin_type_label') || '').toLowerCase();
  
  let normalizedRole = rawRole;
  if (rawRole === 'super_admin') normalizedRole = 'superadmin';
  else if (rawRole === 'root') normalizedRole = 'root';
  else if (rawRole === '0') normalizedRole = 'superadmin'; // fallback numérique
  else if (rawRole === 'secretaire' || rawRole === '3') normalizedRole = 'intendant';
  else if (rawRole === 'admin' || rawRole === '4') normalizedRole = 'administration';
  else if (rawRole === 'directeur' || rawRole === '1') normalizedRole = 'directeur';
  else if (rawRole === 'fondateur' || rawRole === '2') normalizedRole = 'fondateur';

  let allowedItems: AdminView[] = [];
  if (normalizedRole === 'superadmin') {
    allowedItems = navGroups.flatMap(g => g.items).map(i => i.id);
  } else if (normalizedRole === 'root') {
    allowedItems = ['dashboard', 'utilisateurs', 'configuration', 'messagerie'];
  } else if (normalizedRole === 'intendant') {
    allowedItems = ['dashboard', 'paiements', 'impayes', 'configuration', 'messagerie'];
  } else if (normalizedRole === 'fondateur') {
    allowedItems = ['dashboard', 'paiements', 'impayes', 'configuration', 'eleves', 'messagerie', 'emploi-du-temps', 'epreuves', 'notes', 'bulletins', 'presences', 'discipline'];
  } else if (normalizedRole === 'directeur') {
    allowedItems = ['dashboard', 'configuration', 'eleves', 'messagerie', 'emploi-du-temps', 'epreuves', 'notes', 'bulletins', 'presences', 'discipline'];
  } else if (normalizedRole === 'administration') {
    allowedItems = [
      'dashboard', 'classes', 'salles', 'titulaires', 'annees', 'trimestres',
      'eleves', 'inscriptions', 'matieres', 'emploi-du-temps', 'epreuves',
      'notes', 'bulletins', 'presences', 'discipline', 'messagerie', 'configuration'
    ];
  } else {
    // Fallback: show everything for super admins or unknown types that bypassed
    allowedItems = navGroups.flatMap(g => g.items).map(i => i.id);
    if (!allowedItems.includes('configuration')) allowedItems.push('configuration');
  }

  const filteredNavGroups = navGroups.map(group => ({
    ...group,
    items: group.items.filter(item => allowedItems.includes(item.id))
  })).filter(group => group.items.length > 0);

  const [activeView, setActiveView] = useState<AdminView>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const allItems = filteredNavGroups.flatMap(g => g.items);
  const current = allItems.find(i => i.id === activeView);

  // If the active view is not allowed for this role, fallback to dashboard
  if (!current && activeView !== 'dashboard') {
    setActiveView('dashboard');
  }

  const handleSelect = (view: AdminView) => {
    setActiveView(view);
    setSidebarOpen(false);
  };

  const getThemePalette = (role: string) => {
    switch (role) {
      case 'directeur': // Purple
        return { 50: '#faf5ff', 100: '#f3e8ff', 200: '#e9d5ff', 300: '#d8b4fe', 400: '#c084fc', 500: '#a855f7', 600: '#9333ea', 700: '#7e22ce', 800: '#6b21a8', 900: '#581c87', 950: '#3b0764' };
      case 'fondateur': // Amber
        return { 50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f', 950: '#451a03' };
      case 'intendant': // Teal
        return { 50: '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4', 300: '#5eead4', 400: '#2dd4bf', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e', 800: '#115e59', 900: '#134e4a', 950: '#042f2e' };
      case 'administration': // Slate
        return { 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a', 950: '#020617' };
      case 'root':
      default:
        return null; // Keep default blue
    }
  };

  const themePalette = getThemePalette(normalizedRole);

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard': return <AdminDashboard />;
      case 'classes': return <ClassesView />;
      case 'salles': return <SallesView />;
      case 'titulaires': return <TitulairesView />;
      case 'eleves': return <ElevesView />;
      case 'inscriptions': return <InscriptionsView />;
      case 'matieres': return <MatieresView />;
      case 'emploi-du-temps': return <EmploiDuTempsView />;
      case 'epreuves': return <EpreuvesView />;
      case 'paiements': return <PaiementsView />;
      case 'presences': return <PresencesView />;
      case 'notes': return <NotesView />;
      case 'bulletins': return <BulletinsView />;
      case 'discipline': return <DisciplineView />;
      case 'impayes': return <ImpayesView />;
      case 'messagerie': return <MessagerieView />;
      case 'utilisateurs': return <UtilisateursView />;
      case 'configuration': return <ConfigurationView />;
      default:
        if (!current) return null;
        return <PlaceholderView id={current.id} label={current.label} icon={current.icon} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden dark:bg-slate-900 admin-theme-wrapper">
      {themePalette && (
        <style dangerouslySetInnerHTML={{ __html: `
          .admin-theme-wrapper {
            --color-blue-50: ${themePalette[50]};
            --color-blue-100: ${themePalette[100]};
            --color-blue-200: ${themePalette[200]};
            --color-blue-300: ${themePalette[300]};
            --color-blue-400: ${themePalette[400]};
            --color-blue-500: ${themePalette[500]};
            --color-blue-600: ${themePalette[600]};
            --color-blue-700: ${themePalette[700]};
            --color-blue-800: ${themePalette[800]};
            --color-blue-900: ${themePalette[900]};
            --color-blue-950: ${themePalette[950]};
          }
        `}} />
      )}

      {/* ── Overlay (mobile) ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-30 lg:z-auto
        flex flex-col w-64 bg-slate-900 flex-shrink-0
        transition-transform duration-300 lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-700/50">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0 p-0.5">
            <img src="/logo_les_genies.png" alt="Logo de l'école" className="w-full h-full object-contain" />
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm truncate" style={{ fontWeight: 700 }}>{settings.schoolName || 'Les Génies'}</p>
            <p className="text-slate-500 text-xs flex items-center gap-2">Espace Administrateur <span className="bg-slate-800 text-slate-300 px-1.5 rounded-md">2025/2026</span></p>
          </div>
          <button
            className="lg:hidden ml-auto text-slate-500 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5 scrollbar-thin">
          {filteredNavGroups.map((group, i) => (
            <SidebarGroup
              key={i}
              group={group}
              activeView={activeView}
              onSelect={handleSelect}
              defaultOpen={i < 4}
            />
          ))}
        </nav>

        {/* User + Logout */}
        <div className="border-t border-slate-700/50 p-3 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 text-white text-xs uppercase" style={{ fontWeight: 700 }}>
              {normalizedRole ? normalizedRole.substring(0, 2) : 'AD'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm truncate capitalize" style={{ fontWeight: 600 }}>
                {normalizedRole || 'Administrateur'}
              </p>
              <p className="text-slate-500 text-xs truncate">
                {normalizedRole ? `${normalizedRole}@lesgenies.cm` : 'admin@lesgenies.cm'}
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/8 transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            {t('common.logout')}
          </button>
          {/* Language switcher in sidebar */}
          <div className="px-1 pt-1">
            <LanguageSwitcher variant="dark" />
          </div>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 px-5 py-3.5 flex items-center gap-4 flex-shrink-0">
          {/* Mobile menu toggle */}
          <button
            className="lg:hidden p-1 text-slate-500 hover:text-slate-800"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">Administration</span>
            {current && current.id !== 'dashboard' && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                <span className="text-slate-700" style={{ fontWeight: 600 }}>{current.label}</span>
              </>
            )}
            {activeView === 'dashboard' && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                <span className="text-slate-700" style={{ fontWeight: 600 }}>Tableau de bord</span>
              </>
            )}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Search */}
          <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-400 w-56">
            <Search className="w-4 h-4 flex-shrink-0" />
            <span>Rechercher…</span>
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs cursor-pointer" style={{ fontWeight: 700 }}>
            AD
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
