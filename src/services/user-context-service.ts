import { LayeredBlueprint } from "@/types/personality-modules";
import type { VPGBlueprint } from "./unified-brain-context";

/**
 * UserContextService - Centralized user context management for brain modules
 * 
 * This service ensures all brain modules have consistent access to user context
 * without introducing global state or breaking existing functionality.
 */
export interface UserContext {
  userId: string;
  blueprintData?: Partial<LayeredBlueprint>;
  vgpBlueprint?: VPGBlueprint;
  sessionId?: string;
  preferences?: Record<string, any>;
  initialized: boolean;
}

class UserContextService {
  private contexts = new Map<string, UserContext>();
  private currentUserId: string | null = null;

  /**
   * Initialize user context for a specific user
   */
  initializeUser(userId: string, sessionId?: string): UserContext {
    if (!userId) {
      throw new Error("UserContextService: userId is required");
    }

    const existing = this.contexts.get(userId);
    if (existing && existing.initialized) {
      // Update session if provided
      if (sessionId) {
        existing.sessionId = sessionId;
      }
      this.currentUserId = userId;
      return existing;
    }

    const context: UserContext = {
      userId,
      sessionId,
      initialized: true,
      preferences: {}
    };

    this.contexts.set(userId, context);
    this.currentUserId = userId;
    
    console.log(`🔐 UserContextService: Initialized context for user ${userId}`);
    return context;
  }

  /**
   * Get user context by userId
   */
  getContext(userId: string): UserContext | null {
    return this.contexts.get(userId) || null;
  }

  /**
   * Get current user context
   */
  getCurrentContext(): UserContext | null {
    if (!this.currentUserId) return null;
    return this.getContext(this.currentUserId);
  }

  /**
   * Update blueprint data for a user
   */
  updateBlueprint(userId: string, blueprint: Partial<LayeredBlueprint>): void {
    const context = this.contexts.get(userId);
    if (context) {
      context.blueprintData = { ...context.blueprintData, ...blueprint };
      console.log(`🎭 UserContextService: Updated blueprint for user ${userId}`);
    }
  }

  /**
   * Update VPG blueprint for a user
   */
  updateVPGBlueprint(userId: string, vgpBlueprint: VPGBlueprint): void {
    const context = this.contexts.get(userId);
    if (context) {
      context.vgpBlueprint = vgpBlueprint;
      console.log(`🧠 UserContextService: Updated VPG blueprint for user ${userId}`);
    }
  }

  /**
   * Update user preferences
   */
  updatePreferences(userId: string, preferences: Record<string, any>): void {
    const context = this.contexts.get(userId);
    if (context) {
      context.preferences = { ...context.preferences, ...preferences };
      console.log(`⚙️ UserContextService: Updated preferences for user ${userId}`);
    }
  }

  /**
   * Set current user (for session management)
   */
  setCurrentUser(userId: string): UserContext {
    if (!this.contexts.has(userId)) {
      return this.initializeUser(userId);
    }
    
    this.currentUserId = userId;
    return this.contexts.get(userId)!;
  }

  /**
   * Clear context for a specific user
   */
  clearUserContext(userId: string): void {
    this.contexts.delete(userId);
    if (this.currentUserId === userId) {
      this.currentUserId = null;
    }
    console.log(`🧹 UserContextService: Cleared context for user ${userId}`);
  }

  /**
   * Check if user context is properly initialized
   */
  isUserReady(userId: string): boolean {
    const context = this.contexts.get(userId);
    return context?.initialized === true;
  }

  /**
   * Get current user ID
   */
  getCurrentUserId(): string | null {
    return this.currentUserId;
  }

  /**
   * Create a context-aware function wrapper
   * This allows services to automatically receive user context
   */
  withUserContext<T extends any[], R>(
    fn: (context: UserContext, ...args: T) => R
  ): (...args: T) => R {
    return (...args: T): R => {
      const context = this.getCurrentContext();
      if (!context) {
        throw new Error("UserContextService: No active user context. Call setCurrentUser() first.");
      }
      return fn(context, ...args);
    };
  }

  /**
   * Create a service initializer that requires user context
   */
  createServiceInitializer<T>(
    serviceName: string,
    initializer: (context: UserContext) => T
  ): (userId: string) => T {
    return (userId: string): T => {
      const context = this.getContext(userId);
      if (!context) {
        throw new Error(`${serviceName}: User context not found for ${userId}. Initialize user first.`);
      }
      console.log(`🔧 ${serviceName}: Initializing with user context for ${userId}`);
      return initializer(context);
    };
  }
}

export const userContextService = new UserContextService();