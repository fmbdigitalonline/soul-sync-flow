
import React from "react";
import { useNavigate } from "react-router-dom";
import { Star, MessageCircle, ListTodo, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { GradientButton } from "@/components/ui/gradient-button";
import StarField from "@/components/ui/star-field";
import MainLayout from "@/components/Layout/MainLayout";

const Index = () => {
  const navigate = useNavigate();

  return (
    <MainLayout hideNav>
      <StarField />
      
      <div className="min-h-screen p-6 flex flex-col justify-between">
        {/* Header */}
        <div className="space-y-6 pt-10">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-center">
            <span className="gradient-text">SoulSync</span>
          </h1>
          <p className="text-center text-muted-foreground max-w-md mx-auto">
            Your personal growth operating system that merges inner wisdom with outer action
          </p>
        </div>
        
        {/* Main content */}
        <div className="space-y-6 max-w-md mx-auto w-full">
          <CosmicCard floating glow>
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-display font-bold">Discover Your Soul Blueprint</h2>
              <p className="text-muted-foreground">
                Uncover your unique design based on astrology, numerology, and human design
              </p>
              <GradientButton 
                onClick={() => navigate("/onboarding")} 
                className="w-full"
              >
                Get Started
              </GradientButton>
            </div>
          </CosmicCard>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FeatureCard 
              icon={<Star className="h-8 w-8 text-soul-purple" />}
              title="Soul Blueprint"
              description="Your unique spiritual profile"
              onClick={() => navigate("/blueprint")}
            />
            
            <FeatureCard 
              icon={<MessageCircle className="h-8 w-8 text-soul-purple" />}
              title="AI Coach"
              description="Personalized spiritual guidance"
              onClick={() => navigate("/coach")}
            />
            
            <FeatureCard 
              icon={<ListTodo className="h-8 w-8 text-soul-purple" />}
              title="Aligned Tasks"
              description="Productivity with purpose"
              onClick={() => navigate("/tasks")}
            />
          </div>
        </div>
        
        {/* Footer */}
        <div className="pt-10">
          <Button 
            variant="link" 
            onClick={() => navigate("/login")}
            className="w-full"
          >
            Already have an account? Log in
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

const FeatureCard = ({ 
  icon, 
  title, 
  description,
  onClick
}: { 
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) => {
  return (
    <CosmicCard 
      className="flex items-center space-x-3 cursor-pointer hover:shadow-md transition-all" 
      onClick={onClick}
    >
      <div className="flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="font-medium">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </CosmicCard>
  );
};

export default Index;
