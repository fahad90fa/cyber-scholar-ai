import { useState, useEffect } from 'react';
import { isAdminAuthenticated, clearAdminSession, createAdminSession, verifyAdminPassword } from '@/lib/adminAuth';

export const useAdmin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsAuthenticated(isAdminAuthenticated());
    setLoading(false);
  }, []);

  const login = async (password: string): Promise<boolean> => {
    const isValid = await verifyAdminPassword(password);
    if (isValid) {
      createAdminSession();
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    clearAdminSession();
    setIsAuthenticated(false);
  };

  return { isAuthenticated, loading, login, logout };
};
