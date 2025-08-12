import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Moon, 
  Clock, 
  CheckCircle, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { memoryService, MicroActionReminder } from '@/services/memory-service';
import { toast } from 'sonner';
import { format, isToday, isTomorrow } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';
import { safeInterpolateTranslation } from '@/utils/sanitize';

export const NextBedtimeAction: React.FC = () => {
  const [bedtimeAction, setBedtimeAction] = useState<MicroActionReminder | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    loadNextBedtimeAction();
  }, []);

  const loadNextBedtimeAction = async () => {
    try {
      setLoading(true);
      const action = await memoryService.getNextBedtimeAction();
      setBedtimeAction(action);
    } catch (error) {
      console.error('Error loading bedtime action:', error);
      toast.error(t('bedtime.toast.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteAction = async () => {
    if (!bedtimeAction) return;
    
    const success = await memoryService.updateReminderStatus(
      bedtimeAction.id, 
      'completed', 
      t('bedtime.completedNote')
    );
    
    if (success) {
      toast.success(t('bedtime.toast.completed'));
      setBedtimeAction(null);
    } else {
      toast.error(t('bedtime.toast.completeFailed'));
    }
  };

  const getTimeDisplay = (scheduledFor: string) => {
    const date = new Date(scheduledFor);
    const timeStr = format(date, 'h:mm a');

    if (isToday(date)) {
      return safeInterpolateTranslation(t('bedtime.time.todayAt'), { time: timeStr });
    } else if (isTomorrow(date)) {
      return safeInterpolateTranslation(t('bedtime.time.tomorrowAt'), { time: timeStr });
    } else {
      const dateStr = format(date, 'MMM dd');
      return safeInterpolateTranslation(t('bedtime.time.onDateAt'), { date: dateStr, time: timeStr });
    }
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5 text-indigo-600" />
            {t('bedtime.loadingTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-indigo-200 rounded w-3/4"></div>
            <div className="h-4 bg-indigo-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!bedtimeAction) {
    return (
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5 text-indigo-600" />
            No Bedtime Actions Scheduled
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-indigo-300" />
            <p className="text-indigo-700 mb-2">No upcoming bedtime routines found</p>
            <p className="text-sm text-indigo-600">
              Consider setting up a bedtime routine to improve your sleep quality
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isOverdue = new Date(bedtimeAction.scheduled_for) < new Date();

  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon className="h-5 w-5 text-indigo-600" />
          {t('bedtime.nextActionTitle')}
        </div>
        {isOverdue ? (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {t('bedtime.overdue')}
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-white border-indigo-200 text-indigo-700">
            <Clock className="h-3 w-3 mr-1" />
            {t('bedtime.scheduled')}
          </Badge>
        )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium text-indigo-900 mb-2">
            {bedtimeAction.action_title}
          </h3>
          {bedtimeAction.action_description && (
            <p className="text-sm text-indigo-700 mb-3">
              {bedtimeAction.action_description}
            </p>
          )}
          <div className="flex items-center gap-2 text-sm text-indigo-600">
            <Calendar className="h-4 w-4" />
            {getTimeDisplay(bedtimeAction.scheduled_for)}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleCompleteAction}
            className="bg-indigo-600 hover:bg-indigo-700 text-white flex-1"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {t('bedtime.markComplete')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NextBedtimeAction;
