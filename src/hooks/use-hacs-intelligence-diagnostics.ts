
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface HACSDiagnostics {
  hacsIntelligenceExists: boolean;
  hacsIntelligenceLoading: boolean;
  userBlueprintExists: boolean;
  blueprintRecordExists: boolean;
  stewardIntroductionCompleted: boolean | null;
  diagnosticsComplete: boolean;
  errors: string[];
}

export const useHACSIntelligenceDiagnostics = () => {
  const { user } = useAuth();
  const [diagnostics, setDiagnostics] = useState<HACSDiagnostics>({
    hacsIntelligenceExists: false,
    hacsIntelligenceLoading: true,
    userBlueprintExists: false,
    blueprintRecordExists: false,
    stewardIntroductionCompleted: null,
    diagnosticsComplete: false,
    errors: []
  });

  useEffect(() => {
    const runDiagnostics = async () => {
      if (!user) {
        console.log('🔍 HACS Diagnostics: No authenticated user');
        return;
      }

      console.log('🔍 HACS Diagnostics: Starting comprehensive check for user:', user.id);
      
      const errors: string[] = [];
      
      try {
        // Check HACS Intelligence table
        const { data: hacsIntelligence, error: hacsError } = await supabase
          .from('hacs_intelligence')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (hacsError) {
          errors.push(`HACS Intelligence query error: ${hacsError.message}`);
          console.error('❌ HACS Diagnostics: Intelligence query error:', hacsError);
        }

        // Check user_blueprints table
        const { data: userBlueprint, error: userBlueprintError } = await supabase
          .from('user_blueprints')
          .select('id, is_active')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle();

        if (userBlueprintError) {
          errors.push(`User Blueprint query error: ${userBlueprintError.message}`);
          console.error('❌ HACS Diagnostics: User blueprint query error:', userBlueprintError);
        }

        // Check blueprints table
        const { data: blueprint, error: blueprintError } = await supabase
          .from('blueprints')
          .select('steward_introduction_completed, is_active')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle();

        if (blueprintError) {
          errors.push(`Blueprint query error: ${blueprintError.message}`);
          console.error('❌ HACS Diagnostics: Blueprint query error:', blueprintError);
        }

        // Log comprehensive results
        console.log('🔍 HACS Diagnostics Results:', {
          hacsIntelligence: hacsIntelligence ? 'EXISTS' : 'MISSING',
          userBlueprint: userBlueprint ? 'EXISTS' : 'MISSING', 
          blueprint: blueprint ? 'EXISTS' : 'MISSING',
          stewardIntroCompleted: blueprint?.steward_introduction_completed,
          errors: errors.length
        });

        if (!hacsIntelligence) {
          console.log('⚠️ HACS Diagnostics: Creating missing HACS intelligence record');
          // Don't break existing functionality - just log the missing record
          errors.push('HACS Intelligence record missing - this may cause loading issues');
        }

        if (!userBlueprint) {
          errors.push('User Blueprint record missing - user may need to complete onboarding');
        }

        if (!blueprint) {
          errors.push('Blueprint record missing - database trigger may have failed');
        }

        setDiagnostics({
          hacsIntelligenceExists: !!hacsIntelligence,
          hacsIntelligenceLoading: false,
          userBlueprintExists: !!userBlueprint,
          blueprintRecordExists: !!blueprint,
          stewardIntroductionCompleted: blueprint?.steward_introduction_completed ?? null,
          diagnosticsComplete: true,
          errors
        });

      } catch (error) {
        console.error('❌ HACS Diagnostics: Unexpected error:', error);
        setDiagnostics(prev => ({
          ...prev,
          hacsIntelligenceLoading: false,
          diagnosticsComplete: true,
          errors: [...prev.errors, `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`]
        }));
      }
    };

    runDiagnostics();
  }, [user]);

  return diagnostics;
};
