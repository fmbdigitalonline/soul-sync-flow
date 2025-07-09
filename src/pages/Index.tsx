import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { SoulOrbAvatar } from "@/components/ui/avatar";
import { ArrowRight, LogIn, Heart, Sparkles, Brain, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { useSoulOrb } from "@/contexts/SoulOrbContext";
import { useNavigate } from "react-router-dom";
import { UnifiedCard } from "@/components/ui/unified-card";
import { useTextSize } from "@/hooks/use-text-size";
import { useUnifiedSpacing } from "@/components/ui/unified-spacing";
import PersonalityDemo from "@/components/personality/PersonalityDemo";
import { useOptimizedBlueprintData } from "@/hooks/use-optimized-blueprint-data";
import { isAdminUser } from "@/utils/isAdminUser";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/ui/language-selector";
import { RotatingText } from "@/components/ui/rotating-text";
import { PersonalizedQuoteDisplay } from "@/components/ui/personalized-quote-display";
import MainLayout from "@/components/Layout/MainLayout";

const Index = () => {
  const {
    user
  } = useAuth();
  const {
    speak
  } = useSoulOrb();
  const navigate = useNavigate();
  const [showDemo, setShowDemo] = useState(false);
  const {
    hasBlueprint,
    loading
  } = useOptimizedBlueprintData();
  const isAdmin = isAdminUser(user);
  const { t, language } = useLanguage();
  const { getStandardTextSize } = useTextSize();
  const { getContainer, getPadding, getSpacing } = useUnifiedSpacing();

  // Memoize the welcome message logic to prevent re-renders
  const welcomeMessage = useMemo(() => {
    if (!user) return null;
    if (hasBlueprint) {
      return t("index.welcomeBackReady");
    } else {
      return t("index.createToGetStarted");
    }
  }, [user, hasBlueprint, t]);

  // Get dynamic subtitle messages - personalized quotes for authenticated users with blueprints
  const subtitleMessages = useMemo(() => {
    if (user && hasBlueprint) {
      // For authenticated users with blueprints, we'll use personalized quotes
      // This will be replaced by the PersonalizedQuoteDisplay component
      return [t("index.subtitle") || "Discover your authentic path through personalized AI guidance and spiritual growth tools."];
    }
    
    const messages = t("index.rotatingMessages");
    // Handle both string and array cases safely
    if (Array.isArray(messages)) {
      return messages;
    }
    // Fallback to a default message if translation fails
    return [t("index.subtitle") || "Discover your authentic path through personalized AI guidance and spiritual growth tools."];
  }, [t, language, user, hasBlueprint]);

  // Only speak welcome message once when user and blueprint data are loaded
  useEffect(() => {
    if (user && !loading && welcomeMessage) {
      // Add a small delay to prevent rapid-fire speaking
      const timer = setTimeout(() => {
        speak(welcomeMessage);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, loading, welcomeMessage, speak]);
  
  const handleGetStarted = () => {
    if (user) {
      if (hasBlueprint) {
        // User has blueprint - navigate to blueprint page
        speak(t("index.startingTutorial"));
        navigate("/blueprint");
      } else {
        navigate("/onboarding");
      }
    } else {
      navigate("/auth");
    }
  };
  
  if (showDemo) {
    return (
      <MainLayout>
        <div className="w-full min-h-screen p-4 sm:p-6">
          <div className="mb-4 sm:mb-6">
            <Button variant="ghost" onClick={() => setShowDemo(false)} className="mb-4 text-sm sm:text-base">
              {t("index.backToHome")}
            </Button>
          </div>
          <PersonalityDemo />
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="w-full min-h-[90vh] flex flex-col justify-center p-4 sm:p-6 pb-24 md:pb-6">
        <div className="w-full max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6 sm:mb-8">
            <SoulOrbAvatar size="lg" />
          </div>
          
          <h1 
            className={`font-heading font-bold ${getStandardTextSize('h1')} mb-4 sm:mb-6 px-4`}
            dangerouslySetInnerHTML={{ __html: t('index.welcome') }}
          />
          
          {user && hasBlueprint ? (
            <PersonalizedQuoteDisplay 
              className="text-lg sm:text-xl mb-6 sm:mb-8 px-4 text-muted-foreground min-h-[3.5rem] flex items-center justify-center"
              interval={4000}
              fallbackQuotes={subtitleMessages}
            />
          ) : (
            <RotatingText 
              texts={subtitleMessages}
              className={`${getStandardTextSize('body')} mb-6 sm:mb-8 px-4 text-muted-foreground min-h-[3.5rem] flex items-center justify-center`}
              interval={4000}
            />
          )}

          {user && <div className={`grid grid-cols-1 sm:grid-cols-3 ${getSpacing('md')} mb-6 sm:mb-8 max-w-2xl mx-auto px-4`}>
                <Link to="/dreams" className="block">
                  <UnifiedCard variant="shadowed" className={`${getPadding('md')} hover:scale-105 transition-transform cursor-pointer h-full`}>
                    <Heart className="h-6 w-6 text-primary mx-auto mb-2" />
                    <h3 className={`font-heading font-semibold mb-1 ${getStandardTextSize('h4')}`}>{t("index.dreams")}</h3>
                    <p className={`${getStandardTextSize('small')} text-muted-foreground`}>{t("index.dreamsDesc")}</p>
                  </UnifiedCard>
                </Link>
                
                <Link to="/spiritual-growth" className="block">
                  <UnifiedCard variant="shadowed" className={`${getPadding('md')} hover:scale-105 transition-transform cursor-pointer h-full`}>
                    <Sparkles className="h-6 w-6 text-primary mx-auto mb-2" />
                    <h3 className={`font-heading font-semibold mb-1 ${getStandardTextSize('h4')}`}>{t("index.growth")}</h3>
                    <p className={`${getStandardTextSize('small')} text-muted-foreground`}>{t("index.growthDesc")}</p>
                  </UnifiedCard>
                </Link>
                
                <Link to="/coach" className="block">
                  <UnifiedCard variant="shadowed" className={`${getPadding('md')} hover:scale-105 transition-transform cursor-pointer h-full`}>
                    <Brain className="h-6 w-6 text-primary mx-auto mb-2" />
                    <h3 className={`font-heading font-semibold mb-1 ${getStandardTextSize('h4')}`}>{t("index.companion")}</h3>
                    <p className={`${getStandardTextSize('small')} text-muted-foreground`}>{t("index.companionDesc")}</p>
                  </UnifiedCard>
                </Link>
              </div>}

          {/* Show the demo button only for admin */}
          {isAdmin && <div className="mb-4 sm:mb-6 px-4">
            <Button variant="outline" onClick={() => setShowDemo(true)} className="mb-4 w-full sm:w-auto text-sm sm:text-base h-10 sm:h-11">
              <Brain className="mr-2 h-4 w-4" />
              {t("index.demo")}
            </Button>
          </div>}
          
          {/* Language Selector - positioned above the action buttons */}
          <div className="flex justify-center mb-6 px-4">
            <LanguageSelector />
          </div>
          
          <div className="flex flex-col gap-3 sm:gap-4 px-4 max-w-md mx-auto">
            {user ? <>
              <Button variant="filled" size="lg" className="w-full" onClick={handleGetStarted}>
                {hasBlueprint ? (
                  <>
                    <BookOpen />
                    {t("index.takeTour")}
                  </>
                ) : (
                  <>
                    {t("index.startJourney")}
                    <ArrowRight />
                  </>
                )}
              </Button>
              
              <Link to="/coach" className="block">
                <Button variant="outline" size="lg" className="w-full">
                  {t("index.chatWithCompanion")}
                </Button>
              </Link>
            </> : <>
              <Button variant="filled" size="lg" className="w-full" onClick={handleGetStarted}>
                {t("index.getStarted")}
                <ArrowRight />
              </Button>
              
              <Link to="/auth" className="block">
                <Button variant="outline" size="lg" className="w-full">
                  {t("index.signIn")}
                  <LogIn />
                </Button>
              </Link>
            </>}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
