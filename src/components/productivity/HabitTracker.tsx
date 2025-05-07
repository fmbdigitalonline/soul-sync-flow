
import React, { useState } from "react";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Check, X, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

type Habit = {
  id: string;
  name: string;
  completedDates: string[];
  alignedWith: string[];
  streak: number;
};

interface HabitTrackerProps {
  blueprintTraits?: string[];
}

export const HabitTracker: React.FC<HabitTrackerProps> = ({ blueprintTraits = ["INFJ", "Projector", "Life Path 7"] }) => {
  const [habits, setHabits] = useState<Habit[]>([
    {
      id: "1",
      name: "Morning meditation",
      completedDates: [
        new Date(Date.now() - 86400000).toISOString().split("T")[0], // yesterday
      ],
      alignedWith: ["Projector", "Pisces Moon"],
      streak: 1,
    },
    {
      id: "2",
      name: "Journal writing",
      completedDates: [
        new Date(Date.now() - 86400000).toISOString().split("T")[0], // yesterday
        new Date(Date.now() - 2 * 86400000).toISOString().split("T")[0], // day before yesterday
        new Date(Date.now() - 3 * 86400000).toISOString().split("T")[0], // 3 days ago
      ],
      alignedWith: ["INFJ", "Life Path 7"],
      streak: 3,
    },
  ]);

  const [newHabitName, setNewHabitName] = useState("");
  const { toast } = useToast();

  // Suggested habits based on blueprint
  const suggestedHabits: Record<string, string[]> = {
    "INFJ": ["Journal writing", "Mindfulness practice", "Creative expression time"],
    "ENFP": ["Social connection calls", "Idea brainstorming", "Nature walks"],
    "Projector": ["Rest periods", "Deep focus sessions", "Selective social engagement"],
    "Generator": ["Physical activity", "Completion celebrations", "Response tracking"],
    "Pisces Moon": ["Emotional check-ins", "Water intake tracking", "Dream journaling"],
    "Leo Sun": ["Creative projects", "Social leadership", "Self-expression"],
    "Life Path 7": ["Spiritual practice", "Learning sessions", "Solitude time"],
    "Life Path 1": ["Goal tracking", "Leadership practice", "Innovation time"],
  };

  const getPersonalizedSuggestions = () => {
    if (!blueprintTraits || blueprintTraits.length === 0) return [];
    
    const suggestions = new Set<string>();
    
    blueprintTraits.forEach(trait => {
      const traitSuggestions = suggestedHabits[trait] || [];
      traitSuggestions.forEach(suggestion => {
        suggestions.add(suggestion);
      });
    });
    
    // Filter out habits already being tracked
    const existingHabitNames = habits.map(h => h.name);
    return Array.from(suggestions).filter(s => !existingHabitNames.includes(s));
  };

  const today = new Date().toISOString().split("T")[0];

  const toggleHabitCompletion = (habitId: string) => {
    setHabits(habits.map(habit => {
      if (habit.id === habitId) {
        const completedToday = habit.completedDates.includes(today);
        
        if (completedToday) {
          // Remove today's date
          return {
            ...habit,
            completedDates: habit.completedDates.filter(date => date !== today),
            streak: habit.streak - 1 >= 0 ? habit.streak - 1 : 0
          };
        } else {
          // Add today's date
          return {
            ...habit,
            completedDates: [...habit.completedDates, today],
            streak: habit.streak + 1
          };
        }
      }
      return habit;
    }));
  };

  const addHabit = () => {
    if (newHabitName.trim() === "") return;
    
    // Find aligned traits
    const alignedTraits = blueprintTraits.filter(trait => {
      const traitHabits = suggestedHabits[trait] || [];
      return traitHabits.some(h => 
        h.toLowerCase().includes(newHabitName.toLowerCase()) ||
        newHabitName.toLowerCase().includes(h.toLowerCase())
      );
    });
    
    const newHabit: Habit = {
      id: Date.now().toString(),
      name: newHabitName,
      completedDates: [],
      alignedWith: alignedTraits,
      streak: 0,
    };
    
    setHabits([...habits, newHabit]);
    setNewHabitName("");
    
    toast({
      title: "Habit created",
      description: `${newHabitName} added to your habit tracker.`,
    });
  };

  const addSuggestedHabit = (habitName: string) => {
    // Find aligned traits
    const alignedTraits = blueprintTraits.filter(trait => {
      const traitHabits = suggestedHabits[trait] || [];
      return traitHabits.includes(habitName);
    });
    
    const newHabit: Habit = {
      id: Date.now().toString(),
      name: habitName,
      completedDates: [],
      alignedWith: alignedTraits,
      streak: 0,
    };
    
    setHabits([...habits, newHabit]);
    
    toast({
      title: "Suggested habit added",
      description: `${habitName} added to your habit tracker.`,
    });
  };

  const deleteHabit = (habitId: string) => {
    setHabits(habits.filter(habit => habit.id !== habitId));
    
    toast({
      title: "Habit deleted",
      description: "The habit has been removed from your tracker.",
    });
  };

  return (
    <CosmicCard className="p-6">
      <h3 className="text-lg font-medium mb-4">Habit Tracker</h3>
      
      <div className="flex space-x-2 mb-4">
        <Input
          placeholder="Add a new habit..."
          value={newHabitName}
          onChange={(e) => setNewHabitName(e.target.value)}
          className="flex-1"
        />
        <Button
          onClick={addHabit}
          disabled={newHabitName.trim() === ""}
          size="icon"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      {habits.length > 0 ? (
        <div className="space-y-3">
          {habits.map((habit) => {
            const completedToday = habit.completedDates.includes(today);
            
            return (
              <div
                key={habit.id}
                className="flex items-center justify-between p-3 bg-secondary/30 rounded-md"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{habit.name}</span>
                    <Badge variant="outline" className="bg-purple-100 text-purple-800">
                      {habit.streak} day{habit.streak !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                  
                  {habit.alignedWith.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {habit.alignedWith.map((trait) => (
                        <div
                          key={trait}
                          className="flex items-center space-x-1 bg-secondary rounded-full px-2 py-0.5 text-xs"
                        >
                          <span>{trait}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => toggleHabitCompletion(habit.id)}
                    size="icon"
                    variant="outline"
                    className={completedToday ? "bg-green-100" : ""}
                  >
                    {completedToday ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </Button>
                  
                  <Button
                    onClick={() => deleteHabit(habit.id)}
                    size="icon"
                    variant="outline"
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-6">
          No habits added yet. Add one to get started!
        </p>
      )}
      
      {getPersonalizedSuggestions().length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">
            Aligned with your blueprint
          </h4>
          <div className="flex flex-wrap gap-2">
            {getPersonalizedSuggestions().slice(0, 3).map((suggestion, index) => (
              <Badge
                key={index}
                variant="outline"
                className="bg-secondary hover:bg-secondary/80 cursor-pointer"
                onClick={() => addSuggestedHabit(suggestion)}
              >
                <Plus className="h-3 w-3 mr-1" /> {suggestion}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </CosmicCard>
  );
};
