import { supabase } from "@/integrations/supabase/client";
import { PIEDataPoint, PIEInsight, PIEPattern, PIEConfiguration } from "@/types/pie-types";

class PIEAPIService {
  private baseUrl: string;

  constructor() {
    // Use the project-specific URL
    this.baseUrl = 'https://qxaajirrqrcnmvtowjbg.supabase.co/functions/v1';
  }

  private async getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('User not authenticated');
    }

    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4YWFqaXJycXJjbm12dG93amJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5NzQ1NDcsImV4cCI6MjA1OTU1MDU0N30.HZRTlihPe3PNQVWxNHCrwjoa9R6Wvo8WOKlQVGunYIw'
    };
  }

  // Data Collection API
  async storeDataPoint(dataPoint: PIEDataPoint): Promise<boolean> {
    try {
      console.log('📊 PIE API: Storing data point via API:', dataPoint.dataType);
      
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/pie-data-collection`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          dataType: dataPoint.dataType,
          value: dataPoint.value,
          source: dataPoint.source,
          confidence: dataPoint.confidence,
          metadata: dataPoint.metadata,
          rawValue: dataPoint.rawValue
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ PIE API: Failed to store data point:', result.error);
        throw new Error(result.error || 'Failed to store data point');
      }

      console.log('✅ PIE API: Data point stored successfully');
      return true;
    } catch (error) {
      console.error('❌ PIE API: Error storing data point:', error);
      throw error;
    }
  }

  async getUserData(dataType?: string, days: number = 90): Promise<PIEDataPoint[]> {
    try {
      console.log('📊 PIE API: Fetching user data via API');
      
      const headers = await this.getAuthHeaders();
      const params = new URLSearchParams();
      if (dataType) params.append('dataType', dataType);
      params.append('days', days.toString());

      const response = await fetch(`${this.baseUrl}/pie-data-collection?${params}`, {
        method: 'GET',
        headers
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ PIE API: Failed to fetch user data:', result.error);
        throw new Error(result.error || 'Failed to fetch user data');
      }

      console.log(`✅ PIE API: Retrieved ${result.data.length} data points`);
      return result.data;
    } catch (error) {
      console.error('❌ PIE API: Error fetching user data:', error);
      throw error;
    }
  }

  // Pattern Detection API
  async detectPatterns(dataType: string): Promise<PIEPattern[]> {
    try {
      console.log('🔍 PIE API: Triggering pattern detection via API:', dataType);
      
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/pie-pattern-detection`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ dataType })
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ PIE API: Failed to detect patterns:', result.error);
        throw new Error(result.error || 'Failed to detect patterns');
      }

      console.log(`✅ PIE API: Detected ${result.patterns.length} patterns`);
      return result.patterns;
    } catch (error) {
      console.error('❌ PIE API: Error detecting patterns:', error);
      throw error;
    }
  }

  // Insight Generation API
  async generateInsights(): Promise<PIEInsight[]> {
    try {
      console.log('💡 PIE API: Generating insights via API');
      
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/pie-insights-generation`, {
        method: 'POST',
        headers,
        body: JSON.stringify({})
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ PIE API: Failed to generate insights:', result.error);
        throw new Error(result.error || 'Failed to generate insights');
      }

      console.log(`✅ PIE API: Generated ${result.insights.length} insights`);
      return result.insights;
    } catch (error) {
      console.error('❌ PIE API: Error generating insights:', error);
      throw error;
    }
  }

  async getCurrentInsights(): Promise<PIEInsight[]> {
    try {
      console.log('💡 PIE API: Fetching current insights via API');
      
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/pie-insights-generation`, {
        method: 'GET',
        headers
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ PIE API: Failed to fetch insights:', result.error);
        throw new Error(result.error || 'Failed to fetch insights');
      }

      console.log(`✅ PIE API: Retrieved ${result.insights.length} insights`);
      return result.insights;
    } catch (error) {
      console.error('❌ PIE API: Error fetching insights:', error);
      throw error;
    }
  }

  // Dashboard API
  async getDashboardData(): Promise<any> {
    try {
      console.log('📊 PIE API: Fetching dashboard data via API');
      
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/pie-dashboard`, {
        method: 'GET',
        headers
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ PIE API: Failed to fetch dashboard data:', result.error);
        throw new Error(result.error || 'Failed to fetch dashboard data');
      }

      console.log('✅ PIE API: Dashboard data retrieved successfully');
      return result.dashboard;
    } catch (error) {
      console.error('❌ PIE API: Error fetching dashboard data:', error);
      throw error;
    }
  }

  // Configuration API
  async getConfiguration(): Promise<PIEConfiguration> {
    try {
      console.log('⚙️ PIE API: Fetching configuration via API');
      
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/pie-configuration`, {
        method: 'GET',
        headers
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ PIE API: Failed to fetch configuration:', result.error);
        throw new Error(result.error || 'Failed to fetch configuration');
      }

      console.log('✅ PIE API: Configuration retrieved successfully');
      
      // Map database format to PIEConfiguration interface
      const config = result.configuration;
      return {
        userId: config.user_id,
        enabled: config.enabled,
        minimumConfidence: config.minimum_confidence,
        patternSensitivity: config.pattern_sensitivity,
        deliveryMethods: config.delivery_methods,
        deliveryTiming: config.delivery_timing,
        quietHours: config.quiet_hours,
        includeAstrology: config.include_astrology,
        includeStatistics: config.include_statistics,
        communicationStyle: config.communication_style,
        dataTypes: config.data_types,
        retentionPeriod: config.retention_period
      };
    } catch (error) {
      console.error('❌ PIE API: Error fetching configuration:', error);
      throw error;
    }
  }

  async updateConfiguration(updates: Partial<PIEConfiguration>): Promise<PIEConfiguration> {
    try {
      console.log('⚙️ PIE API: Updating configuration via API');
      
      const headers = await this.getAuthHeaders();
      
      // Map PIEConfiguration format to database format
      const dbUpdates = {
        enabled: updates.enabled,
        minimum_confidence: updates.minimumConfidence,
        pattern_sensitivity: updates.patternSensitivity,
        delivery_methods: updates.deliveryMethods,
        delivery_timing: updates.deliveryTiming,
        quiet_hours: updates.quietHours,
        include_astrology: updates.includeAstrology,
        include_statistics: updates.includeStatistics,
        communication_style: updates.communicationStyle,
        data_types: updates.dataTypes,
        retention_period: updates.retentionPeriod
      };

      // Remove undefined values
      const cleanUpdates = Object.fromEntries(
        Object.entries(dbUpdates).filter(([_, value]) => value !== undefined)
      );

      const response = await fetch(`${this.baseUrl}/pie-configuration`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(cleanUpdates)
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ PIE API: Failed to update configuration:', result.error);
        throw new Error(result.error || 'Failed to update configuration');
      }

      console.log('✅ PIE API: Configuration updated successfully');
      
      // Map response back to PIEConfiguration interface
      const config = result.configuration;
      return {
        userId: config.user_id,
        enabled: config.enabled,
        minimumConfidence: config.minimum_confidence,
        patternSensitivity: config.pattern_sensitivity,
        deliveryMethods: config.delivery_methods,
        deliveryTiming: config.delivery_timing,
        quietHours: config.quiet_hours,
        includeAstrology: config.include_astrology,
        includeStatistics: config.include_statistics,
        communicationStyle: config.communication_style,
        dataTypes: config.data_types,
        retentionPeriod: config.retention_period
      };
    } catch (error) {
      console.error('❌ PIE API: Error updating configuration:', error);
      throw error;
    }
  }

  // Insight feedback methods (using direct database calls for now as these are simpler)
  async recordInsightFeedback(insightId: string, feedback: {
    type: 'positive' | 'negative' | 'detailed';
    helpful?: boolean;
    feedback?: string;
    timestamp: string;
  }): Promise<void> {
    try {
      const { error } = await supabase
        .from('pie_insights')
        .update({
          user_feedback: feedback.type === 'detailed' ? feedback.feedback : 
                        feedback.helpful ? 'helpful' : 'not_helpful',
          acknowledged: true
        })
        .eq('id', insightId);

      if (error) throw error;
      console.log('✅ PIE insight feedback recorded:', insightId, feedback.type);
    } catch (error) {
      console.error('❌ Error recording insight feedback:', error);
      throw error;
    }
  }

  async markInsightAsViewed(insightId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('pie_insights')
        .update({ acknowledged: true })
        .eq('id', insightId);

      if (error) throw error;
      console.log('✅ PIE insight marked as viewed:', insightId);
    } catch (error) {
      console.error('❌ Error marking insight as viewed:', error);
      throw error;
    }
  }

  async dismissInsight(insightId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('pie_insights')
        .update({
          expiration_time: new Date().toISOString(),
          acknowledged: true
        })
        .eq('id', insightId);

      if (error) throw error;
      console.log('✅ PIE insight dismissed:', insightId);
    } catch (error) {
      console.error('❌ Error dismissing insight:', error);
      throw error;
    }
  }
}

export const pieAPIService = new PIEAPIService();