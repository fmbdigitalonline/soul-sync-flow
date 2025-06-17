
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
      console.log('🔄 BlueprintCache: Fetching blueprint data for user:', user.id);
      const result = await blueprintService.getActiveBlueprintData();
      console.log('📊 BlueprintCache: Fetch result:', { 
        hasData: !!result.data, 
        error: result.error,
        userId: user.id 
      });
      return result;
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // Reduced to 2 minutes for faster updates
    gcTime: 5 * 60 * 1000, // Reduced to 5 minutes
    refetchOnWindowFocus: true, // Enable refetch on focus
    refetchOnMount: true, // Always refetch on mount
    retry: 1
  });

  const refetch = async () => {
    console.log('🔄 BlueprintCache: Manual refetch triggered');
    await queryRefetch();
  };

  // Add effect to log state changes
  useEffect(() => {
    console.log('📈 BlueprintCache State Update:', {
      hasUser: !!user,
      loading: isLoading,
      hasData: !!blueprintResult?.data,
      hasBlueprint: !!blueprintResult?.data,
      error: blueprintResult?.error || (error as Error)?.message
    });
  }, [user, isLoading, blueprintResult, error]);

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
