
import React, { useState } from "react";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Plus, Target, Calendar, Trash2, Star, CheckCircle2, CheckSquare, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useGoals, Goal } from "@/hooks/use-goals";

interface GoalSettingProps {
  blueprintTraits?: string[];
}

export const GoalSetting: React.FC<GoalSettingProps> = ({
  blueprintTraits = ["INFJ", "Projector", "Life Path 7", "Pisces Moon"],
}) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  // Use database-backed goals (Principle #2: No Hardcoded Data)
  const { goals, isLoading, error, addGoal, toggleMilestone, deleteGoal } = useGoals();
  
  const [showNewGoalForm, setShowNewGoalForm] = useState(false);
  const [newGoal, setNewGoal] = useState<{
    title: string;
    description: string;
    category: string;
    deadline?: string;
    alignedWith: string[];
  }>({
    title: "",
    description: "",
    category: "personal",
    alignedWith: [],
  });
  const [newMilestone, setNewMilestone] = useState("");
  const [tempMilestones, setTempMilestones] = useState<{ title: string }[]>([]);

  // Get goal category suggestions based on blueprint
  const getCategorySuggestions = () => {
    const suggestions = [
      { value: "personal", label: t('goals.categoryPersonal') },
      { value: "career", label: t('goals.categoryCareer') },
      { value: "health", label: t('goals.categoryHealth') },
      { value: "relationships", label: t('goals.categoryRelationships') },
      { value: "spiritual", label: t('goals.categorySpiritual') },
      { value: "financial", label: t('goals.categoryFinancial') },
      { value: "creative", label: t('goals.categoryCreative') },
    ];

    // Prioritize certain categories based on blueprint traits
    if (blueprintTraits.includes("INFJ") || blueprintTraits.includes("Life Path 7")) {
      return [
        suggestions[0], // Personal
        suggestions[4], // Spiritual
        ...suggestions.filter((_, index) => index !== 0 && index !== 4),
      ];
    }

    if (blueprintTraits.includes("Leo Sun")) {
      return [
        suggestions[6], // Creative
        suggestions[1], // Career
        ...suggestions.filter((_, index) => index !== 6 && index !== 1),
      ];
    }

    return suggestions;
  };

  const handleAddMilestone = () => {
    if (newMilestone.trim() === "") return;

    setTempMilestones([
      ...tempMilestones,
      { title: newMilestone },
    ]);
    setNewMilestone("");
  };

  const handleRemoveMilestone = (index: number) => {
    setTempMilestones(tempMilestones.filter((_, i) => i !== index));
  };

  const handleAddGoal = async () => {
    if (newGoal.title.trim() === "") return;

    // Determine alignment based on title, description, and category
    const alignedTraits = blueprintTraits.filter(trait => {
      const lowerTitle = newGoal.title.toLowerCase();
      const lowerDescription = newGoal.description.toLowerCase();
      
      // Simple matching logic - could be more sophisticated
      if (trait === "INFJ" && 
          (lowerTitle.includes("meaning") || lowerDescription.includes("purpose"))) {
        return true;
      }
      if (trait === "Projector" && 
          (lowerTitle.includes("guide") || lowerDescription.includes("advise"))) {
        return true;
      }
      if (trait === "Pisces Moon" && 
          (lowerTitle.includes("creative") || lowerDescription.includes("artistic"))) {
        return true;
      }
      if (trait === "Life Path 7" && 
          (lowerTitle.includes("learn") || lowerDescription.includes("knowledge"))) {
        return true;
      }
      
      return false;
    });

    const result = await addGoal(
      {
        title: newGoal.title,
        description: newGoal.description,
        deadline: newGoal.deadline,
        category: newGoal.category,
        alignedWith: alignedTraits,
        milestones: []
      },
      tempMilestones
    );

    if (result) {
      // Reset form
      setNewGoal({
        title: "",
        description: "",
        category: "personal",
        alignedWith: [],
      });
      setTempMilestones([]);
      setShowNewGoalForm(false);
      
      toast({
        title: t('goals.created'),
        description: t('goals.createdDescription'),
      });
    }
  };

  const getCategoryLabel = (value: string) => {
    const category = getCategorySuggestions().find(c => c.value === value);
    return category ? category.label : value;
  };

  return (
    <CosmicCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">{t('goals.smartGoals')}</h3>
        <Button
          onClick={() => setShowNewGoalForm(!showNewGoalForm)}
          variant="outline"
          size="sm"
        >
          {showNewGoalForm ? t('goals.cancel') : t('goals.addGoal')}
        </Button>
      </div>

      {showNewGoalForm && (
        <div className="mb-6 p-4 bg-secondary/20 rounded-lg space-y-4">
          <div>
            <label className="text-sm font-medium">{t('goals.goalTitle')}</label>
            <Input
              value={newGoal.title}
              onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
              placeholder={t('goals.goalTitlePlaceholder')}
              className="mt-1"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">{t('goals.description')}</label>
            <Textarea
              value={newGoal.description}
              onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
              placeholder={t('goals.descriptionPlaceholder')}
              className="mt-1"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">{t('goals.category')}</label>
              <Select
                value={newGoal.category}
                onValueChange={(value) => setNewGoal({ ...newGoal, category: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={t('goals.selectCategory')} />
                </SelectTrigger>
                <SelectContent>
                  {getCategorySuggestions().map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">{t('goals.targetDate')}</label>
              <Input
                type="date"
                value={newGoal.deadline}
                onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">{t('goals.milestones')}</label>
            <div className="flex space-x-2 mt-1">
              <Input
                value={newMilestone}
                onChange={(e) => setNewMilestone(e.target.value)}
                placeholder={t('goals.addMilestone')}
                className="flex-1"
              />
              <Button onClick={handleAddMilestone} size="icon" variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {tempMilestones.length > 0 && (
              <div className="mt-2 space-y-2">
                {tempMilestones.map((milestone, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-background rounded-md">
                    <span className="text-sm">{milestone.title}</span>
                    <Button
                      onClick={() => handleRemoveMilestone(index)}
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex justify-end">
            <Button onClick={handleAddGoal} disabled={newGoal.title.trim() === ""}>
              {t('goals.createGoal')}
            </Button>
          </div>
        </div>
      )}

      {goals.length > 0 ? (
        <div className="space-y-6">
          {goals.map((goal) => (
            <div key={goal.id} className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium flex items-center">
                    <Target className="h-4 w-4 mr-1 text-soul-purple" /> {goal.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                </div>
                <Button
                  onClick={() => deleteGoal(goal.id)}
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center text-xs text-muted-foreground space-x-4">
                <span className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {goal.deadline ? new Date(goal.deadline).toLocaleDateString() : t('goals.noDeadline')}
                </span>
                <span>{getCategoryLabel(goal.category)}</span>
              </div>
              
              {goal.alignedWith.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {goal.alignedWith.map((trait) => (
                    <div
                      key={trait}
                      className="flex items-center space-x-1 bg-secondary rounded-full px-2 py-0.5 text-xs"
                    >
                      <Star className="h-3 w-3 text-soul-purple" />
                      <span>{trait}</span>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span>{t('goals.progress')}</span>
                  <span>{goal.progress}%</span>
                </div>
                <Progress value={goal.progress} className="h-1.5" />
              </div>
              
              <div className="space-y-2">
                <h5 className="text-sm font-medium">{t('goals.milestonesTitle')}</h5>
                {goal.milestones.length > 0 ? (
                  <div className="space-y-1">
                    {goal.milestones.map((milestone) => (
                      <div
                        key={milestone.id}
                        className="flex items-center space-x-2 p-2 bg-secondary/20 rounded-md"
                      >
                        <Button
                          onClick={() => toggleMilestone(goal.id, milestone.id)}
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                        >
                          {milestone.completed ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <CheckSquare className="h-4 w-4" />
                          )}
                        </Button>
                        <span className={`text-sm ${milestone.completed ? "line-through text-muted-foreground" : ""}`}>
                          {milestone.title}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">{t('goals.noMilestones')}</p>
                )}
              </div>
              
              <div className="border-t border-border pt-4 mt-4"></div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-6">
          {t('goals.noGoals')}
        </p>
      )}
    </CosmicCard>
  );
};
