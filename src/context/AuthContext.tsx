import { createContext, useContext, useState, type ReactNode } from "react";

import type { Role, Permission } from "../auth/permissions";

export interface User {
  id: string;
  name: string;
  email: string;
  roleName: Role;
  roleId: string;
  permissions: Permission[];
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (payload: { user: User; token: string }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem("user");
      if (!stored) return null;
      return JSON.parse(stored) as User;
    } catch {
      return null;
    }
  });

  const login = (payload: { user: User; token: string }) => {
    setUser(payload.user);
    localStorage.setItem("user", JSON.stringify(payload.user));
    localStorage.setItem("accessToken", payload.token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
  };

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
