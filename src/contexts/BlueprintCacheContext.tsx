
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { blueprintService, BlueprintData } from '@/services/blueprint-service';
import { useAuth } from '@/contexts/AuthContext';

interface BlueprintCacheContextType {
  blueprintData: BlueprintData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  hasBlueprint: boolean;
}

const BlueprintCacheContext = createContext<BlueprintCacheContextType | undefined>(undefined);

export function BlueprintCacheProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  const {
    data: blueprintResult,
    isLoading,
    error,
    refetch: queryRefetch
  } = useQuery({
    queryKey: ['blueprint', user?.id],
    queryFn: async () => {
      if (!user) return { data: null, error: 'No user' };
      return await blueprintService.getActiveBlueprintData();
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1
  });

  const refetch = async () => {
    await queryRefetch();
  };

  const value: BlueprintCacheContextType = {
    blueprintData: blueprintResult?.data || null,
    loading: isLoading,
    error: blueprintResult?.error || (error as Error)?.message || null,
    refetch,
    hasBlueprint: !!blueprintResult?.data
  };

  return (
    <BlueprintCacheContext.Provider value={value}>
      {children}
    </BlueprintCacheContext.Provider>
  );
}

export function useBlueprintCache() {
  const context = useContext(BlueprintCacheContext);
  if (context === undefined) {
    throw new Error('useBlueprintCache must be used within a BlueprintCacheProvider');
  }
  return context;
}
