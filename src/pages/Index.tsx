
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SoulOrbAvatar } from "@/components/ui/avatar";
import { Star, Heart, MessageCircle, Sparkles, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/ui/language-selector";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { spacing, layout, getTextSize } = useResponsiveLayout();

  // Removed the automatic redirect logic - users can now access homepage even when authenticated

  const features = [
    {
      icon: Star,
      title: "Soul Blueprint",
      description: "Discover your cosmic archetype through personalized astrology, numerology, and human design",
      color: "text-primary"
    },
    {
      icon: Heart,
      title: "Dreams & Visions",
      description: "Explore your subconscious through dream interpretation and symbolic guidance",
      color: "text-secondary"
    },
    {
      icon: MessageCircle,
      title: "AI Companion",
      description: "Get personalized spiritual guidance from your AI soul guide",
      color: "text-primary"
    },
    {
      icon: Sparkles,
      title: "Spiritual Growth",
      description: "Track your spiritual journey with insights and growth recommendations",
      color: "text-secondary"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface/50 to-background">
      {/* Header */}
      <div className="border-b border-border bg-background/80 backdrop-blur-lg">
        <div className={`${spacing.container} py-4 flex items-center justify-between`}>
          <div className="flex items-center space-x-3">
            <SoulOrbAvatar size="md" />
            <h1 className="text-2xl font-bold font-cormorant gradient-text brand-text">
              Soul Guide
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageSelector />
            {user ? (
              <Button 
                onClick={() => navigate("/blueprint")}
                className="bg-primary hover:bg-primary/90 rounded-2xl font-cormorant font-medium"
              >
                Go to Blueprint
              </Button>
            ) : (
              <Button 
                onClick={() => navigate("/auth")}
                className="bg-primary hover:bg-primary/90 rounded-2xl font-cormorant font-medium"
              >
                {t('auth.signIn')}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className={`${spacing.container} py-20 text-center`}>
        <div className={`${layout.maxWidth} mx-auto space-y-8`}>
          <div className="space-y-4">
            <h2 className={`${getTextSize('text-4xl')} font-bold font-cormorant gradient-text`}>
              {t('landing.heroTitle')}
            </h2>
            <p className={`${getTextSize('text-lg')} text-muted-foreground max-w-2xl mx-auto font-inter`}>
              {t('landing.heroDescription')}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <>
                <Button 
                  size="lg"
                  onClick={() => navigate("/blueprint")}
                  className="bg-primary hover:bg-primary/90 rounded-2xl font-cormorant font-medium"
                >
                  View Your Blueprint
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/companion")}
                  className="rounded-2xl font-cormorant font-medium"
                >
                  Talk to Companion
                </Button>
              </>
            ) : (
              <>
                <Button 
                  size="lg"
                  onClick={() => navigate("/auth")}
                  className="bg-primary hover:bg-primary/90 rounded-2xl font-cormorant font-medium"
                >
                  {t('landing.getStarted')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/auth")}
                  className="rounded-2xl font-cormorant font-medium"
                >
                  {t('landing.learnMore')}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className={`${spacing.container} py-20`}>
        <div className={`${layout.maxWidth} mx-auto`}>
          <div className="text-center mb-12">
            <h3 className={`${getTextSize('text-3xl')} font-bold font-cormorant mb-4`}>
              {t('landing.featuresTitle')}
            </h3>
            <p className={`${getTextSize('text-lg')} text-muted-foreground font-inter`}>
              {t('landing.featuresDescription')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="cosmic-card hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="text-center">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mx-auto mb-4`}>
                      <Icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <CardTitle className={`${getTextSize('text-lg')} font-cormorant`}>
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className={`${getTextSize('text-sm')} font-inter text-center`}>
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className={`${spacing.container} py-20`}>
        <div className={`${layout.maxWidth} mx-auto text-center`}>
          <Card className="cosmic-card bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardHeader className="space-y-4">
              <CardTitle className={`${getTextSize('text-3xl')} font-bold font-cormorant gradient-text`}>
                {t('landing.ctaTitle')}
              </CardTitle>
              <CardDescription className={`${getTextSize('text-lg')} font-inter`}>
                {t('landing.ctaDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user ? (
                <Button 
                  size="lg"
                  onClick={() => navigate("/blueprint")}
                  className="bg-primary hover:bg-primary/90 rounded-2xl font-cormorant font-medium"
                >
                  Continue Your Journey
                </Button>
              ) : (
                <Button 
                  size="lg"
                  onClick={() => navigate("/auth")}
                  className="bg-primary hover:bg-primary/90 rounded-2xl font-cormorant font-medium"
                >
                  {t('landing.startJourney')}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border bg-card/50">
        <div className={`${spacing.container} py-8 text-center`}>
          <p className={`${getTextSize('text-sm')} text-muted-foreground font-inter`}>
            © 2024 Soul Guide. {t('landing.footerText')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
