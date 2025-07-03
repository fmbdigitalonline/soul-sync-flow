
import { supabase } from "@/integrations/supabase/client";

export class TestAuthenticationService {
  private static testUser: any = null;
  private static testSession: any = null;

  static async initializeTestUser(): Promise<{ userId: string; session: any } | null> {
    try {
      // Check if we already have an authenticated user
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        this.testUser = session.user;
        this.testSession = session;
        console.log('✅ Using existing authenticated user for tests:', session.user.id);
        return { userId: session.user.id, session };
      }

      // If no authenticated user, create a test context without actual authentication
      console.log('⚠️ No authenticated user found. Tests will run in limited mode.');
      return null;
    } catch (error) {
      console.error('❌ Failed to initialize test user:', error);
      return null;
    }
  }

  static getTestUserId(): string {
    return this.testUser?.id || '00000000-0000-0000-0000-000000000000';
  }

  static isAuthenticated(): boolean {
    return !!this.testUser;
  }

  static getAuthenticationStatus(): 'authenticated' | 'unauthenticated' | 'test_mode' {
    if (this.testUser) return 'authenticated';
    return 'test_mode';
  }

  static generateTestUUID(): string {
    return crypto.randomUUID();
  }

  static async cleanup(): Promise<void> {
    this.testUser = null;
    this.testSession = null;
  }
}
