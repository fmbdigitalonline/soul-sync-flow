
import React, { useState } from "react";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Target, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Zap, 
  Brain, 
  Star,
  Plus,
  Loader2,
  ChevronRight,
  ChevronDown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBlueprintData } from "@/hooks/use-blueprint-data";
import { useJourneyTracking } from "@/hooks/use-journey-tracking";
import { goalDecompositionService, Goal, Milestone, Task } from "@/services/goal-decomposition-service";

interface GoalAchievementProps {
  onGoalCreated?: (goal: Goal) => void;
}

export const GoalAchievement: React.FC<GoalAchievementProps> = ({ onGoalCreated }) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { blueprintData } = useBlueprintData();
  const { productivityJourney, addGoal, updateGoal, completeGoal } = useJourneyTracking();
  
  const [isCreating, setIsCreating] = useState(false);
  const [isDecomposing, setIsDecomposing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    description: '',
    category: 'personal_growth'
  });

  const currentGoals = (productivityJourney?.current_goals || []) as Goal[];

  const handleCreateGoal = async () => {
    if (!formData.description.trim()) {
      toast({
        title: "Goal Required",
        description: "Please enter a goal description",
        variant: "destructive"
      });
      return;
    }

    setIsDecomposing(true);
    
    try {
      console.log("Starting intelligent goal decomposition...");
      
      // Use the AI-powered decomposition service
      const decomposedGoal = await goalDecompositionService.decomposeGoal(
        formData.description,
        '1 month', // Default timeframe
        formData.category,
        blueprintData || {}
      );

      console.log("Goal decomposition complete:", decomposedGoal);

      // Save to journey tracking
      await addGoal(decomposedGoal);
      
      // Notify parent component
      onGoalCreated?.(decomposedGoal);
      
      // Reset form
      setFormData({
        description: '',
        category: 'personal_growth'
      });
      setShowForm(false);
      
      toast({
        title: "Intelligent Goal Created!",
        description: `Your goal has been broken down into ${decomposedGoal.milestones.length} milestones and ${decomposedGoal.tasks.length} personalized tasks.`,
      });
      
    } catch (error) {
      console.error("Error creating goal:", error);
      toast({
        title: "Error",
        description: "Failed to create goal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDecomposing(false);
    }
  };

  const handleToggleTask = async (goalId: string, taskId: string) => {
    const goal = currentGoals.find(g => g.id === goalId);
    if (!goal) return;

    const updatedTasks = goal.tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );

    const completedTasks = updatedTasks.filter(t => t.completed).length;
    const progress = Math.round((completedTasks / updatedTasks.length) * 100);

    await updateGoal(goalId, {
      tasks: updatedTasks,
      progress
    });

    toast({
      title: "Task Updated",
      description: `Task ${updatedTasks.find(t => t.id === taskId)?.completed ? 'completed' : 'reopened'}`,
    });
  };

  const handleToggleMilestone = async (goalId: string, milestoneId: string) => {
    const goal = currentGoals.find(g => g.id === goalId);
    if (!goal) return;

    const updatedMilestones = goal.milestones.map(milestone =>
      milestone.id === milestoneId ? { ...milestone, completed: !milestone.completed } : milestone
    );

    const completedMilestones = updatedMilestones.filter(m => m.completed).length;
    const milestoneProgress = Math.round((completedMilestones / updatedMilestones.length) * 100);

    await updateGoal(goalId, {
      milestones: updatedMilestones,
      progress: Math.max(goal.progress, milestoneProgress)
    });

    toast({
      title: "Milestone Updated",
      description: `Milestone ${updatedMilestones.find(m => m.id === milestoneId)?.completed ? 'completed' : 'reopened'}`,
    });
  };

  const getBlueprintBadgeColor = (trait: string): string => {
    if (trait.includes('MBTI')) return 'bg-blue-100 text-blue-800';
    if (trait.includes('Generator') || trait.includes('Manifestor')) return 'bg-green-100 text-green-800';
    if (trait.includes('Projector') || trait.includes('Reflector')) return 'bg-purple-100 text-purple-800';
    if (trait.includes('Life Path')) return 'bg-orange-100 text-orange-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getTaskCategoryIcon = (category: string) => {
    switch (category) {
      case 'planning': return <Brain className="h-3 w-3" />;
      case 'execution': return <Zap className="h-3 w-3" />;
      case 'review': return <CheckCircle2 className="h-3 w-3" />;
      case 'communication': return <Star className="h-3 w-3" />;
      default: return <Target className="h-3 w-3" />;
    }
  };

  return (
    <CosmicCard className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
        <div className="flex-1">
          <h3 className="text-lg sm:text-xl font-medium flex items-center mb-2">
            <Target className="h-5 w-5 mr-2 text-green-600 flex-shrink-0" />
            <span className="leading-tight">Intelligent Goal Achievement</span>
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            AI-powered goal breakdown based on your unique blueprint
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 hover:bg-green-700 w-full sm:w-auto mt-4 sm:mt-0 py-3 sm:py-2"
          size="lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Goal
        </Button>
      </div>

      {/* Blueprint Summary */}
      {blueprintData && (
        <div className="mb-6 p-4 bg-secondary/20 rounded-lg">
          <h4 className="text-sm font-medium mb-3">Your Achievement Blueprint</h4>
          <div className="flex flex-wrap gap-2">
            {blueprintData.cognition_mbti?.type && (
              <Badge variant="outline" className="text-xs py-1 px-2">
                {blueprintData.cognition_mbti.type}
              </Badge>
            )}
            {blueprintData.energy_strategy_human_design?.type && (
              <Badge variant="outline" className="text-xs py-1 px-2">
                {blueprintData.energy_strategy_human_design.type}
              </Badge>
            )}
            {blueprintData.values_life_path?.lifePathNumber && (
              <Badge variant="outline" className="text-xs py-1 px-2">
                Life Path {blueprintData.values_life_path.lifePathNumber}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Goal Creation Form */}
      {showForm && (
        <div className="mb-6 p-4 border rounded-lg space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium block">Goal Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your goal in detail (e.g., 'Launch a successful online business selling handmade crafts')"
              className="min-h-[100px] text-base leading-relaxed"
              rows={4}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium block">Category</label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger className="w-full h-12 text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal_growth">Personal Growth</SelectItem>
                <SelectItem value="career">Career</SelectItem>
                <SelectItem value="health">Health & Fitness</SelectItem>
                <SelectItem value="relationships">Relationships</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
                <SelectItem value="creative">Creative Projects</SelectItem>
                <SelectItem value="learning">Learning & Skills</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowForm(false)}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateGoal}
              disabled={isDecomposing || !formData.description.trim()}
              className="bg-green-600 hover:bg-green-700 w-full sm:w-auto order-1 sm:order-2 py-3 sm:py-2"
              size="lg"
            >
              {isDecomposing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  AI Analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Create Smart Goal
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Current Goals */}
      <div className="space-y-4">
        {currentGoals.length === 0 ? (
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="font-medium mb-2 text-lg">No Goals Yet</h4>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed max-w-sm mx-auto">
              Create your first intelligent goal to get personalized milestones and tasks
            </p>
            <Button
              onClick={() => setShowForm(true)}
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50 py-3 px-6"
              size="lg"
            >
              Create Your First Goal
            </Button>
          </div>
        ) : (
          currentGoals.map((goal) => (
            <CosmicCard key={goal.id} className="p-4 border-green-200/20">
              <div
                className="flex items-start justify-between cursor-pointer pb-4"
                onClick={() => setExpandedGoal(expandedGoal === goal.id ? null : goal.id)}
              >
                <div className="flex-1 pr-4">
                  <h4 className="font-medium text-base mb-2 leading-tight">{goal.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{goal.description}</p>
                  <div className="flex flex-wrap gap-3 mb-3">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1.5" />
                      {goal.target_completion}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1.5" />
                      {goal.timeframe}
                    </div>
                    <Badge variant="outline" className="text-xs py-0.5 px-2">
                      {goal.category.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 flex-shrink-0">
                  <div className="text-right">
                    <div className="text-sm font-medium mb-1">{goal.progress}%</div>
                    <Progress value={goal.progress} className="w-20 h-2" />
                  </div>
                  {expandedGoal === goal.id ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Blueprint Alignment */}
              {goal.blueprint_alignment.length > 0 && (
                <div className="mb-4 pb-4 border-t border-border pt-4">
                  <div className="flex flex-wrap gap-2">
                    {goal.blueprint_alignment.map((trait, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className={`text-xs py-1 px-2 ${getBlueprintBadgeColor(trait)}`}
                      >
                        <Star className="h-3 w-3 mr-1" />
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Expanded Content */}
              {expandedGoal === goal.id && (
                <div className="mt-4 pt-4 border-t border-border">
                  <Tabs defaultValue="milestones" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                      <TabsTrigger value="milestones" className="text-xs sm:text-sm">
                        Milestones ({goal.milestones.length})
                      </TabsTrigger>
                      <TabsTrigger value="tasks" className="text-xs sm:text-sm">
                        Tasks ({goal.tasks.length})
                      </TabsTrigger>
                      <TabsTrigger value="insights" className="text-xs sm:text-sm">
                        AI Insights
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="milestones" className="mt-4">
                      <div className="space-y-3">
                        {goal.milestones.map((milestone) => (
                          <div key={milestone.id} className="border rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleMilestone(goal.id, milestone.id)}
                                className={`mt-0.5 ${milestone.completed ? 'text-green-600' : ''} p-1`}
                              >
                                <CheckCircle2 className={`h-4 w-4 ${milestone.completed ? 'fill-current' : ''}`} />
                              </Button>
                              <div className="flex-1 min-w-0">
                                <h5 className={`font-medium text-sm mb-1 leading-tight ${milestone.completed ? 'line-through text-muted-foreground' : ''}`}>
                                  {milestone.title}
                                </h5>
                                <p className="text-xs text-muted-foreground mb-2 leading-relaxed">{milestone.description}</p>
                                <div className="text-xs text-muted-foreground">
                                  {milestone.target_date}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="tasks" className="mt-4">
                      <div className="space-y-3">
                        {goal.tasks.map((task) => (
                          <div key={task.id} className="flex items-start space-x-3 p-3 border rounded">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleTask(goal.id, task.id)}
                              className={`mt-0.5 ${task.completed ? 'text-green-600' : ''} p-1`}
                            >
                              <CheckCircle2 className={`h-4 w-4 ${task.completed ? 'fill-current' : ''}`} />
                            </Button>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start space-x-2 mb-2">
                                {getTaskCategoryIcon(task.category)}
                                <span className={`text-sm leading-tight ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                                  {task.title}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <Badge variant="outline" className="text-xs py-0.5 px-1.5">
                                  {task.estimated_duration}
                                </Badge>
                                <Badge variant="outline" className="text-xs py-0.5 px-1.5">
                                  {task.energy_level_required} energy
                                </Badge>
                                {task.optimal_time_of_day.slice(0, 2).map(time => (
                                  <Badge key={time} variant="outline" className="text-xs py-0.5 px-1.5">
                                    {time}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="insights" className="mt-4">
                      <div className="space-y-4">
                        <div className="p-4 bg-secondary/20 rounded-lg">
                          <h5 className="font-medium mb-2 text-sm">Energy Management</h5>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {goal.energy_requirements} energy requirement - {goal.optimal_timing.join(', ')}
                          </p>
                        </div>
                        
                        <div className="p-4 bg-secondary/20 rounded-lg">
                          <h5 className="font-medium mb-3 text-sm">Success Criteria</h5>
                          <ul className="text-sm text-muted-foreground space-y-2">
                            {goal.success_criteria.map((criteria, index) => (
                              <li key={index} className="flex items-start leading-relaxed">
                                <CheckCircle2 className="h-3 w-3 mr-2 mt-0.5 flex-shrink-0" />
                                <span>{criteria}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </CosmicCard>
          ))
        )}
      </div>
    </CosmicCard>
  );
};
