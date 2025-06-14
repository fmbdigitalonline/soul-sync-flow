
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Plus, CheckCircle, Calendar, TrendingUp, Flame } from "lucide-react";
import { HabitCard } from "./HabitCard";
import { HabitDetailPopup } from "./HabitDetailPopup";

interface Habit {
  id: string;
  title: string;
  description?: string;
  frequency: 'daily' | 'weekly';
  streak: number;
  completedToday: boolean;
  target: number;
  category: string;
}

export const HabitTracker: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([
    {
      id: '1',
      title: 'Morning Meditation',
      description: '10 minutes of mindfulness practice',
      frequency: 'daily',
      streak: 7,
      completedToday: true,
      target: 30,
      category: 'wellness'
    },
    {
      id: '2',
      title: 'Read for 30 minutes',
      description: 'Personal development or fiction',
      frequency: 'daily',
      streak: 3,
      completedToday: false,
      target: 21,
      category: 'learning'
    },
    {
      id: '3',
      title: 'Exercise',
      description: 'Any form of physical activity',
      frequency: 'daily',
      streak: 12,
      completedToday: true,
      target: 30,
      category: 'health'
    }
  ]);

  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleHabitDoubleTap = (habit: Habit) => {
    setSelectedHabit(habit);
    setIsPopupOpen(true);
  };

  const handleHabitSingleTap = (habit: Habit) => {
    // Optional: Add visual feedback for single tap
    console.log('Single tap on habit:', habit.title);
  };

  const handleMarkComplete = (habitId: string) => {
    setHabits(prev => prev.map(habit => 
      habit.id === habitId 
        ? { 
            ...habit, 
            completedToday: true, 
            streak: habit.completedToday ? habit.streak : habit.streak + 1 
          }
        : habit
    ));
    setIsPopupOpen(false);
  };

  const completedToday = habits.filter(h => h.completedToday).length;
  const totalHabits = habits.length;
  const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
  const longestStreak = Math.max(...habits.map(h => h.streak));

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
