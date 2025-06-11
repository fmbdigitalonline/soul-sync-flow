
import React, { useState } from "react";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Heart, Moon, Star, Compass, Eye, Save, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReflectionPromptsProps {
  onReflectionSave: (prompt: string, response: string) => void;
}

export const ReflectionPrompts: React.FC<ReflectionPromptsProps> = ({ onReflectionSave }) => {
  const [selectedPrompt, setSelectedPrompt] = useState<string>("");
  const [reflection, setReflection] = useState<string>("");
  const [saved, setSaved] = useState(false);
  const { toast } = useToast();

  const dailyPrompts = [
    {
      category: "Daily Reflection",
      icon: Moon,
      prompts: [
        "What brought me the most joy today?",
        "What challenged me and what did I learn?",
        "How did I honor my authentic self today?",
        "What am I grateful for right now?"
      ]
    },
    {
      category: "Deep Insight",
      icon: Eye,
      prompts: [
        "What pattern keeps showing up in my life?",
        "What is my soul trying to tell me?",
        "How am I growing beyond my comfort zone?",
        "What does my blueprint reveal about this situation?"
      ]
    },
    {
      category: "Life Direction",
      icon: Compass,
      prompts: [
        "What feels most aligned with my purpose?",
        "Where am I resisting my natural flow?",
        "What would I do if I fully trusted myself?",
        "How can I honor my authentic energy today?"
      ]
    }
  ];

  const handleSaveReflection = () => {
    if (selectedPrompt && reflection.trim()) {
      onReflectionSave(selectedPrompt, reflection);
      setSaved(true);
      toast({
        title: "Reflection saved",
        description: "Your insights have been added to your growth patterns",
      });
      
      // Reset after 2 seconds
      setTimeout(() => {
        setSelectedPrompt("");
        setReflection("");
        setSaved(false);
      }, 2000);
    }
  };

  return (
    <CosmicCard className="p-4 mb-4">
      <h3 className="text-sm font-medium mb-3 flex items-center">
        <Sparkles className="h-4 w-4 mr-2 text-soul-purple" />
        Reflection & Growth Tracking
      </h3>
      
      <div className="space-y-4">
        {!selectedPrompt && !saved && (
          <div className="space-y-4">
            {dailyPrompts.map((category) => {
              const Icon = category.icon;
              return (
                <div key={category.category}>
                  <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center">
                    <Icon className="h-3 w-3 mr-1" />
                    {category.category}
                  </p>
                  <div className="space-y-1">
                    {category.prompts.map((prompt, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedPrompt(prompt)}
                        className="w-full justify-start text-xs h-auto py-2 px-3 text-left hover:bg-soul-purple/10"
                      >
                        <Heart className="h-3 w-3 mr-2 text-soul-purple flex-shrink-0" />
                        <span className="text-wrap">{prompt}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {selectedPrompt && !saved && (
          <div className="space-y-3">
            <div className="p-3 bg-soul-purple/5 rounded-md">
              <p className="text-sm font-medium text-soul-purple mb-1">Reflecting on:</p>
              <p className="text-sm">{selectedPrompt}</p>
            </div>
            
            <Textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Write your thoughts and insights here..."
              className="min-h-24 text-sm"
            />
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedPrompt("")}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                size="sm"
                onClick={handleSaveReflection}
                disabled={!reflection.trim()}
                className="flex-1 bg-soul-purple hover:bg-soul-purple/90"
              >
                <Save className="h-3 w-3 mr-2" />
                Save Reflection
              </Button>
            </div>
          </div>
        )}

        {saved && (
          <div className="flex items-center justify-center p-4 bg-green-50 rounded-md">
            <Check className="h-4 w-4 text-green-600 mr-2" />
            <span className="text-sm text-green-700">Reflection saved to your growth patterns!</span>
          </div>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground mt-3">
        Your reflections build a personal growth database for weekly insights and pattern recognition.
      </p>
    </CosmicCard>
  );
};
