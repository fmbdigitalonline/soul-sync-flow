
import React, { createContext, useState, useEffect, useContext } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isNewUser: boolean;
  setIsNewUser: (value: boolean) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    // Set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state change event:", event);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Check if this is a new sign-up event
        if (event === 'SIGNED_IN' && session?.user.app_metadata.provider === 'email') {
          // Check if this user has any blueprints
          checkIfNewUser(session.user.id);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        checkIfNewUser(session.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Check if the user has any blueprints
  const checkIfNewUser = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_blueprints')
        .select('id')
        .eq('user_id', userId)
        .eq('is_active', true)
        .limit(1);
      
      if (error) {
        console.error("Error checking if user has blueprints:", error);
        return;
      }
      
      setIsNewUser(!data || data.length === 0);
      console.log("Is new user:", !data || data.length === 0);
    } catch (error) {
      console.error("Error in checkIfNewUser:", error);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      loading, 
      signOut,
      isNewUser,
      setIsNewUser
    }}>
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
