
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
    queryKey: ['blueprint-cache', user?.id],
    queryFn: async () => {
      if (!user) return { data: null, error: 'No user' };
      
      console.log('🔍 Blueprint Cache: Fetching data for user:', user.id);
      const result = await blueprintService.getActiveBlueprintData();
      
      if (result.data) {
        console.log('✅ Blueprint Cache: Data received:', {
          hasUserMeta: !!result.data.user_meta,
          hasCognitionMBTI: !!result.data.cognition_mbti,
          hasEnergyStrategy: !!result.data.energy_strategy_human_design,
          hasArchetypeWestern: !!result.data.archetype_western,
          hasValuesLifePath: !!result.data.values_life_path,
          userMetaKeys: result.data.user_meta ? Object.keys(result.data.user_meta) : [],
        });
      } else {
        console.log('⚠️ Blueprint Cache: No data received, error:', result.error);
      }
      
      return result;
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes - shorter for better responsiveness
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Ensure fresh data on mount
    retry: 2
  });

  const refetch = async () => {
    console.log('🔄 Blueprint Cache: Manual refetch triggered');
    await queryRefetch();
  };

  const value: BlueprintCacheContextType = {
    blueprintData: blueprintResult?.data || null,
    loading: isLoading,
    error: blueprintResult?.error || (error as Error)?.message || null,
    refetch,
    hasBlueprint: !!blueprintResult?.data
  };

  // Log state changes for debugging
  useEffect(() => {
    console.log('🎯 Blueprint Cache State Update:', {
      hasData: !!value.blueprintData,
      loading: value.loading,
      hasError: !!value.error,
      hasBlueprint: value.hasBlueprint,
    });
  }, [value.blueprintData, value.loading, value.error, value.hasBlueprint]);

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
