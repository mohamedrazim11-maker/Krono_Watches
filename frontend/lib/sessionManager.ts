/**
 * Krono Client Session Management Engine
 * Provides cross-tab synchronization, heartbeat verification, idle detection,
 * and automatic renewal/revocation orchestration.
 */

import { getClientSession, deleteCookie } from "./cookieManager";

export interface SessionInfo {
  id: string;
  deviceLabel: string;
  createdAt: string;
  expiresAt: string;
  timeRemainingMs: number;
  rememberMe: boolean;
  cookieSecurity?: {
    httpOnly: boolean;
    sameSite: string;
    secure: boolean;
  };
}

export type AuthSyncMessage =
  | { type: "LOGIN"; userId: string; timestamp: number }
  | { type: "LOGOUT"; timestamp: number }
  | { type: "SESSION_REFRESHED"; timestamp: number };

type SyncListener = (msg: AuthSyncMessage) => void;
type ExpiryWarningListener = (minutesRemaining: number) => void;

class SessionManager {
  private syncChannel: BroadcastChannel | null = null;
  private syncListeners: Set<SyncListener> = new Set();
  private warningListeners: Set<ExpiryWarningListener> = new Set();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private lastActivity: number = Date.now();
  private isWarningDispatched: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.initBroadcastChannel();
      this.initActivityTracker();
    }
  }

  private initBroadcastChannel() {
    try {
      const globalWin = typeof window !== "undefined" ? (window as any) : null;
      if (!globalWin) return;

      if ("BroadcastChannel" in globalWin) {
        this.syncChannel = new BroadcastChannel("krono_auth_sync");
        this.syncChannel.onmessage = (event: MessageEvent) => {
          if (event.data && event.data.type) {
            this.notifySyncListeners(event.data);
          }
        };
      } else if (globalWin.addEventListener) {
        // Fallback to storage event for older browsers
        globalWin.addEventListener("storage", (e: StorageEvent) => {
          if (e.key === "krono_auth_event" && e.newValue) {
            try {
              const data = JSON.parse(e.newValue);
              this.notifySyncListeners(data);
            } catch {}
          }
        });
      }
    } catch (e) {
      console.warn("BroadcastChannel initialization skipped:", e);
    }
  }

  private initActivityTracker() {
    const handleActivity = () => {
      this.lastActivity = Date.now();
    };

    window.addEventListener("mousemove", handleActivity, { passive: true });
    window.addEventListener("keydown", handleActivity, { passive: true });
    window.addEventListener("touchstart", handleActivity, { passive: true });
    window.addEventListener("click", handleActivity, { passive: true });
  }

  /**
   * Broadcast authentication events across all open browser tabs
   */
  public broadcastAuthEvent(message: AuthSyncMessage) {
    if (this.syncChannel) {
      this.syncChannel.postMessage(message);
    }
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("krono_auth_event", JSON.stringify(message));
      } catch {}
    }
  }

  /**
   * Subscribe to multi-tab auth synchronization events
   */
  public onSync(listener: SyncListener): () => void {
    this.syncListeners.add(listener);
    return () => {
      this.syncListeners.delete(listener);
    };
  }

  private notifySyncListeners(msg: AuthSyncMessage) {
    for (const listener of this.syncListeners) {
      try {
        listener(msg);
      } catch (err) {
        console.error("Sync listener error:", err);
      }
    }
  }

  /**
   * Subscribe to session expiration warnings
   */
  public onExpiryWarning(listener: ExpiryWarningListener): () => void {
    this.warningListeners.add(listener);
    return () => {
      this.warningListeners.delete(listener);
    };
  }

  /**
   * Start heartbeat checking to maintain session and detect server-side invalidation
   */
  public startHeartbeat(checkCallback: () => Promise<boolean>, intervalMs: number = 3 * 60 * 1000) {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(async () => {
      const clientSession = getClientSession();
      if (!clientSession) {
        this.stopHeartbeat();
        return;
      }

      const msRemaining = clientSession.expiresAt - Date.now();
      const minsRemaining = Math.round(msRemaining / 60000);

      // Trigger warning if less than 15 minutes remaining and not yet alerted
      if (minsRemaining <= 15 && minsRemaining > 0 && !this.isWarningDispatched) {
        this.isWarningDispatched = true;
        for (const listener of this.warningListeners) {
          try {
            listener(minsRemaining);
          } catch {}
        }
      }

      // Check with backend
      const isValid = await checkCallback();
      if (!isValid) {
        this.stopHeartbeat();
        this.broadcastAuthEvent({ type: "LOGOUT", timestamp: Date.now() });
      }
    }, intervalMs);
  }

  public stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    this.isWarningDispatched = false;
  }

  /**
   * Check if user was recently active (within last 10 minutes)
   */
  public isRecentlyActive(thresholdMs: number = 10 * 60 * 1000): boolean {
    return Date.now() - this.lastActivity < thresholdMs;
  }
}

export const sessionManager = new SessionManager();
