"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiClient, ApiError } from "@/lib/api-client";

export interface UserPreferences {
  work_start_time?: string;
  work_end_time?: string;
  max_daily_meetings?: number;
  meeting_buffer_minutes?: number;
  communication_tone?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string | null;
  preferences?: UserPreferences | null;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string | null;
  user: {
    user_id: string;
    email: string;
    full_name: string;
    preferences?: UserPreferences;
  };
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const TOKEN_KEY = "flow_access_token";
export const USER_KEY = "flow_user_data";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    try {
      const profile = await apiClient.get<AuthUser>("/auth/me");
      setUser(profile);
      if (typeof window !== "undefined") {
        localStorage.setItem(USER_KEY, JSON.stringify(profile));
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        // Token expired or invalid
        logout();
      }
    }
  }, []);

  // Initialize session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (storedToken) {
          setToken(storedToken);
          if (storedUser) {
            try {
              setUser(JSON.parse(storedUser));
            } catch {
              // Ignore parse error
            }
          }
          // Verify token against backend
          await refreshUser();
        }
      } catch (e) {
        console.error("Failed to restore auth session:", e);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [refreshUser]);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await apiClient.post<TokenResponse>("/auth/login", {
        email,
        password,
      });

      const accessToken = response.access_token;
      const authUser: AuthUser = {
        id: response.user.user_id,
        email: response.user.email,
        full_name: response.user.full_name,
        preferences: response.user.preferences,
      };

      localStorage.setItem(TOKEN_KEY, accessToken);
      localStorage.setItem(USER_KEY, JSON.stringify(authUser));

      setToken(accessToken);
      setUser(authUser);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (fullName: string, email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await apiClient.post<TokenResponse>("/auth/signup", {
        full_name: fullName,
        email,
        password,
      });

      const accessToken = response.access_token;
      const authUser: AuthUser = {
        id: response.user.user_id,
        email: response.user.email,
        full_name: response.user.full_name,
        preferences: response.user.preferences,
      };

      localStorage.setItem(TOKEN_KEY, accessToken);
      localStorage.setItem(USER_KEY, JSON.stringify(authUser));

      setToken(accessToken);
      setUser(authUser);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    setToken(null);
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

