
import React, { useState } from "react";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Smile, Meh, Frown, Sun, Moon, Zap, Leaf, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MoodTrackerProps {
  onMoodSave: (mood: string, energy: string) => void;
}

export const MoodTracker: React.FC<MoodTrackerProps> = ({ onMoodSave }) => {
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [selectedEnergy, setSelectedEnergy] = useState<string>("");
  const [saved, setSaved] = useState(false);
  const { toast } = useToast();

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

  const handleSave = () => {
    if (selectedMood && selectedEnergy) {
      onMoodSave(selectedMood, selectedEnergy);
      setSaved(true);
      toast({
        title: "Mood tracked",
        description: `${selectedMood} mood with ${selectedEnergy} energy saved to your patterns`,
      });
      
      // Reset after 2 seconds
      setTimeout(() => {
        setSelectedMood("");
        setSelectedEnergy("");
        setSaved(false);
      }, 2000);
    }
  };

  return (
    <CosmicCard className="p-4 mb-4">
      <h3 className="text-sm font-medium mb-3 flex items-center">
        <Heart className="h-4 w-4 mr-2 text-soul-purple" />
        Track Your Current State
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
                  disabled={saved}
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
                  disabled={saved}
                >
                  <Icon className={`h-3 w-3 mr-1 ${energy.color}`} />
                  {energy.name}
                </Button>
              );
            })}
          </div>
        </div>

        {selectedMood && selectedEnergy && !saved && (
          <Button
            size="sm"
            onClick={handleSave}
            className="w-full bg-soul-purple hover:bg-soul-purple/90"
          >
            <Heart className="h-3 w-3 mr-2" />
            Save to Patterns
          </Button>
        )}

        {saved && (
          <div className="flex items-center justify-center p-2 bg-green-50 rounded-md">
            <Check className="h-4 w-4 text-green-600 mr-2" />
            <span className="text-sm text-green-700">Mood tracked!</span>
          </div>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground mt-3">
        Your mood patterns help generate personalized insights and weekly summaries.
      </p>
    </CosmicCard>
  );
};
