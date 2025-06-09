
import React from "react";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Button } from "@/components/ui/button";
import { Sparkles, Heart, Moon, Star, Compass, Eye } from "lucide-react";

interface ReflectionPromptsProps {
  onPromptSelect: (prompt: string) => void;
}

export const ReflectionPrompts: React.FC<ReflectionPromptsProps> = ({ onPromptSelect }) => {
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

  return (
    <CosmicCard className="p-4 mb-4">
      <h3 className="text-sm font-medium mb-3 flex items-center">
        <Sparkles className="h-4 w-4 mr-2 text-soul-purple" />
        Soul Reflection Prompts
      </h3>
      
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
                    onClick={() => onPromptSelect(prompt)}
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
    </CosmicCard>
  );
};
