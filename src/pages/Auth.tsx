import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GradientButton } from "@/components/ui/gradient-button";
import MainLayout from "@/components/Layout/MainLayout";
import { StarField } from "@/components/ui/star-field";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isNewUser, setIsNewUser } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (isNewUser) {
        // New users should go through onboarding
        navigate("/onboarding");
      } else {
        // Existing users go to blueprint
        navigate("/blueprint");
      }
    }
  }, [user, isNewUser, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign up flow
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          throw error;
        }
        
        // New user - mark for onboarding
        setIsNewUser(true);
        toast({
          title: "Account created!",
          description: "Please check your email for a confirmation link",
        });
      } else {
        // Sign in flow
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw error;
        }
        
        toast({
          title: "Welcome back!",
          description: "You have been successfully logged in.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Authentication error",
        description: error.message || "Failed to authenticate",
      });
      console.error("Authentication error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout hideNav>
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <StarField className="absolute inset-0 z-0" />
        
        <Card className="w-full max-w-md z-10 bg-background/80 backdrop-blur-md border-soul-dark">
          <CardHeader>
            <CardTitle className="text-2xl font-display text-center">
              {isSignUp ? "Create Your Account" : "Welcome Back"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </div>
              
              <GradientButton 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading 
                  ? "Loading..." 
                  : isSignUp 
                    ? "Create Account" 
                    : "Sign In"
                }
              </GradientButton>
              
              <div className="text-center mt-4">
                <Button 
                  variant="link" 
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                >
                  {isSignUp 
                    ? "Already have an account? Sign In" 
                    : "Need an account? Sign Up"
                  }
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Auth;
