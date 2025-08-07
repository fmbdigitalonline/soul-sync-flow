/**
 * EMERGENCY I/O RECOVERY MODE
 * 
 * This service manages the emergency low-I/O mode for the 360° system
 * to prevent disk I/O budget depletion and CPU spikes.
 * 
 * Following SoulSync Mandate:
 * - Pillar I: Preserves core intelligence functionality
 * - Pillar II: Operates on ground truth, no simulation
 * - Pillar III: Transparent about emergency state
 */

import { supabase } from '@/integrations/supabase/client';

interface EmergencyStatus {
  isEmergencyMode: boolean;
  reason: string;
  activatedAt: string;
  reducedFeatures: string[];
}

class User360EmergencyService {
  private emergencyMode = false;
  private emergencyReason = '';
  private activatedAt = '';

  // Monitor disk I/O budget and activate emergency mode if needed
  async checkSystemHealth(): Promise<EmergencyStatus> {
    console.log('🔍 Emergency Monitor: Checking 360° system health');
    
    try {
      // Check profile table size and recent activity
      const { data: profileStats } = await supabase
        .from('user_360_profiles')
        .select('id, updated_at')
        .order('updated_at', { ascending: false })
        .limit(100);

      const recentUpdates = profileStats?.filter(p => 
        new Date(p.updated_at).getTime() > Date.now() - (5 * 60 * 1000) // Last 5 minutes
      ).length || 0;

      // Emergency triggers
      const highUpdateFrequency = recentUpdates > 50;
      const profileTableSize = profileStats?.length || 0;

      if (highUpdateFrequency || profileTableSize > 1000) {
        await this.activateEmergencyMode(
          `High I/O detected: ${recentUpdates} updates in 5min, ${profileTableSize} total profiles`
        );
      }

      return this.getEmergencyStatus();
    } catch (error) {
      console.error('❌ Emergency Monitor: Health check failed:', error);
      await this.activateEmergencyMode('Health check failed - activating emergency mode');
      return this.getEmergencyStatus();
    }
  }

  // Activate emergency low-I/O mode
  async activateEmergencyMode(reason: string): Promise<void> {
    if (this.emergencyMode) return;

    console.log('🚨 EMERGENCY MODE ACTIVATED:', reason);
    
    this.emergencyMode = true;
    this.emergencyReason = reason;
    this.activatedAt = new Date().toISOString();

    // Log emergency activation for transparency (Pillar III)
    try {
      await supabase
        .from('user_activities')
        .insert({
          user_id: '00000000-0000-0000-0000-000000000000', // System event
          activity_type: 'emergency_mode_activated',
          activity_data: {
            reason,
            activated_at: this.activatedAt,
            reduced_features: [
              'real_time_sync_disabled',
              'profile_refresh_rate_reduced',
              'background_aggregation_paused'
            ]
          },
          points_earned: 0
        });
    } catch (error) {
      console.warn('Failed to log emergency activation:', error);
    }
  }

  // Deactivate emergency mode when system is stable
  async deactivateEmergencyMode(): Promise<void> {
    if (!this.emergencyMode) return;

    console.log('✅ Emergency mode deactivated - system stable');
    
    this.emergencyMode = false;
    this.emergencyReason = '';
    this.activatedAt = '';

    // Log emergency deactivation
    try {
      await supabase
        .from('user_activities')
        .insert({
          user_id: '00000000-0000-0000-0000-000000000000',
          activity_type: 'emergency_mode_deactivated',
          activity_data: {
            deactivated_at: new Date().toISOString(),
            duration_minutes: this.activatedAt ? 
              Math.round((Date.now() - new Date(this.activatedAt).getTime()) / 60000) : 0
          },
          points_earned: 0
        });
    } catch (error) {
      console.warn('Failed to log emergency deactivation:', error);
    }
  }

  // Get current emergency status
  getEmergencyStatus(): EmergencyStatus {
    return {
      isEmergencyMode: this.emergencyMode,
      reason: this.emergencyReason,
      activatedAt: this.activatedAt,
      reducedFeatures: this.emergencyMode ? [
        'Real-time sync reduced to 30-second intervals',
        'Profile aggregation limited to essential data only',
        'Background processing throttled'
      ] : []
    };
  }

  // Check if we should skip intensive operations
  shouldSkipIntensiveOperation(): boolean {
    return this.emergencyMode;
  }

  // Get emergency-safe profile data (minimal I/O)
  async getEmergencySafeProfile(userId: string): Promise<any> {
    if (!this.emergencyMode) {
      throw new Error('Emergency mode not active - use regular profile service');
    }

    console.log('🔒 Emergency Mode: Fetching minimal profile data for:', userId);

    try {
      // Only fetch the absolute minimum data needed
      const { data } = await supabase
        .from('user_360_profiles')
        .select('id, data_availability, last_updated')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      return data || {
        id: null,
        userId,
        emergencyMode: true,
        dataAvailability: {},
        message: 'Emergency mode active - limited data available'
      };
    } catch (error) {
      console.error('❌ Emergency Mode: Failed to fetch safe profile:', error);
      return {
        id: null,
        userId,
        emergencyMode: true,
        error: 'Profile unavailable in emergency mode'
      };
    }
  }
}

export const user360EmergencyService = new User360EmergencyService();