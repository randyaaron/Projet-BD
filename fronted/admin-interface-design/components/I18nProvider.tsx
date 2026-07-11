'use client';

import { useEffect } from 'react';
import '@/lib/i18n/i18n';

/**
 * Initialise i18next sur le client pour les apps Next.js.
 * À placer dans le layout racine (app/layout.tsx).
 */
export function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // i18n est initialisé par l'import ci-dessus
  }, []);

  return <>{children}</>;
}
