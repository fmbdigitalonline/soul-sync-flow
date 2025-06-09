
import React from "react";
import { Button } from "@/components/ui/button";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Target, Heart, Sparkles } from "lucide-react";
import { AgentType } from "@/services/ai-coach-service";

interface AgentSelectorProps {
  currentAgent: AgentType;
  onAgentChange: (agent: AgentType) => void;
  className?: string;
}

export function AgentSelector({ currentAgent, onAgentChange, className }: AgentSelectorProps) {
  const agents = [
    {
      type: "coach" as AgentType,
      name: "Soul Coach",
      icon: Target,
      description: "Goal achievement & productivity",
      color: "text-green-400",
    },
    {
      type: "guide" as AgentType,
      name: "Soul Guide", 
      icon: Heart,
      description: "Personal insight & spiritual growth",
      color: "text-soul-purple",
    },
    {
      type: "blend" as AgentType,
      name: "Soul Companion",
      icon: Sparkles,
      description: "Balanced approach for both",
      color: "text-blue-400",
    },
  ];

  return (
    <CosmicCard className={`p-4 ${className}`}>
      <div className="text-center mb-3">
        <p className="text-sm font-medium">Choose Your Guide</p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {agents.map((agent) => {
          const Icon = agent.icon;
          const isActive = currentAgent === agent.type;
          
          return (
            <Button
              key={agent.type}
              variant={isActive ? "default" : "ghost"}
              size="sm"
              onClick={() => onAgentChange(agent.type)}
              className={`flex flex-col items-center gap-1 h-auto py-2 px-1 ${
                isActive ? "bg-soul-purple hover:bg-soul-purple/90" : ""
              }`}
            >
              <Icon className={`h-4 w-4 ${agent.color}`} />
              <span className="text-xs font-medium">{agent.name}</span>
              <span className="text-xs opacity-70 text-center leading-tight">
                {agent.description}
              </span>
            </Button>
          );
        })}
      </div>
    </CosmicCard>
  );
}
