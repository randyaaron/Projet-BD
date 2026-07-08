export interface LegacyApiError {
  message: string;
}

export function getLegacyAdminId(): string | null {
  return localStorage.getItem('legacy_admin_id');
}

export function getLegacyAdminTypeLabel(): string | null {
  return localStorage.getItem('legacy_admin_type_label');
}

export function isLegacyDemoMode(): boolean {
  return String(import.meta.env.VITE_LEGACY_DEMO_MODE || '').toLowerCase() === 'true';
}

export async function legacyFetch<T = unknown>(url: string, init: RequestInit = {}): Promise<T> {
  const adminId = getLegacyAdminId();
  const headers = new Headers(init.headers || {});
  if (!headers.has('Content-Type') && init.body && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }
  if (adminId) {
    headers.set('X-Admin-Id', adminId);
    if (adminId === '999') {
      headers.set('X-Admin-Role', getLegacyAdminTypeLabel() || 'SUPER_ADMIN');
    }
  } else if (isLegacyDemoMode()) {
    // En mode démo, on pose un id fictif pour simplifier les tests frontend.
    headers.set('X-Admin-Id', '999');
    headers.set('X-Admin-Role', getLegacyAdminTypeLabel() || 'SUPER_ADMIN');
  }

  const response = await fetch(url, { ...init, headers });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error((payload as LegacyApiError).message || 'Erreur API');
  }
  return payload as T;
}

