"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  AuthUser,
  AuthResponse,
  ActiveSession,
  apiLogin,
  apiRegister,
  apiLogout,
  apiGetProfile,
  apiUpdateProfile,
  apiChangePassword,
  apiGetSession,
  apiRefreshSession,
  apiGetActiveSessions,
  apiRevokeSession,
  apiRevokeOtherSessions,
} from "@/lib/api";
import { setCookie, deleteCookie, getClientSession } from "./cookieManager";
import { sessionManager, SessionInfo, AuthSyncMessage } from "./sessionManager";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  session: SessionInfo | null;
  activeSessions: ActiveSession[];
  isAuthenticated: boolean;
  isLoading: boolean;
  mergedGuestCount: number;
  expiryWarningMinutes: number | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<AuthResponse>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => Promise<AuthResponse>;
  logout: () => void;
  updateProfile: (data: {
    name?: string;
    phone?: string;
    address?: string;
    secondary_address?: string;
  }) => Promise<AuthResponse>;
  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }) => Promise<AuthResponse>;
  refreshProfile: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  loadActiveSessions: () => Promise<void>;
  revokeSession: (sessionId: string) => Promise<boolean>;
  revokeOtherSessions: () => Promise<boolean>;
  dismissExpiryWarning: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "krono_token";
const USER_KEY = "krono_user";
const SESSION_KEY = "krono_session_info";
const MERGED_COUNT_KEY = "krono_merged_guest_count";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [mergedGuestCount, setMergedGuestCount] = useState<number>(0);
  const [expiryWarningMinutes, setExpiryWarningMinutes] = useState<number | null>(null);
  const router = useRouter();

  // Synchronize client-side cookies for SSR and Next.js middleware
  const syncCookies = (tokenValue: string, rememberMe: boolean = false) => {
    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60;
    setCookie("krono_token", tokenValue, { maxAge, path: "/", sameSite: "Lax" });
  };

  const clearCookies = () => {
    deleteCookie("krono_token", "/");
    deleteCookie("krono_session", "/");
    deleteCookie("krono_client_session", "/");
  };

  // Milestone 4: Cart Association — Logic to merge guest items upon user authentication
  const mergeGuestCart = (userId: string) => {
    try {
      const guestCartRaw = localStorage.getItem("krono_cart");
      const userCartKey = `krono_cart_${userId}`;
      const userCartRaw = localStorage.getItem(userCartKey);

      const guestCart = guestCartRaw ? JSON.parse(guestCartRaw) : [];
      const userCart = userCartRaw ? JSON.parse(userCartRaw) : [];

      if (guestCart.length > 0) {
        let totalMergedUnits = 0;
        const merged = [...userCart];

        for (const gItem of guestCart) {
          totalMergedUnits += gItem.quantity || 1;
          const existing = merged.find((item: any) => item.product?.id === gItem.product?.id);
          if (existing) {
            existing.quantity = (existing.quantity || 1) + (gItem.quantity || 1);
          } else {
            merged.push(gItem);
          }
        }

        localStorage.setItem(userCartKey, JSON.stringify(merged));
        localStorage.setItem("krono_cart", JSON.stringify(merged));
        localStorage.setItem(MERGED_COUNT_KEY, totalMergedUnits.toString());
        setMergedGuestCount(totalMergedUnits);
      }
    } catch (e) {
      console.error("Cart association error:", e);
    }
  };

  // Check and refresh session status from backend
  const checkSessionStatus = useCallback(async (): Promise<boolean> => {
    try {
      const res = await apiGetSession();
      if (res.success && res.isAuthenticated && res.session) {
        setSession(res.session);
        if (res.user) setUser(res.user);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  // Fetch all active devices/sessions for the user
  const loadActiveSessions = useCallback(async () => {
    try {
      const res = await apiGetActiveSessions();
      if (res.success && res.sessions) {
        setActiveSessions(res.sessions);
      }
    } catch (e) {
      console.error("Error fetching active sessions:", e);
    }
  }, []);

  // Secure Logout Sequence
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setSession(null);
    setActiveSessions([]);
    setMergedGuestCount(0);
    setExpiryWarningMinutes(null);

    sessionManager.stopHeartbeat();
    sessionManager.broadcastAuthEvent({ type: "LOGOUT", timestamp: Date.now() });

    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(MERGED_COUNT_KEY);
      clearCookies();
      apiLogout().catch(() => {});
    } catch {}

    router.push("/");
  }, [router]);

  // Initial authentication & session hydration
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      const savedUser = localStorage.getItem(USER_KEY);
      const savedMerged = localStorage.getItem(MERGED_COUNT_KEY);
      const savedSession = localStorage.getItem(SESSION_KEY);

      if (savedMerged) {
        setMergedGuestCount(parseInt(savedMerged, 10) || 0);
      }
      if (savedSession) {
        try {
          setSession(JSON.parse(savedSession));
        } catch {}
      }

      if (savedToken) {
        setToken(savedToken);
        syncCookies(savedToken);
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }

        // Verify session integrity with backend
        apiGetSession()
          .then((res) => {
            if (res.success && res.session) {
              setSession(res.session);
              localStorage.setItem(SESSION_KEY, JSON.stringify(res.session));
              if (res.user) {
                setUser(res.user);
                localStorage.setItem(USER_KEY, JSON.stringify(res.user));
              }
            } else {
              // Session expired or invalidated on server
              logout();
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
  }, [logout]);

  // Multi-tab synchronization and heartbeat setup
  useEffect(() => {
    const unsubSync = sessionManager.onSync((msg: AuthSyncMessage) => {
      if (msg.type === "LOGOUT") {
        setToken(null);
        setUser(null);
        setSession(null);
        setActiveSessions([]);
        clearCookies();
      } else if (msg.type === "LOGIN" || msg.type === "SESSION_REFRESHED") {
        const savedToken = localStorage.getItem(TOKEN_KEY);
        const savedUser = localStorage.getItem(USER_KEY);
        if (savedToken) setToken(savedToken);
        if (savedUser) setUser(JSON.parse(savedUser));
        checkSessionStatus();
      }
    });

    const unsubWarning = sessionManager.onExpiryWarning((minutes: number) => {
      setExpiryWarningMinutes(minutes);
    });

    if (token) {
      sessionManager.startHeartbeat(checkSessionStatus);
    }

    return () => {
      unsubSync();
      unsubWarning();
      sessionManager.stopHeartbeat();
    };
  }, [token, checkSessionStatus]);

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

  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const res = await apiRefreshSession();
      if (res.success && res.session) {
        setSession((prev) => ({ ...(prev || {}), ...res.session } as SessionInfo));
        setExpiryWarningMinutes(null);
        sessionManager.broadcastAuthEvent({ type: "SESSION_REFRESHED", timestamp: Date.now() });
        return true;
      }
      return false;
    } catch (e) {
      console.error("Refresh session error:", e);
      return false;
    }
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = false): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const res = await apiLogin({ email, password, rememberMe });
      if (res.success && res.token && res.user) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem(TOKEN_KEY, res.token);
        localStorage.setItem(USER_KEY, JSON.stringify(res.user));
        syncCookies(res.token, rememberMe);
        mergeGuestCart(res.user.id);

        if (res.session) {
          const sInfo: SessionInfo = {
            id: res.session.id,
            deviceLabel: res.session.deviceLabel || "Web Browser",
            createdAt: res.session.createdAt || new Date().toISOString(),
            expiresAt: typeof res.session.expiresAt === "number" ? new Date(res.session.expiresAt).toISOString() : String(res.session.expiresAt),
            timeRemainingMs: typeof res.session.expiresAt === "number" ? res.session.expiresAt - Date.now() : 7 * 24 * 60 * 60 * 1000,
            rememberMe: Boolean(rememberMe),
          };
          setSession(sInfo);
          localStorage.setItem(SESSION_KEY, JSON.stringify(sInfo));
        }

        sessionManager.broadcastAuthEvent({ type: "LOGIN", userId: res.user.id, timestamp: Date.now() });
        sessionManager.startHeartbeat(checkSessionStatus);
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
      const res = await apiRegister(data);
      if (res.success && res.token && res.user) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem(TOKEN_KEY, res.token);
        localStorage.setItem(USER_KEY, JSON.stringify(res.user));
        syncCookies(res.token, false);
        mergeGuestCart(res.user.id);

        if (res.session) {
          const sInfo: SessionInfo = {
            id: res.session.id,
            deviceLabel: res.session.deviceLabel || "Web Browser",
            createdAt: res.session.createdAt || new Date().toISOString(),
            expiresAt: typeof res.session.expiresAt === "number" ? new Date(res.session.expiresAt).toISOString() : String(res.session.expiresAt),
            timeRemainingMs: typeof res.session.expiresAt === "number" ? res.session.expiresAt - Date.now() : 7 * 24 * 60 * 60 * 1000,
            rememberMe: false,
          };
          setSession(sInfo);
          localStorage.setItem(SESSION_KEY, JSON.stringify(sInfo));
        }

        sessionManager.broadcastAuthEvent({ type: "LOGIN", userId: res.user.id, timestamp: Date.now() });
        sessionManager.startHeartbeat(checkSessionStatus);
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: {
    name?: string;
    phone?: string;
    address?: string;
    secondary_address?: string;
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

  const revokeSession = async (sessionId: string): Promise<boolean> => {
    try {
      const res = await apiRevokeSession(sessionId);
      if (res.success) {
        setActiveSessions((prev) => prev.filter((s) => s.id !== sessionId));
        if (session && session.id === sessionId) {
          logout();
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const revokeOtherSessions = async (): Promise<boolean> => {
    try {
      const res = await apiRevokeOtherSessions();
      if (res.success) {
        loadActiveSessions();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const dismissExpiryWarning = () => {
    setExpiryWarningMinutes(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        session,
        activeSessions,
        isAuthenticated: !!token && !!user,
        isLoading,
        mergedGuestCount,
        expiryWarningMinutes,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        refreshProfile,
        refreshSession,
        loadActiveSessions,
        revokeSession,
        revokeOtherSessions,
        dismissExpiryWarning,
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
