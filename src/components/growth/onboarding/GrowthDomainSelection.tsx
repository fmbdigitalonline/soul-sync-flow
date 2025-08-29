
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, TrendingUp, DollarSign, Palette, Sparkles, Home, Users } from 'lucide-react';
import { LifeDomain } from '@/types/growth-program';
import { useLanguage } from '@/contexts/LanguageContext';

interface DomainCard {
  domain: LifeDomain;
  icon: React.ComponentType<any>;
  emoji: string;
}

const domainCards: DomainCard[] = [
  {
    domain: 'career',
    icon: TrendingUp,
    emoji: '🏢'
  },
  {
    domain: 'relationships',
    icon: Users,
    emoji: '💕'
  },
  {
    domain: 'wellbeing',
    icon: Heart,
    emoji: '🌱'
  },
  {
    domain: 'finances',
    icon: DollarSign,
    emoji: '💰'
  },
  {
    domain: 'creativity',
    icon: Palette,
    emoji: '🎨'
  },
  {
    domain: 'spirituality',
    icon: Sparkles,
    emoji: '✨'
  },
  {
    domain: 'home_family',
    icon: Home,
    emoji: '🏠'
  }
];

interface GrowthDomainSelectionProps {
  onDomainSelect: (domain: LifeDomain) => void;
  selectedDomain: LifeDomain | null;
}

export const GrowthDomainSelection: React.FC<GrowthDomainSelectionProps> = ({
  onDomainSelect,
  selectedDomain
}) => {
  const { t } = useLanguage();

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-br from-soul-purple to-soul-teal rounded-full flex items-center justify-center mx-auto">
          <Heart className="h-8 w-8 text-white" />
        </div>
        
        <div>
          <h1 className="text-2xl font-bold gradient-text mb-2">
            {t('growth.onboarding.welcomeTitle')}
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            {t('growth.onboarding.welcomeDescription')}
          </p>
        </div>
      </div>

      {/* Domain Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {domainCards.map((card) => {
          const IconComponent = card.icon;
          const isSelected = selectedDomain === card.domain;
          
          return (
            <Card
              key={card.domain}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
                isSelected ? 'ring-2 ring-soul-purple bg-soul-purple/5' : ''
              }`}
              onClick={() => onDomainSelect(card.domain)}
            >
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{card.emoji}</div>
                    <IconComponent className="h-5 w-5 text-soul-purple" />
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-lg">{t(`growth.domains.${card.domain}.title`)}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t(`growth.domains.${card.domain}.description`)}
                    </p>
                  </div>
                  
                  <div className="text-xs text-soul-purple font-medium">
                    {t('growth.onboarding.clickToExplore')}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          {t('growth.onboarding.chooseAreaPrompt')}
        </p>
      </div>
    </div>
  );
};
