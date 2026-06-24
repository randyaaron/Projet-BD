import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Settings {
  schoolName: string;
  academicYear: string;
  contactEmail: string;
  contactPhone: string;
}

interface SettingsContextType {
  settings: Settings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: Settings = {
  schoolName: 'Les Génies',
  academicYear: '2025-2026',
  contactEmail: '',
  contactPhone: ''
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  loading: true,
  refreshSettings: async () => {},
});

export const useSettings = () => useContext(SettingsContext);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/admin/settings`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.schoolName) {
          setSettings(data);
          document.title = data.schoolName;
        }
      }
    } catch (err) {
      console.error('Failed to load global settings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}
