import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface HermeticProcessingJob {
  id: string;
  user_id: string;
  blueprint_data: any;
  status: string;
  status_message?: string;
  progress_data?: any;
  result_data?: any;
  created_at: string;
  updated_at?: string;
  completed_at?: string;
}

export function ReportStatusPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [job, setJob] = useState<HermeticProcessingJob | null>(null);
  const [isPolling, setIsPolling] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchJobStatus = async () => {
    if (!jobId || !user) return;

    try {
      const { data, error } = await supabase
        .rpc('get_hermetic_job_status', { job_id: jobId });

      if (error) {
        console.error('Failed to fetch job status:', error);
        toast({
          title: "Error",
          description: "Failed to fetch job status",
          variant: "destructive"
        });
        return;
      }

      // Check if we got empty data (likely due to RLS)
      if (!data || Object.keys(data).length === 0) {
        console.log('No job data returned - may not exist or user lacks access');
        setJob(null);
        setLoading(false);
        return;
      }

      setJob(data as any as HermeticProcessingJob);
      setLoading(false);

      // Handle status changes
      if ((data as any)?.status === 'completed') {
        setIsPolling(false);
        toast({
          title: "Report Complete!",
          description: "Your hermetic report has been generated successfully.",
        });
        
        // Redirect to report view after a brief delay
        setTimeout(() => {
          navigate(`/reports/view/${(data as any).id}`);
        }, 2000);
        
      } else if ((data as any)?.status === 'failed') {
        setIsPolling(false);
        toast({
          title: "Generation Failed",
          description: "Report generation failed",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Error fetching job status:', error);
      setLoading(false);
    }
  };

  // Only fetch job data after authentication is loaded and user is authenticated
  useEffect(() => {
    if (!authLoading && user) {
      fetchJobStatus();
    } else if (!authLoading && !user) {
      // User is not authenticated
      setLoading(false);
    }
  }, [jobId, user, authLoading]);

  useEffect(() => {
    if (!isPolling || !user) return;

    const pollInterval = setInterval(() => {
      fetchJobStatus();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }, [isPolling, jobId, user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-6 h-6 text-green-600" />;
      case 'failed':
        return <AlertCircle className="w-6 h-6 text-red-600" />;
      case 'processing':
        return <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />;
      default:
        return <Clock className="w-6 h-6 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-700 bg-green-50';
      case 'failed':
        return 'text-red-700 bg-red-50';
      case 'processing':
        return 'text-blue-700 bg-blue-50';
      default:
        return 'text-yellow-700 bg-yellow-50';
    }
  };

  const handleRetryGeneration = async () => {
    // Navigate back to generate new report
    navigate('/reports/generate');
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">
            {authLoading ? 'Authenticating...' : 'Loading report status...'}
          </span>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="text-center">
          <CardContent className="pt-6">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Report Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The report you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button onClick={() => navigate('/reports')}>
              Go to Reports
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Hermetic Report Generation</h1>
        <p className="text-muted-foreground">
          Your comprehensive hermetic analysis is being processed
        </p>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {getStatusIcon(job.status)}
            <span className="capitalize">{job.status}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Status */}
          <div className={`p-4 rounded-lg ${getStatusColor(job.status)}`}>
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Status: {job.status}</span>
              <span className="text-sm">
                Started {new Date(job.created_at).toLocaleTimeString()}
              </span>
            </div>
            {job.status_message && (
              <p className="text-sm">{job.status_message}</p>
            )}
          </div>

          {/* Progress Data */}
          {job.progress_data && Object.keys(job.progress_data).length > 0 && (
            <div className="p-4 bg-blue-50 text-blue-700 rounded-lg">
              <p className="font-medium mb-1">Progress Details:</p>
              <div className="text-sm space-y-1">
                {job.progress_data.hermetic_sections && (
                  <p>Hermetic Analysis: {job.progress_data.hermetic_sections.length} sections completed</p>
                )}
                {job.progress_data.gate_analyses && (
                  <p>Gate Analysis: {job.progress_data.gate_analyses.length} gates analyzed</p>
                )}
                {job.progress_data.translations && (
                  <p>System Translations: {job.progress_data.translations.length} translations completed</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Guidance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">What You Can Do Now</CardTitle>
        </CardHeader>
        <CardContent>
          {job.status === 'processing' || job.status === 'pending' ? (
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">Close this browser tab</p>
                  <p className="text-sm text-muted-foreground">
                    Your report will continue processing in the background
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">Shut down your computer</p>
                  <p className="text-sm text-muted-foreground">
                    Processing happens on our servers, not your device
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">Come back in 15-25 minutes</p>
                  <p className="text-sm text-muted-foreground">
                    Your comprehensive 120,000+ word report will be ready!
                  </p>
                </div>
              </div>
            </div>
          ) : job.status === 'completed' ? (
            <div className="text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
              <div>
                <h3 className="text-xl font-semibold text-green-700 mb-2">
                  Report Complete!
                </h3>
                <p className="text-muted-foreground">
                  Your hermetic analysis has been successfully generated.
                </p>
              </div>
              <Button 
                onClick={() => navigate(`/reports/view/${job.id}`)}
                className="bg-green-600 hover:bg-green-700"
              >
                View Your Report
              </Button>
            </div>
          ) : job.status === 'failed' ? (
            <div className="text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
              <div>
                <h3 className="text-xl font-semibold text-red-700 mb-2">
                  Generation Failed
                </h3>
                <p className="text-muted-foreground">
                  Something went wrong while processing your report.
                </p>
              </div>
              <Button 
                onClick={handleRetryGeneration}
                variant="outline"
              >
                Try Again
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Processing Info */}
      {(job.status === 'processing' || job.status === 'pending') && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Processing Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              <strong>Expected Duration:</strong> 15-25 minutes for complete analysis
            </p>
            <p>
              <strong>Report Size:</strong> 120,000+ words across multiple sections
            </p>
            <p>
              <strong>Analysis Depth:</strong> 30+ specialized AI agents processing your blueprint
            </p>
            <p className="text-muted-foreground">
              This page will automatically update as processing progresses.
              You'll be redirected to your completed report when it's ready.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}