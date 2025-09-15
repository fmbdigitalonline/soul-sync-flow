// Quick utility to trigger hermetic recovery - import this anywhere to run recovery
import { supabase } from '@/integrations/supabase/client';

const triggerRecovery = async () => {
  try {
    console.log('🔄 Triggering hermetic recovery...');
    
    const { data, error } = await supabase.functions.invoke('hermetic-recovery', {
      body: { job_id: '8e91dc1b-07be-4d7a-9033-33a125da6fa6' }
    });

    if (error) {
      console.error('❌ Recovery failed:', error);
      return;
    }

    console.log('✅ Recovery result:', data);
    
    if (data?.success) {
      console.log('🎉 Recovery successful! Report created:', data.report_id);
      // Refresh the page to see the updated data
      setTimeout(() => window.location.reload(), 1000);
    } else {
      console.error('❌ Recovery unsuccessful:', data?.error);
    }
  } catch (err) {
    console.error('❌ Recovery error:', err);
  }
};

// Auto-trigger recovery
triggerRecovery();

export default triggerRecovery;