import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useBlueprintFactsAutomation } from '@/hooks/use-blueprint-facts-automation';

interface AutomationWrapperProps {
  children: React.ReactNode;
}

export const AutomationWrapper: React.FC<AutomationWrapperProps> = ({ children }) => {
  const { user } = useAuth();
  
  // Initialize automated blueprint facts extraction
  useBlueprintFactsAutomation(user?.id);
  
  return <>{children}</>;
};