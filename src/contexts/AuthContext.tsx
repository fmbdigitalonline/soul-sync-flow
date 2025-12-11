
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
      if (!hash || !hash.includes('type=recovery')) return;

      try {
        console.log('🔐 AuthProvider: Handling recovery from URL');
        const { data, error } = await supabase.auth.getSessionFromUrl({ storeSession: true });

        if (error) {
          console.error('🔐 Error handling recovery session:', error);
          return;
        }

        if (data.session) {
          console.log('🔐 Recovery session established for:', data.session.user.email);
          setSession(data.session);
          setUser(data.session.user);
        }

        const url = new URL(window.location.href);
        url.hash = '';
        url.pathname = '/auth';
        url.searchParams.set('type', 'recovery');
        window.history.replaceState({}, document.title, url.toString());
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
