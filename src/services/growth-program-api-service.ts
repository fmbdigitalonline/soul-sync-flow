import { supabase } from "@/integrations/supabase/client";
import { GrowthProgram, ProgramWeek, LifeDomain } from "@/types/growth-program";

class GrowthProgramAPIService {
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

  // Program Management API
  async createProgram(userId: string, domain: LifeDomain, blueprintParams: any, programType?: string, totalWeeks?: number, sessionSchedule?: any): Promise<GrowthProgram> {
    try {
      console.log('🌱 Growth API: Creating program via API:', domain);
      
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/growth-program-management`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          domain,
          blueprintParams,
          programType,
          totalWeeks,
          sessionSchedule
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ Growth API: Failed to create program:', result.error);
        throw new Error(result.error || 'Failed to create program');
      }

      console.log('✅ Growth API: Program created successfully');
      return result.program;
    } catch (error) {
      console.error('❌ Growth API: Error creating program:', error);
      throw error;
    }
  }

  async getCurrentProgram(userId: string): Promise<GrowthProgram | null> {
    try {
      console.log('📊 Growth API: Fetching current program via API');
      
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/growth-program-management`, {
        method: 'GET',
        headers
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ Growth API: Failed to fetch current program:', result.error);
        throw new Error(result.error || 'Failed to fetch current program');
      }

      console.log(`✅ Growth API: Current program retrieved`);
      return result.program;
    } catch (error) {
      console.error('❌ Growth API: Error fetching current program:', error);
      throw error;
    }
  }

  async getProgram(programId: string): Promise<GrowthProgram | null> {
    try {
      console.log('📊 Growth API: Fetching program via API:', programId);
      
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/growth-program-management?programId=${programId}`, {
        method: 'GET',
        headers
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ Growth API: Failed to fetch program:', result.error);
        throw new Error(result.error || 'Failed to fetch program');
      }

      console.log(`✅ Growth API: Program retrieved`);
      return result.program;
    } catch (error) {
      console.error('❌ Growth API: Error fetching program:', error);
      throw error;
    }
  }

  async updateProgramProgress(programId: string, updates: Partial<GrowthProgram>): Promise<void> {
    try {
      console.log('📊 Growth API: Updating program progress via API:', programId);
      
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/growth-program-management`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          programId,
          updates
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ Growth API: Failed to update program:', result.error);
        throw new Error(result.error || 'Failed to update program');
      }

      console.log('✅ Growth API: Program updated successfully');
    } catch (error) {
      console.error('❌ Growth API: Error updating program:', error);
      throw error;
    }
  }

  // Session Tracking API
  async createSession(programId: string, weekNumber: number, sessionNumber: number, sessionType: string, sessionData?: any): Promise<any> {
    try {
      console.log('📝 Growth API: Creating session via API');
      
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/growth-session-tracking`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          programId,
          weekNumber,
          sessionNumber,
          sessionType,
          sessionData
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ Growth API: Failed to create session:', result.error);
        throw new Error(result.error || 'Failed to create session');
      }

      console.log('✅ Growth API: Session created successfully');
      return result.session;
    } catch (error) {
      console.error('❌ Growth API: Error creating session:', error);
      throw error;
    }
  }

  async completeSession(sessionId: string, outcomes?: any[], completionData?: any): Promise<any> {
    try {
      console.log('✅ Growth API: Completing session via API:', sessionId);
      
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/growth-session-tracking`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          sessionId,
          outcomes,
          completionData
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ Growth API: Failed to complete session:', result.error);
        throw new Error(result.error || 'Failed to complete session');
      }

      console.log('✅ Growth API: Session completed successfully');
      return result.session;
    } catch (error) {
      console.error('❌ Growth API: Error completing session:', error);
      throw error;
    }
  }

  async getSessions(programId: string, weekNumber?: number): Promise<any[]> {
    try {
      console.log('📊 Growth API: Fetching sessions via API');
      
      const headers = await this.getAuthHeaders();
      const params = new URLSearchParams({ programId });
      if (weekNumber) params.append('weekNumber', weekNumber.toString());

      const response = await fetch(`${this.baseUrl}/growth-session-tracking?${params}`, {
        method: 'GET',
        headers
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ Growth API: Failed to fetch sessions:', result.error);
        throw new Error(result.error || 'Failed to fetch sessions');
      }

      console.log(`✅ Growth API: Retrieved ${result.sessions.length} sessions`);
      return result.sessions;
    } catch (error) {
      console.error('❌ Growth API: Error fetching sessions:', error);
      throw error;
    }
  }

  // Dashboard API
  async getDashboardData(): Promise<any> {
    try {
      console.log('📊 Growth API: Fetching dashboard data via API');
      
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/growth-program-dashboard`, {
        method: 'GET',
        headers
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ Growth API: Failed to fetch dashboard data:', result.error);
        throw new Error(result.error || 'Failed to fetch dashboard data');
      }

      console.log('✅ Growth API: Dashboard data retrieved successfully');
      return result.dashboard;
    } catch (error) {
      console.error('❌ Growth API: Error fetching dashboard data:', error);
      throw error;
    }
  }

  // Generate weekly program structure from dashboard data
  async generateWeeklyProgram(program: GrowthProgram): Promise<ProgramWeek[]> {
    try {
      const dashboardData = await this.getDashboardData();
      return dashboardData.weeklyProgram || [];
    } catch (error) {
      console.error('❌ Growth API: Error generating weekly program:', error);
      throw error;
    }
  }
}

export const growthProgramAPIService = new GrowthProgramAPIService();