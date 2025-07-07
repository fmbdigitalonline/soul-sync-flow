
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface DreamActivity {
  id: string;
  activity_type: string;
  activity_data: any;
  timestamp: string;
}

export const DreamActivityLog = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<DreamActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDreamActivities();
    }
  }, [user]);

  const loadDreamActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('dream_activity_logs')
        .select('*')
        .eq('user_id', user?.id)
        .order('timestamp', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error loading dream activities:', error);
      } else {
        setActivities(data || []);
      }
    } catch (error) {
      console.error('Error loading dream activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const formatActivityType = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Card className="bg-night-800/50 border-dream-600/30">
      <CardHeader>
        <CardTitle className="text-dream-200">Dream Activity Log</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-dream-300">Loading activities...</div>
        ) : activities.length > 0 ? (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="p-3 bg-dream-900/20 rounded-lg border border-dream-600/20">
                <div className="flex justify-between items-center">
                  <span className="text-dream-200 font-medium">
                    {formatActivityType(activity.activity_type)}
                  </span>
                  <span className="text-dream-400 text-sm">
                    {formatTimestamp(activity.timestamp)}
                  </span>
                </div>
                {activity.activity_data && (
                  <div className="text-dream-300 text-sm mt-1">
                    {JSON.stringify(activity.activity_data, null, 2)}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-dream-400">No dream activities recorded yet.</div>
        )}
      </CardContent>
    </Card>
  );
};
