import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, AlertCircle, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface HermeticProcessingJob {
  id: string;
  user_id: string;
  job_type: string;
  status: string;
  current_step?: string;
  current_stage?: string;
  current_step_index?: number;
  current_phase?: number;
  progress_percentage?: number;
  progress_data?: any;
  result_data?: any;
  error_message?: string;
  created_at: string;
  updated_at?: string;
  completed_at?: string;
  last_heartbeat?: string;
}

interface RPCErrorResponse {
  error: 'authentication_required' | 'job_not_found';
  message: string;
}

interface SubJob {
  id: string;
  agent_name: string;
  stage: string;
  status: string;
  content?: string;
  word_count: number;
  created_at: string;
  completed_at?: string;
}

export function ReportStatusPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const [job, setJob] = useState<HermeticProcessingJob | null>(null);
  const [subJobs, setSubJobs] = useState<SubJob[]>([]);
  const [showContent, setShowContent] = useState(false);
  const [isPolling, setIsPolling] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchJobStatus = async () => {
    if (!jobId || !user) {
      console.log('🔍 REPORT STATUS: Missing requirements', { jobId, user: !!user });
      return;
    }

    console.log('🔍 REPORT STATUS: Fetching status for job:', jobId, 'user:', user.id);

    try {
      // Fetch main job status
      const { data, error } = await supabase
        .rpc('get_hermetic_job_status', { job_id: jobId });

      console.log('📡 REPORT STATUS: RPC response:', { 
        hasData: !!data, 
        error: error,
        dataKeys: data ? Object.keys(data) : [],
        rawData: data 
      });

      // CRITICAL: Also fetch sub-jobs for real-time content display
      const { data: subJobsData, error: subJobsError } = await supabase
        .from('hermetic_sub_jobs')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: true });

      if (subJobsData) {
        console.log('📋 REPORT STATUS: Sub-jobs fetched:', {
          count: subJobsData.length,
          completed: subJobsData.filter(sj => sj.status === 'completed').length,
          totalWordCount: subJobsData.reduce((sum, sj) => sum + (sj.word_count || 0), 0)
        });
        setSubJobs(subJobsData);
      }

      if (error) {
        console.error('❌ REPORT STATUS: RPC error:', error);
        toast({
          title: t('toast.error.databaseError'),
          description: `Failed to fetch job status: ${error.message}`,
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Handle new error response format from improved RPC function
      if (data && typeof data === 'object' && 'error' in data) {
        const errorData = data as unknown as RPCErrorResponse;
        console.log('⚠️ REPORT STATUS: Job status error:', errorData.error, errorData.message);
        
        if (errorData.error === 'authentication_required') {
          console.log('🔐 REPORT STATUS: Authentication required - retrying in 2 seconds...');
          setTimeout(() => {
            if (user) fetchJobStatus();
          }, 2000);
          return;
        }
        
        if (errorData.error === 'job_not_found') {
          console.log('❌ REPORT STATUS: Job not found or access denied');
          setJob(null);
          setLoading(false);
          return;
        }
      }

      // Check if we got empty data (legacy fallback)
      if (!data || Object.keys(data).length === 0) {
        console.log('📋 REPORT STATUS: No job data returned - trying direct table access...');
        
        const { data: directData, error: directError } = await supabase
          .from('hermetic_processing_jobs')
          .select('*')
          .eq('id', jobId)
          .eq('user_id', user.id)
          .single();
        
        console.log('🔍 REPORT STATUS: Direct query result:', {
          hasData: !!directData,
          error: directError,
          jobData: directData
        });
        
        if (directError) {
          console.error('❌ REPORT STATUS: Direct query failed:', directError);
          setJob(null);
          setLoading(false);
          return;
        }
        
        if (directData) {
          console.log('✅ REPORT STATUS: Direct query succeeded');
          setJob(directData as unknown as HermeticProcessingJob);
          setLoading(false);
        } else {
          setJob(null);
          setLoading(false);
        }
        return;
      }

      const jobData = data as unknown as HermeticProcessingJob;
        console.log('📊 REPORT STATUS: Job details:', {
          jobId: jobData.id,
          status: jobData.status,
          progress: jobData.progress_percentage,
          currentStep: jobData.current_step,
          currentStage: jobData.current_stage,
          stepIndex: jobData.current_step_index,
          lastHeartbeat: jobData.last_heartbeat,
          hasProgressData: !!jobData.progress_data,
          hasResultData: !!jobData.result_data
        });

      // Log detailed progress if available
      if (jobData.progress_data) {
        const pd = jobData.progress_data;
        const wordCount = [
          ...(pd.system_sections || []),
          ...(pd.hermetic_sections || []),
          ...(pd.gate_sections || []),
          ...(pd.intelligence_sections || [])
        ].reduce((total, section) => {
          return total + (section.content || '').split(/\s+/).filter(word => word.length > 0).length;
        }, 0);

        console.log('📈 REPORT STATUS: Progress breakdown:', {
          systemSections: pd.system_sections?.length || 0,
          hermeticSections: pd.hermetic_sections?.length || 0,
          gateSections: pd.gate_sections?.length || 0,
          intelligenceSections: pd.intelligence_sections?.length || 0,
          totalWordCount: wordCount,
          progressData: pd
        });
      }

      setJob(jobData);
      setLoading(false);

      // Handle status changes with enhanced logging
      if (jobData?.status === 'completed') {
        console.log('🎉 REPORT STATUS: Job completed successfully!', {
          jobId: jobData.id,
          completedAt: jobData.completed_at,
          hasResultData: !!jobData.result_data
        });
        setIsPolling(false);
        toast({
          title: t('toast.success.reportComplete'),
          description: "Your hermetic report has been generated successfully.",
        });
        
        setTimeout(() => {
          console.log('🚀 REPORT STATUS: Redirecting to report view...');
          navigate(`/reports/view/${jobData.id}`);
        }, 2000);
        
      } else if (jobData?.status === 'failed') {
        console.error('❌ REPORT STATUS: Job failed!', {
          jobId: jobData.id,
          errorMessage: jobData.error_message,
          failedAt: jobData.updated_at
        });
        setIsPolling(false);
        toast({
          title: t('toast.error.generationFailed'),
          description: jobData.error_message || "Report generation failed",
          variant: "destructive"
        });
      } else {
        console.log('⏳ REPORT STATUS: Job still in progress:', {
          status: jobData.status,
          progress: jobData.progress_percentage,
          currentStep: jobData.current_step
        });
      }

    } catch (error) {
      console.error('💥 REPORT STATUS: Unexpected error:', error);
      toast({
        title: t('toast.error.networkError'),
        description: "Unable to connect to the server. Retrying...",
        variant: "destructive"
      });
      
      setTimeout(() => {
        console.log('🔄 REPORT STATUS: Retrying after error...');
        if (user) fetchJobStatus();
      }, 3000);
      
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
    if (!isPolling || !user) {
      console.log('🛑 REPORT STATUS POLLING: Stopped', { isPolling, hasUser: !!user });
      return;
    }

    console.log('🔄 REPORT STATUS POLLING: Starting polling every 3 seconds');

    const pollInterval = setInterval(() => {
      console.log('⏰ REPORT STATUS POLLING: Fetching update...');
      fetchJobStatus();
    }, 3000); // Faster polling (3 seconds)

    return () => {
      console.log('🛑 REPORT STATUS POLLING: Cleanup');
      clearInterval(pollInterval);
    };
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
              This could be due to an authentication issue or the report may not exist.
            </p>
            <div className="space-y-3">
              <Button onClick={() => {
                console.log('Retrying job status fetch...');
                setLoading(true);
                fetchJobStatus();
              }}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
              <Button variant="outline" onClick={() => navigate('/blueprint')}>
                Back to Blueprint
              </Button>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              Job ID: {jobId}
            </div>
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
            {job.current_step && (
              <p className="text-sm">{job.current_step}</p>
            )}
          </div>

          {/* Real-time Content Display */}
          {showContent && subJobs.length > 0 && (
            <div className="p-4 bg-purple-50 text-purple-700 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <p className="font-medium">Generated Content Preview:</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowContent(false)}
                >
                  <EyeOff className="w-4 h-4 mr-1" />
                  Hide
                </Button>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {subJobs.filter(sj => sj.status === 'completed' && sj.content).map((subJob) => (
                  <div key={subJob.id} className="border border-purple-200 rounded-lg p-3 bg-white">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-sm text-purple-900">
                        {subJob.agent_name.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())} ({subJob.stage})
                      </h4>
                      <span className="text-xs text-purple-600">
                        {subJob.word_count} words
                      </span>
                    </div>
                    <p className="text-xs text-purple-700 line-clamp-3">
                      {subJob.content?.substring(0, 200)}...
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-xs text-purple-600">
                Total: {subJobs.reduce((sum, sj) => sum + (sj.word_count || 0), 0)} words generated so far
              </div>
            </div>
          )}

          {/* Show Content Button */}
          {!showContent && subJobs.length > 0 && (
            <Button 
              variant="outline" 
              onClick={() => setShowContent(true)}
              className="w-full"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Generated Content ({subJobs.filter(sj => sj.status === 'completed').length} sections completed)
            </Button>
          )}

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