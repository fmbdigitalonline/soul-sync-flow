
import React from "react";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Heart, 
  Lightbulb, 
  Target,
  Star,
  Calendar
} from "lucide-react";
import { usePersonalInsights, WeeklyInsight } from "@/hooks/use-personal-insights";

export const WeeklyInsights: React.FC = () => {
  const { generateWeeklyInsights } = usePersonalInsights();
  const insights = generateWeeklyInsights();

  return (
    <div className="space-y-4">
      <CosmicCard className="p-4">
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-soul-purple" />
          Your Weekly Soul Insights
        </h3>
        
        <div className="space-y-4">
          {/* Weekly Score */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Growth Score</span>
              <span className="text-sm text-soul-purple font-bold">{insights.weeklyScore}/100</span>
            </div>
            <Progress value={insights.weeklyScore} className="h-2" />
          </div>

          {/* Mood Trends */}
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center">
              <Heart className="h-4 w-4 mr-1 text-soul-purple" />
              Dominant Mood Pattern
            </h4>
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-soul-purple/10">
                {insights.moodTrends.dominantMood}
              </Badge>
              <Badge variant="outline">
                {insights.moodTrends.energyPattern} Energy
              </Badge>
            </div>
          </div>

          {/* Reflection Themes */}
          {insights.reflectionThemes.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <Target className="h-4 w-4 mr-1 text-soul-purple" />
                Key Reflection Areas
              </h4>
              <div className="space-y-1">
                {insights.reflectionThemes.map((theme, index) => (
                  <p key={index} className="text-xs text-muted-foreground">
                    • {theme}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Insight Tags */}
          {insights.insightTags.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <Lightbulb className="h-4 w-4 mr-1 text-soul-purple" />
                Growth Themes
              </h4>
              <div className="flex flex-wrap gap-1">
                {insights.insightTags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Growth Patterns */}
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1 text-soul-purple" />
              Observed Patterns
            </h4>
            <div className="space-y-1">
              {insights.growthPatterns.map((pattern, index) => (
                <div key={index} className="flex items-center text-xs">
                  <Star className="h-3 w-3 mr-1 text-soul-purple" />
                  {pattern}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CosmicCard>
    </div>
  );
};
