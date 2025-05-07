
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, RotateCcw, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PomodoroTimerProps {
  defaultWorkMinutes?: number;
  defaultBreakMinutes?: number;
  focusType?: string;
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  defaultWorkMinutes = 25,
  defaultBreakMinutes = 5,
  focusType = "standard"
}) => {
  // Adjust defaults based on focus type
  const getAdjustedWorkMinutes = () => {
    switch (focusType?.toLowerCase()) {
      case "deep focus":
        return 40; // Longer focus period for deep thinkers
      case "quick bursts":
        return 15; // Shorter sprints for those who work better in short bursts
      case "standard":
      default:
        return defaultWorkMinutes;
    }
  };

  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [seconds, setSeconds] = useState(getAdjustedWorkMinutes() * 60);
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => {
          if (prevSeconds === 1) {
            if (isBreak) {
              // Break finished, start work session
              toast({
                title: "Break finished!",
                description: "Time to focus on your task.",
              });
              setIsBreak(false);
              return getAdjustedWorkMinutes() * 60;
            } else {
              // Work session finished, start break
              toast({
                title: "Pomodoro completed!",
                description: "Take a short break.",
              });
              setPomodorosCompleted((prev) => prev + 1);
              setIsBreak(true);
              return defaultBreakMinutes * 60;
            }
          }
          return prevSeconds - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, isBreak, defaultBreakMinutes, toast]);

  const formatTime = () => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes < 10 ? "0" + minutes : minutes}:${
      remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds
    }`;
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setSeconds(getAdjustedWorkMinutes() * 60);
  };

  const progress = isBreak 
    ? ((defaultBreakMinutes * 60 - seconds) / (defaultBreakMinutes * 60)) * 100
    : ((getAdjustedWorkMinutes() * 60 - seconds) / (getAdjustedWorkMinutes() * 60)) * 100;

  return (
    <CosmicCard className="p-6">
      <div className="flex flex-col items-center space-y-4">
        <h3 className="text-lg font-medium">
          {isBreak ? "Break Time" : "Focus Timer"}
        </h3>
        <div className="text-4xl font-bold">{formatTime()}</div>
        <Progress value={progress} className="w-full h-2" />
        <div className="flex space-x-2">
          <Button
            onClick={toggleTimer}
            variant="outline"
            size="icon"
            className={isActive ? "bg-yellow-100" : "bg-green-100"}
          >
            {isActive ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <Button onClick={resetTimer} variant="outline" size="icon">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-sm text-muted-foreground flex items-center">
          <Clock className="h-4 w-4 mr-1" /> 
          Pomodoros completed today: {pomodorosCompleted}
        </div>
        <p className="text-xs text-muted-foreground text-center">
          {focusType === "standard" 
            ? "Standard 25/5 Pomodoro rhythm" 
            : focusType === "deep focus" 
              ? "Extended focus for deep work (40/5)" 
              : "Quick bursts for enhanced attention (15/5)"}
        </p>
      </div>
    </CosmicCard>
  );
};
