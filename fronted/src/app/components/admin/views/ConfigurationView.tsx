import { useState, useEffect } from 'react';
import { Settings, Save, Globe, Lock, Bell, Database, Loader2, Palette } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ConfigurationView() {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { theme, setTheme } = useTheme();
  
  const [formData, setFormData] = useState({
    schoolName: '',
    academicYear: '2025-2026',
    contactEmail: '',
    contactPhone: ''
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const token = localStorage.getItem('sanctum_token');
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/admin/settings`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setFormData(data);
        }
      } catch (err) {
        console.error("Failed to load settings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem('sanctum_token');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/admin/settings`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert('Configuration sauvegardée avec succès !');
        window.location.reload();
      } else {
        alert('Erreur lors de la sauvegarde.');
      }
    } catch (err) {
      console.error(err);
      alert('Erreur de connexion');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900 dark:text-white" style={{ fontSize: '1.375rem', fontWeight: 700 }}>Configuration Système</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Paramètres généraux de l'établissement scolaire</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading || saving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors shadow-sm disabled:opacity-50" 
          style={{ fontWeight: 600 }}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
          Enregistrer les modifications
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 flex-shrink-0 space-y-1">
          <button onClick={() => setActiveTab('general')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'general' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'}`}>
            <Globe className="w-4 h-4" /> Général
          </button>
          <button onClick={() => setActiveTab('apparence')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'apparence' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'}`}>
            <Palette className="w-4 h-4" /> Apparence
          </button>
          <button onClick={() => setActiveTab('security')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'security' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'}`}>
            <Lock className="w-4 h-4" /> Sécurité
          </button>
          <button onClick={() => setActiveTab('notifications')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'notifications' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'}`}>
            <Bell className="w-4 h-4" /> Notifications
          </button>
          <button onClick={() => setActiveTab('backup')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'backup' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'}`}>
            <Database className="w-4 h-4" /> Sauvegardes
          </button>
        </div>

        <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden min-h-[400px]">
          {activeTab === 'general' && (
            <div className="p-6 space-y-6">
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                </div>
              ) : (
                <div>
                  <h3 className="text-slate-900 dark:text-white font-bold mb-4">Informations de l'établissement</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Nom de l'école</label>
                      <input 
                        value={formData.schoolName}
                        onChange={e => setFormData({...formData, schoolName: e.target.value})}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Année académique en cours</label>
                      <select 
                        value={formData.academicYear}
                        onChange={e => setFormData({...formData, academicYear: e.target.value})}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                      >
                        <option value="2025-2026">2025-2026</option>
                        <option value="2026-2027">2026-2027</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Téléphone Principal</label>
                      <input 
                        value={formData.contactPhone}
                        onChange={e => setFormData({...formData, contactPhone: e.target.value})}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Email de contact</label>
                      <input 
                        value={formData.contactEmail}
                        onChange={e => setFormData({...formData, contactEmail: e.target.value})}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400" 
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'apparence' && (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-slate-900 dark:text-white font-bold mb-4">Préférences d'Affichage</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Thème de l'interface</label>
                    <select 
                      value={theme}
                      onChange={e => setTheme(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                    >
                      <option value="light">Clair</option>
                      <option value="dark">Sombre</option>
                      <option value="system">Système (Auto)</option>
                    </select>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Ce réglage s'applique instantanément et ne nécessite pas d'être enregistré.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {['security', 'notifications', 'backup'].includes(activeTab) && (
            <div className="p-10 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-full flex items-center justify-center mb-4">
                {activeTab === 'security' && <Lock className="w-8 h-8" />}
                {activeTab === 'notifications' && <Bell className="w-8 h-8" />}
                {activeTab === 'backup' && <Database className="w-8 h-8" />}
              </div>
              <h3 className="text-slate-900 dark:text-white font-bold mb-1">Section en cours de configuration</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm">Les paramètres de cet onglet seront disponibles prochainement une fois les modules associés activés.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
