
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
      
      // Check both hash fragment and query params for recovery
      const isRecoveryFromHash = hash.includes('type=recovery') || hash.includes('access_token');
      const isRecoveryFromQuery = searchParams.get('type') === 'recovery';
      
      if (!isRecoveryFromHash && !isRecoveryFromQuery) return;

      console.log('🔐 AuthProvider: Detected recovery mode', { isRecoveryFromHash, isRecoveryFromQuery, hash: hash.substring(0, 100) });

      // CRITICAL: Set sessionStorage flag IMMEDIATELY to survive URL cleanup race condition
      sessionStorage.setItem('soul_sync_recovery_mode', 'true');

      try {
        // CRITICAL: Extract tokens from hash BEFORE any cleanup
        if (hash.includes('access_token')) {
          const hashParams = new URLSearchParams(hash.substring(1)); // Remove the #
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          
          console.log('🔐 Found tokens in hash:', { 
            hasAccessToken: !!accessToken, 
            hasRefreshToken: !!refreshToken,
            accessTokenPrefix: accessToken?.substring(0, 20) 
          });
          
          if (accessToken && refreshToken) {
            // CRITICAL: Store tokens in sessionStorage for fallback recovery
            sessionStorage.setItem('soul_sync_recovery_tokens', JSON.stringify({
              access_token: accessToken,
              refresh_token: refreshToken,
              stored_at: Date.now()
            }));
            console.log('🔐 Tokens stored in sessionStorage for fallback');
            
            // Explicitly set the session with the extracted tokens
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            
            if (error) {
              console.error('🔐 Error setting recovery session:', error);
            } else if (data.session) {
              console.log('🔐 Recovery session established via setSession:', data.session.user.email);
              setSession(data.session);
              setUser(data.session.user);
              
              // Verify session was actually established
              const { data: verifyData } = await supabase.auth.getSession();
              if (verifyData.session) {
                console.log('🔐 Session verified after setSession:', verifyData.session.user.email);
              } else {
                console.error('🔐 Session verification failed - session not persisted!');
              }
            }
          }
        } else {
          // Fallback: try to get existing session
          const { data, error } = await supabase.auth.getSession();
          if (error) {
            console.error('🔐 Error getting recovery session:', error);
          } else if (data.session) {
            console.log('🔐 Recovery session found via getSession:', data.session.user.email);
            setSession(data.session);
            setUser(data.session.user);
          }
        }

        // Clean up the URL AFTER tokens are processed and session is verified
        if (isRecoveryFromHash) {
          const url = new URL(window.location.href);
          url.hash = '';
          url.pathname = '/auth';
          url.searchParams.set('type', 'recovery');
          window.history.replaceState({}, document.title, url.toString());
          console.log('🔐 AuthProvider: Redirected to clean recovery URL:', url.toString());
        }
      } catch (error) {
        console.error('🔐 Error processing recovery callback:', error);
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
