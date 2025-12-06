import type { AdminSession } from '@/types/admin.types';

const ADMIN_SESSION_KEY = 'cybersec_admin_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const verifyAdminPassword = async (password: string): Promise<boolean> => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-auth`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ password }),
      }
    );
    const data = await response.json();
    return data.success === true;
  } catch {
    return false;
  }
};

export const createAdminSession = (): void => {
  const session: AdminSession = {
    authenticated: true,
    timestamp: Date.now(),
    expiresAt: Date.now() + SESSION_DURATION,
  };
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
};

export const getAdminSession = (): AdminSession | null => {
  const sessionStr = localStorage.getItem(ADMIN_SESSION_KEY);
  if (!sessionStr) return null;
  
  try {
    const session: AdminSession = JSON.parse(sessionStr);
    if (Date.now() > session.expiresAt) {
      clearAdminSession();
      return null;
    }
    return session;
  } catch {
    clearAdminSession();
    return null;
  }
};

export const isAdminAuthenticated = (): boolean => {
  const session = getAdminSession();
  return session?.authenticated === true;
};

export const clearAdminSession = (): void => {
  localStorage.removeItem(ADMIN_SESSION_KEY);
};
