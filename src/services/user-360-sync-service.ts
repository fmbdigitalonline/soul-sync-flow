
import { supabase } from '@/integrations/supabase/client';
import { user360Service } from './user-360-service';
import { RealtimeChannel } from '@supabase/supabase-js';

interface SyncConfiguration {
  enabled: boolean;
  userId: string;
  channels: RealtimeChannel[];
  lastSyncTimestamp: string;
}

class User360SyncService {
  private syncConfigs: Map<string, SyncConfiguration> = new Map();
  private readonly SOURCE_TABLES = [
    'blueprints',
    'hacs_intelligence', 
    'memory_graph_nodes',
    'memory_graph_edges',
    'pie_patterns',
    'growth_journey',
    'user_activities',
    'user_goals',
    'conversation_memory',
    'user_statistics'
  ];

  // Start real-time synchronization for a user
  async startSync(userId: string): Promise<void> {
    if (this.syncConfigs.has(userId)) {
      console.log(`🔄 Sync already active for user: ${userId}`);
      return;
    }

    console.log(`🚀 Starting 360° sync for user: ${userId}`);
    
    const channels: RealtimeChannel[] = [];
    
    // Set up real-time listeners for each source table
    for (const tableName of this.SOURCE_TABLES) {
      const channel = supabase
        .channel(`360-sync-${tableName}-${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to INSERT, UPDATE, DELETE
            schema: 'public',
            table: tableName,
            filter: `user_id=eq.${userId}`
          },
          (payload) => this.handleTableChange(userId, tableName, payload)
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log(`✅ Subscribed to ${tableName} changes for user: ${userId}`);
          } else if (status === 'CHANNEL_ERROR') {
            console.error(`❌ Failed to subscribe to ${tableName} for user: ${userId}`);
          }
        });

      channels.push(channel);
    }

    // Store sync configuration
    this.syncConfigs.set(userId, {
      enabled: true,
      userId,
      channels,
      lastSyncTimestamp: new Date().toISOString()
    });
  }

  // Stop real-time synchronization for a user
  async stopSync(userId: string): Promise<void> {
    const config = this.syncConfigs.get(userId);
    if (!config) {
      console.log(`⚠️ No active sync found for user: ${userId}`);
      return;
    }

    console.log(`🛑 Stopping 360° sync for user: ${userId}`);

    // Unsubscribe from all channels
    config.channels.forEach(channel => {
      supabase.removeChannel(channel);
    });

    // Remove configuration
    this.syncConfigs.delete(userId);
  }

  // Handle changes from source tables
  private async handleTableChange(
    userId: string, 
    tableName: string, 
    payload: any
  ): Promise<void> {
    const config = this.syncConfigs.get(userId);
    if (!config || !config.enabled) {
      return;
    }

    console.log(`📊 360° Sync: ${tableName} changed for user ${userId}`, {
      eventType: payload.eventType,
      table: tableName,
      timestamp: new Date().toISOString()
    });

    try {
      // Trigger 360° profile refresh with debouncing
      await this.debouncedProfileRefresh(userId);
      
      // Update last sync timestamp
      config.lastSyncTimestamp = new Date().toISOString();
      
      // Log successful sync
      await this.logSyncEvent(userId, tableName, payload.eventType, 'success');
      
    } catch (error) {
      console.error(`❌ 360° Sync error for user ${userId}:`, error);
      
      // Log failed sync - don't mask the error
      await this.logSyncEvent(
        userId, 
        tableName, 
        payload.eventType, 
        'error', 
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  // Debounced profile refresh to prevent excessive updates
  private refreshTimeouts: Map<string, NodeJS.Timeout> = new Map();
  
  private async debouncedProfileRefresh(userId: string): Promise<void> {
    // Clear existing timeout
    const existingTimeout = this.refreshTimeouts.get(userId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Set new timeout for 2 seconds
    const timeout = setTimeout(async () => {
      try {
        console.log(`🔄 Refreshing 360° profile for user: ${userId}`);
        await user360Service.refreshUserProfile(userId);
        this.refreshTimeouts.delete(userId);
      } catch (error) {
        console.error(`❌ Failed to refresh 360° profile for user ${userId}:`, error);
      }
    }, 2000);

    this.refreshTimeouts.set(userId, timeout);
  }

  // Log sync events for transparency
  private async logSyncEvent(
    userId: string,
    tableName: string,
    eventType: string,
    status: 'success' | 'error',
    errorMessage?: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_activities')
        .insert({
          user_id: userId,
          activity_type: '360_sync_event',
          activity_data: {
            source_table: tableName,
            event_type: eventType,
            status,
            error_message: errorMessage || null,
            timestamp: new Date().toISOString()
          },
          points_earned: 0
        });

      if (error) {
        console.warn('Failed to log sync event:', error);
      }
    } catch (error) {
      // Don't let logging failures break sync - just warn
      console.warn('Failed to log sync event:', error);
    }
  }

  // Get sync status for a user
  getSyncStatus(userId: string): SyncConfiguration | null {
    return this.syncConfigs.get(userId) || null;
  }

  // Get all active syncs (for debugging)
  getAllActiveSyncs(): string[] {
    return Array.from(this.syncConfigs.keys());
  }

  // Cleanup method for when the service is destroyed
  cleanup(): void {
    console.log('🧹 Cleaning up 360° sync service');
    
    for (const [userId, config] of this.syncConfigs.entries()) {
      config.channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    }
    
    this.syncConfigs.clear();
    
    // Clear any pending refresh timeouts
    for (const timeout of this.refreshTimeouts.values()) {
      clearTimeout(timeout);
    }
    this.refreshTimeouts.clear();
  }
}

export const user360SyncService = new User360SyncService();
