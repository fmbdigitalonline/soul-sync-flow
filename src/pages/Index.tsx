import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { SoulOrbAvatar } from "@/components/ui/avatar";
import { ArrowRight, LogIn, Heart, Sparkles, Brain, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { useSoulOrb } from "@/contexts/SoulOrbContext";
import { useNavigate } from "react-router-dom";
import { CosmicCard } from "@/components/ui/cosmic-card";
import PersonalityDemo from "@/components/personality/PersonalityDemo";
import { useOptimizedBlueprintData } from "@/hooks/use-optimized-blueprint-data";
import { isAdminUser } from "@/utils/isAdminUser";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/ui/language-selector";
import { RotatingText } from "@/components/ui/rotating-text";
import { PersonalizedQuoteDisplay } from "@/components/ui/personalized-quote-display";
import MainLayout from "@/components/Layout/MainLayout";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { useTutorialFlow } from "@/hooks/use-tutorial-flow";
import { TutorialModal } from "@/components/tutorial/TutorialModal";

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
    return <MainLayout>
        <div className={`w-full min-h-screen ${spacing.container} ${isMobile ? 'pb-20' : ''}`}>
          <div className={`mb-4 ${spacing.gap}`}>
            <Button variant="ghost" onClick={() => setShowDemo(false)} className={`mb-4 ${getTextSize('text-sm')} ${touchTargetSize}`}>
              {t("index.backToHome")}
            </Button>
          </div>
          <PersonalityDemo />
        </div>
      </MainLayout>;
  }

  return <MainLayout>
      <div className={`w-full min-h-[90vh] flex flex-col justify-center ${spacing.container} ${isMobile ? 'pb-24' : 'pb-6'}`}>
        <div className={`w-full ${layout.maxWidth} mx-auto text-center`}>
          
          <h1 className={`font-heading ${getTextSize('text-3xl')} lg:${getTextSize('text-4xl')} font-bold mb-8 ${spacing.gap} px-4`}>
            {user ? <>
                Welcome to <span className="text-primary">SoulSync</span>, {
            blueprintData?.user_meta?.preferred_name || getDisplayName || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Friend'}
              </> : <span dangerouslySetInnerHTML={{
            __html: t('index.welcome') as string
          }} />}
          </h1>
          
          {user && hasBlueprint ? <PersonalizedQuoteDisplay className={`${getTextSize('text-sm')} mb-8 ${spacing.gap} px-4 text-muted-foreground min-h-[3.5rem] flex items-center justify-center italic`} interval={8000} fallbackQuotes={subtitleMessages} /> : <RotatingText texts={subtitleMessages} className={`${getTextSize('text-sm')} mb-8 ${spacing.gap} px-4 text-muted-foreground min-h-[3.5rem] flex items-center justify-center`} interval={8000} />}

          {user && hasBlueprint}

          {user && <div className={`grid ${layout.columns} ${spacing.gap} mb-6 max-w-2xl mx-auto px-4`}>
                <Link to="/dreams" className="block">
                  <CosmicCard className={`${spacing.card} hover:scale-105 transition-transform cursor-pointer h-full backdrop-blur-lg border border-border`}>
                    <Heart className={`h-6 w-6 ${isFoldDevice ? 'h-5 w-5' : 'sm:h-8 sm:w-8'} text-primary mx-auto mb-2`} />
                    <h3 className={`font-heading font-semibold mb-1 ${getTextSize('text-base')}`}>{t("index.dreams")}</h3>
                    <p className={`${getTextSize('text-xs')} text-muted-foreground`}>{t("index.dreamsDesc")}</p>
                  </CosmicCard>
                </Link>
                
                <Link to="/spiritual-growth" className="block">
                  <CosmicCard className={`${spacing.card} hover:scale-105 transition-transform cursor-pointer h-full backdrop-blur-lg border border-border`}>
                    <Sparkles className={`h-6 w-6 ${isFoldDevice ? 'h-5 w-5' : 'sm:h-8 sm:w-8'} text-accent mx-auto mb-2`} />
                    <h3 className={`font-heading font-semibold mb-1 ${getTextSize('text-base')}`}>{t("index.growth")}</h3>
                    <p className={`${getTextSize('text-xs')} text-muted-foreground`}>{t("index.growthDesc")}</p>
                  </CosmicCard>
                </Link>
                
                <Link to="/coach" className="block">
                  <CosmicCard className={`${spacing.card} hover:scale-105 transition-transform cursor-pointer h-full backdrop-blur-lg border border-border`}>
                    <Brain className={`h-6 w-6 ${isFoldDevice ? 'h-5 w-5' : 'sm:h-8 sm:w-8'} text-secondary mx-auto mb-2`} />
                    <h3 className={`font-heading font-semibold mb-1 ${getTextSize('text-base')}`}>{t("index.companion")}</h3>
                    <p className={`${getTextSize('text-xs')} text-muted-foreground`}>{t("index.companionDesc")}</p>
                  </CosmicCard>
                </Link>
              </div>}

          {isAdmin && <div className={`mb-4 ${spacing.gap} px-4`}>
            <Button variant="outline" onClick={() => setShowDemo(true)} className={`mb-4 ${layout.width} ${isMobile ? 'w-full' : 'sm:w-auto'} ${getTextSize('text-sm')} ${touchTargetSize}`}>
              <Brain className={`mr-2 h-4 w-4 ${isFoldDevice ? 'h-3 w-3' : ''}`} />
              {t("index.demo")}
            </Button>
          </div>}
          
          <div className={`flex justify-center mb-6 px-4`}>
            <LanguageSelector />
          </div>
          
          <div className={`flex flex-col ${spacing.gap} px-4 max-w-md mx-auto`}>
            {user ? <>
              <Button size="lg" className={`bg-primary hover:bg-primary/90 w-full ${touchTargetSize} ${getTextSize('text-base')}`} onClick={handleGetStarted}>
                {hasBlueprint ? <>
                    <BookOpen className={`mr-2 h-4 w-4 ${isFoldDevice ? 'h-3 w-3' : ''}`} />
                    {t("index.takeTour")}
                  </> : <>
                    {t("index.startJourney")}
                    <ArrowRight className={`ml-2 h-4 w-4 ${isFoldDevice ? 'h-3 w-3' : ''}`} />
                  </>}
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className={`w-full ${touchTargetSize} ${getTextSize('text-base')} backdrop-blur-sm border-border hover:bg-accent hover:text-accent-foreground`}
                onClick={handleTutorialStart}
                type="button"
              >
                View Blueprint
              </Button>
            </> : <>
              <Button size="lg" className={`bg-primary hover:bg-primary/90 w-full ${touchTargetSize} ${getTextSize('text-base')}`} onClick={handleGetStarted}>
                {t("index.getStarted")}
                <ArrowRight className={`ml-2 h-4 w-4 ${isFoldDevice ? 'h-3 w-3' : ''}`} />
              </Button>
              
              <Link to="/auth" className="block">
                <Button size="lg" variant="outline" className={`w-full ${touchTargetSize} ${getTextSize('text-base')} backdrop-blur-sm border-border hover:bg-accent hover:text-accent-foreground`}>
                  {t("index.signIn")}
                  <LogIn className={`ml-2 h-4 w-4 ${isFoldDevice ? 'h-3 w-3' : ''}`} />
                </Button>
              </Link>
            </>}
          </div>
        </div>
      </div>

      <TutorialModal 
        isOpen={showTutorial}
        onClose={() => {
          console.log('🎭 Closing tutorial modal');
          setShowTutorial(false);
        }}
        tutorialState={tutorialState}
        onContinue={continueTutorial}
        onComplete={completeTutorial}
      />
    </MainLayout>;
};

export default Index;
