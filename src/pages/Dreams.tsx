
import React, { useRef, useEffect, useState } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Target, Sparkles, MapPin, Calendar, Zap, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEnhancedAICoach } from "@/hooks/use-enhanced-ai-coach";
import { supabase } from "@/integrations/supabase/client";
import { CoachInterface } from "@/components/coach/CoachInterface";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBlueprintData } from "@/hooks/use-blueprint-data";
import { goalDecompositionService } from "@/services/goal-decomposition-service";
import { JourneyMap } from "@/components/journey/JourneyMap";
import DreamAchievementDashboard from "@/components/journey/DreamAchievementDashboard";

const Dreams = () => {
  const { messages, isLoading, sendMessage, resetConversation, currentAgent, switchAgent } = useEnhancedAICoach("coach");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<'create' | 'chat' | 'journey'>('create');
  const [isCreatingDream, setIsCreatingDream] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { blueprintData } = useBlueprintData();

  // Dream creation form state
  const [dreamForm, setDreamForm] = useState({
    title: '',
    description: '',
    category: 'personal_growth',
    timeframe: '3 months'
  });

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Set agent to coach for this page
  useEffect(() => {
    if (currentAgent !== "coach") {
      switchAgent("coach");
    }
  }, [currentAgent, switchAgent]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleCreateDream = async () => {
    if (!dreamForm.title.trim()) {
      toast({
        title: "Dream Required",
        description: "Please enter your dream or goal",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingDream(true);

    try {
      // Create goal using blueprint-aligned decomposition
      const goal = await goalDecompositionService.decomposeGoal(
        dreamForm.title,
        dreamForm.timeframe,
        dreamForm.category,
        blueprintData || {}
      );

      // Save to productivity journey
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('productivity_journey')
          .upsert({
            user_id: user.id,
            current_goals: [goal],
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });

        if (error) {
          console.error('Error saving goal:', error);
        }
      }

      // Show success and switch to journey view
      toast({
        title: "🎯 Dream Journey Created!",
        description: "Your personalized roadmap is ready. Let's begin!",
      });

      setCurrentView('journey');
    } catch (error) {
      console.error('Error creating dream:', error);
      toast({
        title: "Creation Error",
        description: "Failed to create your dream journey. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingDream(false);
    }
  };

  const handleStartAIGuidance = () => {
    sendMessage("I want to start my dream journey. Help me define my biggest goal and create a personalized action plan based on my soul blueprint.");
    setCurrentView('chat');
  };

  const getBlueprintInsight = () => {
    if (!blueprintData) return "Your journey will be personalized once your blueprint is complete";
    
    const traits = [];
    if (blueprintData.cognition_mbti?.type) traits.push(blueprintData.cognition_mbti.type);
    if (blueprintData.energy_strategy_human_design?.type) traits.push(blueprintData.energy_strategy_human_design.type);
    if (blueprintData.values_life_path?.lifePathNumber) traits.push(`Life Path ${blueprintData.values_life_path.lifePathNumber}`);
    
    return `This journey will be optimized for your ${traits.slice(0, 2).join(' & ')} nature`;
  };

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <CosmicCard className="p-8 text-center max-w-sm w-full">
            <Heart className="h-12 w-12 text-soul-purple mx-auto mb-6" />
            <h1 className="text-2xl font-bold font-display mb-4">
              <span className="text-soul-purple">Dream Achievement</span>
            </h1>
            <p className="mb-8 text-muted-foreground">Sign in to start your personalized journey to your dreams</p>
            <Button 
              className="w-full bg-soul-purple hover:bg-soul-purple/90"
              onClick={() => window.location.href = '/auth'}
            >
              {t('nav.signIn')}
            </Button>
          </CosmicCard>
        </div>
      </MainLayout>
    );
  }

  if (currentView === 'chat') {
    return (
      <MainLayout>
        <div className="h-screen flex flex-col">
          {/* Minimal Chat Header */}
          <div className="bg-background border-b border-border p-4">
            <div className="flex items-center justify-between max-w-md mx-auto">
              <div className="flex items-center">
                <Heart className="h-5 w-5 text-soul-purple mr-2" />
                <h2 className="text-lg font-semibold">Dream Guide</h2>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setCurrentView('create')}
                className="text-sm"
              >
                Back
              </Button>
            </div>
          </div>
          
          {/* Chat Interface */}
          <div className="flex-1 max-w-md mx-auto w-full p-4">
            <CoachInterface
              messages={messages}
              isLoading={isLoading}
              onSendMessage={sendMessage}
              messagesEndRef={messagesEndRef}
            />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (currentView === 'journey') {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-b from-soul-purple/5 to-background">
          <div className="max-w-4xl mx-auto px-4 py-8">
            
            {/* Journey Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setCurrentView('create')}
                  className="mr-4"
                >
                  ← New Dream
                </Button>
                <h1 className="text-3xl font-bold font-display">Your Dream Journey</h1>
              </div>
              <p className="text-muted-foreground">{getBlueprintInsight()}</p>
            </div>

            {/* Journey Map and Dashboard */}
            <div className="space-y-8">
              <JourneyMap />
              <DreamAchievementDashboard />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Create Dream View (default)
  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-soul-purple/5 to-background">
        <div className="max-w-md mx-auto px-4 py-8">
          
          {/* Hero Section - Above the fold */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-soul-purple/20 to-soul-purple/10 rounded-full flex items-center justify-center mb-6">
              <Target className="h-10 w-10 text-soul-purple" />
            </div>
            <h1 className="text-3xl font-bold font-display mb-3">Create Your Dream</h1>
            <p className="text-muted-foreground text-lg leading-relaxed mb-2">
              Turn your biggest aspiration into a personalized roadmap
            </p>
            <p className="text-sm text-soul-purple">{getBlueprintInsight()}</p>
          </div>

          {/* Dream Creation Form */}
          <CosmicCard className="p-6 mb-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">What's your dream or goal?</label>
                <Input
                  placeholder="e.g., Launch my creative business, Get fit and healthy..."
                  value={dreamForm.title}
                  onChange={(e) => setDreamForm(prev => ({ ...prev, title: e.target.value }))}
                  className="text-base"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Why is this important to you?</label>
                <Textarea
                  placeholder="Share what drives this dream..."
                  value={dreamForm.description}
                  onChange={(e) => setDreamForm(prev => ({ ...prev, description: e.target.value }))}
                  className="text-base min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select 
                    value={dreamForm.category} 
                    onValueChange={(value) => setDreamForm(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal_growth">Personal Growth</SelectItem>
                      <SelectItem value="career">Career</SelectItem>
                      <SelectItem value="health">Health & Fitness</SelectItem>
                      <SelectItem value="relationships">Relationships</SelectItem>
                      <SelectItem value="creativity">Creativity</SelectItem>
                      <SelectItem value="financial">Financial</SelectItem>
                      <SelectItem value="spiritual">Spiritual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Timeframe</label>
                  <Select 
                    value={dreamForm.timeframe} 
                    onValueChange={(value) => setDreamForm(prev => ({ ...prev, timeframe: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1 month">1 Month</SelectItem>
                      <SelectItem value="3 months">3 Months</SelectItem>
                      <SelectItem value="6 months">6 Months</SelectItem>
                      <SelectItem value="1 year">1 Year</SelectItem>
                      <SelectItem value="2 years">2+ Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Create Button */}
              <Button 
                onClick={handleCreateDream}
                disabled={isCreatingDream}
                className="w-full bg-soul-purple hover:bg-soul-purple/90 text-white text-lg py-6 rounded-xl font-semibold mt-6"
              >
                {isCreatingDream ? (
                  <>
                    <Brain className="h-5 w-5 mr-2 animate-pulse" />
                    Creating Your Journey...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Create My Dream Journey
                  </>
                )}
              </Button>
            </div>
          </CosmicCard>

          {/* Alternative Options */}
          <div className="space-y-3">
            <div className="text-center text-sm text-muted-foreground mb-4">
              Or explore other ways to start:
            </div>
            
            <Button
              variant="outline"
              onClick={handleStartAIGuidance}
              className="w-full justify-start text-left p-4 h-auto border-soul-purple/30 hover:bg-soul-purple/5"
            >
              <div className="flex items-center">
                <Zap className="h-5 w-5 mr-3 text-soul-purple" />
                <div>
                  <div className="font-medium">Talk with AI Dream Guide</div>
                  <div className="text-sm text-muted-foreground">Explore your dreams through conversation</div>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              onClick={() => setCurrentView('journey')}
              className="w-full justify-start text-left p-4 h-auto border-soul-purple/30 hover:bg-soul-purple/5"
            >
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-3 text-soul-purple" />
                <div>
                  <div className="font-medium">View Existing Journey</div>
                  <div className="text-sm text-muted-foreground">Continue your current dream path</div>
                </div>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dreams;
