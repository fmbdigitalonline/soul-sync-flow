
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Bell, 
  Clock, 
  CheckCircle, 
  Snooze, 
  Calendar,
  AlertCircle,
  Play,
  Pause
} from 'lucide-react';
import { memoryService, MicroActionReminder } from '@/services/memory-service';
import { toast } from 'sonner';
import { format, addHours, addDays, isPast } from 'date-fns';

interface MicroActionRemindersProps {
  sessionId: string;
}

export const MicroActionReminders: React.FC<MicroActionRemindersProps> = ({
  sessionId
}) => {
  const [reminders, setReminders] = useState<MicroActionReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [completionNotes, setCompletionNotes] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadActiveReminders();
    
    // Set up polling for new reminders every 30 seconds
    const interval = setInterval(loadActiveReminders, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadActiveReminders = async () => {
    try {
      console.log('⏰ Loading active reminders...');
      const activeReminders = await memoryService.getActiveReminders();
      setReminders(activeReminders);
      
      // Check for overdue reminders and trigger notifications
      const overdueReminders = activeReminders.filter(r => 
        isPast(new Date(r.scheduled_for)) && r.status === 'pending'
      );
      
      if (overdueReminders.length > 0) {
        toast.info(`You have ${overdueReminders.length} pending action${overdueReminders.length > 1 ? 's' : ''}!`);
      }
    } catch (error) {
      console.error('Error loading reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteAction = async (reminder: MicroActionReminder) => {
    const notes = completionNotes[reminder.id] || '';
    
    console.log('✅ Completing action:', reminder.action_title);
    
    const success = await memoryService.updateReminderStatus(
      reminder.id, 
      'completed', 
      notes.trim() || undefined
    );
    
    if (success) {
      // Save completion as memory
      await memoryService.saveMemory({
        user_id: '',
        session_id: sessionId,
        memory_type: 'micro_action',
        memory_data: {
          action_title: reminder.action_title,
          action_description: reminder.action_description,
          completion_notes: notes,
          completed_at: new Date().toISOString(),
          original_scheduled: reminder.scheduled_for
        },
        context_summary: `Completed micro-action: ${reminder.action_title}`,
        importance_score: 7
      });
      
      toast.success(`Great job completing: ${reminder.action_title}!`);
      loadActiveReminders();
      setCompletionNotes(prev => ({ ...prev, [reminder.id]: '' }));
    } else {
      toast.error('Failed to mark action as completed');
    }
  };

  const handleSnoozeAction = async (reminder: MicroActionReminder, hours: number) => {
    const snoozeUntil = addHours(new Date(), hours);
    
    console.log(`😴 Snoozing action for ${hours} hours:`, reminder.action_title);
    
    const success = await memoryService.snoozeReminder(reminder.id, snoozeUntil);
    
    if (success) {
      toast.info(`Action snoozed until ${format(snoozeUntil, 'MMM dd, h:mm a')}`);
      loadActiveReminders();
    } else {
      toast.error('Failed to snooze action');
    }
  };

  const handleCreateReminder = async (actionTitle: string, actionDescription: string, scheduledFor: Date) => {
    console.log('⏰ Creating new reminder:', actionTitle);
    
    const reminder = await memoryService.createReminder({
      user_id: '',
      session_id: sessionId,
      action_title: actionTitle,
      action_description: actionDescription,
      reminder_type: 'in_app',
      scheduled_for: scheduledFor.toISOString(),
      status: 'pending'
    });
    
    if (reminder) {
      toast.success(`Reminder set for: ${actionTitle}`);
      loadActiveReminders();
    } else {
      toast.error('Failed to create reminder');
    }
  };

  const getStatusIcon = (status: MicroActionReminder['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'sent': return <Bell className="h-4 w-4 text-orange-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'snoozed': return <Snooze className="h-4 w-4 text-gray-500" />;
      default: return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (reminder: MicroActionReminder) => {
    const isOverdue = isPast(new Date(reminder.scheduled_for)) && reminder.status === 'pending';
    
    if (isOverdue) {
      return <Badge variant="destructive">Overdue</Badge>;
    }
    
    switch (reminder.status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'sent':
        return <Badge variant="secondary">Active</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'snoozed':
        return <Badge variant="outline">Snoozed</Badge>;
      default:
        return <Badge variant="destructive">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Action Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Action Reminders
          {reminders.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {reminders.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {reminders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No active reminders</p>
            <p className="text-sm">Actions will appear here when scheduled</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reminders.map((reminder) => (
              <div key={reminder.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(reminder.status)}
                      <h4 className="font-medium">{reminder.action_title}</h4>
                      {getStatusBadge(reminder)}
                    </div>
                    {reminder.action_description && (
                      <p className="text-sm text-gray-600 mb-2">
                        {reminder.action_description}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Scheduled for: {format(new Date(reminder.scheduled_for), 'MMM dd, yyyy h:mm a')}
                    </p>
                  </div>
                </div>

                {(reminder.status === 'pending' || reminder.status === 'sent') && (
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Add notes about completing this action (optional)"
                      value={completionNotes[reminder.id] || ''}
                      onChange={(e) => setCompletionNotes(prev => ({
                        ...prev,
                        [reminder.id]: e.target.value
                      }))}
                      rows={2}
                      className="text-sm"
                    />
                    
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        onClick={() => handleCompleteAction(reminder)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Mark Complete
                      </Button>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Snooze className="h-4 w-4 mr-1" />
                            Snooze
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Snooze Action</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-3">
                            <p className="text-sm text-gray-600">
                              How long would you like to snooze "{reminder.action_title}"?
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              <Button 
                                onClick={() => handleSnoozeAction(reminder, 1)}
                                variant="outline"
                              >
                                1 Hour
                              </Button>
                              <Button 
                                onClick={() => handleSnoozeAction(reminder, 4)}
                                variant="outline"
                              >
                                4 Hours
                              </Button>
                              <Button 
                                onClick={() => handleSnoozeAction(reminder, 24)}
                                variant="outline"
                              >
                                1 Day
                              </Button>
                              <Button 
                                onClick={() => handleSnoozeAction(reminder, 72)}
                                variant="outline"
                              >
                                3 Days
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                )}

                {reminder.status === 'completed' && reminder.completion_notes && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Completion notes:</strong> {reminder.completion_notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MicroActionReminders;
