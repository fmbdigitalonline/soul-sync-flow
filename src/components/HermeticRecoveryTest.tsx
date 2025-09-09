import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface JobStatus {
  job_id: string;
  status: string;
  last_heartbeat: string | null;
  sub_job_count: number;
  total_content_length: number;
  is_zombie: boolean;
}

export const HermeticRecoveryTest: React.FC = () => {
  const [jobStatuses, setJobStatuses] = useState<JobStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const checkZombieJobs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('validate_job_heartbeat_with_content');
      
      if (error) throw error;
      
      setJobStatuses(data || []);
      
      const zombieCount = data?.filter(job => job.is_zombie).length || 0;
      toast({
        title: "Zombie Job Detection Complete",
        description: `Found ${zombieCount} zombie jobs out of ${data?.length || 0} total jobs`
      });
    } catch (error) {
      console.error('Error checking zombie jobs:', error);
      toast({
        title: "Error",
        description: "Failed to check zombie jobs",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startNewHermeticGeneration = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to start hermetic generation",
          variant: "destructive"
        });
        return;
      }

      // Get user's blueprint
      const { data: blueprint, error: blueprintError } = await supabase
        .from('user_blueprints')
        .select('blueprint')
        .eq('user_id', user.user.id)
        .eq('is_active', true)
        .single();

      if (blueprintError || !blueprint) {
        toast({
          title: "Blueprint Required",
          description: "Please complete your blueprint first",
          variant: "destructive"
        });
        return;
      }

      // Start new hermetic generation
      const { data, error } = await supabase.functions.invoke('hermetic-job-creator', {
        body: {
          user_id: user.user.id,
          blueprint_data: blueprint.blueprint
        }
      });

      if (error) throw error;

      toast({
        title: "Hermetic Generation Started",
        description: `New job created with ID: ${data.job_id}`
      });

      // Refresh job statuses
      await checkZombieJobs();
    } catch (error) {
      console.error('Error starting hermetic generation:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to start hermetic generation",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🔄 Hermetic Recovery & Testing Panel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={checkZombieJobs} 
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? 'Checking...' : 'Check Zombie Jobs'}
            </Button>
            <Button 
              onClick={startNewHermeticGeneration}
              className="bg-primary text-primary-foreground"
            >
              Start New Generation
            </Button>
          </div>

          {jobStatuses.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Job Status Overview</h3>
              <div className="grid gap-4">
                {jobStatuses.map((job) => (
                  <Card key={job.job_id} className="border-l-4 border-l-primary/20">
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-mono text-sm text-muted-foreground">
                          {job.job_id.slice(0, 8)}...
                        </div>
                        <div className="flex gap-2">
                          <Badge 
                            variant={job.status === 'completed' ? 'default' : 
                                   job.status === 'failed' ? 'destructive' : 'secondary'}
                          >
                            {job.status}
                          </Badge>
                          {job.is_zombie && (
                            <Badge variant="destructive">ZOMBIE</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Sub-jobs</div>
                          <div className="font-medium">{job.sub_job_count}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Content Length</div>
                          <div className="font-medium">{job.total_content_length.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Last Heartbeat</div>
                          <div className="font-medium">
                            {job.last_heartbeat 
                              ? new Date(job.last_heartbeat).toLocaleTimeString()
                              : 'Never'
                            }
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};