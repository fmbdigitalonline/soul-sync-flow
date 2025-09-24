
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Clock, CheckCircle, Calendar } from 'lucide-react';
import { memoryService, MicroActionReminder } from '@/services/memory-service';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { format, isPast } from 'date-fns';

export const ActiveReminders: React.FC = () => {
  const { t } = useLanguage();
  const [reminders, setReminders] = useState<MicroActionReminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActiveReminders();
    
    // Set up polling for new reminders every 2 minutes, not every 30 seconds
    const interval = setInterval(loadActiveReminders, 120000);
    
    return () => clearInterval(interval);
  }, []); // Empty dependency array is correct here - we want this to run once on mount

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
    console.log('✅ Completing action:', reminder.action_title);
    
    const success = await memoryService.updateReminderStatus(
      reminder.id, 
      'completed'
    );
    
    if (success) {
      toast.success(`Great job completing: ${reminder.action_title}!`);
      loadActiveReminders();
    } else {
      toast.error('Failed to mark action as completed');
    }
  };

  const getStatusIcon = (status: MicroActionReminder['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'sent': return <Bell className="h-4 w-4 text-orange-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
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
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Bell className="h-4 w-4" />
              {t('common.activeReminders')}
            </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (reminders.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Bell className="h-4 w-4" />
              {t('common.activeReminders')}
            </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-500">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">{t('common.noActiveReminders')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Bell className="h-4 w-4" />
            {t('common.activeReminders')}
            <Badge variant="secondary" className="text-xs">
              {reminders.length}
            </Badge>
          </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {reminders.slice(0, 3).map((reminder) => (
          <div key={reminder.id} className="border rounded-lg p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {getStatusIcon(reminder.status)}
                  <h4 className="font-medium text-sm">{reminder.action_title}</h4>
                  {getStatusBadge(reminder)}
                </div>
                {reminder.action_description && (
                  <p className="text-xs text-gray-600 mb-1">
                    {reminder.action_description}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  {format(new Date(reminder.scheduled_for), 'MMM dd, h:mm a')}
                </p>
              </div>
            </div>

            {(reminder.status === 'pending' || reminder.status === 'sent') && (
              <Button
                size="sm"
                onClick={() => handleCompleteAction(reminder)}
                className="bg-green-600 hover:bg-green-700 text-xs h-7"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Complete
              </Button>
            )}
          </div>
        ))}
        
        {reminders.length > 3 && (
          <div className="text-center pt-2">
            <p className="text-xs text-gray-500">
              +{reminders.length - 3} more reminders
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
