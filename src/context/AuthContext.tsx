import React, { createContext, useContext, useEffect, useState } from "react";
import { apiClient, authAPI } from "@/services/api";

interface User {
  id: string;
  email: string;
  username: string;
  is_active: boolean;
  created_at: string;
}

interface AuthResponse {
  access_token: string;
  user: User;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = apiClient.getToken();
        if (token) {
          const userData = await authAPI.getCurrentUser();
          setUser(userData as User);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        apiClient.clearToken();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authAPI.login(email, password) as AuthResponse;
    apiClient.setToken(response.access_token);
    setUser(response.user);
  };

  const register = async (
    email: string,
    username: string,
    password: string
  ) => {
    const response = await authAPI.register(email, username, password) as AuthResponse;
    apiClient.setToken(response.access_token);
    setUser(response.user);
    
    try {
      await apiClient.post('/auth/init-profile');
    } catch (error) {
      console.error("Failed to initialize profile:", error);
    }
  };

  const logout = () => {
    apiClient.clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
};
