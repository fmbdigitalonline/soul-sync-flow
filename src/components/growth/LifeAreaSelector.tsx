
import React from "react";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Button } from "@/components/ui/button";
import { Heart, Briefcase, DollarSign, Users, Flower, Palette, Sparkles } from "lucide-react";

export interface LifeArea {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  color: string;
}

const lifeAreas: LifeArea[] = [
  {
    id: 'home',
    name: 'Home',
    icon: Heart,
    description: 'Family, living space, domestic harmony',
    color: 'bg-gradient-to-br from-soul-purple/10 to-soul-lavender/20 text-soul-purple border-soul-purple/30 hover:from-soul-purple/20 hover:to-soul-lavender/30'
  },
  {
    id: 'career',
    name: 'Career',
    icon: Briefcase,
    description: 'Purpose, professional growth, impact',
    color: 'bg-gradient-to-br from-soul-teal/10 to-soul-blue/20 text-soul-teal border-soul-teal/30 hover:from-soul-teal/20 hover:to-soul-blue/30'
  },
  {
    id: 'finances',
    name: 'Finances',
    icon: DollarSign,
    description: 'Abundance, security, money mindset',
    color: 'bg-gradient-to-br from-soul-gold/10 to-soul-gold/20 text-soul-gold border-soul-gold/40 hover:from-soul-gold/20 hover:to-soul-gold/30'
  },
  {
    id: 'relationships',
    name: 'Relationships',
    icon: Users,
    description: 'Love, friendship, community connection',
    color: 'bg-gradient-to-br from-soul-lavender/10 to-soul-purple/20 text-soul-lavender border-soul-lavender/30 hover:from-soul-lavender/20 hover:to-soul-purple/30'
  },
  {
    id: 'wellbeing',
    name: 'Well-being',
    icon: Flower,
    description: 'Health, energy, mental clarity',
    color: 'bg-gradient-to-br from-soul-pewter/10 to-soul-teal/20 text-soul-pewter border-soul-pewter/30 hover:from-soul-pewter/20 hover:to-soul-teal/30'
  },
  {
    id: 'creativity',
    name: 'Creativity',
    icon: Palette,
    description: 'Expression, art, innovation, play',
    color: 'bg-gradient-to-br from-soul-indigo/10 to-soul-blue/20 text-soul-indigo border-soul-indigo/30 hover:from-soul-indigo/20 hover:to-soul-blue/30'
  },
  {
    id: 'spirituality',
    name: 'Spirituality',
    icon: Sparkles,
    description: 'Inner wisdom, connection, transcendence',
    color: 'bg-gradient-to-br from-soul-purple/10 to-soul-indigo/20 text-soul-purple border-soul-purple/30 hover:from-soul-purple/20 hover:to-soul-indigo/30'
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
              className={`h-auto p-4 flex flex-col items-center space-y-3 hover:scale-105 transition-all duration-200 ${area.color}`}
            >
              <Icon className="h-8 w-8" />
              <div className="text-center">
                <div className="font-medium text-sm">{area.name}</div>
                <div className="text-xs opacity-75 mt-1">{area.description}</div>
              </div>
            </Button>
          );
        })}
      </div>
    </CosmicCard>
  );
};
