import { LifeDomain, LifeWheelAssessment } from '@/types/growth-program';

interface AssessmentInput {
  domain: LifeDomain;
  current_score: number;
  desired_score: number;
  importance_rating: number;
  notes?: string;
}

interface ConversationAnalysis {
  domains: {
    [key in LifeDomain]?: {
      mentions: number;
      sentiment: 'positive' | 'neutral' | 'negative';
      currentScore: number;
      desiredScore: number;
      importance: number;
      keyInsights: string[];
    };
  };
  overallTone: 'optimistic' | 'concerned' | 'balanced';
  primaryFocus: LifeDomain[];
}

export class ConversationAssessmentParser {
  private static DOMAIN_KEYWORDS: Record<LifeDomain, string[]> = {
    wellbeing: ['wellbeing', 'wellness', 'balance', 'peace', 'harmony', 'inner peace', 'life balance', 'mental health'],
    energy: ['energy', 'vitality', 'motivation', 'drive', 'vigor', 'stamina', 'fatigue', 'tired', 'exhausted', 'energetic'],
    career: ['career', 'job', 'work', 'profession', 'purpose', 'calling', 'occupation', 'business', 'professional'],
    relationships: ['relationship', 'family', 'friends', 'love', 'connection', 'partnership', 'marriage', 'dating', 'social'],
    finances: ['money', 'financial', 'income', 'wealth', 'debt', 'savings', 'budget', 'economic', 'afford', 'expenses'],
    health: ['health', 'fitness', 'exercise', 'diet', 'nutrition', 'physical', 'body', 'medical', 'doctor', 'illness'],
    personal_growth: ['growth', 'development', 'learning', 'skills', 'improvement', 'goals', 'self-development', 'progress'],
    creativity: ['creativity', 'creative', 'art', 'artistic', 'imagination', 'innovation', 'design', 'expression', 'inspiration'],
    spirituality: ['spirituality', 'spiritual', 'meditation', 'faith', 'beliefs', 'meaning', 'soul', 'consciousness', 'mindfulness'],
    home_family: ['home', 'family', 'house', 'household', 'domestic', 'children', 'parenting', 'spouse', 'living situation'],
    productivity: ['productivity', 'efficient', 'organized', 'time management', 'focus', 'discipline', 'habits', 'routine'],
    stress: ['stress', 'anxiety', 'pressure', 'overwhelm', 'tension', 'worry', 'burden', 'strain', 'overwhelmed'],
    education_learning: ['education', 'learning', 'study', 'knowledge', 'school', 'university', 'course', 'training', 'skills', 'intellectual'],
    social_community: ['community', 'social', 'networking', 'belonging', 'groups', 'society', 'cultural', 'civic', 'volunteer'],
    recreation_fun: ['fun', 'recreation', 'entertainment', 'hobbies', 'leisure', 'enjoyment', 'play', 'relaxation', 'activities'],
    environment_living: ['environment', 'living space', 'home environment', 'surroundings', 'space', 'location', 'neighborhood', 'climate'],
    contribution_service: ['contribution', 'service', 'giving back', 'helping', 'volunteering', 'impact', 'difference', 'charity', 'purpose'],
    adventure_travel: ['adventure', 'travel', 'exploration', 'journey', 'experiences', 'discovery', 'wanderlust', 'vacation', 'trip'],
    physical_fitness: ['fitness', 'physical fitness', 'exercise', 'workout', 'strength', 'cardio', 'athletic', 'sports', 'training']
  };

  private static SATISFACTION_INDICATORS = {
    high: ['love', 'amazing', 'excellent', 'fantastic', 'thriving', 'satisfied', 'happy', 'great', 'wonderful'],
    medium: ['okay', 'fine', 'decent', 'average', 'moderate', 'fair', 'acceptable'],
    low: ['struggling', 'difficult', 'challenging', 'frustrated', 'stressed', 'unhappy', 'disappointed', 'lacking']
  };

  private static IMPORTANCE_INDICATORS = {
    high: ['crucial', 'essential', 'priority', 'important', 'vital', 'key', 'fundamental', 'critical'],
    medium: ['matters', 'significant', 'relevant', 'useful', 'helpful'],
    low: ['minor', 'secondary', 'later', 'eventually', 'someday']
  };

  static parseConversationToAssessment(conversationText: string): AssessmentInput[] {
    const analysis = this.analyzeConversation(conversationText);
    const assessments: AssessmentInput[] = [];

    // Create assessments for domains that were discussed
    Object.entries(analysis.domains).forEach(([domain, data]) => {
      if (data && data.mentions > 0) {
        assessments.push({
          domain: domain as LifeDomain,
          current_score: data.currentScore,
          desired_score: data.desiredScore,
          importance_rating: data.importance,
          notes: data.keyInsights.join('. ')
        });
      }
    });

    // Ensure we have at least core domains with default scores
    const requiredDomains: LifeDomain[] = ['wellbeing', 'energy', 'career', 'relationships', 'finances', 'health', 'personal_growth'];
    
    requiredDomains.forEach(domain => {
      if (!assessments.find(a => a.domain === domain)) {
        assessments.push({
          domain,
          current_score: 6, // Default neutral score
          desired_score: 8, // Default aspirational score
          importance_rating: 7, // Default importance
          notes: 'Assessment inferred from conversation context'
        });
      }
    });

    return assessments.slice(0, 7); // Limit to 7 domains
  }

  private static analyzeConversation(text: string): ConversationAnalysis {
    const lowerText = text.toLowerCase();
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    const analysis: ConversationAnalysis = {
      domains: {},
      overallTone: 'balanced',
      primaryFocus: []
    };

    // Analyze each domain
    Object.entries(this.DOMAIN_KEYWORDS).forEach(([domain, keywords]) => {
      const domainData = this.analyzeDomainMentions(lowerText, sentences, keywords);
      if (domainData.mentions > 0) {
        analysis.domains[domain as LifeDomain] = domainData;
      }
    });

    // Determine primary focus (top 3 most mentioned domains)
    analysis.primaryFocus = Object.entries(analysis.domains)
      .sort(([,a], [,b]) => (b?.mentions || 0) - (a?.mentions || 0))
      .slice(0, 3)
      .map(([domain]) => domain as LifeDomain);

    // Determine overall tone
    analysis.overallTone = this.determineOverallTone(lowerText);

    return analysis;
  }

  private static analyzeDomainMentions(text: string, sentences: string[], keywords: string[]) {
    let mentions = 0;
    let positiveContext = 0;
    let negativeContext = 0;
    const insights: string[] = [];

    // Count keyword mentions and analyze context
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = text.match(regex);
      if (matches) {
        mentions += matches.length;
        
        // Analyze surrounding context for sentiment
        sentences.forEach(sentence => {
          if (sentence.toLowerCase().includes(keyword)) {
            const sentiment = this.analyzeSentiment(sentence);
            if (sentiment === 'positive') positiveContext++;
            if (sentiment === 'negative') negativeContext++;
            
            // Extract key insights
            if (sentence.trim().length > 20) {
              insights.push(sentence.trim());
            }
          }
        });
      }
    });

    // Calculate scores based on context analysis
    const currentScore = this.calculateCurrentScore(text, keywords, positiveContext, negativeContext);
    const desiredScore = Math.max(currentScore + 2, 8); // Always want improvement
    const importance = this.calculateImportance(text, keywords);

    const sentiment: 'positive' | 'neutral' | 'negative' = 
      positiveContext > negativeContext ? 'positive' : 
      negativeContext > positiveContext ? 'negative' : 'neutral';

    return {
      mentions,
      sentiment,
      currentScore,
      desiredScore,
      importance,
      keyInsights: insights.slice(0, 3) // Top 3 insights
    };
  }

  private static calculateCurrentScore(text: string, keywords: string[], positive: number, negative: number): number {
    // Base score from satisfaction indicators
    let score = 5; // neutral starting point
    
    keywords.forEach(keyword => {
      const keywordContext = this.extractKeywordContext(text, keyword);
      
      // Check for satisfaction indicators
      if (this.containsWords(keywordContext, this.SATISFACTION_INDICATORS.high)) {
        score += 2;
      } else if (this.containsWords(keywordContext, this.SATISFACTION_INDICATORS.medium)) {
        score += 0.5;
      } else if (this.containsWords(keywordContext, this.SATISFACTION_INDICATORS.low)) {
        score -= 2;
      }
    });

    // Adjust based on positive/negative context ratio
    if (positive > negative) {
      score += 1;
    } else if (negative > positive) {
      score -= 1;
    }

    return Math.max(1, Math.min(10, Math.round(score)));
  }

  private static calculateImportance(text: string, keywords: string[]): number {
    let importance = 5; // neutral starting point
    
    keywords.forEach(keyword => {
      const keywordContext = this.extractKeywordContext(text, keyword);
      
      if (this.containsWords(keywordContext, this.IMPORTANCE_INDICATORS.high)) {
        importance += 2;
      } else if (this.containsWords(keywordContext, this.IMPORTANCE_INDICATORS.medium)) {
        importance += 1;
      } else if (this.containsWords(keywordContext, this.IMPORTANCE_INDICATORS.low)) {
        importance -= 1;
      }
    });

    return Math.max(1, Math.min(10, Math.round(importance)));
  }

  private static extractKeywordContext(text: string, keyword: string): string {
    const regex = new RegExp(`(.{0,50}\\b${keyword}\\b.{0,50})`, 'gi');
    const matches = text.match(regex);
    return matches ? matches.join(' ') : '';
  }

  private static containsWords(text: string, words: string[]): boolean {
    return words.some(word => text.toLowerCase().includes(word.toLowerCase()));
  }

  private static analyzeSentiment(sentence: string): 'positive' | 'negative' | 'neutral' {
    const positive = ['good', 'great', 'love', 'happy', 'amazing', 'wonderful', 'excited', 'satisfied'];
    const negative = ['bad', 'hate', 'terrible', 'awful', 'frustrated', 'stressed', 'difficult', 'struggling'];
    
    const lowerSentence = sentence.toLowerCase();
    const positiveCount = positive.filter(word => lowerSentence.includes(word)).length;
    const negativeCount = negative.filter(word => lowerSentence.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private static determineOverallTone(text: string): 'optimistic' | 'concerned' | 'balanced' {
    const optimisticWords = ['excited', 'optimistic', 'hopeful', 'confident', 'positive', 'growth', 'improve'];
    const concernedWords = ['worried', 'anxious', 'stressed', 'overwhelmed', 'struggling', 'difficult'];
    
    const optimisticCount = optimisticWords.filter(word => text.includes(word)).length;
    const concernedCount = concernedWords.filter(word => text.includes(word)).length;
    
    if (optimisticCount > concernedCount + 1) return 'optimistic';
    if (concernedCount > optimisticCount + 1) return 'concerned';
    return 'balanced';
  }
}