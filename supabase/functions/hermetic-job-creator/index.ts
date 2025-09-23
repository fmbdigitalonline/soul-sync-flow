import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, blueprint_data, language = 'en' } = await req.json();
    
    if (!user_id || !blueprint_data) {
      return new Response(JSON.stringify({ 
        error: 'Missing user_id or blueprint_data' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`📋 Creating hermetic job for user ${user_id}`);
    
    // Check if user has existing active job
    const { data: existingJobs } = await supabase
      .from('hermetic_processing_jobs')
      .select('id, status')
      .eq('user_id', user_id)
      .in('status', ['pending', 'processing'])
      .order('created_at', { ascending: false });
    
    if (existingJobs && existingJobs.length > 0) {
      console.log(`⚠️ User ${user_id} already has active job: ${existingJobs[0].id}`);
      return new Response(JSON.stringify({ 
        job_id: existingJobs[0].id,
        message: 'Existing job found' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Create new job record
    const { data: job, error: jobError } = await supabase
      .from('hermetic_processing_jobs')
      .insert({
        user_id: user_id,
        blueprint_data: blueprint_data,
        language: language,
        status: 'pending',
        status_message: 'Job created, queued for processing...'
      })
      .select()
      .single();
    
    if (jobError) {
      console.error('❌ Failed to create job:', jobError);
      return new Response(JSON.stringify({ 
        error: 'Failed to create job',
        details: jobError.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    console.log(`✅ Created job ${job.id} for user ${user_id}`);
    
    // Start background processing (fire-and-forget)
    // This returns quickly but processing continues in background
    const processingPromise = supabase.functions.invoke('hermetic-background-orchestrator', {
      body: { job_id: job.id }
    }).then(result => {
      if (result.error) {
        console.error(`❌ Failed to start background processing for job ${job.id}:`, result.error);
        // Update job status to failed
        supabase
          .from('hermetic_processing_jobs')
          .update({
            status: 'failed',
            status_message: `Failed to start processing: ${result.error.message}`,
            updated_at: new Date().toISOString()
          })
          .eq('id', job.id);
      } else {
        console.log(`🚀 Background processing started for job ${job.id}`);
      }
    }).catch(error => {
      console.error(`❌ Error invoking background processor for job ${job.id}:`, error);
      // Update job status to failed
      supabase
        .from('hermetic_processing_jobs')
        .update({
          status: 'failed',
          status_message: `Failed to invoke processor: ${error.message}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', job.id);
    });
    
    // Don't await - return immediately
    return new Response(JSON.stringify({ 
      job_id: job.id,
      message: 'Job created and processing started'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ Job creation failed:', error);
    return new Response(JSON.stringify({ 
      error: 'Job creation failed',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});