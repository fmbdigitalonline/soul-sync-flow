/**
 * MBTI Data Repair Service
 * Fixes missing MBTI data extraction from personality assessments
 * Addresses the "mbti_data_not_extracted" diagnostic issue
 */

import { supabase } from '@/integrations/supabase/client';

export interface MBTIRepairResult {
  success: boolean;
  mbtiType: string;
  repaired: boolean;
  error?: string;
}

class MBTIDataRepairService {
  /**
   * Repairs MBTI data extraction for a specific user
   * Looks for personality assessment data and properly maps it to cognition_mbti
   */
  async repairUserMBTIData(userId: string): Promise<MBTIRepairResult> {
    console.log('🔧 MBTI Repair: Starting repair for user:', userId);
    
    try {
      // Step 1: Check current blueprint state
      const { data: currentBlueprint, error: fetchError } = await supabase
        .from('blueprints')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle();
      
      if (fetchError) {
        console.error('❌ MBTI Repair: Error fetching blueprint:', fetchError);
        return { success: false, mbtiType: 'Unknown', repaired: false, error: fetchError.message };
      }
      
      if (!currentBlueprint) {
        console.log('📝 MBTI Repair: No active blueprint found');
        return { success: false, mbtiType: 'Unknown', repaired: false, error: 'No active blueprint found' };
      }
      
      // Step 2: Extract personality data from various sources
      const personalityData = this.extractPersonalityData(currentBlueprint);
      
      if (!personalityData.mbtiType || personalityData.mbtiType === 'Unknown') {
        console.log('⚠️ MBTI Repair: No valid MBTI data found to repair with');
        return { success: true, mbtiType: 'Unknown', repaired: false, error: 'No personality assessment data available' };
      }
      
      // Step 3: Create proper cognition_mbti structure
      const repairedMBTIData = this.buildMBTIStructure(personalityData);
      
      // Step 4: Update the blueprint with repaired MBTI data
      const { error: updateError } = await supabase
        .from('blueprints')
        .update({
          cognition_mbti: repairedMBTIData,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentBlueprint.id);
      
      if (updateError) {
        console.error('❌ MBTI Repair: Error updating blueprint:', updateError);
        return { success: false, mbtiType: personalityData.mbtiType, repaired: false, error: updateError.message };
      }
      
      console.log('✅ MBTI Repair: Successfully repaired MBTI data:', personalityData.mbtiType);
      return { success: true, mbtiType: personalityData.mbtiType, repaired: true };
      
    } catch (error) {
      console.error('💥 MBTI Repair: Unexpected error:', error);
      return { 
        success: false, 
        mbtiType: 'Unknown', 
        repaired: false, 
        error: error instanceof Error ? error.message : 'Unknown repair error' 
      };
    }
  }
  
  /**
   * Extracts personality data from multiple possible sources in the blueprint
   */
  private extractPersonalityData(blueprint: any): { mbtiType: string; description?: string; confidence?: number; bigFive?: any } {
    console.log('🔍 MBTI Repair: Extracting personality data from blueprint');
    
    // Source 1: user_meta.personality (most common location)
    if (blueprint.user_meta?.personality?.likelyType) {
      console.log('✅ MBTI Repair: Found personality data in user_meta.personality');
      return {
        mbtiType: blueprint.user_meta.personality.likelyType,
        description: blueprint.user_meta.personality.description,
        confidence: blueprint.user_meta.personality.userConfidence,
        bigFive: blueprint.user_meta.personality.bigFive
      };
    }
    
    // Source 2: cognition_mbti (might have partial data)
    if (blueprint.cognition_mbti?.type && blueprint.cognition_mbti.type !== 'Unknown') {
      console.log('✅ MBTI Repair: Found existing MBTI data in cognition_mbti');
      return {
        mbtiType: blueprint.cognition_mbti.type,
        description: blueprint.cognition_mbti.description,
        confidence: blueprint.cognition_mbti.confidence
      };
    }
    
    // Source 3: metadata.personality_assessment (fallback)
    if (blueprint.metadata?.personality_assessment?.mbti_type) {
      console.log('✅ MBTI Repair: Found personality data in metadata');
      return {
        mbtiType: blueprint.metadata.personality_assessment.mbti_type,
        description: blueprint.metadata.personality_assessment.description,
        confidence: blueprint.metadata.personality_assessment.confidence
      };
    }
    
    console.log('⚠️ MBTI Repair: No valid personality data found');
    return { mbtiType: 'Unknown' };
  }
  
  /**
   * Builds a proper MBTI data structure with functions and keywords
   */
  private buildMBTIStructure(personalityData: { mbtiType: string; description?: string; confidence?: number; bigFive?: any }) {
    const { mbtiType, description = '', confidence = 0.8, bigFive = {} } = personalityData;
    
    // Map MBTI functions
    const functionMap: { [key: string]: { dominant: string; auxiliary: string } } = {
      'INFP': { dominant: 'Introverted Feeling', auxiliary: 'Extraverted Intuition' },
      'ENFP': { dominant: 'Extraverted Intuition', auxiliary: 'Introverted Feeling' },
      'INFJ': { dominant: 'Introverted Intuition', auxiliary: 'Extraverted Feeling' },
      'ENFJ': { dominant: 'Extraverted Feeling', auxiliary: 'Introverted Intuition' },
      'INTJ': { dominant: 'Introverted Intuition', auxiliary: 'Extraverted Thinking' },
      'ENTJ': { dominant: 'Extraverted Thinking', auxiliary: 'Introverted Intuition' },
      'INTP': { dominant: 'Introverted Thinking', auxiliary: 'Extraverted Intuition' },
      'ENTP': { dominant: 'Extraverted Intuition', auxiliary: 'Introverted Thinking' },
      'ISFP': { dominant: 'Introverted Feeling', auxiliary: 'Extraverted Sensing' },
      'ESFP': { dominant: 'Extraverted Sensing', auxiliary: 'Introverted Feeling' },
      'ISFJ': { dominant: 'Introverted Sensing', auxiliary: 'Extraverted Feeling' },
      'ESFJ': { dominant: 'Extraverted Feeling', auxiliary: 'Introverted Sensing' },
      'ISTJ': { dominant: 'Introverted Sensing', auxiliary: 'Extraverted Thinking' },
      'ESTJ': { dominant: 'Extraverted Thinking', auxiliary: 'Introverted Sensing' },
      'ISTP': { dominant: 'Introverted Thinking', auxiliary: 'Extraverted Sensing' },
      'ESTP': { dominant: 'Extraverted Sensing', auxiliary: 'Introverted Thinking' }
    };
    
    const functions = functionMap[mbtiType] || { dominant: 'Unknown', auxiliary: 'Unknown' };
    
    // Extract keywords from description
    const extractKeywords = (desc: string) => {
      const keywords = [];
      if (desc.toLowerCase().includes('authentic')) keywords.push('Authentic');
      if (desc.toLowerCase().includes('empathetic')) keywords.push('Empathetic');
      if (desc.toLowerCase().includes('growth')) keywords.push('Growth-oriented');
      if (desc.toLowerCase().includes('creative')) keywords.push('Creative');
      if (desc.toLowerCase().includes('values')) keywords.push('Values-driven');
      if (desc.toLowerCase().includes('helping')) keywords.push('Helper');
      if (desc.toLowerCase().includes('analytical')) keywords.push('Analytical');
      if (desc.toLowerCase().includes('innovative')) keywords.push('Innovative');
      return keywords.length > 0 ? keywords : ['Authentic', 'Growth-oriented'];
    };
    
    return {
      type: mbtiType,
      core_keywords: extractKeywords(description),
      dominant_function: functions.dominant,
      auxiliary_function: functions.auxiliary,
      description: description || `${mbtiType} personality type`,
      confidence: confidence,
      big_five: bigFive,
      source: 'repaired_from_personality_data',
      repair_timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Batch repair MBTI data for users with missing data
   */
  async batchRepairMBTIData(): Promise<{ repaired: number; errors: string[] }> {
    console.log('🔧 MBTI Repair: Starting batch repair operation');
    
    try {
      // Find users with missing or invalid MBTI data
      const { data: usersNeedingRepair, error } = await supabase
        .from('blueprints')
        .select('user_id, id, cognition_mbti')
        .eq('is_active', true)
        .or('cognition_mbti->>type.is.null,cognition_mbti->>type.eq.Unknown');
      
      if (error) {
        console.error('❌ MBTI Repair: Error finding users needing repair:', error);
        return { repaired: 0, errors: [error.message] };
      }
      
      if (!usersNeedingRepair || usersNeedingRepair.length === 0) {
        console.log('✅ MBTI Repair: No users need MBTI data repair');
        return { repaired: 0, errors: [] };
      }
      
      console.log(`🔧 MBTI Repair: Found ${usersNeedingRepair.length} users needing repair`);
      
      const errors: string[] = [];
      let repaired = 0;
      
      // Process in batches to avoid overwhelming the database
      for (const user of usersNeedingRepair) {
        try {
          const result = await this.repairUserMBTIData(user.user_id);
          if (result.success && result.repaired) {
            repaired++;
          } else if (result.error) {
            errors.push(`User ${user.user_id}: ${result.error}`);
          }
        } catch (err) {
          errors.push(`User ${user.user_id}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
        
        // Small delay to prevent overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      console.log(`✅ MBTI Repair: Batch repair complete. Repaired: ${repaired}, Errors: ${errors.length}`);
      return { repaired, errors };
      
    } catch (error) {
      console.error('💥 MBTI Repair: Batch repair failed:', error);
      return { repaired: 0, errors: [error instanceof Error ? error.message : 'Batch repair failed'] };
    }
  }
}

export const mbtiRepairService = new MBTIDataRepairService();