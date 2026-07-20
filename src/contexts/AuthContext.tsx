
import React, { createContext, useState, useEffect, useContext } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔐 AuthProvider: Initializing auth state management');
    
    // Set up the auth state listener with enhanced stability
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔐 Auth state change:', event, session?.user?.email || 'no user');
        
        // Only update state if there's an actual change to prevent unnecessary re-renders
        if (event === 'SIGNED_OUT' || !session) {
          setSession(null);
          setUser(null);
        } else if (session && (!user || user.id !== session.user.id)) {
          // Only update if user actually changed
          console.log('🔐 Setting new user session:', session.user.email);
          setSession(session);
          setUser(session.user);
        }
        
        setLoading(false);
      }
    );

    // Get initial session with retry logic for stability
    const getInitialSession = async () => {
      try {
        console.log('🔐 AuthProvider: Getting initial session');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('🔐 Error getting initial session:', error);
        } else if (session) {
          console.log('🔐 Initial session found:', session.user.email);
          setSession(session);
          setUser(session.user);
        } else {
          console.log('🔐 No initial session found');
        }
      } catch (error) {
        console.error('🔐 Error in getInitialSession:', error);
      } finally {
        setLoading(false);
      }
    };

    const handleRecoveryFromUrl = async () => {
      if (typeof window === "undefined") return;

      const hash = window.location.hash;
      const searchParams = new URLSearchParams(window.location.search);
      
      // Check both hash fragment, query params, AND sessionStorage for recovery
      const isRecoveryFromHash = hash.includes('type=recovery') || hash.includes('access_token');
      const isRecoveryFromQuery = searchParams.get('type') === 'recovery';
      const isRecoveryFromStorage = sessionStorage.getItem('soul_sync_recovery_mode') === 'true';
      const storedTokensRaw = sessionStorage.getItem('soul_sync_recovery_tokens');
      
      if (!isRecoveryFromHash && !isRecoveryFromQuery && !isRecoveryFromStorage) return;

      console.log('🔐 AuthProvider: Detected recovery mode', { 
        isRecoveryFromHash, 
        isRecoveryFromQuery, 
        isRecoveryFromStorage,
        hasStoredTokens: !!storedTokensRaw,
        hash: hash.substring(0, 50) 
      });

      // CRITICAL: Set sessionStorage flag IMMEDIATELY
      sessionStorage.setItem('soul_sync_recovery_mode', 'true');

      try {
        let accessToken: string | null = null;
        let refreshToken: string | null = null;

        // PRIORITY 1: Check sessionStorage first (captured by early capture in main.tsx)
        if (storedTokensRaw) {
          try {
            const storedTokens = JSON.parse(storedTokensRaw);
            const tokenAge = Date.now() - (storedTokens.stored_at || 0);
            const TOKEN_EXPIRY = 10 * 60 * 1000; // 10 minutes
            
            if (tokenAge < TOKEN_EXPIRY) {
              accessToken = storedTokens.access_token;
              refreshToken = storedTokens.refresh_token;
              console.log('🔐 Retrieved tokens from sessionStorage (early capture)', {
                tokenAge: Math.round(tokenAge / 1000) + 's',
                tokenPrefix: accessToken?.substring(0, 20)
              });
            } else {
              console.log('🔐 Stored tokens expired, clearing');
              sessionStorage.removeItem('soul_sync_recovery_tokens');
            }
          } catch (e) {
            console.error('🔐 Error parsing stored tokens:', e);
          }
        }

        // PRIORITY 2: Extract tokens from hash (fallback if early capture missed)
        if (!accessToken && hash.includes('access_token')) {
          const hashParams = new URLSearchParams(hash.substring(1));
          accessToken = hashParams.get('access_token');
          refreshToken = hashParams.get('refresh_token');
          console.log('🔐 Extracted tokens from URL hash (fallback)', {
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken
          });
        }

        // Establish session with tokens
        if (accessToken && refreshToken) {
          console.log('🔐 Attempting to set session with tokens...');
          
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          
          if (error) {
            console.error('🔐 Error setting recovery session:', error);
          } else if (data.session) {
            console.log('🔐 Recovery session established:', data.session.user.email);
            setSession(data.session);
            setUser(data.session.user);
            
            // Verify session persistence
            const { data: verifyData } = await supabase.auth.getSession();
            if (verifyData.session) {
              console.log('🔐 Session verified successfully');
            } else {
              console.error('🔐 Session verification failed!');
            }
          }
        } else if (isRecoveryFromQuery || isRecoveryFromStorage) {
          // No tokens but in recovery mode - try getting existing session
          console.log('🔐 No tokens found, checking for existing session...');
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            console.log('🔐 Existing session found:', data.session.user.email);
            setSession(data.session);
            setUser(data.session.user);
          } else {
            console.log('🔐 No existing session found');
          }
        }

        // Clean up URL hash if present
        if (isRecoveryFromHash) {
          const url = new URL(window.location.href);
          url.hash = '';
          url.pathname = '/auth';
          url.searchParams.set('type', 'recovery');
          window.history.replaceState({}, document.title, url.toString());
          console.log('🔐 Cleaned up URL to:', url.toString());
        }
      } catch (error) {
        console.error('🔐 Error processing recovery:', error);
      }
    };

    const initializeAuth = async () => {
      await handleRecoveryFromUrl();
      await getInitialSession();
    };

    initializeAuth();

    return () => {
      console.log('🔐 AuthProvider: Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    console.log('🔐 AuthProvider: Signing out user');
    setLoading(true);
    // Account-isolation hygiene: conversation-adjacent local state must not
    // survive into the next login on a shared device. The legacy unscoped
    // stable_thread_id key is purged; user-scoped caches (twin-reunion:*)
    // are cleared as defense in depth.
    try {
      localStorage.removeItem('stable_thread_id');
      Object.keys(localStorage)
        .filter((k) => k.startsWith('twin-reunion:'))
        .forEach((k) => localStorage.removeItem(k));
    } catch {
      /* storage unavailable — nothing to clear */
    }
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signOut }}>
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
