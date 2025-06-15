
import React from "react";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Button } from "@/components/ui/button";
import { Heart, Briefcase, DollarSign, Users, Flower, Palette, Sparkles } from "lucide-react";

export interface LifeArea {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
}

const lifeAreas: LifeArea[] = [
  {
    id: 'home',
    name: 'Home',
    icon: Heart,
    description: 'Family, living space, domestic harmony',
  },
  {
    id: 'career',
    name: 'Career',
    icon: Briefcase,
    description: 'Purpose, professional growth, impact',
  },
  {
    id: 'finances',
    name: 'Finances',
    icon: DollarSign,
    description: 'Abundance, security, money mindset',
  },
  {
    id: 'relationships',
    name: 'Relationships',
    icon: Users,
    description: 'Love, friendship, community connection',
  },
  {
    id: 'wellbeing',
    name: 'Well-being',
    icon: Flower,
    description: 'Health, energy, mental clarity',
  },
  {
    id: 'creativity',
    name: 'Creativity',
    icon: Palette,
    description: 'Expression, art, innovation, play',
  },
  {
    id: 'spirituality',
    name: 'Spirituality',
    icon: Sparkles,
    description: 'Inner wisdom, connection, transcendence',
  }
];

interface LifeAreaSelectorProps {
  onAreaSelect: (area: LifeArea) => void;
}

export const LifeAreaSelector: React.FC<LifeAreaSelectorProps> = ({ onAreaSelect }) => {
  return (
    <CosmicCard className="p-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold gradient-text mb-2">
          Which part of your life would you like to explore today?
        </h2>
        <p className="text-sm text-muted-foreground">
          Choose an area for personalized reflection and growth
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
              // Use group to allow hover on icon/text inside
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
