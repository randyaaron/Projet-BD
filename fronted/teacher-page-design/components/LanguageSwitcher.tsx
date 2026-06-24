'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n/i18n';

interface LanguageSwitcherProps {
  variant?: 'light' | 'dark';
}

export function LanguageSwitcher({ variant = 'dark' }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  // Hydration-safe: wait for client mount before rendering
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const toggle = () => {
    const next = i18n.language?.startsWith('en') ? 'fr' : 'en';
    i18n.changeLanguage(next);
  };

  if (!mounted) return null;

  const isEn = i18n.language?.startsWith('en');
  const isLight = variant === 'light';

  return (
    <button
      onClick={toggle}
      title={isEn ? 'Passer en Français' : 'Switch to English'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        borderRadius: '8px',
        border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.2)',
        background: isLight ? '#ffffff' : 'rgba(255,255,255,0.1)',
        color: isLight ? '#334155' : '#ffffff',
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        letterSpacing: '0.05em',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.background = isLight
          ? '#f1f5f9'
          : 'rgba(255,255,255,0.2)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.background = isLight
          ? '#ffffff'
          : 'rgba(255,255,255,0.1)';
      }}
    >
      <span style={{ fontSize: '16px' }}>{isEn ? '🇬🇧' : '🇫🇷'}</span>
      <span>{isEn ? 'EN' : 'FR'}</span>
      <span style={{ opacity: 0.5, fontSize: '11px' }}>{isEn ? '→ FR' : '→ EN'}</span>
    </button>
  );
}
