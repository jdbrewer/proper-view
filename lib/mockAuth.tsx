"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface AuthContextType {
  user: string | null;
  login: (name: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  hydrated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Check localStorage on mount
    const storedUser = localStorage.getItem("agent");
    if (storedUser) {
      setIsAuthenticated(true);
      setUser(storedUser);
    }
    setHydrated(true); // Set to true after checking
  }, []);

  const login = (name: string) => {
    setUser(name);
    setIsAuthenticated(true);
    localStorage.setItem("agent", name);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('agent');
    localStorage.removeItem('agentId');
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    hydrated,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
