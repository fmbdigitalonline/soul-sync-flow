import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { safeInterpolateTranslation } from "@/utils/sanitize";
import MainLayout from "@/components/Layout/MainLayout";
import { PageContainer, PageHeader, PageSection } from "@/components/Layout/PageContainer";
import { PersonalizedQuoteDisplay } from "@/components/ui/personalized-quote-display";
import { Button } from "@/components/ui/button";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { TutorialModal } from "@/components/tutorial/TutorialModal";
import PersonalityDemo from "@/components/personality/PersonalityDemo";
import { LanguageSelector } from "@/components/ui/language-selector";
import { useSoulOrb } from "@/contexts/SoulOrbContext";
import { useOptimizedBlueprintData } from "@/hooks/use-optimized-blueprint-data";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { useTutorialFlow } from "@/hooks/use-tutorial-flow";
import { isAdminUser } from "@/utils/isAdminUser";
import { Heart, Sparkles, Brain, BookOpen, ArrowRight, LogIn } from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  const { speak } = useSoulOrb();
  const navigate = useNavigate();
  const [showDemo, setShowDemo] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const {
    blueprintData,
    hasBlueprint,
    loading,
    getDisplayName
  } = useOptimizedBlueprintData();
  const isAdmin = isAdminUser(user);
  const { t, language } = useLanguage();
  const {
    spacing,
    layout,
    touchTargetSize,
    getTextSize,
    isFoldDevice,
    isUltraNarrow,
    isMobile
  } = useResponsiveLayout();
  const { 
    tutorialState, 
    startTutorial, 
    continueTutorial, 
    completeTutorial 
  } = useTutorialFlow();

  console.log('🎭 Index render - user:', !!user, 'showTutorial:', showTutorial, 'tutorialState:', tutorialState);

  const welcomeMessage = useMemo(() => {
    if (!user) return null;
    if (hasBlueprint) {
      return t("index.welcomeBackReady");
    } else {
      return t("index.createToGetStarted");
    }
  }, [user, hasBlueprint, t]);

  const subtitleMessages = useMemo(() => {
    if (user && hasBlueprint) {
      return [t("index.subtitle") || "Discover your authentic path through personalized AI guidance and spiritual growth tools."];
    }
    const messages = t("index.rotatingMessages");
    if (Array.isArray(messages)) {
      return messages;
    }
    return [t("index.subtitle") || "Discover your authentic path through personalized AI guidance and spiritual growth tools."];
  }, [t, language, user, hasBlueprint]);

  const userName = useMemo(() => {
    return blueprintData?.user_meta?.preferred_name || getDisplayName || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Friend';
  }, [blueprintData, getDisplayName, user]);

  const currentSubtitle = useMemo(() => {
    return subtitleMessages[0] || t("index.subtitle") || "Welcome to your spiritual journey";
  }, [subtitleMessages, t]);

  useEffect(() => {
    if (user && !loading && welcomeMessage) {
      const timer = setTimeout(() => {
        speak(welcomeMessage);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, loading, welcomeMessage, speak]);

  const handleGetStarted = () => {
    if (user) {
      if (hasBlueprint) {
        speak(t("index.startingTutorial"));
        navigate("/blueprint");
      } else {
        navigate("/onboarding");
      }
    } else {
      navigate("/auth");
    }
  };

  const handleTutorialStart = () => {
    console.log('🎭 TUTORIAL BUTTON CLICKED - Starting handleTutorialStart');
    console.log('🎭 User exists:', !!user);
    console.log('🎭 Current showTutorial state:', showTutorial);
    console.log('🎭 Current tutorialState:', tutorialState);
    
    if (!user) {
      console.log('🎭 ERROR: No user found, cannot start tutorial');
      return;
    }
    
    try {
      console.log('🎭 Calling startTutorial()...');
      const newTutorialState = startTutorial();
      console.log('🎭 startTutorial() returned:', newTutorialState);
      
      console.log('🎭 Setting showTutorial to true...');
      setShowTutorial(true);
      console.log('🎭 Tutorial modal should now be visible');
      
    } catch (error) {
      console.error('🎭 ERROR in handleTutorialStart:', error);
    }
  };

  if (showDemo) {
    return (
      <MainLayout>
        <PageContainer>
          <Button variant="ghost" onClick={() => setShowDemo(false)} className="mb-4">
            {t("index.backToHome")}
          </Button>
          <PersonalityDemo />
        </PageContainer>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageContainer maxWidth="saas" className="min-h-screen flex flex-col justify-center bg-gradient-to-br from-background via-accent/5 to-primary/5">
        {/* Hero Section */}
        <PageSection className="text-center">
          <div className="space-y-6 mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold font-cormorant gradient-text">
              {safeInterpolateTranslation(user ? "Welcome to SoulSync, {name}" : "Welcome to SoulSync", { name: userName })}
            </h1>
            <div className="h-16 flex items-center justify-center">
              <p className="text-xl text-muted-foreground font-inter">
                {safeInterpolateTranslation(currentSubtitle, { name: userName })}
              </p>
            </div>
            <div className="flex items-center justify-center">
              <PersonalizedQuoteDisplay className="text-lg text-muted-foreground font-inter" interval={4000} />
            </div>
          </div>
        </PageSection>

        {/* Navigation Cards - Modern 12-column grid */}
        {hasBlueprint && (
          <PageSection>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <Link to="/dreams" className="group">
                <CosmicCard variant="interactive" size="lg" floating className="h-full">
                  <div className="text-center space-y-4">
                    <Heart className="h-12 w-12 text-primary mx-auto group-hover:text-accent transition-colors" />
                    <div>
                      <h3 className="text-xl font-semibold font-cormorant text-foreground">{t('index.dreams')}</h3>
                      <p className="text-muted-foreground font-inter mt-2">{t('index.dreamsDesc')}</p>
                    </div>
                  </div>
                </CosmicCard>
              </Link>
              <Link to="/spiritual-growth" className="group">
                <CosmicCard variant="interactive" size="lg" floating className="h-full">
                  <div className="text-center space-y-4">
                    <Sparkles className="h-12 w-12 text-primary mx-auto group-hover:text-accent transition-colors" />
                    <div>
                      <h3 className="text-xl font-semibold font-cormorant text-foreground">{t('index.growth')}</h3>
                      <p className="text-muted-foreground font-inter mt-2">{t('index.growthDesc')}</p>
                    </div>
                  </div>
                </CosmicCard>
              </Link>
              <Link to="/companion" className="group">
                <CosmicCard variant="interactive" size="lg" floating className="h-full">
                  <div className="text-center space-y-4">
                    <Brain className="h-12 w-12 text-primary mx-auto group-hover:text-accent transition-colors" />
                    <div>
                      <h3 className="text-xl font-semibold font-cormorant text-foreground">{t('index.companion')}</h3>
                      <p className="text-muted-foreground font-inter mt-2">{t('index.companionDesc')}</p>
                    </div>
                  </div>
                </CosmicCard>
              </Link>
            </div>
          </PageSection>
        )}

        {/* Admin Demo Button */}
        {user && isAdminUser(user) && (
          <div className="flex justify-center mb-8">
            <Button
              onClick={() => setShowDemo(true)}
              variant="outline"
              className="font-inter h-touch"
            >
              <Brain className="h-5 w-5 mr-2" />
              {t('index.demoButton')}
            </Button>
          </div>
        )}

        {/* Language Selector */}
        <div className="flex justify-center mb-12">
          <LanguageSelector />
        </div>

        {/* Action Buttons - Modern CTA section */}
        <PageSection className="text-center">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            {user && hasBlueprint && (
              <Button
                onClick={() => navigate('/blueprint')}
                size="lg"
                className="font-inter group h-touch px-8"
              >
                <BookOpen className="h-5 w-5 mr-2 group-hover:rotate-3 transition-transform" />
                {t('index.viewBlueprint')}
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            )}
            {user && !hasBlueprint && (
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => navigate('/onboarding')}
                  size="lg"
                  className="font-inter h-touch px-8"
                >
                  {t('index.getStarted')}
                </Button>
                <Button
                  onClick={handleTutorialStart}
                  variant="outline"
                  size="lg"
                  className="font-inter h-touch px-8"
                >
                  <BookOpen className="h-5 w-5 mr-2" />
                  {t('index.takeTour')}
                </Button>
              </div>
            )}
            {!user && (
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => navigate('/onboarding')}
                  size="lg"
                  className="font-inter h-touch px-8"
                >
                  <ArrowRight className="h-5 w-5 mr-2" />
                  {t('index.getStarted')}
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="font-inter h-touch px-8"
                >
                  <Link to="/auth">
                    <LogIn className="h-5 w-5 mr-2" />
                    {t('auth.signIn')}
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </PageSection>
      </PageContainer>

      {showTutorial && (
        <TutorialModal
          isOpen={showTutorial}
          onClose={() => setShowTutorial(false)}
          tutorialState={tutorialState}
          onContinue={continueTutorial}
          onComplete={completeTutorial}
        />
      )}
    </MainLayout>
  );
};

export default Index;
