
import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { growthBrainService } from '@/services/growth-brain-service';
import { dreamsBrainService } from '@/services/dreams-brain-service';
import { soulCompanionBrainService } from '@/services/soul-companion-brain-service';
import { useAuth } from '@/contexts/AuthContext';

export type BrainMode = 'growth' | 'dreams' | 'soul_companion';

interface AgentBrainState {
  currentMode: BrainMode;
  isInitialized: boolean;
  error: string | null;
}

export const useAgentBrainSelector = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [brainState, setBrainState] = useState<AgentBrainState>({
    currentMode: 'soul_companion',
    isInitialized: false,
    error: null
  });

  // Determine brain mode based on current route
  const determineBrainMode = useCallback((pathname: string): BrainMode => {
    if (pathname.includes('/spiritual-growth')) {
      return 'growth';
    } else if (pathname.includes('/dreams')) {
      return 'dreams';
    } else {
      return 'soul_companion'; // Default for /coach and other routes
    }
  }, []);

  // Initialize the appropriate brain service
  const initializeBrainService = useCallback(async (mode: BrainMode, userId: string) => {
    try {
      setBrainState(prev => ({ ...prev, error: null }));
      
      switch (mode) {
        case 'growth':
          await growthBrainService.initialize(userId);
          console.log("🌱 Growth brain service initialized");
          break;
        case 'dreams':
          await dreamsBrainService.initialize(userId);
          console.log("🎯 Dreams brain service initialized");
          break;
        case 'soul_companion':
          await soulCompanionBrainService.initialize(userId);
          console.log("🕊️ Soul Companion brain service initialized");
          break;
      }
      
      setBrainState(prev => ({ ...prev, isInitialized: true }));
    } catch (error) {
      console.error(`Failed to initialize ${mode} brain service:`, error);
      setBrainState(prev => ({ 
        ...prev, 
        error: `Failed to initialize ${mode} brain service`,
        isInitialized: false 
      }));
    }
  }, []);

  // Get the appropriate brain service for current mode
  const getBrainService = useCallback(() => {
    switch (brainState.currentMode) {
      case 'growth':
        return growthBrainService;
      case 'dreams':
        return dreamsBrainService;
      case 'soul_companion':
        return soulCompanionBrainService;
      default:
        return soulCompanionBrainService;
    }
  }, [brainState.currentMode]);

  // Process message with appropriate brain service
  const processMessage = useCallback(async (message: string, sessionId: string) => {
    const brainService = getBrainService();
    
    switch (brainState.currentMode) {
      case 'growth':
        return await growthBrainService.processGrowthMessage(message, sessionId);
      case 'dreams':
        return await dreamsBrainService.processDreamsMessage(message, sessionId);
      case 'soul_companion':
        return await soulCompanionBrainService.processSoulMessage(message, sessionId);
      default:
        throw new Error(`Unknown brain mode: ${brainState.currentMode}`);
    }
  }, [brainState.currentMode, getBrainService]);

  // Update brain mode based on route changes
  useEffect(() => {
    const newMode = determineBrainMode(location.pathname);
    
    if (newMode !== brainState.currentMode) {
      console.log(`🧠 Switching brain mode from ${brainState.currentMode} to ${newMode}`);
      setBrainState(prev => ({ 
        ...prev, 
        currentMode: newMode,
        isInitialized: false 
      }));
    }
  }, [location.pathname, brainState.currentMode, determineBrainMode]);

  // Initialize brain service when mode changes or user is available
  useEffect(() => {
    if (user?.id && !brainState.isInitialized) {
      console.log(`🧠 Initializing ${brainState.currentMode} brain for user:`, user.id);
      initializeBrainService(brainState.currentMode, user.id);
    }
  }, [user?.id, brainState.currentMode, brainState.isInitialized, initializeBrainService]);

  return {
    currentMode: brainState.currentMode,
    isInitialized: brainState.isInitialized,
    error: brainState.error,
    processMessage,
    getBrainService
  };
};
