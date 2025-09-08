
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Loader2, Eye, EyeOff, Sparkles } from "lucide-react";
import { SoulOrbAvatar } from "@/components/ui/avatar";
import { LanguageSelector } from "@/components/ui/language-selector";
import { getFunnelData, clearFunnelData, getFunnelSummary } from "@/utils/funnel-data";

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();

  const from = location.state?.from?.pathname || "/";
  const fromFunnel = searchParams.get('from') === 'funnel';
  const funnelData = getFunnelData();
  const [isSignUp, setIsSignUp] = useState(fromFunnel && funnelData ? true : false);

  useEffect(() => {
    if (!authLoading && user) {
      // If user came from funnel and has funnel data, go to onboarding to personalize experience
      if (fromFunnel && funnelData) {
        navigate("/onboarding", { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
  }, [user, authLoading, navigate, from, fromFunnel, funnelData]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: t('error'),
        description: t('auth.passwordsDontMatch'),
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: t('error'),
        description: t('auth.passwordTooShort'),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/onboarding`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) throw error;

      toast({
        title: t('auth.success'),
        description: fromFunnel && funnelData 
          ? t('auth.accountCreatedWithBlueprint')
          : t('auth.signUpSuccess'),
      });

      navigate("/onboarding", { replace: true });
      
    } catch (error: any) {
      console.error("Sign up error:", error);
      toast({
        title: t('error'),
        description: error.message || t('auth.signUpFailed'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: t('auth.welcomeBack'),
        description: t('auth.welcomeBackMessage'),
      });

      // Clear funnel data on successful sign in (they're already a user)
      if (fromFunnel) {
        clearFunnelData();
      }
      navigate(from, { replace: true });
      
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast({
        title: t('error'),
        description: error.message || t('auth.signInFailed'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-soul-purple"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-soul-black to-soul-purple/20 p-4">
      <Card className="w-full max-w-md bg-card/50 backdrop-blur-sm border-white/10">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-end">
            <LanguageSelector />
          </div>
          
          {fromFunnel && funnelData && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">{t('auth.funnelReportReady')}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('auth.completeAccountMessage')}
              </p>
            </div>
          )}
          
          <div className="flex justify-center">
            <SoulOrbAvatar size="md" />
          </div>
          <div>
            <CardTitle className="text-2xl font-display">
              {fromFunnel && funnelData && isSignUp 
                ? t('auth.createYourAccount')
                : isSignUp ? t('auth.createAccount') : t('auth.welcomeBack')}
            </CardTitle>
            <CardDescription>
              {fromFunnel && funnelData && isSignUp
                ? t('auth.accessPersonalizedBlueprint')
                : isSignUp ? t('auth.startJourney') : t('auth.continueJourney')}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.enterEmail')}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.enterPassword')}
                  required
                  disabled={isLoading}
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('auth.confirmPasswordPlaceholder')}
                  required
                  disabled={isLoading}
                  minLength={6}
                />
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-soul-purple hover:bg-soul-purple/90" 
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSignUp ? t('auth.createAccount') : t('nav.signIn')}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setPassword("");
                setConfirmPassword("");
              }}
              disabled={isLoading}
              className="text-soul-purple hover:text-soul-purple/80"
            >
              {isSignUp ? t('auth.alreadyHaveAccount') : t('auth.needAccount')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
