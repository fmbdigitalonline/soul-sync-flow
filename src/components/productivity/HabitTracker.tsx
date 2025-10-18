import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Plus, CheckCircle, Calendar, TrendingUp, Flame, Loader2, AlertCircle } from "lucide-react";
import { HabitCard } from "./HabitCard";
import { HabitDetailPopup } from "./HabitDetailPopup";
import { useHabits } from "@/hooks/use-habits";

export const HabitTracker: React.FC = () => {
  // Use database-backed habits (Principle #2: No Hardcoded Data)
  const { habits, isLoading, error, markHabitComplete } = useHabits();
  
  const [selectedHabit, setSelectedHabit] = useState<any | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleHabitDoubleTap = (habit: any) => {
    setSelectedHabit(habit);
    setIsPopupOpen(true);
  };

  const handleHabitSingleTap = (habit: any) => {
    console.log('Single tap on habit:', habit.title);
  };

  const handleMarkComplete = async (habitId: string) => {
    await markHabitComplete(habitId);
    setIsPopupOpen(false);
  };

  const completedToday = habits.filter(h => h.completedToday).length;
  const totalHabits = habits.length;
  const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
  const longestStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0;

  // Principle #7: Build Transparently - show loading states
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-8 rounded-xl border border-orange-200 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-orange-600" />
          <p className="text-sm text-gray-600">Loading your habits...</p>
        </div>
      </div>
    );
  }

  // Principle #3: No Fallbacks That Mask Errors - surface issues
  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 p-6 rounded-xl border border-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-900 mb-1">Failed to load habits</h4>
              <p className="text-sm text-red-700">{error}</p>
              <p className="text-xs text-red-600 mt-2">Please refresh or sign in to view your habits.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state if no habits
  if (habits.length === 0) {
    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-8 rounded-xl border border-orange-200 text-center">
          <Flame className="h-12 w-12 text-orange-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-800 mb-2">No Habits Yet</h3>
          <p className="text-sm text-gray-600 mb-4">
            Start tracking your daily habits to build positive routines
          </p>
          <Button
            variant="outline"
            className="border-dashed border-2 border-orange-500 hover:bg-orange-50"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Your First Habit
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Stats */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl border border-orange-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-bold">Daily Habits</h2>
          </div>
          <Badge variant="outline" className="bg-white">
            {completedToday}/{totalHabits} today
          </Badge>
        </div>
        
        <Progress value={completionRate} className="h-2 mb-3" />
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-gray-600">{completionRate}% completed today</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-orange-500" />
            <span className="text-gray-600">{longestStreak} day best streak</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-50 p-3 rounded-lg text-center border border-green-200">
          <div className="text-lg font-bold text-green-800">{completedToday}</div>
          <div className="text-xs text-green-600">Today</div>
        </div>
        <div className="bg-orange-50 p-3 rounded-lg text-center border border-orange-200">
          <div className="text-lg font-bold text-orange-800">{longestStreak}</div>
          <div className="text-xs text-orange-600">Best Streak</div>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg text-center border border-blue-200">
          <div className="text-lg font-bold text-blue-800">{totalHabits}</div>
          <div className="text-xs text-blue-600">Total Habits</div>
        </div>
      </div>

      {/* Habits List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Your Habits</h3>
          <Badge variant="outline" className="text-xs">
            Double-tap for details
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onDoubleTap={handleHabitDoubleTap}
              onSingleTap={handleHabitSingleTap}
            />
          ))}
        </div>
      </div>

      {/* Add Habit Button */}
      <Button
        variant="outline"
        className="w-full border-dashed border-2 h-16 hover:border-orange-500 hover:bg-orange-50 transition-colors"
      >
        <Plus className="h-5 w-5 mr-2" />
        Add New Habit
      </Button>

      {/* Habit Detail Popup */}
      <HabitDetailPopup
        habit={selectedHabit}
        isOpen={isPopupOpen}
        onClose={() => {
          setIsPopupOpen(false);
          setSelectedHabit(null);
        }}
        onMarkComplete={handleMarkComplete}
      />
    </div>
  );
};
