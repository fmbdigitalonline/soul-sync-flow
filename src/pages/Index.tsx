
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleTakeTour = () => {
    if (user) {
      navigate('/dreams');
    } else {
      navigate('/auth');
    }
  };

  const handleViewBlueprint = () => {
    if (user) {
      navigate('/blueprint');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-soul-purple/5 via-white to-soul-teal/5 flex items-center justify-center p-4">
      <div className={`max-w-md w-full space-y-6 transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>
        
        {/* Brand Header */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-soul-purple to-soul-teal rounded-full flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          
          <div className="space-y-2">
            <h1 className="font-cormorant font-bold text-4xl text-gray-800 leading-tight">
              Soul Guide
            </h1>
            <p className="font-inter text-gray-600 text-lg leading-relaxed">
              Discover your authentic path through personalized spiritual guidance
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button
            onClick={handleTakeTour}
            className="w-full bg-gradient-to-r from-soul-purple to-soul-teal hover:shadow-lg text-white font-cormorant font-semibold text-lg py-6 rounded-2xl transition-all duration-300 active:scale-95"
          >
            <BookOpen className="h-5 w-5 mr-2" />
            Take Tour
          </Button>
          
          <Button
            variant="outline"
            onClick={handleViewBlueprint}
            className="w-full border-2 border-soul-purple/30 text-soul-purple hover:bg-soul-purple/5 font-cormorant font-medium text-lg py-6 rounded-2xl transition-all duration-300 active:scale-95"
          >
            View Blueprint
          </Button>
        </div>

        {/* Subtitle */}
        <div className="text-center">
          <p className="font-inter text-gray-500 text-sm leading-relaxed">
            Begin your journey of self-discovery and spiritual growth
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
