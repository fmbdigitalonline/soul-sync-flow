
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Heart, Briefcase, DollarSign, Home, Sparkles, TreePine, Clock } from 'lucide-react';
import { LifeDomain } from '@/types/growth-program';

interface GrowthProgramStarterProps {
  onDomainSelect: (domain: LifeDomain) => void;
  loading?: boolean;
}

export const GrowthProgramStarter: React.FC<GrowthProgramStarterProps> = ({
  onDomainSelect,
  loading = false
}) => {
  const [selectedDomain, setSelectedDomain] = useState<LifeDomain | null>(null);

  const getDomainOptions = () => [
    { 
      value: 'career' as LifeDomain, 
      label: 'Career & Purpose', 
      description: 'Work fulfillment, calling, and professional growth',
      icon: Briefcase,
      color: 'bg-blue-500'
    },
    { 
      value: 'relationships' as LifeDomain, 
      label: 'Relationships', 
      description: 'Love, friendship, and meaningful connections',
      icon: Heart,
      color: 'bg-pink-500'
    },
    { 
      value: 'wellbeing' as LifeDomain, 
      label: 'Wellbeing', 
      description: 'Health, energy, and self-care practices',
      icon: Sparkles,
      color: 'bg-green-500'
    },
    { 
      value: 'finances' as LifeDomain, 
      label: 'Finances', 
      description: 'Money, abundance, and financial security',
      icon: DollarSign,
      color: 'bg-yellow-500'
    },
    { 
      value: 'creativity' as LifeDomain, 
      label: 'Creativity', 
      description: 'Expression, art, and innovative thinking',
      icon: Sparkles,
      color: 'bg-purple-500'
    },
    { 
      value: 'spirituality' as LifeDomain, 
      label: 'Spirituality', 
      description: 'Meaning, growth, and deeper connection',
      icon: TreePine,
      color: 'bg-indigo-500'
    },
    { 
      value: 'home_family' as LifeDomain, 
      label: 'Home & Family', 
      description: 'Domestic life and family relationships',
      icon: Home,
      color: 'bg-orange-500'
    }
  ];

  const handleStartProgram = () => {
    if (selectedDomain) {
      onDomainSelect(selectedDomain);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Start Your Growth Journey
        </CardTitle>
        <p className="text-muted-foreground text-center">
          Choose a life area to focus on for your personalized growth program
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {getDomainOptions().map((domain) => {
            const IconComponent = domain.icon;
            return (
              <Card
                key={domain.value}
                className={`cursor-pointer transition-all hover:shadow-md border-2 ${
                  selectedDomain === domain.value 
                    ? 'ring-2 ring-soul-purple border-soul-purple' 
                    : 'border-gray-200'
                }`}
                onClick={() => setSelectedDomain(domain.value)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${domain.color} text-white`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{domain.label}</h3>
                      <p className="text-sm text-muted-foreground">{domain.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {selectedDomain && (
          <div className="p-4 bg-soul-purple/5 rounded-lg">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-soul-purple/20 rounded-lg">
                <Play className="h-5 w-5 text-soul-purple" />
              </div>
              <div>
                <h4 className="font-semibold mb-2">Your Personalized Program</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Based on your blueprint, we'll create a customized growth program tailored to your personality, decision-making style, and preferences.
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Program length and pace adapted to your unique profile</span>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleStartProgram}
              disabled={loading}
              className="w-full bg-soul-purple hover:bg-soul-purple/90"
            >
              {loading ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Creating Your Program...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start My Growth Program
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
