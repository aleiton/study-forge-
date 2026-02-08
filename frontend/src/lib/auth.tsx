"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import apiClient from "./api-client";

interface User {
  id: number;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("jwt_token");
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await apiClient.post("/login", {
      user: { email, password },
    });
    const token = response.headers.authorization?.replace("Bearer ", "");
    if (token) {
      localStorage.setItem("jwt_token", token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      setUser(response.data.user);
    }
  }, []);

  const signup = useCallback(async (email: string, password: string) => {
    const response = await apiClient.post("/signup", {
      user: { email, password },
    });
    const token = response.headers.authorization?.replace("Bearer ", "");
    if (token) {
      localStorage.setItem("jwt_token", token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      setUser(response.data.user);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.delete("/logout");
    } finally {
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("user");
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
