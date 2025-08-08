import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { safeInterpolateTranslation } from "@/utils/sanitize";
import MainLayout from "@/components/Layout/MainLayout";
import { PageContainer, PageHeader, PageSection } from "@/components/Layout/PageContainer";
import { PersonalizedQuoteDisplay } from "@/components/ui/personalized-quote-display";
import { Button } from "@/components/ui/button";

import { TutorialModal } from "@/components/tutorial/TutorialModal";
import PersonalityDemo from "@/components/personality/PersonalityDemo";
import { LanguageSelector } from "@/components/ui/language-selector";
import { HomeMenuGrid, type HomeMenuItem } from "@/components/home/HomeMenuGrid";
import { useSoulOrb } from "@/contexts/SoulOrbContext";
import { useOptimizedBlueprintData } from "@/hooks/use-optimized-blueprint-data";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { useTutorialFlow } from "@/hooks/use-tutorial-flow";
import { isAdminUser } from "@/utils/isAdminUser";
import { Heart, Sparkles, Brain, BookOpen, ArrowRight, LogIn, LayoutDashboard, ListTodo, User } from "lucide-react";
const Index = () => {
  const {
    user
  } = useAuth();
  const {
    speak
  } = useSoulOrb();
  const navigate = useNavigate();
  const [showDemo, setShowDemo] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const {
    blueprintData,
    hasBlueprint,
    loading,
    getDisplayName
  } = useOptimizedBlueprintData();
  const {
    t,
    language
  } = useLanguage();
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
    return <MainLayout>
        <PageContainer>
          <Button variant="ghost" onClick={() => setShowDemo(false)} className="mb-4">
            {t("index.backToHome")}
          </Button>
          <PersonalityDemo />
        </PageContainer>
      </MainLayout>;
  }
  return <MainLayout>
      <PageContainer maxWidth="saas" className="min-h-screen flex flex-col justify-center bg-gradient-to-br from-background via-accent/5 to-primary/5">
        {/* Hero Section */}
        <PageSection className="text-center">
          <div className="space-y-6 mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold font-cormorant gradient-text">
              {safeInterpolateTranslation(user ? "Welcome to SoulSync, {name}" : "Welcome to SoulSync", {
              name: userName
            })}
            </h1>
            
            <div className="flex items-center justify-center">
              <PersonalizedQuoteDisplay className="text-lg text-muted-foreground font-inter" interval={4000} />
            </div>
          </div>
        </PageSection>

        {/* Navigation Cards - Starting Hub */}
        <PageSection>
            <HomeMenuGrid
              items={useMemo<HomeMenuItem[]>(() => [
                {
                  key: 'dashboard',
                  to: '/dashboard',
                  title: t('index.dashboard') || 'Dashboard',
                  description: t('index.dashboardDesc') || 'Overview of your progress and insights.',
                  Icon: LayoutDashboard,
                },
                {
                  key: 'blueprint',
                  to: '/blueprint',
                  title: t('index.blueprint') || 'Soul Blueprint',
                  description: t('index.blueprintDesc') || 'Explore your personal cosmic blueprint.',
                  Icon: BookOpen,
                },
                {
                  key: 'companion',
                  to: '/companion',
                  title: t('index.companion') || 'Companion',
                  description: t('index.companionDesc') || 'Your AI guide for daily support and clarity.',
                  Icon: Brain,
                },
                {
                  key: 'tasks',
                  to: '/tasks',
                  title: t('index.tasks') || 'Tasks',
                  description: t('index.tasksDesc') || 'Focus on what matters with guided tasks.',
                  Icon: ListTodo,
                },
                {
                  key: 'dreams',
                  to: '/dreams',
                  title: t('index.dreams') || 'Dreams',
                  description: t('index.dreamsDesc') || 'Track, decode, and reflect on your dreams.',
                  Icon: Heart,
                },
                {
                  key: 'growth',
                  to: '/spiritual-growth',
                  title: t('index.growth') || 'Spiritual Growth',
                  description: t('index.growthDesc') || 'Deepen your practice with curated exercises.',
                  Icon: Sparkles,
                },
                {
                  key: 'profile',
                  to: '/profile',
                  title: t('index.profile') || 'Profile',
                  description: t('index.profileDesc') || 'Manage your information and preferences.',
                  Icon: User,
                },
              ], [t])}
            />
        </PageSection>

        {/* Admin Demo Button */}
        {user && isAdminUser(user) && <div className="flex justify-center mb-8">
            <Button onClick={() => setShowDemo(true)} variant="outline" className="font-inter h-touch">
              <Brain className="h-5 w-5 mr-2" />
              {t('index.demoButton')}
            </Button>
          </div>}

        {/* Language Selector */}
        <div className="flex justify-center mb-12">
          <LanguageSelector />
        </div>

        {/* Action Buttons - Modern CTA section */}
        <PageSection className="text-center">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            {user && hasBlueprint && (
              <>
                <Button onClick={() => navigate('/blueprint')} size="lg" className="font-inter group h-touch px-8">
                  <BookOpen className="h-5 w-5 mr-2 group-hover:rotate-3 transition-transform" />
                  {t('index.viewBlueprint')}
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button onClick={handleTutorialStart} variant="outline" size="lg" className="font-inter h-touch px-8">
                  <BookOpen className="h-5 w-5 mr-2" />
                  {t('index.takeTour')}
                </Button>
              </>
            )}
            {user && !hasBlueprint && <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={() => navigate('/onboarding')} size="lg" className="font-inter h-touch px-8">
                  {t('index.getStarted')}
                </Button>
                <Button onClick={handleTutorialStart} variant="outline" size="lg" className="font-inter h-touch px-8">
                  <BookOpen className="h-5 w-5 mr-2" />
                  {t('index.takeTour')}
                </Button>
              </div>}
            {!user && <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={() => navigate('/onboarding')} size="lg" className="font-inter h-touch px-8">
                  <ArrowRight className="h-5 w-5 mr-2" />
                  {t('index.getStarted')}
                </Button>
                <Button asChild variant="outline" size="lg" className="font-inter h-touch px-8">
                  <Link to="/auth">
                    <LogIn className="h-5 w-5 mr-2" />
                    {t('auth.signIn')}
                  </Link>
                </Button>
              </div>}
          </div>
        </PageSection>
      </PageContainer>

      {showTutorial && <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} tutorialState={tutorialState} onContinue={continueTutorial} onComplete={completeTutorial} />}
    </MainLayout>;
};
export default Index;