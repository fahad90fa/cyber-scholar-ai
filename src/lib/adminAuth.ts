const ADMIN_TOKEN_KEY = 'admin_token';

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
