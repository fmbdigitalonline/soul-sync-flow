import { supabase } from '@/integrations/supabase/client';

export interface RetrievalResult {
  intent: 'FACTUAL' | 'INTERPRETIVE' | 'MIXED';
  facts: Array<{
    facet: string;
    key: string;
    value_json: any;
    confidence: number;
  }>;
  passages: Array<{
    content: string;
    relevance: number;
    metadata: any;
  }>;
  citations: string[];
  debug: {
    factsFound: number;
    passagesFound: number;
    retrievalMethod: string;
    timestamp: string;
  };
}

class RetrievalSidecarService {
  private sidecarEnabled = true; // Feature flag

  async queryRetrieval(
    userId: string, 
    query: string, 
    mode: string = 'companion'
  ): Promise<RetrievalResult | null> {
    if (!this.sidecarEnabled) {
      return null;
    }

    try {
      console.log('🔍 Sidecar: Querying retrieval service', {
        userId: userId.substring(0, 8),
        queryLength: query.length,
        mode
      });

      const { data, error } = await supabase.functions.invoke('retrieval-sidecar', {
        body: {
          userId,
          query,
          mode
        }
      });

      if (error) {
        console.error('❌ Sidecar error:', error);
        return null;
      }

      console.log('✅ Sidecar success:', {
        factsFound: data?.facts?.length || 0,
        passagesFound: data?.passages?.length || 0,
        intent: data?.intent
      });

      return data;
    } catch (error) {
      console.error('❌ Sidecar service error:', error);
      return null;
    }
  }

  async extractBlueprintFacts(userId: string, forceReprocess: boolean = false): Promise<boolean> {
    try {
      console.log('🔧 Starting blueprint facts extraction', {
        userId: userId.substring(0, 8),
        forceReprocess
      });

      const { data, error } = await supabase.functions.invoke('blueprint-facts-etl', {
        body: {
          userId,
          forceReprocess
        }
      });

      if (error) {
        console.error('❌ Facts extraction error:', error);
        return false;
      }

      console.log('✅ Facts extraction success:', {
        factsCount: data?.factsCount || 0,
        message: data?.message
      });

      return true;
    } catch (error) {
      console.error('❌ Facts extraction service error:', error);
      return false;
    }
  }

  async getRetrievalConfig(userId: string) {
    try {
      const { data, error } = await supabase
        .from('retrieval_config')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error fetching retrieval config:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('❌ Retrieval config service error:', error);
      return null;
    }
  }

  async updateRetrievalConfig(userId: string, config: Partial<{
    sidecar_enabled: boolean;
    hybrid_retrieval_enabled: boolean;
    ann_thresholds: number[];
    facts_priority: boolean;
  }>) {
    try {
      const { data, error } = await supabase
        .from('retrieval_config')
        .upsert({
          user_id: userId,
          ...config
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating retrieval config:', error);
        return null;
      }

      console.log('✅ Retrieval config updated:', data);
      return data;
    } catch (error) {
      console.error('❌ Retrieval config update service error:', error);
      return null;
    }
  }

  enableSidecar() {
    this.sidecarEnabled = true;
    console.log('🔄 Retrieval sidecar enabled');
  }

  disableSidecar() {
    this.sidecarEnabled = false;
    console.log('🔄 Retrieval sidecar disabled');
  }

  isEnabled(): boolean {
    return this.sidecarEnabled;
  }
}

export const retrievalSidecarService = new RetrievalSidecarService();