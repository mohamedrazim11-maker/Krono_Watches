"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  AuthUser,
  AuthResponse,
  apiLogin,
  apiRegister,
  apiGetProfile,
  apiUpdateProfile,
  apiChangePassword,
} from "@/lib/api";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => Promise<AuthResponse>;
  logout: () => void;
  updateProfile: (data: { name?: string; phone?: string; address?: string }) => Promise<AuthResponse>;
  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }) => Promise<AuthResponse>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "krono_token";
const USER_KEY = "krono_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Helper to set cookie for Next.js middleware support
  const setAuthCookie = (tokenValue: string) => {
    try {
      document.cookie = `krono_token=${tokenValue}; path=/; max-age=604800; SameSite=Lax`;
    } catch {}
  };

  const clearAuthCookie = () => {
    try {
      document.cookie = `krono_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
    } catch {}
  };

  // Merge guest cart with user cart on login (Milestone 4 - Cart Association)
  const mergeGuestCart = (userId: string) => {
    try {
      const guestCartRaw = localStorage.getItem("krono_cart");
      const userCartKey = `krono_cart_${userId}`;
      const userCartRaw = localStorage.getItem(userCartKey);

      const guestCart = guestCartRaw ? JSON.parse(guestCartRaw) : [];
      const userCart = userCartRaw ? JSON.parse(userCartRaw) : [];

      if (guestCart.length > 0) {
        // Merge guest items into user cart by product id
        const merged = [...userCart];
        for (const gItem of guestCart) {
          const existing = merged.find((item: any) => item.product?.id === gItem.product?.id);
          if (existing) {
            existing.quantity = (existing.quantity || 1) + (gItem.quantity || 1);
          } else {
            merged.push(gItem);
          }
        }
        localStorage.setItem(userCartKey, JSON.stringify(merged));
        localStorage.setItem("krono_cart", JSON.stringify(merged));
      }
    } catch (e) {
      console.error("Cart merge error:", e);
    }
  };

  // Initial load
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      const savedUser = localStorage.getItem(USER_KEY);

      if (savedToken) {
        setToken(savedToken);
        setAuthCookie(savedToken);
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
        // Refresh profile from backend
        apiGetProfile()
          .then((res) => {
            if (res.success && res.user) {
              setUser(res.user);
              localStorage.setItem(USER_KEY, JSON.stringify(res.user));
            }
          })
          .catch(() => {})
          .finally(() => setIsLoading(false));
        return;
      }
    } catch (e) {
      console.error("Auth init error:", e);
    }
    setIsLoading(false);
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const res = await apiGetProfile();
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem(USER_KEY, JSON.stringify(res.user));
      }
    } catch (e) {
      console.error("Refresh profile error:", e);
    }
  }, []);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const res = await apiLogin({ email, password });
      if (res.success && res.token && res.user) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem(TOKEN_KEY, res.token);
        localStorage.setItem(USER_KEY, JSON.stringify(res.user));
        setAuthCookie(res.token);
        mergeGuestCart(res.user.id);
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      return await apiRegister(data);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      clearAuthCookie();
    } catch {}
    router.push("/");
  }, [router]);

  const updateProfile = async (data: {
    name?: string;
    phone?: string;
    address?: string;
  }): Promise<AuthResponse> => {
    const res = await apiUpdateProfile(data);
    if (res.success && res.user) {
      setUser((prev) => (prev ? { ...prev, ...res.user } : res.user!));
      try {
        const updated = { ...(user || {}), ...res.user };
        localStorage.setItem(USER_KEY, JSON.stringify(updated));
      } catch {}
    }
    return res;
  };

  const changePassword = async (data: {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }): Promise<AuthResponse> => {
    return await apiChangePassword(data);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
