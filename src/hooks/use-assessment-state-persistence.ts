import { useState, useEffect } from 'react';
import { LifeWheelAssessment } from '@/types/growth-program';

interface AssessmentState {
  method: 'quick_focus' | 'full_assessment' | 'guided_discovery' | 'progressive_journey' | null;
  currentStep: number;
  assessments: LifeWheelAssessment[];
  selectedDomains: string[];
  conversationData?: string[];
  lastActivity: number;
  sessionId: string;
}

const STORAGE_KEY = 'life_os_assessment_state';
const SESSION_TIMEOUT = 4 * 60 * 60 * 1000; // 4 hours

export function useAssessmentStatePersistence() {
  const [assessmentState, setAssessmentState] = useState<AssessmentState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        
        // Check if session is still valid
        if (Date.now() - parsed.lastActivity < SESSION_TIMEOUT) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('Error loading assessment state:', error);
    }
    
    // Return default state
    return {
      method: null,
      currentStep: 0,
      assessments: [],
      selectedDomains: [],
      lastActivity: Date.now(),
      sessionId: `assessment_${Date.now()}`
    };
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      const stateToSave = {
        ...assessmentState,
        lastActivity: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.error('Error saving assessment state:', error);
    }
  }, [assessmentState]);

  const updateAssessmentMethod = (method: AssessmentState['method']) => {
    setAssessmentState(prev => ({
      ...prev,
      method,
      currentStep: 0,
      lastActivity: Date.now()
    }));
  };

  const updateCurrentStep = (step: number) => {
    setAssessmentState(prev => ({
      ...prev,
      currentStep: step,
      lastActivity: Date.now()
    }));
  };

  const addAssessment = (assessment: LifeWheelAssessment) => {
    setAssessmentState(prev => ({
      ...prev,
      assessments: [
        ...prev.assessments.filter(a => a.domain !== assessment.domain),
        assessment
      ],
      lastActivity: Date.now()
    }));
  };

  const updateSelectedDomains = (domains: string[]) => {
    setAssessmentState(prev => ({
      ...prev,
      selectedDomains: domains,
      lastActivity: Date.now()
    }));
  };

  const addConversationData = (data: string) => {
    setAssessmentState(prev => ({
      ...prev,
      conversationData: [...(prev.conversationData || []), data],
      lastActivity: Date.now()
    }));
  };

  const clearAssessmentState = () => {
    const newState: AssessmentState = {
      method: null,
      currentStep: 0,
      assessments: [],
      selectedDomains: [],
      lastActivity: Date.now(),
      sessionId: `assessment_${Date.now()}`
    };
    setAssessmentState(newState);
    localStorage.removeItem(STORAGE_KEY);
  };

  const hasInProgressAssessment = () => {
    return assessmentState.method !== null && 
           (assessmentState.currentStep > 0 || assessmentState.assessments.length > 0);
  };

  const getTimeRemaining = () => {
    const elapsed = Date.now() - assessmentState.lastActivity;
    return Math.max(0, SESSION_TIMEOUT - elapsed);
  };

  const isSessionExpired = () => {
    return getTimeRemaining() === 0;
  };

  const switchMethod = (newMethod: AssessmentState['method']) => {
    // Preserve assessments when switching methods
    setAssessmentState(prev => ({
      ...prev,
      method: newMethod,
      currentStep: 0,
      lastActivity: Date.now()
    }));
  };

  const getAssessmentProgress = () => {
    const totalDomains = 7; // Standard number of life domains
    const completedAssessments = assessmentState.assessments.length;
    
    return {
      completed: completedAssessments,
      total: totalDomains,
      percentage: Math.round((completedAssessments / totalDomains) * 100),
      isComplete: completedAssessments >= totalDomains
    };
  };

  return {
    assessmentState,
    updateAssessmentMethod,
    updateCurrentStep,
    addAssessment,
    updateSelectedDomains,
    addConversationData,
    clearAssessmentState,
    hasInProgressAssessment,
    getTimeRemaining,
    isSessionExpired,
    switchMethod,
    getAssessmentProgress,
    
    // Computed properties
    currentMethod: assessmentState.method,
    currentStep: assessmentState.currentStep,
    assessments: assessmentState.assessments,
    selectedDomains: assessmentState.selectedDomains,
    sessionId: assessmentState.sessionId
  };
}