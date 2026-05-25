import { useState, useEffect } from 'react';
import { LayoutDashboard, Users, GraduationCap, Wallet, Building2, Menu, X, LogOut } from 'lucide-react';
import { LoginPage } from './components/LoginPage';
import { Attendance } from './components/Attendance';
import { Classes } from './components/Classes';
import { getLegacyAdminTypeLabel, isLegacyDemoMode } from './lib/legacyApi';
import { AdminApp } from './components/admin/AdminApp';

type Tab = 'dashboard' | 'classes' | 'attendance';
type AccountType = 'admin' | 'teacher' | 'parent' | null;

const roleLabels: Record<string, string> = {
  admin: 'Administrateur',
  teacher: 'Enseignant',
  parent: 'Parent / Tuteur',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<AccountType>(null);
  const adminTypeLabel = getLegacyAdminTypeLabel();
  const demoMode = isLegacyDemoMode();

  const handleLogin = (role: AccountType) => {
    setUserRole(role);
    setIsLoggedIn(true);

    if (role === 'teacher') {
      window.location.href = 'http://localhost:3001';
    } else if (role === 'parent') {
      window.location.href = 'http://localhost:3002';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('legacy_admin_id');
    localStorage.removeItem('legacy_token');
    localStorage.removeItem('legacy_admin_type_label');
    setIsLoggedIn(false);
    setUserRole(null);
    setActiveTab('dashboard');
    setMobileMenuOpen(false);
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (userRole === 'admin') {
    return <AdminApp onLogout={handleLogout} />;
  }

  const getTabs = () => {
    if (userRole === 'teacher') {
      return [
        { id: 'classes' as Tab, label: 'Classes', icon: Building2 },
        { id: 'attendance' as Tab, label: 'Présences', icon: Users },
      ];
    }
    if (userRole === 'parent') {
      return [
        { id: 'dashboard' as Tab, label: 'Tableau de bord', icon: LayoutDashboard },
      ];
    }
    return [
      { id: 'dashboard' as Tab, label: 'Tableau de bord', icon: LayoutDashboard },
    ];
  };

  const tabs = getTabs();

  const renderContent = () => {
    switch (activeTab) {
      case 'classes':
        return <Classes />;
      case 'attendance':
        return <Attendance />;
      default:
        return <div>Tableau de bord - {userRole}</div>;
    }
  };

  return (
    <div className="size-full flex flex-col bg-[#F8FAFC]">
      <header className="bg-[#334155] text-white shadow-lg">
        {demoMode && (
          <div className="bg-amber-500 text-amber-950 text-xs px-4 py-1 text-center">
            Mode démo actif - authentification legacy bypassée localement
          </div>
        )}
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#339CFF] rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">École Primaire Saint-Michel</h1>
              <p className="text-slate-200 text-sm">Système de Gestion Scolaire</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {userRole && (
              <div className="hidden lg:flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/20">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-white text-sm">
                  {roleLabels[userRole]}
                </span>
              </div>
            )}
            <button
              className="hidden lg:flex items-center gap-1.5 text-slate-200 hover:text-white hover:bg-slate-600 px-3 py-1.5 rounded-lg transition-colors text-sm"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </button>
            <button
              className="lg:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        <nav className={`${mobileMenuOpen ? 'block' : 'hidden'} lg:block border-t border-slate-500`}>
          <div className="px-4 py-2 flex flex-col lg:flex-row gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-[#0F172A] font-semibold'
                    : 'text-slate-200 hover:bg-slate-600'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-slate-200 hover:bg-slate-600"
            >
              <LogOut className="w-5 h-5" />
              <span>Déconnexion</span>
            </button>
          </div>
        </nav>
      </header>

      <main className="flex-1 overflow-auto">
        {renderContent()}
      </main>

      <footer className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex flex-col md:flex-row justify-between items-center gap-2 text-sm text-gray-600">
          <p>© 2026 École Primaire Saint-Michel - Tous droits réservés</p>
          <p>Version 1.0.0</p>
        </div>
      </footer>
    </div>
  );
}
