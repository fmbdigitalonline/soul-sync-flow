
import React from "react";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Button } from "@/components/ui/button";
import { Heart, Briefcase, DollarSign, Users, Flower, Palette, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export interface LifeArea {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
}

interface LifeAreaSelectorProps {
  onAreaSelect: (area: LifeArea) => void;
}

export const LifeAreaSelector: React.FC<LifeAreaSelectorProps> = ({ onAreaSelect }) => {
  const { t } = useLanguage();

  const lifeAreas: LifeArea[] = [
    {
      id: 'home',
      name: t('lifeArea.home.name'),
      icon: Heart,
      description: t('lifeArea.home.description'),
    },
    {
      id: 'career',
      name: t('lifeArea.career.name'),
      icon: Briefcase,
      description: t('lifeArea.career.description'),
    },
    {
      id: 'finances',
      name: t('lifeArea.finances.name'),
      icon: DollarSign,
      description: t('lifeArea.finances.description'),
    },
    {
      id: 'relationships',
      name: t('lifeArea.relationships.name'),
      icon: Users,
      description: t('lifeArea.relationships.description'),
    },
    {
      id: 'wellbeing',
      name: t('lifeArea.wellbeing.name'),
      icon: Flower,
      description: t('lifeArea.wellbeing.description'),
    },
    {
      id: 'creativity',
      name: t('lifeArea.creativity.name'),
      icon: Palette,
      description: t('lifeArea.creativity.description'),
    },
    {
      id: 'spirituality',
      name: t('lifeArea.spirituality.name'),
      icon: Sparkles,
      description: t('lifeArea.spirituality.description'),
    }
  ];

  return (
    <CosmicCard className="p-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold gradient-text mb-2">
          {t('lifeArea.selector.title')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t('lifeArea.selector.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {lifeAreas.map((area) => {
          const Icon = area.icon;
          return (
            <Button
              key={area.id}
              variant="outline"
              onClick={() => onAreaSelect(area)}
              className="h-auto p-4 flex flex-col items-center space-y-3 transition-all duration-200 border-2 group border-gray-200 bg-white/80 backdrop-blur-sm hover:border-soul-purple hover:bg-soul-purple/10 hover:shadow-lg"
            >
              <Icon className="h-8 w-8 text-gray-500 group-hover:text-soul-purple transition-colors duration-200" />
              <div className="text-center">
                <div className="font-medium text-sm text-foreground group-hover:text-soul-purple transition-colors duration-200">{area.name}</div>
                <div className="text-xs opacity-75 mt-1 text-muted-foreground group-hover:text-soul-purple/80 transition-colors duration-200">{area.description}</div>
              </div>
            </Button>
          );
        })}
      </div>
    </CosmicCard>
  );
};
