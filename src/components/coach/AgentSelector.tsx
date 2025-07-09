
import React from "react";
import { Button } from "@/components/ui/button";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Separator } from "@/components/ui/separator";
import { Target, Heart, Sparkles } from "lucide-react";
import { AgentType } from "@/services/ai-coach-service";
import { useLanguage } from "@/contexts/LanguageContext";

interface AgentSelectorProps {
  currentAgent: AgentType;
  onAgentChange: (agent: AgentType) => void;
  className?: string;
}

export function AgentSelector({ currentAgent, onAgentChange, className }: AgentSelectorProps) {
  const { t } = useLanguage();
  
  const agents = [
    {
      type: "coach" as AgentType,
      name: t('agent.coach.name'),
      icon: Target,
      description: t('agent.coach.description'),
      details: t('agent.coach.details'),
      color: "text-green-400",
      domain: "SEPARATED"
    },
    {
      type: "guide" as AgentType,
      name: t('agent.guide.name'), 
      icon: Heart,
      description: t('agent.guide.description'),
      details: t('agent.guide.details'),
      color: "text-soul-purple",
      domain: "SEPARATED"
    },
    {
      type: "blend" as AgentType,
      name: t('agent.blend.name'),
      icon: Sparkles,
      description: t('agent.blend.description'),
      details: t('agent.blend.details'),
      color: "text-blue-400",
      domain: "INTEGRATED"
    },
  ];

  return (
    <CosmicCard className={`p-4 ${className}`}>
      <div className="text-center mb-4">
        <p className="text-sm font-medium mb-1">{t('agent.chooseStyle')}</p>
        <p className="text-xs text-muted-foreground">{t('agent.separatedDomains')}</p>
      </div>
      
      <div className="space-y-3">
        {/* Separated Options */}
        <div>
          <div className="flex items-center justify-center mb-2">
            <span className="text-xs text-muted-foreground font-medium">{t('agent.separated')}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {agents.filter(agent => agent.domain === "SEPARATED").map((agent) => {
              const Icon = agent.icon;
              const isActive = currentAgent === agent.type;
              
              return (
                <Button
                  key={agent.type}
                  variant={isActive ? "filled" : "ghost"}
                  size="sm"
                  onClick={() => onAgentChange(agent.type)}
                  className={`flex flex-col items-center gap-1 h-auto py-3 px-2 ${
                    isActive ? "bg-soul-purple hover:bg-soul-purple/90" : ""
                  }`}
                >
                  <Icon className={`h-4 w-4 ${agent.color}`} />
                  <span className="text-xs font-medium">{agent.name}</span>
                  <span className="text-xs opacity-70 text-center leading-tight">
                    {agent.description}
                  </span>
                  <span className="text-xs opacity-50 text-center leading-tight">
                    {agent.details}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-center">
          <Separator className="flex-1" />
          <span className="px-2 text-xs text-muted-foreground">{t('agent.or')}</span>
          <Separator className="flex-1" />
        </div>

        {/* Integrated Option */}
        <div>
          <div className="flex items-center justify-center mb-2">
            <span className="text-xs text-muted-foreground font-medium">{t('agent.integrated')}</span>
          </div>
          {agents.filter(agent => agent.domain === "INTEGRATED").map((agent) => {
            const Icon = agent.icon;
            const isActive = currentAgent === agent.type;
            
            return (
              <Button
                key={agent.type}
                variant={isActive ? "filled" : "ghost"}
                size="sm"
                onClick={() => onAgentChange(agent.type)}
                className={`w-full flex flex-col items-center gap-1 h-auto py-3 px-2 ${
                  isActive ? "bg-soul-purple hover:bg-soul-purple/90" : ""
                }`}
              >
                <Icon className={`h-5 w-5 ${agent.color}`} />
                <span className="text-sm font-medium">{agent.name}</span>
                <span className="text-xs opacity-70 text-center leading-tight">
                  {agent.description}
                </span>
                <span className="text-xs opacity-50 text-center leading-tight">
                  {agent.details}
                </span>
              </Button>
            );
          })}
        </div>
      </div>
    </CosmicCard>
  );
}
