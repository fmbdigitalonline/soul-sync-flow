/**
 * React Hook for Multi-Dimensional XP Progression
 * 
 * Manages XP state with real-time updates and milestone tracking
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  ProgressState,
  ProgressEvent,
  Dim,
  xpToPercent,
  awardXP,
  passesGates,
  handleRollovers,
  getDimensionName,
  getNextMilestone,
} from '@/services/xp-progression-service';

export interface XPProgress {
  percent: number;
  xpTotal: number;
  dimScores: Record<Dim, number>;
  lastMilestone: number;
  nextMilestone: { milestone: number; xpNeeded: number } | null;
  sessionXP: number;
  dailyXP: number;
  weeklyXP: number;
}

export const useXPProgression = () => {
  const [progress, setProgress] = useState<XPProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Initialize or fetch user's XP progress
  const initializeProgress = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch existing progress
      const { data: existing, error: fetchError } = await supabase
        .from('user_xp_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existing) {
        // Handle rollovers
        let state: ProgressState = {
          xpTotal: Number(existing.xp_total),
          dimScoresEWMA: existing.dim_scores_ewma as Record<Dim, number>,
          lastMilestoneHit: existing.last_milestone_hit,
          repeatsToday: existing.repeats_today as Partial<Record<Dim, number>>,
          sessionXP: Number(existing.session_xp),
          dailyXP: Number(existing.daily_xp),
          weeklyXP: Number(existing.weekly_xp),
          lastADPAt: existing.last_adp_at ? new Date(existing.last_adp_at).getTime() : undefined,
          last_reset_day: existing.last_reset_day,
          last_reset_week: existing.last_reset_week,
        };

        state = handleRollovers(state);

        // Update if rollovers occurred
        if (state.last_reset_day !== existing.last_reset_day || state.last_reset_week !== existing.last_reset_week) {
          await supabase
            .from('user_xp_progress')
            .update({
              daily_xp: state.dailyXP,
              weekly_xp: state.weeklyXP,
              repeats_today: state.repeatsToday,
              last_reset_day: state.last_reset_day,
              last_reset_week: state.last_reset_week,
            })
            .eq('user_id', user.id);
        }

        const percent = xpToPercent(state.xpTotal);
        const nextMilestone = getNextMilestone(percent, state.xpTotal);

        setProgress({
          percent,
          xpTotal: state.xpTotal,
          dimScores: state.dimScoresEWMA,
          lastMilestone: state.lastMilestoneHit,
          nextMilestone,
          sessionXP: state.sessionXP,
          dailyXP: state.dailyXP,
          weeklyXP: state.weeklyXP,
        });
      } else {
        // Initialize new user with 0 XP
        const initialState: ProgressState = {
          xpTotal: 0,
          dimScoresEWMA: {
            SIP: 50,
            CMP: 50,
            PCP: 50,
            HPP: 50,
            COV: 50,
            LVP: 50,
            ADP: 50,
          },
          lastMilestoneHit: 0,
          repeatsToday: {},
          sessionXP: 0,
          dailyXP: 0,
          weeklyXP: 0,
          last_reset_day: new Date().toISOString().slice(0, 10),
          last_reset_week: getWeekNumber(new Date()),
        };

        const { error: insertError } = await supabase
          .from('user_xp_progress')
          .insert({
            user_id: user.id,
            xp_total: initialState.xpTotal,
            dim_scores_ewma: initialState.dimScoresEWMA,
            last_milestone_hit: initialState.lastMilestoneHit,
            repeats_today: initialState.repeatsToday,
            session_xp: initialState.sessionXP,
            daily_xp: initialState.dailyXP,
            weekly_xp: initialState.weeklyXP,
            last_reset_day: initialState.last_reset_day,
            last_reset_week: initialState.last_reset_week,
          });

        if (insertError) throw insertError;

        setProgress({
          percent: 0,
          xpTotal: 0,
          dimScores: initialState.dimScoresEWMA,
          lastMilestone: 0,
          nextMilestone: getNextMilestone(0, 0),
          sessionXP: 0,
          dailyXP: 0,
          weeklyXP: 0,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize XP progress');
      console.error('Failed to initialize XP progress:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Award XP from an event
  const recordXPEvent = useCallback(async (event: ProgressEvent) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !progress) return;

      // Fetch recent kinds for novelty check
      const { data: recentEvents } = await supabase
        .from('user_xp_events')
        .select('kinds, occurred_at')
        .eq('user_id', user.id)
        .gte('occurred_at', new Date(Date.now() - 86_400_000).toISOString())
        .order('occurred_at', { ascending: false })
        .limit(30);

      const recentKinds = (recentEvents || []).flatMap((e) =>
        e.kinds.map((k: string) => ({
          kind: k,
          at: new Date(e.occurred_at).getTime(),
        }))
      );

      // Fetch current state
      const { data: current } = await supabase
        .from('user_xp_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!current) return;

      let state: ProgressState = {
        xpTotal: Number(current.xp_total),
        dimScoresEWMA: current.dim_scores_ewma as Record<Dim, number>,
        lastMilestoneHit: current.last_milestone_hit,
        repeatsToday: current.repeats_today as Partial<Record<Dim, number>>,
        sessionXP: Number(current.session_xp),
        dailyXP: Number(current.daily_xp),
        weeklyXP: Number(current.weekly_xp),
        lastADPAt: current.last_adp_at ? new Date(current.last_adp_at).getTime() : undefined,
        last_reset_day: current.last_reset_day,
        last_reset_week: current.last_reset_week,
      };

      // Handle rollovers
      state = handleRollovers(state);

      // Award XP
      const { state: newState, deltaXP, topContributors } = awardXP(state, event, recentKinds);

      if (deltaXP === 0) return; // No XP awarded

      const newPercent = xpToPercent(newState.xpTotal);
      const oldPercent = xpToPercent(state.xpTotal);

      // Check gating
      const gateResult = passesGates(
        newPercent,
        newState.dimScoresEWMA,
        newState.lastADPAt
      );

      // Update database
      await supabase.from('user_xp_progress').update({
        xp_total: newState.xpTotal,
        dim_scores_ewma: newState.dimScoresEWMA,
        repeats_today: newState.repeatsToday,
        session_xp: newState.sessionXP,
        daily_xp: newState.dailyXP,
        weekly_xp: newState.weeklyXP,
        last_reset_day: newState.last_reset_day,
        last_reset_week: newState.last_reset_week,
      }).eq('user_id', user.id);

      // Log event
      await supabase.from('user_xp_events').insert({
        user_id: user.id,
        occurred_at: new Date(event.timestamp).toISOString(),
        delta_xp: deltaXP,
        xp_total_after: newState.xpTotal,
        dims: event.dims,
        quality: event.quality,
        kinds: event.kinds,
        blocked_gate: gateResult.passes ? null : gateResult.blockedReason,
      });

      // Update local state
      const nextMilestone = getNextMilestone(newPercent, newState.xpTotal);
      setProgress({
        percent: newPercent,
        xpTotal: newState.xpTotal,
        dimScores: newState.dimScoresEWMA,
        lastMilestone: newState.lastMilestoneHit,
        nextMilestone,
        sessionXP: newState.sessionXP,
        dailyXP: newState.dailyXP,
        weeklyXP: newState.weeklyXP,
      });

      // Show milestone celebrations
      if (newPercent !== oldPercent && newPercent >= 50) {
        const milestones = [50, 60, 70, 80, 90, 100];
        const crossedMilestone = milestones.find(
          (m) => oldPercent < m && newPercent >= m
        );

        if (crossedMilestone && gateResult.passes && crossedMilestone > newState.lastMilestoneHit) {
          // Update milestone
          await supabase
            .from('user_xp_progress')
            .update({ last_milestone_hit: crossedMilestone })
            .eq('user_id', user.id);

          newState.lastMilestoneHit = crossedMilestone;

          // Show celebration
          toast({
            title: `🎉 ${crossedMilestone}% Milestone!`,
            description: `Intelligence evolved! Top contributors: ${topContributors
              .map((c) => getDimensionName(c.dim))
              .join(', ')}`,
            duration: 5000,
          });
        }
      }
    } catch (err) {
      console.error('Failed to record XP event:', err);
    }
  }, [progress, toast]);

  useEffect(() => {
    initializeProgress();
  }, [initializeProgress]);

  return {
    progress,
    loading,
    error,
    recordXPEvent,
    refreshProgress: initializeProgress,
  };
};

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
