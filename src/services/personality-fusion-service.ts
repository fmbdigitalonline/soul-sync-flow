
import { supabase } from "@/integrations/supabase/client";
import { PersonalityScores, PersonalityAnswer, PersonalityProfile } from "@/types/personality-fusion";

export class PersonalityFusionService {
  
  static async savePersonalityProfile(
    blueprintId: string, 
    profile: PersonalityProfile
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const personalityScores: Omit<PersonalityScores, 'blueprint_id'> = {
        big5: profile.bigFive,
        big5_confidence: profile.confidence,
        mbti_probabilities: profile.mbtiProbabilities,
        last_updated: new Date().toISOString()
      };

      const { error: scoresError } = await supabase
        .from('personality_scores')
        .upsert({
          blueprint_id: blueprintId,
          ...personalityScores
        });

      if (scoresError) {
        console.error('Error saving personality scores:', scoresError);
        return { success: false, error: scoresError.message };
      }

      // Save micro-answers if available
      if (profile.microAnswers && profile.microAnswers.length > 0) {
        const answers = profile.microAnswers.map(answer => ({
          blueprint_id: blueprintId,
          item_code: answer.key,
          answer: answer.value.toString(),
          created_at: new Date().toISOString()
        }));

        const { error: answersError } = await supabase
          .from('personality_answers')
          .insert(answers);

        if (answersError) {
          console.error('Error saving personality answers:', answersError);
          // Don't fail the whole operation for answers
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Unexpected error saving personality profile:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async getPersonalityProfile(
    blueprintId: string
  ): Promise<{ data: PersonalityProfile | null; error?: string }> {
    try {
      const { data: scores, error: scoresError } = await supabase
        .from('personality_scores')
        .select('*')
        .eq('blueprint_id', blueprintId)
        .single();

      if (scoresError || !scores) {
        return { data: null, error: scoresError?.message || 'No personality profile found' };
      }

      // Get recent answers
      const { data: answers } = await supabase
        .from('personality_answers')
        .select('*')
        .eq('blueprint_id', blueprintId)
        .order('created_at', { ascending: false })
        .limit(10);

      // Generate likely type from probabilities
      const likelyType = Object.keys(scores.mbti_probabilities).reduce((a, b) => 
        scores.mbti_probabilities[a] > scores.mbti_probabilities[b] ? a : b
      );

      const profile: PersonalityProfile = {
        bigFive: scores.big5,
        confidence: scores.big5_confidence,
        mbtiProbabilities: scores.mbti_probabilities,
        likelyType,
        description: this.generateDescription(likelyType, scores.big5),
        microAnswers: answers?.map(a => ({
          key: a.item_code,
          value: parseFloat(a.answer)
        })) || []
      };

      return { data: profile };
    } catch (error) {
      console.error('Error fetching personality profile:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async recordMicroAnswer(
    blueprintId: string,
    itemCode: string,
    answer: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('personality_answers')
        .insert({
          blueprint_id: blueprintId,
          item_code: itemCode,
          answer,
          created_at: new Date().toISOString()
        });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private static generateDescription(type: string, bigFive: any): string {
    const descriptions: Record<string, string> = {
      'INTJ': 'Strategic and independent, you likely prefer working alone on complex problems and have a natural talent for seeing the big picture.',
      'INTP': 'Analytical and inventive, you probably enjoy exploring theoretical concepts and finding logical explanations for everything.',
      'ENTJ': 'Natural leader with strong organizational skills, you likely excel at implementing your vision and motivating others.',
      'ENTP': 'Innovative and adaptable, you probably love brainstorming new possibilities and engaging in intellectual discussions.',
      'INFJ': 'Insightful and idealistic, you likely seek meaning and connection while working toward your vision of a better world.',
      'INFP': 'Authentic and empathetic, you probably value personal growth and helping others discover their potential.',
      'ENFJ': 'Charismatic and supportive, you likely excel at understanding others and helping them achieve their goals.',
      'ENFP': 'Enthusiastic and creative, you probably see life as full of possibilities and love inspiring others.',
      'ISTJ': 'Reliable and methodical, you likely prefer proven methods and take pride in completing tasks thoroughly.',
      'ISFJ': 'Caring and dependable, you probably focus on helping others and maintaining harmony in your environment.',
      'ESTJ': 'Organized and decisive, you likely excel at managing projects and ensuring things get done efficiently.',
      'ESFJ': 'Warm and conscientious, you probably enjoy bringing people together and creating positive experiences.',
      'ISTP': 'Practical and adaptable, you likely prefer hands-on problem solving and working independently.',
      'ISFP': 'Artistic and sensitive, you probably value personal expression and prefer to work at your own pace.',
      'ESTP': 'Energetic and pragmatic, you likely enjoy taking action and adapting quickly to new situations.',
      'ESFP': 'Spontaneous and enthusiastic, you probably love being around people and creating memorable experiences.'
    };
    
    return descriptions[type] || 'You have a unique personality that combines various traits in interesting ways.';
  }
}
