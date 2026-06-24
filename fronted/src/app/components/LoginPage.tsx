import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  GraduationCap, Eye, EyeOff, ArrowRight, ArrowLeft,
  ShieldAlert, Briefcase, Award, CreditCard, Building, Users
} from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';

type AccountType = 'admin' | 'teacher' | 'parent' | null;
type PortalType = 'users' | 'admin';
type AdminRole = 'directeur' | 'fondateur' | 'intendant' | 'root' | 'administration';

interface LoginPageProps {
  onLogin: (role: AccountType) => void;
}

const ADMIN_ROLE_CONFIG = {
  root: { label: 'Root (Système)', icon: ShieldAlert, bg: 'bg-blue-600', hover: 'hover:bg-blue-700', ring: 'focus:ring-blue-500/30', border: 'focus:border-blue-400', lightBg: 'bg-blue-50', text: 'text-blue-700' },
  directeur: { label: 'Directeur', icon: Briefcase, bg: 'bg-purple-600', hover: 'hover:bg-purple-700', ring: 'focus:ring-purple-500/30', border: 'focus:border-purple-400', lightBg: 'bg-purple-50', text: 'text-purple-700' },
  fondateur: { label: 'Fondateur', icon: Award, bg: 'bg-amber-600', hover: 'hover:bg-amber-700', ring: 'focus:ring-amber-500/30', border: 'focus:border-amber-400', lightBg: 'bg-amber-50', text: 'text-amber-700' },
  intendant: { label: 'Intendant (Caisse)', icon: CreditCard, bg: 'bg-teal-600', hover: 'hover:bg-teal-700', ring: 'focus:ring-teal-500/30', border: 'focus:border-teal-400', lightBg: 'bg-teal-50', text: 'text-teal-700' },
  administration: { label: 'Administration', icon: Building, bg: 'bg-slate-700', hover: 'hover:bg-slate-800', ring: 'focus:ring-slate-500/30', border: 'focus:border-slate-500', lightBg: 'bg-slate-100', text: 'text-slate-800' }
};

export function LoginPage({ onLogin }: LoginPageProps) {
  const { t } = useTranslation();
  
  const [portal, setPortal] = useState<PortalType>('users');
  const [selectedAdminRole, setSelectedAdminRole] = useState<AdminRole | null>(null);
  const [adminPortalUnlocked, setAdminPortalUnlocked] = useState(false);
  const [adminAccessCode, setAdminAccessCode] = useState('');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAdminRoleSelect = (role: AdminRole) => {
    setSelectedAdminRole(role);
    setError('');
    setUsername(role); 
    setPassword('');
  };

  const handleBack = () => {
    setSelectedAdminRole(null);
    setError('');
    setUsername('');
    setPassword('');
  };

  const switchPortal = (p: PortalType) => {
    setPortal(p);
    setSelectedAdminRole(null);
    setError('');
    setUsername('');
    setPassword('');
    setAdminAccessCode('');
  };

  const handleUnlockAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminAccessCode === 'admin123') {
      setAdminPortalUnlocked(true);
      setError('');
    } else {
      setError("Code d'accès invalide.");
    }
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Try Teacher first
      const teacherRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/legacy/auth/login-teacher`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (teacherRes.ok) {
        const payload = await teacherRes.json();
        localStorage.setItem('user_id', String(payload?.teacher?.id || ''));
        localStorage.setItem('legacy_token', String(payload?.token || ''));
        localStorage.setItem('user_role', 'ENSEIGNANT');
        onLogin('teacher');
        return;
      }

      // Try Parent if teacher failed
      const parentRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/legacy/auth/login-parent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (parentRes.ok) {
        const payload = await parentRes.json();
        localStorage.setItem('user_id', String(payload?.parent?.id || ''));
        localStorage.setItem('legacy_token', String(payload?.token || ''));
        localStorage.setItem('user_role', 'PARENT');
        onLogin('parent');
        return;
      }

      // If both failed
      setError('Identifiants invalides ou compte inactif.');
    } catch {
      setError('Impossible de joindre le serveur backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Hardcoded bypass for testing admin roles
      if (password === 'password123') {
        localStorage.setItem('legacy_admin_id', '999');
        localStorage.setItem('legacy_admin_type_label', selectedAdminRole || 'root');
        localStorage.setItem('legacy_token', 'demo-token');
        onLogin('admin');
        return;
      }

      const legacyRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/legacy/auth/login-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (legacyRes.ok) {
        const payload = await legacyRes.json();
        localStorage.setItem('legacy_admin_id', String(payload?.admin?.id || ''));
        localStorage.setItem('legacy_admin_type_label', String(payload?.admin?.typeAdminLabel || selectedAdminRole));
        localStorage.setItem('legacy_token', String(payload?.token || ''));
        onLogin('admin');
        return;
      } else {
        if (import.meta.env.VITE_LEGACY_DEMO_MODE === 'true' && username === 'demo') {
           localStorage.setItem('legacy_role', 'admin');
           onLogin('admin');
           return;
        }
        setError('Mot de passe ou identifiant administrateur invalide');
      }
    } catch {
      setError('Impossible de joindre le serveur backend.');
    } finally {
      setLoading(false);
    }
  };

  const adminConfig = selectedAdminRole ? ADMIN_ROLE_CONFIG[selectedAdminRole] : null;

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-8 overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="/Interior%20of%20a%20classroom%20with%20natural%20light%20AI%20generated.jpeg"
          alt="Salle de classe primaire"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-colors duration-500" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <div className="flex justify-end mb-3">
          <LanguageSwitcher variant="dark" />
        </div>
        
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-lg p-1">
            <img src="/logo_les_genies.png" alt="Logo de l'école" className="w-full h-full object-contain" />
          </div>
          <div>
            <p className="text-white text-sm tracking-widest uppercase opacity-90">{t('auth.school_subtitle')}</p>
            <p className="text-white text-xs font-medium">{t('auth.school_name')}</p>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => switchPortal('users')}
              className={`flex-1 py-4 text-sm font-semibold transition-all ${portal === 'users' ? 'text-blue-700 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            >
              Connexion Utilisateur
            </button>
            <button
              onClick={() => switchPortal('admin')}
              className={`flex-1 py-4 text-sm font-semibold transition-all ${portal === 'admin' ? 'text-slate-800 border-b-2 border-slate-700 bg-slate-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            >
              Espace Sécurisé
            </button>
          </div>

          {/* Users Portal */}
          {portal === 'users' && (
            <div className="p-8">
              <div className="mb-8 text-center">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6" />
                </div>
                <h2 className="text-gray-900 mb-2 text-xl font-bold">Portail Utilisateurs</h2>
                <p className="text-gray-500 text-sm">Parents, Enseignants et Personnel administratif</p>
              </div>

              <form onSubmit={handleUserSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5 font-semibold">Identifiant</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Votre identifiant"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all text-gray-800 text-sm"
                    autoComplete="username"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1.5 font-semibold">Mot de passe</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all text-gray-800 text-sm"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.99] text-sm mt-4 font-semibold bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    <svg className="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  ) : (
                    <>
                      Se connecter
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Admin Portal - Step 1: Passcode */}
          {portal === 'admin' && !adminPortalUnlocked && (
            <div className="p-8">
              <div className="mb-8 text-center">
                <div className="w-12 h-12 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h2 className="text-gray-900 mb-2 text-xl font-bold">Zone Restreinte</h2>
                <p className="text-gray-500 text-sm">Veuillez saisir la clé d'accès au portail d'administration</p>
              </div>

              <form onSubmit={handleUnlockAdmin} className="space-y-4">
                <div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={adminAccessCode}
                      onChange={(e) => setAdminAccessCode(e.target.value)}
                      placeholder="Code d'accès"
                      className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-slate-500/30 focus:border-slate-500 transition-all text-center tracking-widest text-gray-800 text-lg font-mono"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-center text-sm px-4 py-3 rounded-xl">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.99] text-sm mt-4 font-semibold bg-slate-800 hover:bg-slate-900"
                >
                  Déverrouiller l'accès
                </button>
              </form>
            </div>
          )}

          {/* Admin Portal - Step 2: Role Selection */}
          {portal === 'admin' && adminPortalUnlocked && !selectedAdminRole && (
            <div className="p-8">
              <div className="mb-6 text-center">
                <h2 className="text-gray-900 mb-2 text-xl font-bold">Sélectionnez votre Grade</h2>
                <p className="text-gray-500 text-sm">Veuillez indiquer votre fonction au sein de l'administration</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <AdminRoleCard role="directeur" onClick={() => handleAdminRoleSelect('directeur')} />
                <AdminRoleCard role="fondateur" onClick={() => handleAdminRoleSelect('fondateur')} />
                <AdminRoleCard role="intendant" onClick={() => handleAdminRoleSelect('intendant')} />
                <AdminRoleCard role="administration" onClick={() => handleAdminRoleSelect('administration')} />
                <div className="col-span-2">
                  <AdminRoleCard role="root" onClick={() => handleAdminRoleSelect('root')} />
                </div>
              </div>
            </div>
          )}

          {portal === 'admin' && selectedAdminRole && (
            <div className="p-8">
              <button 
                onClick={handleBack}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Changer de grade
              </button>

              <div className="flex items-center gap-4 mb-8">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${adminConfig?.lightBg}`}>
                  {adminConfig && <adminConfig.icon className={`w-6 h-6 ${adminConfig.text}`} />}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Espace {adminConfig?.label}</h2>
                  <p className="text-gray-500 text-sm">Authentification sécurisée requise</p>
                </div>
              </div>

              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5 font-semibold">Identifiant de connexion</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 transition-all text-gray-800 text-sm ${adminConfig?.ring} ${adminConfig?.border}`}
                    autoComplete="username"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1.5 font-semibold">Mot de passe</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 transition-all text-gray-800 text-sm ${adminConfig?.ring} ${adminConfig?.border}`}
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex items-center justify-center gap-2 py-3 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.99] text-sm mt-4 font-semibold ${adminConfig?.bg} ${adminConfig?.hover}`}
                >
                  {loading ? (
                    <svg className="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  ) : (
                    <>
                      Se connecter
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 mt-6">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <p className="text-xs text-white/80">Année académique 2025 – 2026</p>
        </div>
      </div>
    </div>
  );
}

function AdminRoleCard({ role, onClick }: { role: AdminRole, onClick: () => void }) {
  const config = ADMIN_ROLE_CONFIG[role];
  const Icon = config.icon;
  return (
    <button
      onClick={onClick}
      className={`group flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 bg-white hover:${config.lightBg} transition-all duration-200 shadow-sm hover:shadow-md border-b-4 ${config.border.replace('focus:', '')}`}
    >
      <div className={`w-10 h-10 rounded-full mb-2 flex items-center justify-center ${config.lightBg} ${config.text} group-hover:scale-110 transition-transform`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-sm font-semibold text-gray-800">{config.label}</span>
    </button>
  );
}
