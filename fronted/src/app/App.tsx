import { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { AdminApp } from './components/admin/AdminApp';
import { LandingPage } from './components/LandingPage';

type AccountType = 'admin' | 'teacher' | 'parent' | null;

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<AccountType>(null);
  const [showLogin, setShowLogin] = useState(false);

  const handleLogin = (role: AccountType) => {
    setUserRole(role);
    setIsLoggedIn(true);

    if (role === 'teacher') {
      const uid = localStorage.getItem('user_id') || '';
      window.location.href = `${import.meta.env.VITE_TEACHER_URL || 'http://localhost:3001'}/teacher?userId=${uid}`;
    } else if (role === 'parent') {
      const uid = localStorage.getItem('user_id') || '';
      window.location.href = `${import.meta.env.VITE_PARENT_URL || 'http://localhost:3002'}/parent?userId=${uid}`;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('legacy_admin_id');
    localStorage.removeItem('legacy_token');
    localStorage.removeItem('legacy_admin_type_label');
    setIsLoggedIn(false);
    setUserRole(null);
    setShowLogin(false);
  };

  if (!isLoggedIn) {
    if (showLogin) {
      return (
        <div className="relative">
          <button 
            onClick={() => setShowLogin(false)}
            className="absolute top-6 left-6 z-50 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 border border-white/20"
          >
            ← Retour à l'accueil
          </button>
          <LoginPage onLogin={handleLogin} />
        </div>
      );
    }
    return <LandingPage onNavigateToLogin={() => setShowLogin(true)} />;
  }

  if (userRole === 'admin') {
    return <AdminApp onLogout={handleLogout} />;
  }

  // Redirection screen for parents and teachers
  if (userRole === 'teacher' || userRole === 'parent') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-sm w-full border border-gray-100">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Redirection en cours</h2>
          <p className="text-gray-500 text-sm">
            Veuillez patienter pendant que nous vous redirigeons vers votre portail {userRole === 'teacher' ? 'Enseignant' : 'Parent'}...
          </p>
        </div>
      </div>
    );
  }

  // Unreachable fallback
  return null;
}
