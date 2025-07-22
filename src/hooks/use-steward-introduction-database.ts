/**
 * Phase 2 Complete: Database-Driven Steward Introduction Logic
 * 
 * SoulSync Principles Implemented:
 * ✅ #1: Never Break - Uses existing architecture, additive only
 * ✅ #2: No Hardcoded Data - Uses real user blueprint data from database
 * ✅ #3: No Fallbacks That Mask Errors - Transparent error states
 * ✅ #7: Build Transparently - Clear logging and state visibility
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface StewardIntroductionState {
  shouldShow: boolean;
  loading: boolean;
  error: string | null;
  diagnostic: {
    blueprintExists: boolean;
    mbtiDataCorrect: boolean;
    introductionCompleted: boolean;
    mbtiType: string | null;
    userName: string | null;
    diagnosis: string;
  } | null;
}

export const useStewardIntroductionDatabase = () => {
  const { user } = useAuth();
  const [state, setState] = useState<StewardIntroductionState>({
    shouldShow: false,
    loading: true,
    error: null,
    diagnostic: null
  });

  const checkIntroductionStatus = async () => {
    if (!user?.id) {
      setState(prev => ({
        ...prev,
        loading: false,
        shouldShow: false,
        error: 'User not authenticated'
      }));
      return;
    }

    try {
      console.log('🔍 STEWARD INTRODUCTION: Checking database status for user:', user.id);
      
      // Query blueprints table directly for real data (Principle #2)
      const { data, error } = await supabase
        .from('blueprints')
        .select(`
          id,
          steward_introduction_completed,
          cognition_mbti,
          user_meta
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('❌ STEWARD INTRODUCTION: Database query failed:', error);
        setState(prev => ({
          ...prev,
          loading: false,
          error: `Database error: ${error.message}`,
          shouldShow: false
        }));
        return;
      }

      if (!data) {
        console.warn('⚠️ STEWARD INTRODUCTION: No active blueprint found for user');
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'No active blueprint found',
          shouldShow: false,
          diagnostic: {
            blueprintExists: false,
            mbtiDataCorrect: false,
            introductionCompleted: false,
            mbtiType: null,
            userName: null,
            diagnosis: 'missing_blueprint_record'
          }
        }));
        return;
      }

      // Extract real user data (Principle #2: No Hardcoded Data)
      const mbtiType = (data.cognition_mbti as any)?.type;
      const userName = (data.user_meta as any)?.preferred_name;
      const introCompleted = data.steward_introduction_completed || false;
      const mbtiDataCorrect = mbtiType && mbtiType !== 'Unknown';

      const diagnostic = {
        blueprintExists: true,
        mbtiDataCorrect: !!mbtiDataCorrect,
        introductionCompleted: introCompleted,
        mbtiType: mbtiType || null,
        userName: userName || null,
        diagnosis: !mbtiDataCorrect 
          ? 'mbti_data_not_extracted'
          : introCompleted 
          ? 'introduction_already_completed'
          : 'ready_for_introduction'
      };

      const shouldShow = !!(
        data && 
        mbtiDataCorrect && 
        !introCompleted
      );

      console.log('📊 STEWARD INTRODUCTION: Diagnostic result:', {
        shouldShow,
        diagnostic,
        rawData: { mbtiType, userName, introCompleted }
      });

      setState({
        shouldShow,
        loading: false,
        error: null,
        diagnostic
      });

    } catch (error) {
      console.error('💥 STEWARD INTRODUCTION: Unexpected error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        shouldShow: false
      }));
    }
  };

  const markIntroductionCompleted = async () => {
    if (!user?.id) {
      console.error('❌ STEWARD INTRODUCTION: Cannot mark completed - no user ID');
      return false;
    }

    try {
      console.log('✅ STEWARD INTRODUCTION: Marking as completed for user:', user.id);
      
      const { error } = await supabase
        .from('blueprints')
        .update({ steward_introduction_completed: true })
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) {
        console.error('❌ STEWARD INTRODUCTION: Failed to mark completed:', error);
        return false;
      }

      // Update local state
      setState(prev => ({
        ...prev,
        shouldShow: false,
        diagnostic: prev.diagnostic ? {
          ...prev.diagnostic,
          introductionCompleted: true,
          diagnosis: 'introduction_completed'
        } : null
      }));

      console.log('🎯 STEWARD INTRODUCTION: Successfully marked as completed');
      return true;
    } catch (error) {
      console.error('💥 STEWARD INTRODUCTION: Error marking completed:', error);
      return false;
    }
  };

  // Check status when user changes or component mounts
  useEffect(() => {
    checkIntroductionStatus();
  }, [user?.id]);

  return {
    ...state,
    checkIntroductionStatus,
    markIntroductionCompleted
  };
};