
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Heart, Briefcase, DollarSign, Home, Sparkles, TreePine, Clock } from 'lucide-react';
import { LifeDomain } from '@/types/growth-program';
import { useLanguage } from '@/contexts/LanguageContext';

interface GrowthProgramStarterProps {
  onDomainSelect: (domain: LifeDomain) => void;
  loading?: boolean;
  creatingDomain?: LifeDomain | null;
}

export const GrowthProgramStarter: React.FC<GrowthProgramStarterProps> = ({
  onDomainSelect,
  loading = false,
  creatingDomain = null
}) => {
  const [selectedDomain, setSelectedDomain] = useState<LifeDomain | null>(null);
  const { t } = useLanguage();

  const getDomainOptions = () => [
    { 
      value: 'career' as LifeDomain, 
      label: t('growth.domains.career.title'), 
      description: t('growth.domains.career.description'),
      icon: Briefcase,
      color: 'bg-blue-500'
    },
    { 
      value: 'relationships' as LifeDomain, 
      label: t('growth.domains.relationships.title'), 
      description: t('growth.domains.relationships.description'),
      icon: Heart,
      color: 'bg-pink-500'
    },
    { 
      value: 'wellbeing' as LifeDomain, 
      label: t('growth.domains.wellbeing.title'), 
      description: t('growth.domains.wellbeing.description'),
      icon: Sparkles,
      color: 'bg-green-500'
    },
    { 
      value: 'finances' as LifeDomain, 
      label: t('growth.domains.finances.title'), 
      description: t('growth.domains.finances.description'),
      icon: DollarSign,
      color: 'bg-yellow-500'
    },
    { 
      value: 'creativity' as LifeDomain, 
      label: t('growth.domains.creativity.title'), 
      description: t('growth.domains.creativity.description'),
      icon: Sparkles,
      color: 'bg-purple-500'
    },
    { 
      value: 'spirituality' as LifeDomain, 
      label: t('growth.domains.spirituality.title'), 
      description: t('growth.domains.spirituality.description'),
      icon: TreePine,
      color: 'bg-indigo-500'
    },
    { 
      value: 'home_family' as LifeDomain, 
      label: t('growth.domains.home_family.title'), 
      description: t('growth.domains.home_family.description'),
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
          {t('growth.programStarter.title')}
        </CardTitle>
        <p className="text-muted-foreground text-center">
          {t('growth.programStarter.description')}
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
                <h4 className="font-semibold mb-2">{t('growth.programStarter.personalizedProgram.title')}</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  {t('growth.programStarter.personalizedProgram.description')}
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{t('growth.programStarter.personalizedProgram.duration')}</span>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleStartProgram}
              disabled={loading || creatingDomain !== null}
              className="w-full bg-soul-purple hover:bg-soul-purple/90"
            >
              {loading || creatingDomain === selectedDomain ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  {t('growth.programStarter.buttons.creating')}
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  {t('growth.programStarter.buttons.start')}
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
