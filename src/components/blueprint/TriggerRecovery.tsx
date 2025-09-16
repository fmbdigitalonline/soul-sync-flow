import React, { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const TriggerRecovery: React.FC = () => {
  useEffect(() => {
    const runRecovery = async () => {
      try {
        console.log('🔄 Triggering hermetic recovery for job 8e91dc1b-07be-4d7a-9033-33a125da6fa6...');
        
        const { data, error } = await supabase.functions.invoke('hermetic-recovery', {
          body: { job_id: '8e91dc1b-07be-4d7a-9033-33a125da6fa6' }
        });

        if (error) {
          console.error('❌ Recovery failed:', error);
          return;
        }

        console.log('✅ Recovery result:', data);
        
        if (data?.success) {
          console.log('🎉 Recovery successful! Report created with ID:', data.report_id);
          console.log('📊 Report word count:', data.word_count);
          console.log('✅ Recovery completed - check report tab for updated content');
        } else {
          console.error('❌ Recovery unsuccessful:', data?.error);
        }
      } catch (err) {
        console.error('❌ Recovery error:', err);
      }
    };

    runRecovery();
  }, []);

  return (
    <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
      Recovery trigger component (invisible)
    </div>
  );
};

export default TriggerRecovery;