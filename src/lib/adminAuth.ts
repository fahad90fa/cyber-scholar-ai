const ADMIN_TOKEN_KEY = 'admin_token';
const ADMIN_PASSWORD_KEY = 'admin_password';

export const getAdminToken = (): string | null => {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
};

export const setAdminToken = (token: string): void => {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
};

export const clearAdminSession = (): void => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
};

export const isAdminAuthenticated = (): boolean => {
  const token = getAdminToken();
  return token !== null && token !== '';
};

export const getAdminTokenHeader = (): Record<string, string> => {
  const token = getAdminToken();
  if (!token) {
    return {};
  }
  return {
    'Authorization': `Bearer ${token}`,
  };
};

export const createAdminSession = (): void => {
  const password = localStorage.getItem(ADMIN_PASSWORD_KEY);
  if (password) {
    setAdminToken(password);
  }
};

export const verifyAdminPassword = async (password: string): Promise<boolean> => {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const response = await fetch(`${supabaseUrl}/functions/v1/admin-auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });

    const data = await response.json();
    if (data.success) {
      localStorage.setItem(ADMIN_PASSWORD_KEY, password);
      setAdminToken(password);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Admin auth error:', error);
    return false;
  }
};
