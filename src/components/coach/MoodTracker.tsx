
import React, { useState } from "react";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Smile, Meh, Frown, Sun, Moon, Zap, Leaf } from "lucide-react";

interface MoodTrackerProps {
  onMoodSelect: (mood: string, energy: string) => void;
}

export const MoodTracker: React.FC<MoodTrackerProps> = ({ onMoodSelect }) => {
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [selectedEnergy, setSelectedEnergy] = useState<string>("");

  const moods = [
    { name: "Joyful", icon: Smile, color: "text-yellow-400" },
    { name: "Content", icon: Heart, color: "text-green-400" },
    { name: "Neutral", icon: Meh, color: "text-gray-400" },
    { name: "Reflective", icon: Moon, color: "text-blue-400" },
    { name: "Challenged", icon: Frown, color: "text-purple-400" },
  ];

  const energyLevels = [
    { name: "High", icon: Zap, color: "text-orange-400" },
    { name: "Steady", icon: Sun, color: "text-yellow-400" },
    { name: "Low", icon: Leaf, color: "text-green-400" },
  ];

  const handleSubmit = () => {
    if (selectedMood && selectedEnergy) {
      onMoodSelect(selectedMood, selectedEnergy);
      setSelectedMood("");
      setSelectedEnergy("");
    }
  };

  return (
    <CosmicCard className="p-4 mb-4">
      <h3 className="text-sm font-medium mb-3 flex items-center">
        <Heart className="h-4 w-4 mr-2 text-soul-purple" />
        How are you feeling right now?
      </h3>
      
      <div className="space-y-4">
        <div>
          <p className="text-xs text-muted-foreground mb-2">Emotional state:</p>
          <div className="flex flex-wrap gap-2">
            {moods.map((mood) => {
              const Icon = mood.icon;
              return (
                <Button
                  key={mood.name}
                  variant={selectedMood === mood.name ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedMood(mood.name)}
                  className="text-xs h-8"
                >
                  <Icon className={`h-3 w-3 mr-1 ${mood.color}`} />
                  {mood.name}
                </Button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-2">Energy level:</p>
          <div className="flex gap-2">
            {energyLevels.map((energy) => {
              const Icon = energy.icon;
              return (
                <Button
                  key={energy.name}
                  variant={selectedEnergy === energy.name ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedEnergy(energy.name)}
                  className="text-xs h-8"
                >
                  <Icon className={`h-3 w-3 mr-1 ${energy.color}`} />
                  {energy.name}
                </Button>
              );
            })}
          </div>
        </div>

        {selectedMood && selectedEnergy && (
          <Button
            size="sm"
            onClick={handleSubmit}
            className="w-full bg-soul-purple hover:bg-soul-purple/90"
          >
            Share with Soul Guide
          </Button>
        )}
      </div>
    </CosmicCard>
  );
};
