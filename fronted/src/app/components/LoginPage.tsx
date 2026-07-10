import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GraduationCap, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';

type AccountType = 'admin' | 'teacher' | 'parent' | null;

interface LoginPageProps {
  onLogin: (role: AccountType) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Tentative API Moderne (Enseignant / Parent)
      const modernRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (modernRes.status === 403) {
        const errData = await modernRes.json();
        setError(errData.message || 'Ce compte est désactivé.');
        return;
      }

      if (modernRes.ok) {
        const payload = await modernRes.json();
        const userRole = (payload?.user?.role ?? '').toString().toUpperCase();

        if (payload?.token) {
          localStorage.setItem('sanctum_token', String(payload.token));
        }
        if (payload?.user?.id) {
          localStorage.setItem('user_id', String(payload.user.legacy_id || payload.user.id));
        }
        if (payload?.user?.role) {
          localStorage.setItem('user_role', String(payload.user.role));
        }

        if (userRole === 'ENSEIGNANT') {
          onLogin('teacher');
          setLoading(false);
          return;
        } else if (userRole === 'PARENT') {
          onLogin('parent');
          setLoading(false);
          return;
        }
      }

      // 2. Tentative API Legacy (Enseignant)
      const legacyTeacherRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/legacy/auth/login-teacher`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (legacyTeacherRes.status === 403) {
        const errData = await legacyTeacherRes.json();
        setError(errData.message || 'Ce compte est désactivé.');
        return;
      }

      if (legacyTeacherRes.ok) {
        const payload = await legacyTeacherRes.json();
        if (payload?.teacher?.id) {
          localStorage.setItem('user_id', String(payload.teacher.id));
        }
        if (payload?.token) {
          localStorage.setItem('legacy_token', String(payload.token));
        }
        localStorage.setItem('user_role', 'ENSEIGNANT');
        
        onLogin('teacher');
        setLoading(false);
        return;
      }

      // 3. Tentative API Legacy (Parent)
      const legacyParentRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/legacy/auth/login-parent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (legacyParentRes.status === 403) {
        const errData = await legacyParentRes.json();
        setError(errData.message || 'Ce compte est désactivé.');
        return;
      }

      if (legacyParentRes.ok) {
        const payload = await legacyParentRes.json();
        if (payload?.parent?.id) {
          localStorage.setItem('user_id', String(payload.parent.id));
        }
        if (payload?.token) {
          localStorage.setItem('legacy_token', String(payload.token));
        }
        localStorage.setItem('user_role', 'PARENT');

        onLogin('parent');
        setLoading(false);
        return;
      }

      // 4. Tentative API Legacy (Admin)
      const legacyRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/legacy/auth/login-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (legacyRes.ok) {
        const payload = await legacyRes.json();
        if (payload?.admin?.id) {
          localStorage.setItem('legacy_admin_id', String(payload.admin.id));
        }
        if (payload?.admin?.typeAdminLabel) {
          localStorage.setItem('legacy_admin_type_label', String(payload.admin.typeAdminLabel));
        }
        if (payload?.token) {
          localStorage.setItem('legacy_token', String(payload.token));
        }

        onLogin('admin');
        setLoading(false);
        return;
      }

      // 3. Mode Démo Legacy (Bypass local)
      if (import.meta.env.VITE_LEGACY_DEMO_MODE === 'true' && username === 'demo') {
         localStorage.setItem('legacy_role', 'admin');
         onLogin('admin');
         setLoading(false);
         return;
      }

      // Si toutes les tentatives échouent
      setError('Identifiants invalides');
    } catch {
      setError('Impossible de joindre le serveur backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0">
        <img
          src="/classroom.jpeg"
          alt="Salle de classe primaire"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/45 via-blue-900/40 to-slate-800/50" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="flex justify-end mb-3">
          <LanguageSwitcher variant="dark" />
        </div>
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-lg p-1">
            <img src="/logo_les_genies.png" alt="Logo de l'école" className="w-full h-full object-contain" />
          </div>
          <div>
            <p className="text-white text-sm tracking-widest uppercase opacity-90">{t('auth.school_subtitle') || 'Système de Gestion'}</p>
            <p className="text-white text-xs font-medium">{t('auth.school_name') || 'École Primaire'}</p>
            <p className="text-white text-xs font-bold mt-1 bg-white/20 inline-block px-2 py-0.5 rounded">2025/2026</p>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-100 p-8">
            <div className="mb-6 text-center">
              <h2 className="text-gray-900 mb-1" style={{ fontSize: '1.4rem', fontWeight: 700 }}>
                Connexion
              </h2>
              <p className="text-gray-500 text-sm">
                Veuillez entrer vos identifiants pour continuer
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>
                  Nom d'utilisateur ou Email
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ex: admin_test"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all text-gray-800 placeholder-gray-400 text-sm"
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all text-gray-800 placeholder-gray-400 text-sm"
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
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.99] text-sm mt-2"
                style={{ fontWeight: 600 }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    Se connecter
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <p className="text-xs text-white">Année académique 2025 – 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}
