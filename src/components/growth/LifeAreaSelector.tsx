
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
    color: 'bg-rose-100 text-rose-700 border-rose-200'
  },
  {
    id: 'career',
    name: 'Career',
    icon: Briefcase,
    description: 'Purpose, professional growth, impact',
    color: 'bg-blue-100 text-blue-700 border-blue-200'
  },
  {
    id: 'finances',
    name: 'Finances',
    icon: DollarSign,
    description: 'Abundance, security, money mindset',
    color: 'bg-green-100 text-green-700 border-green-200'
  },
  {
    id: 'relationships',
    name: 'Relationships',
    icon: Users,
    description: 'Love, friendship, community connection',
    color: 'bg-pink-100 text-pink-700 border-pink-200'
  },
  {
    id: 'wellbeing',
    name: 'Well-being',
    icon: Flower,
    description: 'Health, energy, mental clarity',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200'
  },
  {
    id: 'creativity',
    name: 'Creativity',
    icon: Palette,
    description: 'Expression, art, innovation, play',
    color: 'bg-orange-100 text-orange-700 border-orange-200'
  },
  {
    id: 'spirituality',
    name: 'Spirituality',
    icon: Sparkles,
    description: 'Inner wisdom, connection, transcendence',
    color: 'bg-purple-100 text-purple-700 border-purple-200'
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
