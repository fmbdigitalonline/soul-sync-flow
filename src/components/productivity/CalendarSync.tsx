
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Calendar, CheckCircle2, AlertCircle, RefreshCw, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useJourneyTracking } from "@/hooks/use-journey-tracking";
import { format, parseISO, isValid } from "date-fns";

interface CalendarSettings {
  autoScheduleTasks: boolean;
  blockFocusTime: boolean;
  showDeadlines: boolean;
  reminderNotifications: boolean;
}

export const CalendarSync: React.FC = () => {
  const { toast } = useToast();
  const { productivityJourney, updateProductivityJourney } = useJourneyTracking();
  const [isSyncing, setIsSyncing] = useState(false);
  const [settings, setSettings] = useState<CalendarSettings>({
    autoScheduleTasks: true,
    blockFocusTime: true,
    showDeadlines: true,
    reminderNotifications: false
  });

  const currentGoals = (productivityJourney?.current_goals || []) as any[];
  const allTasks = currentGoals.flatMap(goal => goal.tasks || []);
  
  // Calculate calendar statistics
  const tasksWithDates = allTasks.filter(task => task.due_date);
  const upcomingTasks = tasksWithDates.filter(task => {
    if (!task.due_date) return false;
    try {
      const taskDate = parseISO(task.due_date);
      return isValid(taskDate) && taskDate > new Date();
    } catch {
      return false;
    }
  });
  
  const overdueTasks = tasksWithDates.filter(task => {
    if (!task.due_date) return false;
    try {
      const taskDate = parseISO(task.due_date);
      return isValid(taskDate) && taskDate < new Date() && !task.completed;
    } catch {
      return false;
    }
  });

  const handleSettingToggle = (setting: keyof CalendarSettings, enabled: boolean) => {
    setSettings(prev => ({ ...prev, [setting]: enabled }));
    
    toast({
      title: enabled ? "Setting Enabled" : "Setting Disabled",
      description: getSettingDescription(setting, enabled),
    });
  };

  const getSettingDescription = (setting: keyof CalendarSettings, enabled: boolean) => {
    const descriptions = {
      autoScheduleTasks: enabled 
        ? "Tasks will automatically appear on your calendar based on due dates."
        : "Tasks won't be automatically scheduled on the calendar.",
      blockFocusTime: enabled
        ? "Focus sessions will block time on your calendar."
        : "Focus sessions won't create calendar blocks.",
      showDeadlines: enabled
        ? "Task deadlines will be highlighted on the calendar."
        : "Task deadlines won't be visually emphasized.",
      reminderNotifications: enabled
        ? "You'll receive reminders for upcoming tasks."
        : "Task reminders are disabled."
    };
    return descriptions[setting];
  };

  const handleCalendarSync = async () => {
    setIsSyncing(true);
    
    // Simulate calendar sync process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update tasks to ensure they have proper calendar data
    const updatedGoals = currentGoals.map(goal => ({
      ...goal,
      tasks: goal.tasks?.map((task: any) => ({
        ...task,
        calendar_synced: true,
        last_sync: new Date().toISOString()
      })) || []
    }));

    await updateProductivityJourney({
      current_goals: updatedGoals
    });
    
    setIsSyncing(false);
    
    toast({
      title: "Calendar Sync Complete",
      description: "All tasks have been synchronized with your calendar view.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Calendar Integration
        </CardTitle>
        <CardDescription>
          Sync your tasks with the built-in calendar view for better planning
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Calendar Status Overview */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div>
            <p className="font-medium">Calendar Status</p>
            <p className="text-sm text-muted-foreground">
              {tasksWithDates.length} tasks scheduled • {overdueTasks.length} overdue
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCalendarSync}
              disabled={isSyncing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Calendar'}
            </Button>
          </div>
        </div>

        {/* Calendar Statistics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{tasksWithDates.length}</p>
            <p className="text-xs text-blue-600">Scheduled Tasks</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{upcomingTasks.length}</p>
            <p className="text-xs text-green-600">Upcoming</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">{overdueTasks.length}</p>
            <p className="text-xs text-red-600">Overdue</p>
          </div>
        </div>

        {/* Calendar Settings */}
        <div className="border rounded-lg p-4 space-y-4">
          <h4 className="font-medium">Calendar Preferences</h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">Auto-schedule tasks</span>
                <p className="text-xs text-muted-foreground">Show tasks on calendar based on due dates</p>
              </div>
              <Switch
                checked={settings.autoScheduleTasks}
                onCheckedChange={(checked) => handleSettingToggle('autoScheduleTasks', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">Block focus time</span>
                <p className="text-xs text-muted-foreground">Reserve calendar time for focus sessions</p>
              </div>
              <Switch
                checked={settings.blockFocusTime}
                onCheckedChange={(checked) => handleSettingToggle('blockFocusTime', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">Highlight deadlines</span>
                <p className="text-xs text-muted-foreground">Visually emphasize task deadlines</p>
              </div>
              <Switch
                checked={settings.showDeadlines}
                onCheckedChange={(checked) => handleSettingToggle('showDeadlines', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">Task reminders</span>
                <p className="text-xs text-muted-foreground">Get notified before tasks are due</p>
              </div>
              <Switch
                checked={settings.reminderNotifications}
                onCheckedChange={(checked) => handleSettingToggle('reminderNotifications', checked)}
              />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-3">Calendar Actions</h4>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Schedule Focus
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Review Today
            </Button>
          </div>
        </div>

        {/* Recent Calendar Activity */}
        {allTasks.length > 0 && (
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-3">Recent Calendar Activity</h4>
            <div className="space-y-2">
              {allTasks.slice(0, 3).map((task, index) => (
                <div key={task.id || index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {task.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                    )}
                    <span className="truncate">{task.title}</span>
                  </div>
                  {task.due_date && (
                    <span className="text-xs text-muted-foreground">
                      {(() => {
                        try {
                          const date = parseISO(task.due_date);
                          return isValid(date) ? format(date, 'MMM d') : '';
                        } catch {
                          return '';
                        }
                      })()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
