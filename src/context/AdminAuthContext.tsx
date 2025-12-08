import React, { createContext, useContext, useEffect, useState } from "react";

interface AdminAuthContextType {
  isAdminAuthenticated: boolean;
  adminLoading: boolean;
  adminLogin: (password: string) => Promise<void>;
  adminLogout: () => void;
  adminError: string | null;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const ADMIN_SESSION_KEY = "admin_session";
const ADMIN_SESSION_EXPIRY_KEY = "admin_session_expiry";
const SESSION_DURATION = 24 * 60 * 60 * 1000;

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);
  const [adminError, setAdminError] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminSession = () => {
      const session = localStorage.getItem(ADMIN_SESSION_KEY);
      const expiry = localStorage.getItem(ADMIN_SESSION_EXPIRY_KEY);

      if (session && expiry) {
        const expiryTime = parseInt(expiry, 10);
        if (Date.now() < expiryTime) {
          setIsAdminAuthenticated(true);
        } else {
          localStorage.removeItem(ADMIN_SESSION_KEY);
          localStorage.removeItem('admin_token');
          localStorage.removeItem(ADMIN_SESSION_EXPIRY_KEY);
          setIsAdminAuthenticated(false);
        }
      } else {
        setIsAdminAuthenticated(false);
      }
      setAdminLoading(false);
    };

    checkAdminSession();
  }, []);

  const adminLogin = async (password: string) => {
    try {
      setAdminError(null);
      const correctPassword = import.meta.env.VITE_ADMIN_PASSWORD;

      if (!correctPassword) {
        throw new Error("Admin password not configured");
      }

      if (password !== correctPassword) {
        throw new Error("Invalid password");
      }

      const expiryTime = Date.now() + SESSION_DURATION;
      localStorage.setItem(ADMIN_SESSION_KEY, "true");
      localStorage.setItem(ADMIN_SESSION_EXPIRY_KEY, expiryTime.toString());
      localStorage.setItem('admin_token', correctPassword);
      setIsAdminAuthenticated(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Authentication failed";
      setAdminError(message);
      throw error;
    }
  };

  const adminLogout = () => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    localStorage.removeItem('admin_token');
    localStorage.removeItem(ADMIN_SESSION_EXPIRY_KEY);
    setIsAdminAuthenticated(false);
    setAdminError(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        isAdminAuthenticated,
        adminLoading,
        adminLogin,
        adminLogout,
        adminError,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return context;
};
